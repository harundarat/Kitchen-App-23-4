import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import RoundedButton from "../components/common/RoundedButton";
import Logo from "/kitchen-craft-logo.svg";
import { UserContext } from "../context/userContext";
import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";

export default function Login() {
  const navigate = useNavigate();
  const { setIsLogged } = useContext(UserContext);
  const [data, setData] = useState({ email: "", password: "" });

  const loginUser = async (e) => {
    e.preventDefault();

    const { email, password } = data;

    try {
      const { data } = await axios.post("/auth/login", { email, password });

      if (data.error) {
        toast.error(data.error);
      } else {
        console.log(data);
        setData({}); // Clear input fields
        toast.success("Login successful!");
        setIsLogged(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Server error!");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
      <form
        onSubmit={(e) => loginUser(e)}
         >
        <div className="mb-5">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Your email" />
          </div>
          <TextInput
            id="email"
            placeholder="name@company.com"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-5">
          <div className="mb-2 block">
            <Label htmlFor="password" value="Your password" />
          </div>
          <TextInput id="password" type="password" required 
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
        </div>

        <div className="flex justify-between gap-5 mb-4">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>
          <a href="#" className="text-sm text-cyan-700 hover:underline dark:text-cyan-500">
            Lost Password?
          </a>
        </div>

        <RoundedButton
          name="Sign In to your account"
          className="mt-2 rounded-lg text-white w-48 mb-4 text-sm py-2"
        />

        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
          Not registered?&nbsp;
          <a href="#" className="text-cyan-700 hover:underline dark:text-cyan-500">
            Create account
          </a>
        </div>
      </form>
    </div>
  );
}
