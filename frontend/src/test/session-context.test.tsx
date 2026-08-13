import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-hot-toast";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserContextProvider, useUser } from "../context/userContext";
import { apiRequest } from "../services/api";

function sessionResponse(role: "user" | "admin" = "user"): Response {
  return new Response(
    JSON.stringify({
      user: { id: "user-1", username: "koki", role },
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

function SessionProbe() {
  const {
    isAdmin,
    isUser,
    logout,
    refreshSession,
    sessionError,
    status,
    user,
  } = useUser();

  return (
    <>
      <p data-testid="session-status">{status}</p>
      {status === "loading" ? (
        <p>Memuat sesi</p>
      ) : sessionError ? (
        <p>Gangguan sesi: {sessionError.message}</p>
      ) : !user ? (
        <p>Sesi anonim</p>
      ) : (
        <>
          <p>
            Sesi untuk {user.username}: {isUser ? "pengguna" : "administrator"}
          </p>
          <p>Admin: {String(isAdmin)}</p>
          <button type="button" onClick={() => void logout()}>
            Keluar
          </button>
        </>
      )}
      <button type="button" onClick={() => void refreshSession()}>
        Segarkan sesi
      </button>
    </>
  );
}

function pendingFetch() {
  return vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });
  });
}

function setupFetch(...responses: Response[]) {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("UserContextProvider", () => {
  afterEach(() => {
    toast.dismiss();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("maps a resolved user session without storing a token in web storage", async () => {
    const fetchMock = setupFetch(sessionResponse());
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    expect(
      await screen.findByText("Sesi untuk koki: pengguna"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth$/),
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  it("maps an administrator session", async () => {
    setupFetch(sessionResponse("admin"));
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    expect(
      await screen.findByText("Sesi untuk koki: administrator"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin: true")).toBeInTheDocument();
  });

  it("maps an unauthorized refresh to an anonymous session", async () => {
    const errorToast = vi.spyOn(toast, "error");
    setupFetch(
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    expect(await screen.findByText("Sesi anonim")).toBeInTheDocument();
    expect(screen.getByTestId("session-status")).toHaveTextContent("anonymous");
    expect(errorToast).not.toHaveBeenCalled();
  });

  it("surfaces server errors once while retaining anonymous session state", async () => {
    const errorToast = vi.spyOn(toast, "error");
    setupFetch(
      new Response(JSON.stringify({ error: "Gateway unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    expect(
      await screen.findByText("Gangguan sesi: Gateway unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("session-status")).toHaveTextContent("anonymous");
    expect(errorToast).toHaveBeenCalledWith("Gateway unavailable", {
      id: "session-refresh-error",
    });
  });

  it("combines caller cancellation with the request timeout", async () => {
    const timeoutController = new AbortController();
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutController.signal);
    const fetchMock = pendingFetch();
    vi.stubGlobal("fetch", fetchMock);
    const callerController = new AbortController();

    const request = apiRequest("/auth", { signal: callerController.signal });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const requestSignal = fetchMock.mock.calls[0][1]?.signal;

    expect(requestSignal).not.toBe(callerController.signal);
    expect(requestSignal).not.toBe(timeoutController.signal);
    callerController.abort();
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });

  it("leaves loading and shows feedback when the session request times out", async () => {
    const errorToast = vi.spyOn(toast, "error");
    const timeoutController = new AbortController();
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutController.signal);
    const fetchMock = pendingFetch();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const timeoutError = new Error("The operation timed out");
    timeoutError.name = "TimeoutError";
    timeoutController.abort(timeoutError);

    expect(
      await screen.findByText("Gangguan sesi: The operation timed out"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("session-status")).toHaveTextContent("anonymous");
    expect(errorToast).toHaveBeenCalledWith("The operation timed out", {
      id: "session-refresh-error",
    });
  });

  it("uses the user logout endpoint and clears session state", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      new Response(null, { status: 200 }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const user = userEvent.setup();

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    await screen.findByText("Sesi untuk koki: pengguna");
    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(await screen.findByText("Sesi anonim")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/api\/auth\/logout$/),
      expect.objectContaining({ credentials: "include", method: "POST" }),
    );
  });

  it("uses the administrator logout endpoint and clears session state", async () => {
    const fetchMock = setupFetch(
      sessionResponse("admin"),
      new Response(null, { status: 200 }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const user = userEvent.setup();

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    await screen.findByText("Sesi untuk koki: administrator");
    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(await screen.findByText("Sesi anonim")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/api\/admin\/logout$/),
      expect.objectContaining({ credentials: "include", method: "POST" }),
    );
  });
});
