import type { AdditionalInfo, Category } from "../types/api";
import fallbackData from "./addData.json";
import { api } from "./api";

const CACHE_KEY = "additionalInfo";

function isAdditionalInfo(value: unknown): value is AdditionalInfo {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AdditionalInfo>;
  return (
    Array.isArray(candidate.bahan) &&
    candidate.bahan.every((item) => typeof item === "string") &&
    Array.isArray(candidate.kategori) &&
    candidate.kategori.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Category).title === "string" &&
        typeof (item as Category).image === "string",
    )
  );
}

function readCache(): AdditionalInfo | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const parsed: unknown = JSON.parse(cached);
    if (
      isAdditionalInfo(parsed) &&
      parsed.bahan.length &&
      parsed.kategori.length
    ) {
      return parsed;
    }
  } catch {
    // Invalid or outdated data is replaced below.
  }

  localStorage.removeItem(CACHE_KEY);
  return null;
}

const fallback: AdditionalInfo = fallbackData;

export async function additionalInfo(): Promise<AdditionalInfo> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const [categoryData, ingredientData] = await Promise.all([
      api.get<{ categories: Category[] }>("/categories"),
      api.get<{ ingredients: string[] }>("/ingredients"),
    ]);
    const result: AdditionalInfo = {
      kategori: categoryData.categories,
      bahan: ingredientData.ingredients,
    };
    if (!result.kategori.length || !result.bahan.length) return fallback;
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    return result;
  } catch {
    return fallback;
  }
}
