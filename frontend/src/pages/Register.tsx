import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import RoundedButton from "../components/common/RoundedButton";
import { useAdditionalInfo } from "../context/additionalInfoContext";
import { Icon } from "@iconify/react";
import { Checkbox, Label, TextInput } from "flowbite-react";
import { api, getErrorMessage } from "../services/api";

interface RegisterFormState {
  fullName: string;
  username: string;
  email: string;
  password: string;
  preferences: string[];
}

export default function Register({
  toLogin,
}: {
  toLogin?: (value: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormState>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    preferences: [],
  });

  const registerUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      const response = await api.post<{ message: string }>("/users/register", {
        fullName: fullName,
        username: username.toLocaleLowerCase(),
        email: email.toLocaleLowerCase(),
        password: password,
        preferences: preferences,
      });
      toLogin?.(true);
      toast.success(response.message || "Pendaftaran berhasil");
      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        preferences: [],
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Pendaftaran gagal"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="bg-primary bg-opacity-50 fixed top-1/2 left-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}

      <div className="space-y">
        <form onSubmit={registerUser} className="flex flex-col gap-2">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="namalengkap">Nama Lengkap</Label>
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
              <Label htmlFor="Name">Username</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
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
          <FormTambahan
            getCategory={(preferences) =>
              setFormData((current) => ({ ...current, preferences }))
            }
          />
          <RoundedButton
            name="Daftar"
            type="submit"
            className="mx-auto mt-2 mb-4 w-48 rounded-lg py-2 text-sm text-white"
          />
          <div className="justify-center text-center">
            <button
              type="button"
              onClick={() => toLogin?.(true)}
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

function FormTambahan({
  getCategory,
}: {
  getCategory: (categories: string[]) => void;
}) {
  const { additionalInfo } = useAdditionalInfo();
  const [checkedCategories, setCheckedCategories] = useState<
    Record<string, boolean>
  >({});

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckedCategories((current) => {
      const next = { ...current, [name]: checked };
      getCategory(Object.keys(next).filter((category) => next[category]));
      return next;
    });
  };

  return (
    <div className="my-2">
      <h1 className="text-primary text-sm font-medium">
        Pilih preferensi kategori anda
      </h1>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-2">
        {additionalInfo?.kategori.map((kat, i) => (
          <div key={i} className="flex items-center gap-2">
            <Checkbox
              id={`kat-${i}`}
              name={kat.title}
              checked={checkedCategories[kat.title] ?? false}
              onChange={handleCheckboxChange}
            />
            <Label htmlFor={`kat-${i}`}>{kat.title}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
