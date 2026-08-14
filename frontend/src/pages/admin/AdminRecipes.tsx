import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InputWbtn from "../../components/common/InputWbtn";
import { adminService } from "../../services/admin";
import type { AdminRecipe } from "../../types/api";
import { getAdminRecipeErrorMessage } from "./adminRecipeMessages";

function recipeMatchesSearch(recipe: AdminRecipe, search: string): boolean {
  return recipe.title
    .toLocaleLowerCase()
    .includes(search.trim().toLocaleLowerCase());
}

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        setRecipes(await adminService.getRecipes(controller.signal));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return;
        setError(loadError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadRecipes();
    return () => controller.abort();
  }, [retryKey]);

  const filteredRecipes = useMemo(
    () => recipes.filter((recipe) => recipeMatchesSearch(recipe, search)),
    [recipes, search],
  );

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-primary text-2xl font-bold">Resep</h1>
          <p className="text-primary/65 mt-1">
            Lihat resep yang dipublikasikan pengguna.
          </p>
        </div>
        <InputWbtn
          type="search"
          value={search}
          onChange={setSearch}
          onClick={setSearch}
          placeholder="Cari judul resep"
          ariaLabel="Cari resep"
          buttonLabel="Cari resep"
          iconify="ri:search-line"
          className="w-full sm:max-w-sm"
        />
      </div>

      {loading ? (
        <RecipeTableSkeleton />
      ) : error ? (
        <RecipeLoadError
          error={error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      ) : recipes.length === 0 ? (
        <RecipeEmptyState title="Belum ada resep" />
      ) : filteredRecipes.length === 0 ? (
        <RecipeEmptyState title="Resep tidak ditemukan" />
      ) : (
        <div className="border-primary/10 bg-bg overflow-x-auto rounded-xl border shadow-sm">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Judul</TableHeadCell>
                <TableHeadCell>Deskripsi</TableHeadCell>
                <TableHeadCell>Waktu</TableHeadCell>
                <TableHeadCell>Kategori</TableHeadCell>
                <TableHeadCell>
                  <span className="sr-only">Aksi</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-primary/10 divide-y">
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe._id} className="bg-bg">
                  <TableCell className="text-primary max-w-48 font-medium">
                    <span className="line-clamp-2">{recipe.title}</span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="line-clamp-2">
                      {recipe.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell>{recipe.totalTime || "—"}</TableCell>
                  <TableCell>{recipe.categories?.join(", ") || "—"}</TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/recipes/${recipe._id}`}
                      className="text-primary border-primary/20 hover:bg-primary hover:text-bg focus-visible:outline-primary rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      Detail
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function RecipeTableSkeleton() {
  return (
    <div className="border-primary/10 bg-bg overflow-hidden rounded-xl border shadow-sm">
      <div className="space-y-4 p-5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-primary/10 h-11 animate-pulse rounded"
          />
        ))}
      </div>
    </div>
  );
}

function RecipeEmptyState({ title }: { title: string }) {
  return (
    <div className="border-primary/20 bg-bg rounded-xl border border-dashed px-6 py-14 text-center">
      <Icon
        icon="hugeicons:album-not-found-01"
        className="text-primary/45 mx-auto"
        width={44}
      />
      <p className="text-primary mt-3 font-medium">{title}</p>
    </div>
  );
}

function RecipeLoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="border-accent-1/25 bg-accent-1/5 rounded-xl border p-6 text-center">
      <p className="text-primary">{getAdminRecipeErrorMessage(error)}</p>
      <button
        type="button"
        className="bg-primary text-bg mt-4 rounded-full px-4 py-2 font-medium"
        onClick={onRetry}
      >
        Coba lagi
      </button>
    </div>
  );
}
