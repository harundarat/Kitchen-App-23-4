import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "./context/userContext";
import { AdditionalInfoProvider } from "./context/additionalInfoContext";

// Pages & Components
import Footer from "./components/layouts/Footer";
import Navbar from "./components/layouts/Navbar";
const About = lazy(() => import("./pages/About"));
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
  const { pathname } = useLocation();
  const showNavFoot =
    pathname !== "/profile/edit" &&
    pathname !== "/recipe/input" &&
    !pathname.startsWith("/recipe/edit/");

  return (
    <UserContextProvider>
      <AdditionalInfoProvider>
        {showNavFoot && <Navbar />}
        <Toaster position="top-center" toastOptions={{ duration: 1600 }} />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/recipe/input" element={<InputRecipe />} />
            <Route path="/recipe/edit/:idRecipe" element={<EditRecipe />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/privasi" element={<Privasi />} />
            <Route path="/about/kontak-saran" element={<KontakSaran />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {showNavFoot && <Footer />}
      </AdditionalInfoProvider>
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
