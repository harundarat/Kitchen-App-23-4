import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ContextType, type ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminLayout from "../components/layouts/AdminLayout";
import { RequireAdmin } from "../components/layouts/RequireRole";
import { UserContext } from "../context/userContext";
import AdminLogin from "../pages/admin/AdminLogin";

const adminServiceMock = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock("../services/admin", () => ({ adminService: adminServiceMock }));

type SessionValue = NonNullable<ContextType<typeof UserContext>>;
type Role = "user" | "admin" | null;

function sessionValue(
  role: Role,
  status: SessionValue["status"] = role ? "authenticated" : "anonymous",
  overrides: Partial<SessionValue> = {},
): SessionValue {
  const isLogged = status === "authenticated";
  return {
    user: role ? { id: `${role}-1`, username: role, role } : null,
    status,
    sessionError: null,
    isLogged,
    isUser: isLogged && role === "user",
    isAdmin: isLogged && role === "admin",
    refreshSession: async () => undefined,
    logout: async () => undefined,
    ...overrides,
  };
}

function SessionProvider({
  value,
  children,
}: {
  value: SessionValue;
  children: ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function renderProtectedRoute(value: SessionValue) {
  return render(
    <SessionProvider value={value}>
      <MemoryRouter initialEntries={["/admin/recipes"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin/recipes" element={<p>Resep terlindungi</p>} />
          </Route>
          <Route path="/admin/login" element={<p>Login administrator</p>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

function renderAdminLayout(value: SessionValue) {
  return render(
    <SessionProvider value={value}>
      <MemoryRouter initialEntries={["/admin/recipes"]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="users" element={<p>Daftar pengguna</p>} />
            <Route path="recipes" element={<p>Daftar resep</p>} />
          </Route>
          <Route path="/admin/login" element={<p>Login administrator</p>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

function AdminLoginHarness({ initialRole = null }: { initialRole?: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const value = sessionValue(role, role ? "authenticated" : "anonymous", {
    refreshSession: async () => setRole("admin"),
  });

  return (
    <SessionProvider value={value}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/admin/login",
            state: { from: { pathname: "/admin/recipes" } },
          },
        ]}
      >
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/recipes" element={<p>Detail resep admin</p>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>
  );
}

describe("administrator routes and shell", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("keeps a protected route pending while session state is loading", () => {
    renderProtectedRoute(sessionValue(null, "loading"));

    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi...");
    expect(screen.queryByText("Login administrator")).not.toBeInTheDocument();
  });

  it("sends anonymous and normal-user sessions to admin login", () => {
    const anonymous = renderProtectedRoute(sessionValue(null));
    expect(screen.getByText("Login administrator")).toBeInTheDocument();
    anonymous.unmount();

    renderProtectedRoute(sessionValue("user"));
    expect(screen.getByText("Login administrator")).toBeInTheDocument();
  });

  it("renders the originally requested route for an administrator", () => {
    renderProtectedRoute(sessionValue("admin"));

    expect(screen.getByText("Resep terlindungi")).toBeInTheDocument();
  });

  it("uses URL-backed active navigation and accessible drawer controls", () => {
    renderAdminLayout(sessionValue("admin"));

    expect(screen.getByText("Daftar resep")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Resep" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("button", { name: "Buka navigasi admin" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "Ciutkan navigasi admin" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("returns to a protected deep link after administrator login", async () => {
    adminServiceMock.login.mockResolvedValue({});
    const user = userEvent.setup();
    render(<AdminLoginHarness />);

    await user.type(
      screen.getByLabelText("Email administrator"),
      "admin@example.test",
    );
    await user.type(screen.getByLabelText("Kata sandi"), "secret-password");
    await user.click(
      screen.getByRole("button", { name: "Masuk sebagai admin" }),
    );

    expect(adminServiceMock.login).toHaveBeenCalledWith({
      email: "admin@example.test",
      password: "secret-password",
    });
    expect(await screen.findByText("Detail resep admin")).toBeInTheDocument();
  });

  it("keeps failed admin login in place and warns when replacing a user session", async () => {
    adminServiceMock.login.mockRejectedValue(new Error("Kredensial salah"));
    const user = userEvent.setup();
    render(<AdminLoginHarness initialRole="user" />);

    expect(
      screen.getByText(/akan menggantikan sesi pengguna saat ini/i),
    ).toBeInTheDocument();
    await user.type(
      screen.getByLabelText("Email administrator"),
      "admin@example.test",
    );
    await user.type(screen.getByLabelText("Kata sandi"), "wrong-password");
    await user.click(
      screen.getByRole("button", { name: "Masuk sebagai admin" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Masuk sebagai admin" }),
      ).toBeEnabled();
    });
    expect(screen.getByLabelText("Email administrator")).toBeInTheDocument();
  });

  it("logs out from the admin shell and removes protected content", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderAdminLayout(sessionValue("admin", "authenticated", { logout }));

    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(logout).toHaveBeenCalledOnce();
    expect(await screen.findByText("Login administrator")).toBeInTheDocument();
    expect(screen.queryByText("Daftar resep")).not.toBeInTheDocument();
  });
});
