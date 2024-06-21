import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RoundedButton from "../components/common/RoundedButton";
import Logo from "/kitchen-craft-logo.svg";
import { UserContext } from "../context/userContext";
import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";
import "flowbite/dist/flowbite.min.css";
import { Icon } from "@iconify/react";

export default function Login({ toRegister }) {
  const navigate = useNavigate();
  const { setIsLogged } = useContext(UserContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("isikan data dengan benar");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post("/auth/login", formData);
      console.log(response);
      if (response.status != 200) {
        toast.error(response.data.message);
        return;
      }
      // setIsLogged(true);
      toast.success("Login berhasil");
      setFormData({ email: "", password: "" });
      setIsLogged(true);
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
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          Masuk ke akun anda.
        </h3>
        <form onSubmit={(e) => loginUser(e)}>
          <div className="mb-5">
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email" />
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
              <Label htmlFor="password" value="Password" />
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
            className="mb-4 mt-2 w-48 rounded-lg py-2 text-sm text-white"
          />

          <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
            Belum memiliki akun?&nbsp;
            <button
              className="text-cyan-700 hover:underline dark:text-cyan-500"
              onClick={(e) => {
                e.preventDefault();
                toRegister ? toRegister(true) : "";
              }}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
