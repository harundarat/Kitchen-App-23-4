import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  ConsumerEditorLayout,
  ConsumerLayout,
} from "./components/layouts/ConsumerLayouts";
import { RequireAdmin, RequireUser } from "./components/layouts/RequireRole";
import { UserContextProvider } from "./context/userContext";

const About = lazy(() => import("./pages/About"));
const AdminLayout = lazy(() => import("./components/layouts/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminNotFound = lazy(() => import("./pages/admin/AdminNotFound"));
const AdminRecipeDetail = lazy(() => import("./pages/admin/AdminRecipeDetail"));
const AdminRecipes = lazy(() => import("./pages/admin/AdminRecipes"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const EditRecipe = lazy(() => import("./pages/EditRecipe"));
const Home = lazy(() => import("./pages/Home"));
const InputRecipe = lazy(() => import("./pages/InputRecipe"));
const KontakSaran = lazy(() => import("./pages/KontakSaran"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privasi = lazy(() => import("./pages/Privasi"));
const Profile = lazy(() => import("./pages/Profile"));
const Recipe = lazy(() => import("./pages/Recipe"));
const Search = lazy(() => import("./pages/Search"));
const User = lazy(() => import("./pages/User"));

function App() {
  return (
    <UserContextProvider>
      <Toaster position="top-center" toastOptions={{ duration: 1600 }} />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<ConsumerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/privasi" element={<Privasi />} />
            <Route path="/about/kontak-saran" element={<KontakSaran />} />
            <Route path="/user/:username" element={<User />} />
            <Route element={<RequireUser />}>
              <Route path="/profile/:username" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<RequireUser />}>
            <Route element={<ConsumerEditorLayout />}>
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/recipe/input" element={<InputRecipe />} />
              <Route path="/recipe/edit/:idRecipe" element={<EditRecipe />} />
            </Route>
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="recipes" element={<AdminRecipes />} />
              <Route path="recipes/:id" element={<AdminRecipeDetail />} />
              <Route path="*" element={<AdminNotFound />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </UserContextProvider>
  );
}

function RouteFallback() {
  return (
    <main
      className="flex min-h-svh items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="border-primary/20 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
      <span className="sr-only">Memuat halaman...</span>
    </main>
  );
}

export default App;
