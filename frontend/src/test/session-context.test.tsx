import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserContextProvider, useUser } from "../context/userContext";

function sessionResponse(role: "user" | "admin" = "user"): Response {
  return new Response(
    JSON.stringify({
      user: { id: "user-1", username: "koki", role },
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

function SessionProbe() {
  const { isAdmin, isUser, logout, sessionError, status, user } = useUser();

  if (status === "loading") return <p>Memuat sesi</p>;
  if (sessionError) return <p>Gangguan sesi: {sessionError.message}</p>;
  if (!user) return <p>Sesi anonim</p>;

  return (
    <>
      <p>
        Sesi untuk {user.username}: {isUser ? "pengguna" : "administrator"}
      </p>
      <p>Admin: {String(isAdmin)}</p>
      <button type="button" onClick={() => void logout()}>
        Keluar
      </button>
    </>
  );
}

function setupFetch(...responses: Response[]) {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("UserContextProvider", () => {
  afterEach(() => {
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
  });

  it("exposes server errors separately from an anonymous session", async () => {
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
