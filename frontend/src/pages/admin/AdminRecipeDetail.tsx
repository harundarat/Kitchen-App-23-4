import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  RecipeCategories,
  RecipeHero,
  RecipeIngredients,
  RecipeNutrition,
  RecipeSteps,
} from "../../components/features/RecipePresentation";
import { ApiError } from "../../services/api";
import { adminService } from "../../services/admin";
import type { AdminRecipeDetail } from "../../types/api";
import { isValidObjectId } from "../../utils/validation";
import { getAdminRecipeErrorMessage } from "./adminRecipeMessages";

export default function AdminRecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<AdminRecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!isValidObjectId(id)) {
      setError(new ApiError(400, "ID resep tidak valid"));
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const loadRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        setRecipe(await adminService.getRecipe(id, controller.signal));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return;
        setError(loadError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadRecipe();
    return () => controller.abort();
  }, [id, retryKey]);

  if (loading) return <RecipeDetailSkeleton />;
  if (error || !recipe) {
    const status = error instanceof ApiError ? error.status : undefined;
    return (
      <div className="border-accent-1/25 bg-accent-1/5 mx-auto max-w-[720px] rounded-xl border p-7 text-center">
        <p className="text-primary">{getAdminRecipeErrorMessage(error)}</p>
        {status !== 400 && (
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="bg-primary text-bg mt-4 rounded-full px-4 py-2 font-medium"
          >
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1080px]">
      <button
        type="button"
        className="text-primary mb-5 inline-flex items-center gap-2 font-medium hover:underline"
        onClick={() => navigate("/admin/recipes")}
      >
        <Icon icon="solar:arrow-left-linear" width={20} /> Kembali ke resep
      </button>
      <RecipeHero recipe={recipe} />
      <div className="mt-5 max-w-[820px]">
        <p className="text-primary leading-7">
          {recipe.description || "Deskripsi belum dicantumkan."}
        </p>
        <RecipeCategories categories={recipe.categories} />
        <hr className="my-5 border-gray-300" />
        <RecipeIngredients ingredients={recipe.ingredients} />
        {recipe.nutrition && (
          <>
            <hr className="my-5 border-gray-300" />
            <RecipeNutrition nutrition={recipe.nutrition} />
          </>
        )}
        <hr className="my-5 border-gray-300" />
        <RecipeSteps steps={recipe.steps} video={recipe.video} />
      </div>
    </section>
  );
}

function RecipeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1080px] animate-pulse">
      <div className="bg-primary/10 aspect-[16/6] rounded-lg" />
      <div className="mt-6 max-w-[820px] space-y-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="bg-primary/10 h-12 rounded" />
        ))}
      </div>
    </div>
  );
}
