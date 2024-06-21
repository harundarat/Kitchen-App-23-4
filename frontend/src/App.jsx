import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "./context/userContext";
import { useEffect } from "react";

// Pages & Components
import Footer from "./components/layouts/Footer";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Recipe from "./pages/Recipe";
import NotFound from "./pages/NotFound";
import Simpan from "./pages/Simpan";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import Resep from "./pages/Resep";
import InputRecipe from "./pages/InputRecipe";
import About from "./pages/About";
import KontakSaran from "./pages/KontakSaran";
import Privasi from "./pages/Privasi";
import User from "./pages/User";
import { useLocation } from "react-router-dom";
import EditRecipe from "./pages/EditRecipe";

axios.defaults.baseURL = "https://api-msib-6-kitchen-app-04.educalab.id/api";
axios.defaults.withCredentials = true;

function App() {
  const showNavFoot =
    useLocation().pathname !== "/profile/edit" &&
    useLocation().pathname !== "/recipe/input" &&
    !useLocation().pathname.startsWith("/recipe/edit/");

  return (
    <UserContextProvider>
      {showNavFoot && <Navbar />}
      <Toaster position="top-center" toastOptions={{ duration: 1600 }} />
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
      {showNavFoot && <Footer />}
    </UserContextProvider>
  );
}

export default App;
