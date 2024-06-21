import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BlankProfile from "../assets/blank_profile.webp";
import Card from "../components/common/Card";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function User() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/users/${username}`);
        const data = response.data;
        setUser(data);
        console.log("🚀 ~ fetchUser ~ data:", data);
      } catch (error) {
        console.log("🚀 ~ fetchUser ~ error:", error);
        navigate("/user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  return (
    <main className="mb-20 mt-32 min-h-svh w-full px-5 lg:px-0">
      <section className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 sm:flex-row">
        <img
          className="aspect-square h-fit w-24 rounded-full"
          src={user.user?.image || BlankProfile}
          alt="profile picture"
        />
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-xl font-bold">
            {user.user?.fullName || "User Full Name"}
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
      </section>
      <hr className="mx-auto mt-6 w-full max-w-[1080px]" />
      <section className="mx-auto mt-4 flex w-full max-w-[1080px] flex-col gap-2 font-semibold">
        <h1>Resep dari {user.user?.fullName}</h1>
        <UserRecipes username={username} />
      </section>
    </main>
  );
}

function UserRecipes({ username }) {
  const [userRecipes, setUserRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // console.log(forYou);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/users/${username}`);
        setUserRecipes(data.recipe);
        setUser(data.user);
      } catch (error) {
        console.log("🚀 ~ fetchUserRecipes ~ error:", error);

        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
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
  if (!userRecipes.length) {
    return (
      <div className="mb-4 mt-16 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Icon icon="hugeicons:album-not-found-01" width={50} />
        <h1 className="text-lg font-medium">User belum menambahkan resep</h1>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {userRecipes?.map((item, index) => (
        <Card
          key={index}
          id={item._id}
          tittle={item.title}
          image={item.image}
          time={item.total_time}
          likes={item.likes}
          creatorName={user?.fullName || "User Full Name"}
          creatorImage={user?.image || BlankProfile}
        />
      ))}
    </div>
  );
}
