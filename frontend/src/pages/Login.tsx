import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import RoundedButton from "../components/common/RoundedButton";
import { useUser } from "../context/userContext";
import { Label, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { api, getErrorMessage } from "../services/api";

export default function Login({
  toRegister,
}: {
  toRegister?: (value: boolean) => void;
}) {
  const { refreshSession } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const loginUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("isikan data dengan benar");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/login", formData);
      // setIsLogged(true);
      toast.success("Login berhasil");
      setFormData({ email: "", password: "" });
      await refreshSession();
    } catch (error) {
      toast.error(getErrorMessage(error, "Login gagal"));
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
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          Masuk ke akun anda.
        </h3>
        <form onSubmit={loginUser}>
          <div className="mb-5">
            <div className="mb-2 block">
              <Label htmlFor="email">Email</Label>
            </div>
            <TextInput
              id="email"
              placeholder="Masukan email kamu"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-5">
            <div className="mb-2 block">
              <Label htmlFor="password">Password</Label>
            </div>
            <TextInput
              id="password"
              type="password"
              required
              placeholder="Masukan password kamu"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <RoundedButton
            type="submit"
            name="Masuk"
            className="mt-2 mb-4 w-48 rounded-lg py-2 text-sm text-white"
          />

          <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
            Belum memiliki akun?&nbsp;
            <button
              type="button"
              className="text-cyan-700 hover:underline dark:text-cyan-500"
              onClick={() => toRegister?.(true)}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
