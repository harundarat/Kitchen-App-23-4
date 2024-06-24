import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { UserContext } from "../context/userContext";
import axios from "axios";
import { Icon } from "@iconify/react";
import BlankProfile from "../assets/blank_profile.webp";
import toast from "react-hot-toast";
import Card from "../components/common/Card";

export default function Profile() {
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const { isLogged } = useContext(UserContext);
  const { username } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState("recipes");
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    const tab = urlSearchParams.get("tab");
    if (!tab) {
      setActiveTab("recipes");
    }
    if (tab === "saved") {
      setActiveTab("saved");
    }
    if (tab !== "saved") {
      urlSearchParams.set("tab", "recipes");
      setActiveTab("recipes");
    }
  }, [useLocation().search]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/users/${username}`);
        const data = response.data;
        setUser(data);
        setDeleted(false);
      } catch (error) {
        console.log("🚀 ~ fetchUser ~ error:", error);
        toast.error("Error fetching user data.");
        navigate("/user");
      }
    };
    const authorize = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/auth/authorized/${username}`);
        if (response.status === 200) {
          fetchUser();
        }
      } catch (error) {
        console.log("🚀 ~ authorize ~ error:", error);
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };
    authorize();
  }, [isLogged, deleted]);

  const tabHandler = (tab) => {
    urlSearchParams.set("tab", tab);
    navigate(`/profile/${username}?${urlSearchParams.toString()}`);
    setActiveTab(tab);
  };

  return (
    <>
      {/* {loading && (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary bg-opacity-50 backdrop-blur">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded bg-bg font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )} */}
      <main className="mb-24 mt-32 min-h-svh px-5 lg:px-0">
        <section className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 sm:flex-row">
          <img
            className="aspect-square h-fit w-24 rounded-full"
            src={user.user?.image || BlankProfile}
            alt="profile picture"
          />
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-xl font-bold">
              {user.user?.fullName || "....."}
            </h1>
            {user.user?.website && (
              <a
                className="font-medium italic text-accent-1 underline"
                href={user.user?.website}
                target="_blank"
              >
                {user.user?.website}
              </a>
            )}
            {user.user?.bio && <p>{user.user?.bio}</p>}
          </div>
          <button
            onClick={() => navigate("/profile/edit")}
            className="mt-2 flex h-fit w-fit items-center gap-2 rounded-full border border-primary px-4 py-2 transition-all hover:bg-primary hover:text-bg active:scale-95 sm:ml-auto"
          >
            <Icon icon="uil:setting" />
            Pengaturan
          </button>
        </section>
        <hr className="mx-auto mt-6 w-full max-w-[1080px]" />
        <div className="mx-auto mt-6 flex w-full max-w-[1080px] justify-end">
          <button
            onClick={() => navigate("/recipe/input")}
            className="bo flex items-center gap-2 rounded-full border bg-primary px-4 py-2 text-bg transition-all hover:border-primary hover:bg-bg hover:text-primary active:scale-95"
          >
            Tambah Resep Baru
            <Icon icon="fluent:add-12-filled" />
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-[1080px] items-center justify-center gap-10 pt-4">
          <button
            onClick={() => tabHandler("recipes")}
            className={`w-44 border-b-2 py-3 ${activeTab === "recipes" ? "border-accent-1" : ""}`}
          >
            Resep Kamu
          </button>
          <button
            onClick={() => tabHandler("saved")}
            className={`w-44 border-b-2 py-3 ${activeTab === "saved" ? "border-accent-1" : ""}`}
          >
            Resep Disimpan
          </button>
        </div>
        <section className="mx-auto mt-4 flex w-full max-w-[1080px]">
          {activeTab === "recipes" && (
            <RecipesTab
              loading={loading}
              user={user}
              deleted={(val) => setDeleted(val)}
            />
          )}
          {activeTab === "saved" && <SaveTab />}
          {/* {activeTab === "saved" && <RecipesTab />} */}
        </section>
      </main>
    </>
  );
}

function RecipesTab({ user, loading, deleted }) {
  if (loading) {
    return (
      <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        {/* Taruh kodingan section 'untuk kamu' disini */}
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
      </div>
    );
  }
  if (user.recipe?.length === 0) {
    return (
      <div className="mb-4 mt-16 flex w-full flex-col items-center justify-center gap-4 text-gray-400">
        <Icon icon="hugeicons:album-not-found-01" width={50} />
        <h1>Belum ada resep yang dibuat.</h1>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {user.recipe?.map((item, index) => (
        <Card
          key={index}
          id={item._id}
          tittle={item.title}
          image={item.image}
          time={item.total_time}
          likes={item.likes}
          creatorName={user.user?.fullName || "User Full Name"}
          creatorImage={user.user?.image || ""}
          editor
          delete
          reload={(val) => deleted(val)}
        />
      ))}
    </div>
  );
}

function SaveTab() {
  const { username } = useParams();
  const [savedRecipes, setSavedRecipes] = useState(null);
  // console.log("🚀 ~ SaveTab ~ savedRecipes:", savedRecipes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/users/${username}/saved-recipes`);
        setSavedRecipes(data.recipes);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [username]);

  if (error || loading) {
    if (error) toast.error("Gagal mengambil data 'for you'");
    return (
      <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        {/* Taruh kodingan section 'untuk kamu' disini */}
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
      </div>
    );
  }

  if (savedRecipes?.length === 0) {
    return (
      <div className="mb-4 mt-16 flex w-full flex-col items-center justify-center gap-4 text-gray-400">
        <Icon icon="hugeicons:album-not-found-01" width={50} />
        <h1>Belum ada resep yang disimpan.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {savedRecipes?.map((item, index) => (
        <Card
          key={index}
          id={item._id}
          tittle={item.title}
          image={item.image}
          time={item.total_time}
          likes={item.likes}
          creatorName={item.user_id?.fullName || "User Full Name"}
          creatorImage={item.user_id?.image || ""}
        />
      ))}
    </div>
  );
}
