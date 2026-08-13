import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserContext } from "../context/userContext";
import AdminRecipeDetailPage from "../pages/admin/AdminRecipeDetail";
import AdminRecipes from "../pages/admin/AdminRecipes";
import { getAdminRecipeErrorMessage } from "../pages/admin/adminRecipeMessages";
import { ApiError } from "../services/api";
import { adminService } from "../services/admin";
import type { AdminRecipe, AdminRecipeDetail } from "../types/api";

vi.mock("../services/admin", () => ({
  adminService: {
    getRecipes: vi.fn(),
    getRecipe: vi.fn(),
  },
}));

const service = vi.mocked(adminService);
const recipe: AdminRecipe = {
  _id: "507f1f77bcf86cd799439013",
  title: "Sup Hangat",
  description: "Sup ayam untuk makan malam.",
  totalTime: "75",
  categories: ["Sup", "Makan malam"],
};
const detail: AdminRecipeDetail = {
  ...recipe,
  image: "https://example.test/sup.jpg",
  ingredients: ["1 ayam", "2 wortel"],
  steps: [
    { description: "Didihkan kaldu", image: "" },
    { description: "Masukkan sayuran", image: "https://example.test/step.jpg" },
  ],
  video: "https://www.youtube.com/watch?v=abc123",
  nutrition: { calories: 320, protein: { amount: 24, unit: "g" } },
};

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

function renderList() {
  return render(
    <UserContext.Provider value={adminContext}>
      <MemoryRouter>
        <AdminRecipes />
      </MemoryRouter>
    </UserContext.Provider>,
  );
}

function renderDetail(id = recipe._id) {
  return render(
    <UserContext.Provider value={adminContext}>
      <MemoryRouter initialEntries={[`/admin/recipes/${id}`]}>
        <Routes>
          <Route path="/admin/recipes" element={<p>Daftar resep</p>} />
          <Route
            path="/admin/recipes/:id"
            element={<AdminRecipeDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
}

describe("admin recipe management", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads recipes, supports an empty state, and filters titles case-insensitively", async () => {
    service.getRecipes.mockResolvedValueOnce([]);
    const empty = renderList();
    expect(await screen.findByText("Belum ada resep")).toBeInTheDocument();
    empty.unmount();

    service.getRecipes.mockResolvedValue([
      recipe,
      { ...recipe, _id: "second", title: "Sate Pagi" },
    ]);
    const user = userEvent.setup();
    renderList();
    expect(await screen.findByText("Sup Hangat")).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "Cari resep" }),
      "sate",
    );
    expect(screen.getByText("Sate Pagi")).toBeInTheDocument();
    expect(screen.queryByText("Sup Hangat")).not.toBeInTheDocument();
  });

  it("renders current structured recipe fields without consumer mutation controls", async () => {
    service.getRecipe.mockResolvedValue(detail);
    renderDetail();

    expect(
      await screen.findByRole("heading", { name: "Sup Hangat" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sup ayam untuk makan malam.")).toBeInTheDocument();
    expect(screen.getByText("1 ayam")).toBeInTheDocument();
    expect(screen.getByText("Didihkan kaldu")).toBeInTheDocument();
    expect(screen.getByAltText("Foto langkah 2")).toHaveAttribute(
      "src",
      "https://example.test/step.jpg",
    );
    expect(screen.getByTitle("Video resep")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abc123",
    );
    expect(screen.getByText("320 kkal")).toBeInTheDocument();
    expect(screen.queryByText("Simpan")).not.toBeInTheDocument();
    expect(screen.queryByText("Bagikan")).not.toBeInTheDocument();
    expect(screen.queryByText("Laporkan")).not.toBeInTheDocument();
    expect(screen.queryByText("Cek Harga")).not.toBeInTheDocument();
  });

  it("tolerates optional recipe fields and shows invalid and missing recipe states", async () => {
    service.getRecipe.mockResolvedValueOnce({
      _id: recipe._id,
      title: "Resep Ringkas",
      nutrition: null,
    });
    const optional = renderDetail();
    expect(
      await screen.findByRole("heading", { name: "Resep Ringkas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bahan belum dicantumkan.")).toBeInTheDocument();
    expect(
      screen.getByText("Langkah memasak belum dicantumkan."),
    ).toBeInTheDocument();
    optional.unmount();

    service.getRecipe.mockRejectedValueOnce(
      new ApiError(400, "Invalid recipe id"),
    );
    const invalid = renderDetail("invalid");
    expect(
      await screen.findByText("ID resep tidak valid."),
    ).toBeInTheDocument();
    invalid.unmount();

    service.getRecipe.mockRejectedValueOnce(new ApiError(404, "Not found"));
    renderDetail();
    expect(
      await screen.findByText(/Resep tidak ditemukan/i),
    ).toBeInTheDocument();
  });

  it("maps authorization and server failures to explicit feedback", () => {
    expect(getAdminRecipeErrorMessage(new ApiError(401, "expired"))).toBe(
      "Sesi admin sudah berakhir. Silakan login kembali.",
    );
    expect(getAdminRecipeErrorMessage(new ApiError(403, "forbidden"))).toBe(
      "Anda tidak memiliki izin untuk melihat resep ini.",
    );
    expect(getAdminRecipeErrorMessage(new ApiError(500, "server"))).toBe(
      "Server gagal memuat resep. Coba lagi.",
    );
  });
});
