import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecipeNutrition } from "../components/features/RecipePresentation";

describe("RecipeNutrition", () => {
  it("renders each nutrient with the unit returned by the API", () => {
    render(
      <RecipeNutrition
        nutrition={{
          calories: 250,
          totalFat: { amount: 900, unit: "mg" },
          saturatedFat: { amount: 2, unit: "g" },
          protein: { amount: 500, unit: "mg" },
          carbohydrates: { amount: 30, unit: "g" },
          sugar: { amount: 800, unit: "mg" },
          sodium: { amount: 1, unit: "g" },
        }}
      />,
    );

    const expectedValues = [
      ["Energi Total", "250 kkal"],
      ["Lemak Total", "900 mg"],
      ["Lemak Jenuh", "2 g"],
      ["Protein", "500 mg"],
      ["Karbohidrat", "30 g"],
      ["Gula", "800 mg"],
      ["Garam", "1 g"],
    ] as const;

    expectedValues.forEach(([label, value]) => {
      expect(
        screen.getByRole("heading", { name: label }).parentElement,
      ).toHaveTextContent(value);
    });
  });
});
