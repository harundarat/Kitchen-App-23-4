import { useState, useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import ImageForm from "../components/common/ImageForm";
import BlankImage from "../assets/blank_profile.webp";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import axios from "axios";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [inputs, setInputs] = useState({
    image: "",
    fullName: "",
    username: "",
    email: "",
    website: "",
    bio: "",
    sandiLama: "",
    sandiBaru: "",
    sandiKonfirmasi: "",
  });
  const [image, setImage] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/users/${user.username}`);
        console.log("🚀 ~ fetchUser ~ data:", data);
        setInputs({
          image: data.user?.image,
          fullName: data.user?.fullName,
          username: data.user?.username,
          email: data.user?.email,
          website: data.user?.website,
          bio: data.user?.bio,
        });
      } catch (error) {
        console.log("🚀 ~ fetchUser ~ error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const changeHandler = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const validatePassword = () => {
    const { sandiLama, sandiBaru, sandiKonfirmasi } = inputs;
    if (sandiLama) {
      if (!sandiBaru || !sandiKonfirmasi) {
        toast.error("Password baru dan konfirmasi password harus diisi");
        return false;
      }
      if (sandiBaru !== sandiKonfirmasi) {
        toast.error("Password baru dan konfirmasi password tidak sama");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validatePassword();
    if (!validatePassword()) return;

    const form = new FormData();
    if (image.file) form.append("image", image.file);
    form.append("fullName", inputs.fullName);
    form.append("username", inputs.username);
    form.append("email", inputs.email);
    if (inputs.website) form.append("website", inputs.website);
    if (inputs.bio) form.append("bio", inputs.bio);

    try {
      setLoading(true);
      const { data } = await axios.put(`/users/${user.username}`, form);
      navigate(-1, { replace: true });
      toast.success("Berhasil menyimpan perubahan");
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary bg-opacity-50">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded bg-bg font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-[720px] px-4 pb-10">
        <header className="flex h-16 w-full items-center justify-between">
          <button
            className="flex items-center gap-1 font-medium text-primary"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            <Icon icon="akar-icons:arrow-left" />
            Kembali
          </button>
          <h1 className="font-semibold text-primary">Edit Profile</h1>
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
              onClick={() => document.getElementById("user-image").click()}
            />
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("user-image").click();
                }}
                className="font-medium text-accent-1 underline underline-offset-4"
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
              type="text"
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
              onChange={changeHandler}
              required
              disabled
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
              type="text"
              id="bio"
              name="bio"
              placeholder="Masukan bio Anda"
              value={inputs.bio}
              onChange={changeHandler}
            />
          </div>
          <hr className="hidden border-gray-300" />
          {/* Password */}
          <h1 className="hidden font-medium">Ubah Password</h1>
          <div className="hidden w-fit flex-col">
            <label htmlFor="password">Password Lama</label>
            <input
              className="mt-1 w-full max-w-64 rounded-md border border-gray-500"
              type="password"
              id="password"
              name="sandiLama"
              placeholder="Masukan password lama"
              value={inputs.sandiLama}
              onChange={changeHandler}
            />
          </div>
          <div className="hidden w-full flex-col gap-4 sm:flex-row">
            <div className="flex w-fit flex-col">
              <label htmlFor="sandiBaru">Password Baru</label>
              <input
                className="mt-1 w-full max-w-64 rounded-md border border-gray-500"
                type="password"
                id="sandiBaru"
                name="sandiBaru"
                placeholder="Masukan password baru"
                value={inputs.sandiBaru}
                onChange={changeHandler}
              />
            </div>
            <div className="flex w-fit flex-col">
              <label htmlFor="sandiKonfirmasi">Ulangi Password Baru</label>
              <input
                className="mt-1 w-full max-w-64 rounded-md border border-gray-500"
                type="password"
                id="sandiKonfirmasi"
                name="sandiKonfirmasi"
                placeholder="Ulangi password baru"
                value={inputs.sandiKonfirmasi}
                onChange={changeHandler}
              />
            </div>
          </div>
          <hr className="border-gray-300" />
          <button
            type="submit"
            className="ml-auto w-fit rounded-full bg-accent-2 px-4 py-2 text-bg"
          >
            Simpan Perubahan
          </button>
        </form>
      </main>
    </>
  );
};

export default EditProfile;
