import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import ImageForm from "../components/common/ImageForm";
import BlankImage from "../assets/blank_profile.webp";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { api } from "../services/api";
import type { UserResponse } from "../types/api";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [inputs, setInputs] = useState({
    image: "",
    fullName: "",
    username: "",
    email: "",
    website: "",
    bio: "",
  });
  const [image, setImage] = useState<{
    file: File | null;
    url: string | null;
  }>({ file: null, url: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        navigate("/", { replace: true });
        return;
      }
      try {
        setLoading(true);
        const data = await api.get<UserResponse>(`/users/${user.username}`);
        setInputs((current) => ({
          ...current,
          image: data.user.image || "",
          fullName: data.user.fullName,
          username: data.user.username,
          email: data.user.email || "",
          website: data.user.website || "",
          bio: data.user.bio || "",
        }));
      } catch {
        toast.error("Gagal memuat profil");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void fetchUser();
  }, [navigate, user]);

  const changeHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInputs({
      ...inputs,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const form = new FormData();
    if (image.file) form.append("image", image.file);
    form.append("fullName", inputs.fullName);
    form.append("email", inputs.email);
    if (inputs.website) form.append("website", inputs.website);
    if (inputs.bio) form.append("bio", inputs.bio);

    if (!user) return;
    try {
      setLoading(true);
      await api.put(`/users/${user.username}`, form);
      navigate(-1);
      toast.success("Berhasil menyimpan perubahan");
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="bg-primary/50 fixed top-1/2 left-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-[720px] px-4 pb-10">
        <header className="flex h-16 w-full items-center justify-between">
          <button
            className="text-primary flex items-center gap-1 font-medium"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            <Icon icon="akar-icons:arrow-left" />
            Kembali
          </button>
          <h1 className="text-primary font-semibold">Edit Profile</h1>
        </header>
        <hr className="border-gray-300" />
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <ImageForm
            id="user-image"
            name="user-image"
            onChange={(file, url) => {
              setImage({ file, url });
            }}
          />
          <div className="flex items-center gap-4">
            <img
              className="aspect-square w-28 cursor-pointer rounded-full bg-gray-300"
              src={image.url ? image.url : inputs.image || BlankImage}
              alt="Profile picture"
              onClick={() => document.getElementById("user-image")?.click()}
            />
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("user-image")?.click();
                }}
                className="text-accent-1 font-medium underline underline-offset-4"
              >
                Unggah Gambar
              </button>
              <p className="text-sm text-gray-400">
                Inputkan gambar dengan aspect ratio 1 : 1
              </p>
            </div>
          </div>
          {/* Full Name */}
          <div className="w-full">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-500"
              id="name"
              name="fullName"
              placeholder="Masukan nama lengkap"
              value={inputs.fullName}
              onChange={changeHandler}
              required
            />
          </div>
          {/* Username */}
          <div className="w-full">
            <label htmlFor="username">Username</label>
            <input
              className="mt-1 w-full cursor-not-allowed rounded-md border border-gray-500"
              type="text"
              id="username"
              name="username"
              placeholder="Masukan nama username"
              value={inputs.username}
              disabled
              required
            />
          </div>
          {/* Email */}
          <div className="w-full">
            <label htmlFor="email">Email</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-500"
              type="email"
              id="email"
              name="email"
              placeholder="Masukan nama email"
              value={inputs.email}
              onChange={changeHandler}
              required
            />
          </div>
          {/* Website */}
          <div className="w-full">
            <label htmlFor="website">Link Website</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-500"
              type="url"
              id="website"
              name="website"
              placeholder="http:// atau https://"
              value={inputs.website}
              onChange={changeHandler}
            />
          </div>
          {/* Bio */}
          <div className="w-full">
            <label htmlFor="bio">Bio</label>
            <p className="text-sm text-gray-500">
              Tambahkan biodata singkat untuk memberi tahu komunitas KC lebih
              banyak tentang diri Anda.
            </p>
            <textarea
              className="mt-1 min-h-8 w-full rounded-md border border-gray-500"
              id="bio"
              name="bio"
              placeholder="Masukan bio Anda"
              value={inputs.bio}
              onChange={changeHandler}
            />
          </div>
          <hr className="border-gray-300" />
          <button
            type="submit"
            className="bg-accent-2 text-bg ml-auto w-fit rounded-full px-4 py-2"
          >
            Simpan Perubahan
          </button>
        </form>
      </main>
    </>
  );
};

export default EditProfile;
