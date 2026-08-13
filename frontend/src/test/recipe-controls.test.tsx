import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ContextType } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserContext } from "../context/userContext";
import Recipe from "../pages/Recipe";
import type { Recipe as RecipeData } from "../types/api";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("../services/api", () => ({
  api: { get: mocks.get, post: mocks.post },
}));

vi.mock("react-hot-toast", () => ({
  toast: { error: mocks.error, success: mocks.success },
}));

vi.mock("../components/common/Card", () => ({
  default: () => null,
}));

vi.mock("../components/features/RecipePresentation", () => ({
  RecipeHero: () => null,
  RecipeIngredients: () => null,
  RecipeNutrition: () => null,
  RecipeSteps: () => null,
}));

type SessionValue = NonNullable<ContextType<typeof UserContext>>;

const recipe: RecipeData = {
  _id: "recipe-1",
  author: {
    username: "pembuat",
    fullName: "Pembuat Resep",
    image: "",
    website: "",
    bio: "",
  },
  title: "Sup Hangat",
  image: "/sup.webp",
  description: "Sup untuk keluarga",
  totalTime: "30",
  video: "",
  ingredients: ["air"],
  steps: [{ description: "Masak", image: "" }],
  categories: ["Sup"],
  likeCount: 17,
  isLiked: false,
  isSaved: false,
};

function sessionValue(role: "user" | "admin" | null): SessionValue {
  const authenticated = role !== null;
  return {
    user: role ? { id: `${role}-1`, username: role, role } : null,
    status: authenticated ? "authenticated" : "anonymous",
    sessionError: null,
    isLogged: authenticated,
    isUser: role === "user",
    isAdmin: role === "admin",
    refreshSession: async () => ({ user: null, error: null }),
    logout: async () => undefined,
  };
}

function renderRecipe(role: "user" | "admin" | null) {
  mocks.get.mockImplementation((endpoint: string) => {
    if (endpoint === "/recipes/recipe-1") return { recipe };
    return { recipes: [] };
  });

  return render(
    <UserContext.Provider value={sessionValue(role)}>
      <MemoryRouter initialEntries={["/recipe/recipe-1"]}>
        <Routes>
          <Route path="/recipe/:id" element={<Recipe />} />
          <Route path="/search" element={<p>Pencarian</p>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
}

describe("recipe consumer controls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps guest like, save, and report controls with their login prompts", async () => {
    vi.stubGlobal("scrollTo", vi.fn());
    const user = userEvent.setup();
    renderRecipe(null);

    const likeCount = await screen.findByText("17");
    expect(screen.getByText("Simpan")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Laporkan resep" }),
    ).toBeInTheDocument();

    await user.click(likeCount);
    expect(mocks.error).toHaveBeenCalledWith(
      "Silahkan login terlebih dahulu untuk menyukai resep",
    );

    await user.click(screen.getByText("Simpan"));
    expect(mocks.error).toHaveBeenCalledWith(
      "Silahkan login terlebih dahulu untuk menyimpan resep",
    );

    await user.click(screen.getByRole("button", { name: "Laporkan resep" }));
    await user.click(screen.getByLabelText(/Spam/));
    await user.click(screen.getByRole("button", { name: "Kirim" }));
    expect(mocks.error).toHaveBeenCalledWith(
      "Silahkan Login terlebih dahulu untuk melaporkan resep",
    );
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it("keeps consumer actions active and records the returned like state", async () => {
    vi.stubGlobal("scrollTo", vi.fn());
    mocks.post.mockResolvedValue({ liked: true, likeCount: 18 });
    const user = userEvent.setup();
    renderRecipe("user");

    await user.click(await screen.findByText("17"));

    expect(await screen.findByText("18")).toBeInTheDocument();
    expect(mocks.post).toHaveBeenCalledWith(
      "/recipes/recipe-1/like",
      undefined,
      { sessionValidation: { role: "user" } },
    );
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it("keeps consumer-only interactions hidden from administrators", async () => {
    vi.stubGlobal("scrollTo", vi.fn());
    renderRecipe("admin");

    await waitFor(() =>
      expect(mocks.get).toHaveBeenCalledWith("/recipes/recipe-1"),
    );
    expect(screen.queryByText("17")).not.toBeInTheDocument();
    expect(screen.queryByText("Simpan")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Laporkan resep" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Bagikan")).toBeInTheDocument();
  });
});
