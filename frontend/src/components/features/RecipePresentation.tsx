import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { Nutrition, RecipeStep } from "../../types/api";
import {
  formatRecipeTime,
  getYouTubeEmbedUrl,
} from "./recipePresentationUtils";

export interface RecipePresentationData {
  title: string;
  image?: string;
  description?: string;
  totalTime?: string;
  video?: string;
  ingredients?: string[];
  steps?: RecipeStep[];
  categories?: string[];
  nutrition?: Nutrition | null;
}

export function RecipeHero({ recipe }: { recipe: RecipePresentationData }) {
  return (
    <section className="bg-primary/5 relative overflow-hidden rounded-lg">
      {recipe.image ? (
        <img
          src={recipe.image}
          className="aspect-[16/11] w-full object-cover md:aspect-[16/6] md:blur-[5px]"
          alt={`Foto ${recipe.title}`}
        />
      ) : (
        <div className="aspect-[16/11] w-full md:aspect-[16/6]" />
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 p-8">
        <h1 className="text-bg text-center text-xl font-bold drop-shadow-sm sm:text-3xl">
          {recipe.title}
        </h1>
        <img
          src="/kitchen-craft-ic.svg"
          alt=""
          width={30}
          className="absolute right-4 bottom-4 opacity-50 md:right-8 md:bottom-8"
        />
        {recipe.totalTime && (
          <div className="bg-accent-2 text-bg absolute bottom-4 left-4 flex h-fit w-fit items-center gap-1 rounded-full px-3 py-1 text-xs sm:bottom-6 sm:left-6 sm:text-sm">
            <Icon width={19} icon="mingcute:time-line" />
            <p>{formatRecipeTime(recipe.totalTime)}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function RecipeIngredients({
  ingredients = [],
  trailing,
}: {
  ingredients?: string[];
  trailing?: (ingredient: string) => ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">Bahan-bahan</h2>
      {ingredients.length ? (
        ingredients.map((ingredient) => (
          <div
            key={ingredient}
            className="flex min-h-11 w-full max-w-[90%] items-center justify-between gap-4 rounded-sm border border-gray-300 bg-gray-100 px-4 py-2 md:max-w-[80%]"
          >
            <p>{ingredient}</p>
            {trailing?.(ingredient)}
          </div>
        ))
      ) : (
        <p className="text-primary/60">Bahan belum dicantumkan.</p>
      )}
    </section>
  );
}

export function RecipeNutrition({
  nutrition,
}: {
  nutrition?: Nutrition | null;
}) {
  if (!nutrition) return null;
  const nutrients = [
    ["Energi Total", nutrition.calories, "kkal"],
    ["Lemak Total", nutrition.totalFat?.amount, "g"],
    ["Lemak Jenuh", nutrition.saturatedFat?.amount, "g"],
    ["Protein", nutrition.protein?.amount, "g"],
    ["Karbohidrat", nutrition.carbohydrates?.amount, "g"],
    ["Gula", nutrition.sugar?.amount, "g"],
    ["Garam", nutrition.sodium?.amount, "mg"],
  ] as const;

  return (
    <section>
      <h2 className="mb-4 font-semibold">Informasi Nilai Gizi</h2>
      <div className="grid w-full grid-cols-2 items-start gap-4 rounded-sm border border-gray-300 bg-gray-100 px-6 py-4 sm:grid-cols-5 lg:grid-cols-7">
        {nutrients.map(([label, amount, unit]) => (
          <div key={label} className="flex flex-col items-center">
            <h3 className="text-center text-sm">{label}</h3>
            <p className="font-semibold">
              {amount ?? "—"} {amount === undefined ? "" : unit}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500 italic">
        *Nilai gizi yang ditampilkan merupakan perkiraan dan mungkin tidak
        sepenuhnya akurat.
      </p>
    </section>
  );
}

export function RecipeSteps({
  steps = [],
  video,
}: Pick<RecipePresentationData, "steps" | "video">) {
  const videoUrl = video ? getYouTubeEmbedUrl(video) : null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="mt-4 font-semibold">Langkah-langkah</h2>
      {videoUrl && (
        <iframe
          title="Video resep"
          className="aspect-video w-full rounded-lg"
          src={videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
      {steps.length ? (
        steps.map((step, index) => (
          <div
            key={`${index}-${step.description}`}
            className="flex items-start gap-2"
          >
            <span className="bg-primary text-bg flex aspect-square w-7 shrink-0 items-center justify-center rounded-full">
              {index + 1}
            </span>
            <div className="flex w-full flex-col gap-2">
              <p>{step.description}</p>
              {step.image && (
                <img
                  src={step.image}
                  alt={`Foto langkah ${index + 1}`}
                  className="aspect-square w-32 rounded-sm object-cover"
                />
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-primary/60">Langkah memasak belum dicantumkan.</p>
      )}
    </section>
  );
}

export function RecipeCategories({
  categories = [],
}: {
  categories?: string[];
}) {
  if (!categories.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Kategori resep">
      {categories.map((category) => (
        <span
          key={category}
          className="bg-accent-2/10 text-primary rounded-full px-3 py-1 text-sm"
        >
          {category}
        </span>
      ))}
    </div>
  );
}
