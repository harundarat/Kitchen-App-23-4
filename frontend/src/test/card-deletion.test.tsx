import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Card from "../components/common/Card";

const mocks = vi.hoisted(() => ({
  deleteRecipe: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("../services/api", () => ({
  api: { delete: mocks.deleteRecipe },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: mocks.success, error: mocks.error },
}));

function renderDeletableCard(reload = vi.fn()) {
  render(
    <MemoryRouter>
      <Card id="recipe-1" title="Sup hangat" deletable reload={reload} />
    </MemoryRouter>,
  );
  return reload;
}

describe("consumer recipe deletion", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("disables dialog controls and prevents duplicate requests while deleting", async () => {
    let resolveDelete: (() => void) | undefined;
    mocks.deleteRecipe.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }),
    );
    const reload = renderDeletableCard();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "Hapus resep Sup hangat" }),
    );
    const confirm = screen.getByRole("button", { name: "Hapus" });
    await user.click(confirm);

    expect(mocks.deleteRecipe).toHaveBeenCalledOnce();
    expect(mocks.deleteRecipe).toHaveBeenCalledWith("/recipes/recipe-1", {
      sessionValidation: { role: "user" },
    });
    expect(screen.getByRole("button", { name: "Menghapus..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Batal" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Menghapus..." }));
    expect(mocks.deleteRecipe).toHaveBeenCalledOnce();

    resolveDelete?.();
    await waitFor(() => expect(reload).toHaveBeenCalledWith(true));
    expect(mocks.success).toHaveBeenCalledWith("Resep berhasil dihapus");
  });

  it("restores controls and preserves error feedback after a failed delete", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.deleteRecipe.mockRejectedValue(new Error("Server unavailable"));
    renderDeletableCard();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "Hapus resep Sup hangat" }),
    );
    await user.click(screen.getByRole("button", { name: "Hapus" }));

    await waitFor(() => {
      expect(mocks.error).toHaveBeenCalledWith("Gagal menghapus resep");
    });
    expect(screen.getByRole("button", { name: "Hapus" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Batal" })).toBeEnabled();
  });
});
