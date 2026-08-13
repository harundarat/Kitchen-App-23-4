import { api } from "./api";
import { ADMIN_SESSION_VALIDATION } from "./sessionRecovery";
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
    api.get<AdminManagedUser[]>("/admin/users", {
      signal,
      sessionValidation: ADMIN_SESSION_VALIDATION,
    }),

  getUser: (id: string, signal?: AbortSignal) =>
    api.get<AdminManagedUser>(`/admin/user/${id}`, {
      signal,
      sessionValidation: ADMIN_SESSION_VALIDATION,
    }),

  updateUser: (id: string, input: AdminUserUpdateInput) =>
    api.put<AdminUserUpdateResponse>(`/admin/user/${id}`, input, {
      sessionValidation: ADMIN_SESSION_VALIDATION,
    }),

  deleteUser: (id: string) =>
    api.delete<DeleteResponse>(`/admin/user/${id}`, {
      sessionValidation: ADMIN_SESSION_VALIDATION,
    }),

  getRecipes: (signal?: AbortSignal) =>
    api.get<AdminRecipe[]>("/admin/recipes", {
      signal,
      sessionValidation: ADMIN_SESSION_VALIDATION,
    }),

  async getRecipe(
    id: string,
    signal?: AbortSignal,
  ): Promise<AdminRecipeDetail> {
    const { recipe, nutrition } = await api.get<AdminRecipeDetailResponse>(
      `/admin/recipe/${id}`,
      { signal, sessionValidation: ADMIN_SESSION_VALIDATION },
    );
    return { ...recipe, nutrition: nutrition ?? null };
  },
};
