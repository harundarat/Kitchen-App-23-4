import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserContext } from "../context/userContext";
import AdminUserDetail from "../pages/admin/AdminUserDetail";
import AdminUsers from "../pages/admin/AdminUsers";
import {
  getAdminUserLoadErrorMessage,
  getAdminUserUpdateErrorMessage,
} from "../pages/admin/adminUserMessages";
import { ApiError } from "../services/api";
import { adminService } from "../services/admin";
import type { AdminManagedUser } from "../types/api";

vi.mock("../services/admin", () => ({
  adminService: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const users: AdminManagedUser[] = [
  {
    _id: "507f1f77bcf86cd799439011",
    username: "DapurHebat",
    fullName: "Dapur Hebat",
    email: "dapur@example.test",
  },
  {
    _id: "507f1f77bcf86cd799439012",
    username: "koki_malam",
    fullName: "Koki Malam",
    email: "malam@example.test",
  },
];

const adminContext = {
  user: { id: "admin-1", username: "admin", role: "admin" as const },
  status: "authenticated" as const,
  sessionError: null,
  isLogged: true,
  isUser: false,
  isAdmin: true,
  refreshSession: async () => ({ user: null, error: null }),
  logout: async () => undefined,
};

function renderUsers() {
  return render(
    <UserContext.Provider value={adminContext}>
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    </UserContext.Provider>,
  );
}

function renderDetail(id = users[0]._id) {
  return render(
    <UserContext.Provider value={adminContext}>
      <MemoryRouter initialEntries={[`/admin/users/${id}`]}>
        <Routes>
          <Route path="/admin/users" element={<p>Daftar pengguna</p>} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
}

describe("admin user management", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads users and filters username and full name without case sensitivity", async () => {
    service.getUsers.mockResolvedValue(users);
    const user = userEvent.setup();
    renderUsers();

    expect(await screen.findByText("@DapurHebat")).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "Cari pengguna" }),
      "KOKI MALAM",
    );

    expect(screen.getByText("@koki_malam")).toBeInTheDocument();
    expect(screen.queryByText("@DapurHebat")).not.toBeInTheDocument();
  });

  it("renders empty and retryable load-error states", async () => {
    service.getUsers.mockResolvedValueOnce([]);
    const empty = renderUsers();
    expect(await screen.findByText("Belum ada pengguna")).toBeInTheDocument();
    empty.unmount();

    service.getUsers.mockRejectedValueOnce(new Error("Server bermasalah"));
    service.getUsers.mockResolvedValueOnce(users);
    const user = userEvent.setup();
    renderUsers();
    expect(await screen.findByText("Server bermasalah")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByText("@DapurHebat")).toBeInTheDocument();
  });

  it("requires confirmation before deleting a list row then removes it locally", async () => {
    service.getUsers.mockResolvedValue(users);
    service.deleteUser.mockResolvedValue({ message: "deleted" });
    const user = userEvent.setup();
    renderUsers();

    await screen.findByText("@DapurHebat");
    await user.click(screen.getAllByRole("button", { name: "Hapus" })[0]);
    expect(screen.getByText("Hapus pengguna?")).toBeInTheDocument();
    expect(service.deleteUser).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(service.deleteUser).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole("button", { name: "Hapus" })[0]);
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    await waitFor(() => {
      expect(service.deleteUser).toHaveBeenCalledWith(users[0]._id);
    });
    expect(screen.queryByText("@DapurHebat")).not.toBeInTheDocument();
  });

  it("loads a user detail, cancels edits, and sends the current update payload", async () => {
    service.getUser.mockResolvedValue(users[0]);
    service.updateUser.mockResolvedValue({
      message: "updated",
      user: { ...users[0], fullName: "Dapur Baru" },
    });
    const user = userEvent.setup();
    renderDetail();

    expect(
      await screen.findByRole("heading", { name: "Dapur Hebat" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit pengguna" }));
    await user.clear(screen.getByLabelText("Nama lengkap"));
    await user.type(screen.getByLabelText("Nama lengkap"), "Tidak disimpan");
    await user.click(screen.getByRole("button", { name: "Batal" }));
    await user.click(screen.getByRole("button", { name: "Edit pengguna" }));
    expect(screen.getByLabelText("Nama lengkap")).toHaveValue("Dapur Hebat");

    await user.clear(screen.getByLabelText("Nama lengkap"));
    await user.type(screen.getByLabelText("Nama lengkap"), "Dapur Baru");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => {
      expect(service.updateUser).toHaveBeenCalledWith(users[0]._id, {
        username: "DapurHebat",
        fullName: "Dapur Baru",
        email: "dapur@example.test",
      });
    });
    expect(
      await screen.findByRole("heading", { name: "Dapur Baru" }),
    ).toBeInTheDocument();
  });

  it("shows a missing user state and navigates after confirmed detail deletion", async () => {
    service.getUser.mockRejectedValueOnce(new ApiError(404, "Not found"));
    const missing = renderDetail();
    expect(
      await screen.findByText(/Pengguna tidak ditemukan/i),
    ).toBeInTheDocument();
    missing.unmount();

    service.getUser.mockResolvedValue(users[0]);
    service.deleteUser.mockResolvedValue({ message: "deleted" });
    const user = userEvent.setup();
    renderDetail();
    await screen.findByRole("heading", { name: "Dapur Hebat" });
    await user.click(screen.getByRole("button", { name: "Hapus pengguna" }));
    await user.click(screen.getByRole("button", { name: "Hapus" }));
    expect(await screen.findByText("Daftar pengguna")).toBeInTheDocument();
  });

  it("rejects malformed user IDs without requesting user details", async () => {
    renderDetail("invalid");

    expect(
      await screen.findByText("ID pengguna tidak valid."),
    ).toBeInTheDocument();
    expect(service.getUser).not.toHaveBeenCalled();
  });

  it("maps validation, authorization, not-found, conflict, and server failures to clear feedback", () => {
    expect(getAdminUserLoadErrorMessage(new ApiError(400, "bad"))).toBe(
      "ID pengguna tidak valid.",
    );
    expect(getAdminUserLoadErrorMessage(new ApiError(401, "expired"))).toBe(
      "Sesi admin sudah berakhir. Silakan login kembali.",
    );
    expect(getAdminUserLoadErrorMessage(new ApiError(403, "forbidden"))).toBe(
      "Anda tidak memiliki izin untuk melihat pengguna ini.",
    );
    expect(getAdminUserLoadErrorMessage(new ApiError(404, "missing"))).toBe(
      "Pengguna tidak ditemukan atau sudah dihapus.",
    );
    expect(getAdminUserUpdateErrorMessage(new ApiError(409, "duplicate"))).toBe(
      "Username atau email tersebut sudah digunakan.",
    );
    expect(getAdminUserUpdateErrorMessage(new ApiError(500, "server"))).toBe(
      "Server gagal memperbarui pengguna. Coba lagi.",
    );
  });
});
