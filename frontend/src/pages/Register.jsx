import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Logo from "/kitchen-craft-logo.svg";
import RoundedButton from "../components/common/RoundedButton";
import {
  AdditionalInfoContext,
  AdditionalInfoProvider,
} from "../context/additionalInfoContext";
import { Icon } from "@iconify/react";
import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";

export default function Register({ toLogin }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    preferences: [],
  });

  const registerUser = async (e) => {
    e.preventDefault();

    const { fullName, username, email, password, preferences } = formData;
    if (!fullName || !username || !email || !password) {
      toast.error("Semua kolom harus diisi");
      return;
    }
    if (preferences.length === 0) {
      toast.error("Pilih minimal satu kategori");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/users/register", {
        fullName: fullName,
        username: username.toLocaleLowerCase(),
        email: email.toLocaleLowerCase(),
        password: password,
        preferences: preferences,
      });
      console.log(response);
      if (response.status != 200) {
        toast.error(response.data.message);
        return;
      }
      toLogin ? toLogin(true) : "";
      toast.success(response.data.message);
      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        preferences: [],
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error || error.message);
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

      <div className="space-y">
        <form onSubmit={registerUser} className="flex flex-col gap-2">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="namalengkap" value="Nama Lengkap" />
            </div>
            <TextInput
              type="text"
              name="namalengkap"
              placeholder="Masukan nama lengkap"
              value={formData.fullName}
              required
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="Name" value="Username" />
            </div>
            <TextInput
              type="text"
              placeholder="Username kamu"
              value={formData.username}
              required
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput
              type="email"
              placeholder="Masukan email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Password" />
            </div>
            <TextInput
              type="password"
              placeholder="Masukan password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <AdditionalInfoProvider>
            <FormTambahan
              getCategory={(val) =>
                setFormData({ ...formData, preferences: val })
              }
            />
          </AdditionalInfoProvider>
          <RoundedButton
            name="Daftar"
            type="submit"
            className="mx-auto mb-4 mt-2 w-48 rounded-lg py-2 text-sm text-white"
          />
          <div className="justify-center text-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                toLogin ? toLogin(true) : "";
              }}
              className="mt-3 text-black"
            >
              Sudah Punya Akun? <span className="font-semibold">Masuk</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function FormTambahan({ getCategory }) {
  const { additionalInfo } = useContext(AdditionalInfoContext);
  const [checkedCategories, setCheckedCategories] = useState(
    additionalInfo?.kategori?.reduce((acc, category) => {
      acc[category.title] = false;
      return acc;
    }, {}),
  );
  useEffect(() => {
    if (getCategory) getCategory(getCheckedCategories());
  }, [checkedCategories]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedCategories((prevCheckedCategories) => ({
      ...prevCheckedCategories,
      [name]: checked,
    }));
  };

  const getCheckedCategories = () => {
    if (!checkedCategories) return [];
    return Object.keys(checkedCategories).filter(
      (category) => checkedCategories[category],
    );
  };

  return (
    <div className="my-2">
      <h1 className="text-sm font-medium text-primary">
        Pilih preferensi kategori anda
      </h1>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-2">
        {additionalInfo?.kategori.map((kat, i) => (
          <div key={i} className="flex items-center gap-2">
            <Checkbox
              id={`kat-${i}`}
              name={kat.title}
              checked={checkedCategories ? checkedCategories[kat.title] : false}
              onChange={handleCheckboxChange}
            />
            <Label htmlFor={`kat-${i}`}>{kat.title}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
