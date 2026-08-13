import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/userContext";
import { api } from "../services/api";
import {
  CURRENT_USER_SESSION_VALIDATION,
  USER_SESSION_VALIDATION,
} from "../services/sessionRecovery";
import { Icon } from "@iconify/react";
import BlankProfile from "../assets/blank_profile.webp";
import toast from "react-hot-toast";
import Card from "../components/common/Card";
import type { Recipe, UserResponse } from "../types/api";

export default function Profile() {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const { isLogged, user: sessionUser } = useUser();
  const { username } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [deleted, setDeleted] = useState(false);
  const activeTab =
    urlSearchParams.get("tab") === "saved" ? "saved" : "recipes";
  const profileSessionValidation =
    username === sessionUser?.username
      ? CURRENT_USER_SESSION_VALIDATION
      : USER_SESSION_VALIDATION;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await api.get<UserResponse>(`/users/${username}`, {
          sessionValidation: profileSessionValidation,
        });
        setUser(data);
        setDeleted(false);
      } catch {
        toast.error("Error fetching user data.");
        navigate(`/user/${username}`, { replace: true });
      }
    };
    const authorize = async () => {
      try {
        setLoading(true);
        await api.get(`/auth/authorized/${username}`, {
          sessionValidation: profileSessionValidation,
        });
        await fetchUser();
      } catch {
        navigate(`/user/${username}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void authorize();
  }, [deleted, isLogged, navigate, profileSessionValidation, username]);

  const tabHandler = (tab: "recipes" | "saved") => {
    urlSearchParams.set("tab", tab);
    navigate(`/profile/${username}?${urlSearchParams.toString()}`);
  };

  return (
    <>
      {/* {loading && (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary/50 backdrop-blur">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-sm bg-bg font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )} */}
      <main className="mt-32 mb-24 min-h-svh px-5 lg:px-0">
        <section className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 sm:flex-row">
          <img
            className="aspect-square h-fit w-24 rounded-full"
            src={user?.user.image || BlankProfile}
            alt="profile picture"
          />
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-xl font-bold">
              {user?.user.fullName || "....."}
            </h1>
            {user?.user.website && (
              <a
                className="text-accent-1 font-medium italic underline"
                href={user.user.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.user.website}
              </a>
            )}
            {user?.user.bio && <p>{user.user.bio}</p>}
          </div>
          <button
            onClick={() => navigate("/profile/edit")}
            className="border-primary hover:bg-primary hover:text-bg mt-2 flex h-fit w-fit items-center gap-2 rounded-full border px-4 py-2 transition-all active:scale-95 sm:ml-auto"
          >
            <Icon icon="uil:setting" />
            Pengaturan
          </button>
        </section>
        <hr className="mx-auto mt-6 w-full max-w-[1080px]" />
        <div className="mx-auto mt-6 flex w-full max-w-[1080px] justify-end">
          <button
            onClick={() => navigate("/recipe/input")}
            className="bo bg-primary text-bg hover:border-primary hover:bg-bg hover:text-primary flex items-center gap-2 rounded-full border px-4 py-2 transition-all active:scale-95"
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

function RecipesTab({
  user,
  loading,
  deleted,
}: {
  user: UserResponse | null;
  loading: boolean;
  deleted: (value: boolean) => void;
}) {
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
  if (!user?.recipes.length) {
    return (
      <div className="mt-16 mb-4 flex w-full flex-col items-center justify-center gap-4 text-gray-400">
        <Icon icon="hugeicons:album-not-found-01" width={50} />
        <h1>Belum ada resep yang dibuat.</h1>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {user.recipes.map((item) => (
        <Card
          key={item._id}
          id={item._id}
          title={item.title}
          image={item.image}
          time={item.totalTime}
          likes={item.likeCount}
          creatorName={user.user.fullName || "User Full Name"}
          creatorImage={user.user.image || ""}
          editor
          deletable
          reload={(val) => deleted(val)}
        />
      ))}
    </div>
  );
}

function SaveTab() {
  const { username } = useParams();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        const data = await api.get<{ recipes: Recipe[] }>(
          `/users/${username}/saved-recipes`,
          { sessionValidation: USER_SESSION_VALIDATION },
        );
        setSavedRecipes(data.recipes);
      } catch (error) {
        console.error(error);
        setError(error);
        toast.error("Gagal mengambil resep tersimpan");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [username]);

  if (error || loading) {
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
      <div className="mt-16 mb-4 flex w-full flex-col items-center justify-center gap-4 text-gray-400">
        <Icon icon="hugeicons:album-not-found-01" width={50} />
        <h1>Belum ada resep yang disimpan.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {savedRecipes.map((item) => (
        <Card
          key={item._id}
          id={item._id}
          title={item.title}
          image={item.image}
          time={item.totalTime}
          likes={item.likeCount}
          creatorName={item.author?.fullName || "User Full Name"}
          creatorImage={item.author?.image || ""}
        />
      ))}
    </div>
  );
}
