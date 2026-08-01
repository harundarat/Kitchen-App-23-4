export interface SessionUser {
  id: string;
  username: string;
  role: "user" | "admin";
}

export interface UserProfile {
  _id?: string;
  id?: string;
  image: string;
  username: string;
  fullName: string;
  email?: string;
  website: string;
  bio: string;
  preferences?: string[];
}

export interface Category {
  _id?: string;
  title: string;
  image: string;
}

export interface AdditionalInfo {
  bahan: string[];
  kategori: Category[];
}

export interface Nutrient {
  amount: number;
  unit: "g" | "mg";
  dailyValuePercent?: number;
}

export interface Nutrition {
  calories?: number;
  totalFat?: Nutrient;
  saturatedFat?: Nutrient;
  protein?: Nutrient;
  carbohydrates?: Nutrient;
  sugar?: Nutrient;
  sodium?: Nutrient;
}

export interface RecipeStep {
  description: string;
  image: string;
}

export interface Recipe {
  _id: string;
  author: UserProfile;
  title: string;
  image: string;
  description: string;
  totalTime: string;
  video: string;
  ingredients: string[];
  steps: RecipeStep[];
  categories: string[];
  likeCount: number;
  nutrition?: Nutrition | null;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface RecipesResponse {
  recipes: Recipe[];
  pagination: Pagination;
}

export interface UserResponse {
  user: UserProfile;
  recipes: Recipe[];
}

export interface RecipeResponse {
  recipe: Recipe;
}
