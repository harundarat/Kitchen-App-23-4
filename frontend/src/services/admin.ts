import { api } from "./api";
import type {
  AdminLoginInput,
  AdminLoginResponse,
  AdminManagedUser,
  AdminRecipe,
  AdminRecipeDetail,
  AdminRecipeDetailResponse,
  AdminUserUpdateInput,
  AdminUserUpdateResponse,
} from "../types/api";

interface DeleteResponse {
  message: string;
}

export const adminService = {
  login: (credentials: AdminLoginInput) =>
    api.post<AdminLoginResponse>("/admin/login", credentials),

  logout: () => api.post<DeleteResponse>("/admin/logout"),

  getUsers: (signal?: AbortSignal) =>
    api.get<AdminManagedUser[]>("/admin/users", { signal }),

  getUser: (id: string, signal?: AbortSignal) =>
    api.get<AdminManagedUser>(`/admin/user/${id}`, { signal }),

  updateUser: (id: string, input: AdminUserUpdateInput) =>
    api.put<AdminUserUpdateResponse>(`/admin/user/${id}`, input),

  deleteUser: (id: string) => api.delete<DeleteResponse>(`/admin/user/${id}`),

  getRecipes: (signal?: AbortSignal) =>
    api.get<AdminRecipe[]>("/admin/recipes", { signal }),

  async getRecipe(
    id: string,
    signal?: AbortSignal,
  ): Promise<AdminRecipeDetail> {
    const { recipe, nutrition } = await api.get<AdminRecipeDetailResponse>(
      `/admin/recipe/${id}`,
      { signal },
    );
    return { ...recipe, nutrition: nutrition ?? null };
  },
};
