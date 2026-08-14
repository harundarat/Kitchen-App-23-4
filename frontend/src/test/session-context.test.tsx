import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { RequireAdmin, RequireUser } from "../components/layouts/RequireRole";
import { UserContextProvider, useUser } from "../context/userContext";
import Login from "../pages/Login";
import AdminLogin from "../pages/admin/AdminLogin";
import { api, apiRequest } from "../services/api";
import { adminService } from "../services/admin";
import {
  CURRENT_USER_SESSION_VALIDATION,
  SESSION_CHANGE_CHANNEL_NAME,
  SESSION_CHANGED_MESSAGE,
  USER_SESSION_VALIDATION,
} from "../services/sessionRecovery";

type ChannelListener = (event: MessageEvent) => void;

class FakeBroadcastChannel {
  static channels = new Map<string, Set<FakeBroadcastChannel>>();
  static postedMessages: unknown[] = [];

  readonly name: string;
  private readonly listeners = new Set<ChannelListener>();

  constructor(name: string) {
    this.name = name;
    const channels = FakeBroadcastChannel.channels.get(name) ?? new Set();
    channels.add(this);
    FakeBroadcastChannel.channels.set(name, channels);
  }

  addEventListener(type: string, listener: ChannelListener) {
    if (type === "message") this.listeners.add(listener);
  }

  postMessage(data: unknown) {
    FakeBroadcastChannel.postedMessages.push(data);
    FakeBroadcastChannel.channels.get(this.name)?.forEach((channel) => {
      if (channel === this) return;
      channel.listeners.forEach((listener) =>
        listener(new MessageEvent("message", { data })),
      );
    });
  }

  close() {
    FakeBroadcastChannel.channels.get(this.name)?.delete(this);
  }
}

const originalBroadcastChannel = globalThis.BroadcastChannel;

function reportExternalMessage(message: unknown) {
  const channel = new FakeBroadcastChannel(SESSION_CHANGE_CHANNEL_NAME);
  channel.postMessage(message);
  channel.close();
}

function reportExternalSessionChange() {
  reportExternalMessage(SESSION_CHANGED_MESSAGE);
}

function sessionResponse(
  role: "user" | "admin" = "user",
  username = "koki",
  id = "user-1",
): Response {
  return new Response(
    JSON.stringify({
      user: { id, username, role },
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
      <p data-testid="session-user">{user?.username ?? "none"}</p>
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
          <button
            type="button"
            onClick={() => void logout().catch(() => undefined)}
          >
            Keluar
          </button>
        </>
      )}
      <button type="button" onClick={() => void refreshSession()}>
        Segarkan sesi
      </button>
      <button
        type="button"
        onClick={() => void adminService.getUsers().catch(() => undefined)}
      >
        Muat data admin
      </button>
      <button
        type="button"
        onClick={() =>
          void api
            .get("/users/koki", {
              sessionValidation: CURRENT_USER_SESSION_VALIDATION,
            })
            .catch(() => undefined)
        }
      >
        Muat principal pengguna
      </button>
      <button
        type="button"
        onClick={() =>
          void api
            .post(
              "/recipes",
              {},
              {
                sessionValidation: USER_SESSION_VALIDATION,
              },
            )
            .catch(() => undefined)
        }
      >
        Kirim permintaan pengguna
      </button>
    </>
  );
}

function StatefulSessionProbe() {
  const { user } = useUser();
  const [draft, setDraft] = useState("");

  return (
    <>
      <p>Principal aktif: {user?.username ?? "anonim"}</p>
      <label htmlFor="session-draft">Draft</label>
      <input
        id="session-draft"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    </>
  );
}

function SessionRefreshLogoutProbe() {
  const { logout, refreshSession, status, user } = useUser();

  return (
    <>
      <p data-testid="session-status">{status}</p>
      <p data-testid="session-user">{user?.username ?? "none"}</p>
      <button type="button" onClick={() => void refreshSession()}>
        Mulai revalidasi
      </button>
      <button
        type="button"
        onClick={() => void logout().catch(() => undefined)}
      >
        Logout saat revalidasi
      </button>
    </>
  );
}

function ProtectedAdminProbe() {
  return (
    <button
      type="button"
      onClick={() => void adminService.getUsers().catch(() => undefined)}
    >
      Muat halaman admin
    </button>
  );
}

function ProtectedUserProbe() {
  return (
    <button
      type="button"
      onClick={() =>
        void api
          .post(
            "/recipes",
            {},
            {
              sessionValidation: USER_SESSION_VALIDATION,
            },
          )
          .catch(() => undefined)
      }
    >
      Muat halaman pengguna
    </button>
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
  beforeAll(() => {
    Object.defineProperty(globalThis, "BroadcastChannel", {
      configurable: true,
      value: FakeBroadcastChannel,
      writable: true,
    });
  });

  beforeEach(() => {
    vi.spyOn(document, "hasFocus").mockReturnValue(true);
  });

  afterAll(() => {
    if (originalBroadcastChannel) {
      Object.defineProperty(globalThis, "BroadcastChannel", {
        configurable: true,
        value: originalBroadcastChannel,
        writable: true,
      });
    } else {
      delete (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel;
    }
  });

  afterEach(() => {
    toast.dismiss();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
    FakeBroadcastChannel.postedMessages = [];
  });

  it("revalidates on first activation when mounted inactive without BroadcastChannel", async () => {
    const broadcastChannelDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "BroadcastChannel",
    );
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );
    const fetchMock = setupFetch(
      sessionResponse("user", "koki-a", "user-a"),
      sessionResponse("user", "koki-b", "user-b"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    vi.mocked(document.hasFocus).mockReturnValue(false);

    try {
      Object.defineProperty(globalThis, "BroadcastChannel", {
        configurable: true,
        value: undefined,
        writable: true,
      });
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });

      render(
        <UserContextProvider>
          <SessionProbe />
        </UserContextProvider>,
      );
      await screen.findByText("Sesi untuk koki-a: pengguna");
      expect(fetchMock).toHaveBeenCalledOnce();

      vi.mocked(document.hasFocus).mockReturnValue(true);
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("focus"));
      });

      expect(
        await screen.findByText("Sesi untuk koki-b: pengguna"),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      if (broadcastChannelDescriptor) {
        Object.defineProperty(
          globalThis,
          "BroadcastChannel",
          broadcastChannelDescriptor,
        );
      } else {
        delete (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel;
      }
      if (visibilityDescriptor) {
        Object.defineProperty(
          document,
          "visibilityState",
          visibilityDescriptor,
        );
      } else {
        delete (document as { visibilityState?: string }).visibilityState;
      }
    }
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

  it.each([
    ["consumer", "user", "koki-a", "user-a", "koki-b", "user-b"],
    ["administrator", "admin", "admin-a", "admin-a", "admin-b", "admin-b"],
  ] as const)(
    "hydrates a same-role replacement %s and resets stale child state",
    async (_description, role, firstName, firstId, nextName, nextId) => {
      const fetchMock = setupFetch(
        sessionResponse(role, firstName, firstId),
        sessionResponse(role, nextName, nextId),
      );
      vi.spyOn(AbortSignal, "timeout").mockReturnValue(
        new AbortController().signal,
      );
      const interaction = userEvent.setup();

      render(
        <UserContextProvider>
          <StatefulSessionProbe />
        </UserContextProvider>,
      );

      expect(
        await screen.findByText(`Principal aktif: ${firstName}`),
      ).toBeInTheDocument();
      await interaction.type(screen.getByLabelText("Draft"), "draft lama");

      act(() => reportExternalSessionChange());

      expect(
        await screen.findByText(`Principal aktif: ${nextName}`),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Draft")).toHaveValue("");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );

  it("does not reset child state when revalidation confirms the same principal", async () => {
    const fetchMock = setupFetch(sessionResponse(), sessionResponse());
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <StatefulSessionProbe />
      </UserContextProvider>,
    );

    await screen.findByText("Principal aktif: koki");
    await interaction.type(screen.getByLabelText("Draft"), "tetap ada");
    act(() => reportExternalSessionChange());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByLabelText("Draft")).toHaveValue("tetap ada");
  });

  it("removes a stale consumer route when another tab installs an admin session", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      sessionResponse("admin", "pengelola", "admin-1"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <MemoryRouter initialEntries={["/profile/koki"]}>
          <Routes>
            <Route element={<RequireUser />}>
              <Route path="/profile/koki" element={<p>Profil terlindungi</p>} />
            </Route>
            <Route path="/" element={<p>Beranda konsumen</p>} />
          </Routes>
        </MemoryRouter>
      </UserContextProvider>,
    );

    await screen.findByText("Profil terlindungi");
    act(() => reportExternalSessionChange());

    expect(await screen.findByText("Beranda konsumen")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("removes stale admin state when another tab installs a consumer session", async () => {
    const fetchMock = setupFetch(
      sessionResponse("admin", "pengelola", "admin-1"),
      sessionResponse("user", "koki", "user-1"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <MemoryRouter initialEntries={["/admin/users"]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path="/admin/users" element={<p>Data admin lama</p>} />
            </Route>
            <Route path="/admin/login" element={<p>Login administrator</p>} />
          </Routes>
        </MemoryRouter>
      </UserContextProvider>,
    );

    await screen.findByText("Data admin lama");
    act(() => reportExternalSessionChange());

    expect(await screen.findByText("Login administrator")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps a logout notification in another tab to an anonymous session", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
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

    await screen.findByText("Sesi untuk koki: pengguna");
    act(() => reportExternalSessionChange());

    expect(await screen.findByText("Sesi anonim")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("coalesces paired visibility and focus activation into one refresh", async () => {
    const fetchMock = setupFetch(
      sessionResponse("user", "koki-a", "user-a"),
      sessionResponse("user", "koki-b", "user-b"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );

    try {
      render(
        <UserContextProvider>
          <SessionProbe />
        </UserContextProvider>,
      );
      await screen.findByText("Sesi untuk koki-a: pengguna");

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      act(() => {
        window.dispatchEvent(new Event("blur"));
        document.dispatchEvent(new Event("visibilitychange"));
      });
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("focus"));
      });

      expect(
        await screen.findByText("Sesi untuk koki-b: pengguna"),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      if (visibilityDescriptor) {
        Object.defineProperty(
          document,
          "visibilityState",
          visibilityDescriptor,
        );
      } else {
        delete (document as { visibilityState?: string }).visibilityState;
      }
    }
  });

  it("does not refresh when focus never genuinely left", async () => {
    const fetchMock = setupFetch(sessionResponse());
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );
    await screen.findByText("Sesi untuk koki: pengguna");

    act(() => window.dispatchEvent(new Event("focus")));
    await act(async () => Promise.resolve());

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("does not repeat activation refresh after a backgrounded tab already synchronized", async () => {
    const fetchMock = setupFetch(
      sessionResponse("user", "koki-a", "user-a"),
      sessionResponse("user", "koki-b", "user-b"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );

    try {
      render(
        <UserContextProvider>
          <SessionProbe />
        </UserContextProvider>,
      );
      await screen.findByText("Sesi untuk koki-a: pengguna");

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      act(() => {
        window.dispatchEvent(new Event("blur"));
        document.dispatchEvent(new Event("visibilitychange"));
        reportExternalSessionChange();
      });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("focus"));
      });
      await act(async () => Promise.resolve());

      expect(screen.getByTestId("session-user")).toHaveTextContent("koki-b");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      if (visibilityDescriptor) {
        Object.defineProperty(
          document,
          "visibilityState",
          visibilityDescriptor,
        );
      } else {
        delete (document as { visibilityState?: string }).visibilityState;
      }
    }
  });

  it("ignores unrelated cross-tab channel messages", async () => {
    const fetchMock = setupFetch(sessionResponse());
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );
    await screen.findByText("Sesi untuk koki: pengguna");

    act(() => reportExternalMessage({ type: "session-changed" }));
    await act(async () => Promise.resolve());

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("runs one trailing refresh and ignores a superseded in-flight response", async () => {
    let resolveSuperseded!: (response: Response) => void;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sessionResponse("user", "koki-a", "user-a"))
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveSuperseded = resolve;
          }),
      )
      .mockResolvedValueOnce(sessionResponse("user", "koki-c", "user-c"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );
    await screen.findByText("Sesi untuk koki-a: pengguna");

    act(() => reportExternalSessionChange());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    act(() => reportExternalSessionChange());
    await act(async () => {
      resolveSuperseded(sessionResponse("user", "koki-b", "user-b"));
    });

    expect(
      await screen.findByText("Sesi untuk koki-c: pengguna"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sesi untuk koki-b: pengguna"),
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not let a refresh started before logout restore the old principal", async () => {
    let resolveStaleAuth!: (response: Response) => void;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sessionResponse("user", "koki-a", "user-a"))
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveStaleAuth = resolve;
          }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <SessionRefreshLogoutProbe />
      </UserContextProvider>,
    );
    await screen.findByText("koki-a");

    await interaction.click(
      screen.getByRole("button", { name: "Mulai revalidasi" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await interaction.click(
      screen.getByRole("button", { name: "Logout saat revalidasi" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("session-status")).toHaveTextContent(
        "anonymous",
      );
    });
    expect(screen.getByTestId("session-user")).toHaveTextContent("none");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await act(async () => {
      resolveStaleAuth(sessionResponse("user", "koki-a", "user-a"));
    });

    expect(screen.getByTestId("session-status")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("session-user")).toHaveTextContent("none");
  });

  it("preserves but quarantines a confirmed principal when revalidation has a server failure", async () => {
    const fetchMock = setupFetch(
      sessionResponse("user", "koki-a", "user-a"),
      new Response(JSON.stringify({ error: "Gateway unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse("user", "koki-b", "user-b"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );
    await screen.findByText("Sesi untuk koki-a: pengguna");

    act(() => reportExternalSessionChange());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByTestId("session-user")).toHaveTextContent("koki-a");
    expect(screen.getByTestId("session-status")).toHaveTextContent("loading");
    expect(screen.queryByText("Sesi anonim")).not.toBeInTheDocument();

    act(() => window.dispatchEvent(new Event("focus")));
    expect(
      await screen.findByText("Sesi untuk koki-b: pengguna"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("preserves but quarantines a confirmed principal after a network rejection", async () => {
    const errorToast = vi.spyOn(toast, "error");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sessionResponse("user", "koki-a", "user-a"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(sessionResponse("user", "koki-b", "user-b"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );
    await screen.findByText("Sesi untuk koki-a: pengguna");

    act(() => reportExternalSessionChange());
    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith("Failed to fetch", {
        id: "session-refresh-error",
      });
    });

    expect(screen.getByTestId("session-user")).toHaveTextContent("koki-a");
    expect(screen.getByTestId("session-status")).toHaveTextContent("loading");
    expect(screen.queryByText("Sesi anonim")).not.toBeInTheDocument();

    act(() => window.dispatchEvent(new Event("focus")));
    expect(
      await screen.findByText("Sesi untuk koki-b: pengguna"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("hydrates a renamed principal on focus and resets identity-bound state", async () => {
    const fetchMock = setupFetch(
      sessionResponse("user", "koki", "user-1"),
      sessionResponse("user", "koki-baru", "user-1"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <StatefulSessionProbe />
      </UserContextProvider>,
    );
    await screen.findByText("Principal aktif: koki");
    await interaction.type(screen.getByLabelText("Draft"), "draft lama");

    act(() => {
      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("focus"));
    });

    expect(
      await screen.findByText("Principal aktif: koki-baru"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Draft")).toHaveValue("");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("clears a deleted principal when a focused tab revalidates", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
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
    await screen.findByText("Sesi untuk koki: pengguna");

    act(() => {
      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("focus"));
    });

    expect(await screen.findByText("Sesi anonim")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("publishes an opaque change after consumer login without using web storage", async () => {
    const fetchMock = setupFetch(
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ message: "Logged in" }), {
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse(),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <Login />
      </UserContextProvider>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await interaction.type(screen.getByLabelText("Email"), "user@example.test");
    await interaction.type(screen.getByLabelText("Password"), "password");
    await interaction.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(FakeBroadcastChannel.postedMessages).toEqual([
      SESSION_CHANGED_MESSAGE,
    ]);
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  it("does not publish when consumer login fails", async () => {
    const fetchMock = setupFetch(
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <Login />
      </UserContextProvider>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await interaction.type(screen.getByLabelText("Email"), "user@example.test");
    await interaction.type(screen.getByLabelText("Password"), "wrong-password");
    await interaction.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(FakeBroadcastChannel.postedMessages).toEqual([]);
  });

  it("publishes exactly one opaque change after administrator login", async () => {
    const fetchMock = setupFetch(
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ message: "Logged in" }), {
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse("admin", "pengelola", "admin-1"),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <MemoryRouter initialEntries={["/admin/login"]}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/users" element={<p>Daftar pengguna admin</p>} />
          </Routes>
        </MemoryRouter>
      </UserContextProvider>,
    );
    await screen.findByLabelText("Email administrator");
    await interaction.type(
      screen.getByLabelText("Email administrator"),
      "admin@example.test",
    );
    await interaction.type(
      screen.getByLabelText("Kata sandi"),
      "secret-password",
    );
    await interaction.click(
      screen.getByRole("button", { name: "Masuk sebagai admin" }),
    );

    expect(
      await screen.findByText("Daftar pengguna admin"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(FakeBroadcastChannel.postedMessages).toEqual([
      SESSION_CHANGED_MESSAGE,
    ]);
  });

  it("does not publish when administrator login fails", async () => {
    const fetchMock = setupFetch(
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const interaction = userEvent.setup();

    render(
      <UserContextProvider>
        <MemoryRouter initialEntries={["/admin/login"]}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/users" element={<p>Daftar pengguna admin</p>} />
          </Routes>
        </MemoryRouter>
      </UserContextProvider>,
    );
    await screen.findByLabelText("Email administrator");
    await interaction.type(
      screen.getByLabelText("Email administrator"),
      "admin@example.test",
    );
    await interaction.type(
      screen.getByLabelText("Kata sandi"),
      "wrong-password",
    );
    await interaction.click(
      screen.getByRole("button", { name: "Masuk sebagai admin" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      screen.getByRole("button", { name: "Masuk sebagai admin" }),
    ).toBeEnabled();
    expect(FakeBroadcastChannel.postedMessages).toEqual([]);
  });

  it("refreshes stale shared admin state after a protected request is unauthorized", async () => {
    const fetchMock = setupFetch(
      sessionResponse("admin"),
      new Response(JSON.stringify({ error: "Session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const user = userEvent.setup();

    render(
      <UserContextProvider>
        <MemoryRouter initialEntries={["/admin/users"]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path="/admin/users" element={<ProtectedAdminProbe />} />
            </Route>
            <Route path="/admin/login" element={<p>Login administrator</p>} />
          </Routes>
        </MemoryRouter>
      </UserContextProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: "Muat halaman admin" }),
    );

    expect(await screen.findByText("Login administrator")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/\/api\/auth$/),
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });

  it("hydrates a replacement consumer session after an admin authorization failure", async () => {
    const fetchMock = setupFetch(
      sessionResponse("admin"),
      new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse("user"),
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
    await user.click(screen.getByRole("button", { name: "Muat data admin" }));

    expect(
      await screen.findByText("Sesi untuk koki: pengguna"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin: false")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retains an admin session when the authorization refresh confirms it", async () => {
    const fetchMock = setupFetch(
      sessionResponse("admin"),
      new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse("admin"),
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
    await user.click(screen.getByRole("button", { name: "Muat data admin" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    expect(
      screen.getByText("Sesi untuk koki: administrator"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin: true")).toBeInTheDocument();
  });

  it("does not refresh shared session state for unrelated admin failures", async () => {
    const fetchMock = setupFetch(
      sessionResponse("admin"),
      new Response(JSON.stringify({ error: "Gateway unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
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
    await user.click(screen.getByRole("button", { name: "Muat data admin" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(
      screen.getByText("Sesi untuk koki: administrator"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin: true")).toBeInTheDocument();
  });

  it("hydrates a replacement admin session after a consumer authorization failure", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      new Response(JSON.stringify({ error: "User access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse("admin", "pengelola"),
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
    await user.click(
      screen.getByRole("button", { name: "Kirim permintaan pengguna" }),
    );

    expect(
      await screen.findByText("Sesi untuk pengelola: administrator"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin: true")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("hydrates a renamed consumer after the old principal lookup returns 404", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
      sessionResponse("user", "koki-baru"),
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
    await user.click(
      screen.getByRole("button", { name: "Muat principal pengguna" }),
    );

    expect(
      await screen.findByText("Sesi untuk koki-baru: pengguna"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("leaves a protected consumer route after the backend rejects a deleted principal", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      new Response(JSON.stringify({ error: "User access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const user = userEvent.setup();

    render(
      <UserContextProvider>
        <MemoryRouter initialEntries={["/profile/koki"]}>
          <Routes>
            <Route element={<RequireUser />}>
              <Route path="/profile/koki" element={<ProtectedUserProbe />} />
            </Route>
            <Route path="/" element={<p>Beranda konsumen</p>} />
          </Routes>
        </MemoryRouter>
      </UserContextProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: "Muat halaman pengguna" }),
    );

    expect(await screen.findByText("Beranda konsumen")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/\/api\/auth$/),
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });

  it("does not refresh shared session state for unrelated consumer failures", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      new Response(JSON.stringify({ error: "Gateway unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
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
    await user.click(
      screen.getByRole("button", { name: "Kirim permintaan pengguna" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByText("Sesi untuk koki: pengguna")).toBeInTheDocument();
    expect(screen.getByText("Admin: false")).toBeInTheDocument();
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
    const unsupportedAny = Object.getOwnPropertyDescriptor(AbortSignal, "any");
    Object.defineProperty(AbortSignal, "any", {
      configurable: true,
      value: undefined,
    });
    const fetchMock = pendingFetch();
    vi.stubGlobal("fetch", fetchMock);
    const callerController = new AbortController();

    try {
      const request = apiRequest("/auth", { signal: callerController.signal });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      const requestSignal = fetchMock.mock.calls[0][1]?.signal;

      expect(requestSignal).not.toBe(callerController.signal);
      expect(requestSignal).not.toBe(timeoutController.signal);
      callerController.abort();
      await expect(request).rejects.toMatchObject({ name: "AbortError" });
    } finally {
      if (unsupportedAny) {
        Object.defineProperty(AbortSignal, "any", unsupportedAny);
      } else {
        delete (AbortSignal as { any?: unknown }).any;
      }
    }
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
    expect(FakeBroadcastChannel.postedMessages).toEqual([
      SESSION_CHANGED_MESSAGE,
    ]);
  });

  it("retains the confirmed session and does not publish when logout fails", async () => {
    const fetchMock = setupFetch(
      sessionResponse(),
      new Response(JSON.stringify({ error: "Gateway unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
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
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByText("Sesi untuk koki: pengguna")).toBeInTheDocument();
    expect(FakeBroadcastChannel.postedMessages).toEqual([]);
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
    expect(FakeBroadcastChannel.postedMessages).toEqual([
      SESSION_CHANGED_MESSAGE,
    ]);
  });
});
