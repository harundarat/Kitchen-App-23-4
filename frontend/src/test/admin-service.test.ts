import { afterEach, describe, expect, it, vi } from "vitest";
import { adminService } from "../services/admin";

describe("adminService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("normalizes the current recipe and nutrition response into a display DTO", async () => {
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          recipe: {
            _id: "recipe-1",
            title: "Sup Hangat",
            totalTime: "45",
            categories: ["Sup"],
            steps: [{ description: "Masak", image: "" }],
          },
          nutrition: { calories: 123 },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(adminService.getRecipe("recipe-1")).resolves.toEqual({
      _id: "recipe-1",
      title: "Sup Hangat",
      totalTime: "45",
      categories: ["Sup"],
      steps: [{ description: "Masak", image: "" }],
      nutrition: { calories: 123 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/admin\/recipe\/recipe-1$/),
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });
});
