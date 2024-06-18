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

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL_DEV;
axios.defaults.withCredentials = true;

function App() {
  const showNavFoot =
    window.location.pathname !== "/edit-profile" &&
    window.location.pathname !== "/recipe/input";

  return (
    <UserContextProvider>
      {showNavFoot && <Navbar />}
      <Toaster position="top-center" toastOptions={{ duration: 1200 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/Simpan" element={<Simpan />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recipe/input" element={<InputRecipe />} />
        <Route path="/resep" element={<Resep />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/about" element={<About/>}/>
        <Route path="/about/privasi" element={<Privasi/>}/>
        <Route path="/about/Kontak-saran" element={<KontakSaran/>}/>
      </Routes>
      {showNavFoot && <Footer />}
    </UserContextProvider>
  );
}

export default App;
