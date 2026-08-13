import { ApiError, api } from "./api";
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

type AuthorizationFailureListener = () => void;

const authorizationFailureListeners = new Set<AuthorizationFailureListener>();

export function subscribeToAdminAuthorizationFailures(
  listener: AuthorizationFailureListener,
): () => void {
  authorizationFailureListeners.add(listener);
  return () => {
    authorizationFailureListeners.delete(listener);
  };
}

async function protectedAdminRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      authorizationFailureListeners.forEach((listener) => listener());
    }
    throw error;
  }
}

export const adminService = {
  login: (credentials: AdminLoginInput) =>
    api.post<AdminLoginResponse>("/admin/login", credentials),

  logout: () => api.post<DeleteResponse>("/admin/logout"),

  getUsers: (signal?: AbortSignal) =>
    protectedAdminRequest(() =>
      api.get<AdminManagedUser[]>("/admin/users", { signal }),
    ),

  getUser: (id: string, signal?: AbortSignal) =>
    protectedAdminRequest(() =>
      api.get<AdminManagedUser>(`/admin/user/${id}`, { signal }),
    ),

  updateUser: (id: string, input: AdminUserUpdateInput) =>
    protectedAdminRequest(() =>
      api.put<AdminUserUpdateResponse>(`/admin/user/${id}`, input),
    ),

  deleteUser: (id: string) =>
    protectedAdminRequest(() =>
      api.delete<DeleteResponse>(`/admin/user/${id}`),
    ),

  getRecipes: (signal?: AbortSignal) =>
    protectedAdminRequest(() =>
      api.get<AdminRecipe[]>("/admin/recipes", { signal }),
    ),

  async getRecipe(
    id: string,
    signal?: AbortSignal,
  ): Promise<AdminRecipeDetail> {
    const { recipe, nutrition } = await protectedAdminRequest(() =>
      api.get<AdminRecipeDetailResponse>(`/admin/recipe/${id}`, { signal }),
    );
    return { ...recipe, nutrition: nutrition ?? null };
  },
};
