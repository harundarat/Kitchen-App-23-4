import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BlankProfile from "../assets/blank_profile.webp";
import Card from "../components/common/Card";
import { api } from "../services/api";
import type { UserResponse } from "../types/api";

export default function User() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!username) {
      navigate("/", { replace: true });
      return;
    }

    async function fetchUser() {
      try {
        setLoading(true);
        setData(await api.get<UserResponse>(`/users/${username}`));
      } catch {
        toast.error("Pengguna tidak ditemukan");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    void fetchUser();
  }, [navigate, username]);

  const profile = data?.user;

  return (
    <main className="mt-32 mb-20 min-h-svh w-full px-5 lg:px-0">
      <section className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 sm:flex-row">
        <img
          className="aspect-square h-fit w-24 rounded-full object-cover"
          src={profile?.image || BlankProfile}
          alt={profile ? `Foto profil ${profile.fullName}` : "Foto profil"}
        />
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-xl font-bold">{profile?.fullName || "....."}</h1>
          {profile?.website && (
            <a
              className="text-accent-1 font-medium italic underline"
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.website}
            </a>
          )}
          {profile?.bio && <p>{profile.bio}</p>}
        </div>
      </section>
      <hr className="mx-auto mt-6 w-full max-w-[1080px]" />
      <section className="mx-auto mt-4 flex w-full max-w-[1080px] flex-col gap-2 font-semibold">
        <h1>Resep dari {profile?.fullName}</h1>
        {loading ? (
          <RecipeSkeleton />
        ) : data?.recipes.length ? (
          <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
            {data.recipes.map((recipe) => (
              <Card
                key={recipe._id}
                id={recipe._id}
                title={recipe.title}
                image={recipe.image}
                time={recipe.totalTime}
                likes={recipe.likeCount}
                creatorName={profile?.fullName}
                creatorImage={profile?.image || BlankProfile}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 mb-4 flex flex-col items-center justify-center gap-4 text-gray-400">
            <Icon icon="hugeicons:album-not-found-01" width={50} />
            <h1 className="text-lg font-medium">
              User belum menambahkan resep
            </h1>
          </div>
        )}
      </section>
    </main>
  );
}

function RecipeSkeleton() {
  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} isLoad />
      ))}
    </div>
  );
}
