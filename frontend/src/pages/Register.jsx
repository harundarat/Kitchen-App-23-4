import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Logo from "/kitchen-craft-logo.svg";
import RoundedButton from "../components/common/RoundedButton";
import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";


export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    namalengkap: "",
    username: "",
    email: "",
    password: "",
  });

  const registerUser = async (e) => {
    e.preventDefault();

    const { namalengkap, username, email, password } = data;

    try {
      const response = await axios.post("/register", {
        namalengkap,
        username,
        email,
        password,
      });

      const { data } = response;

      if (data.error) {
        toast.error(data.error);
      } else {
        setData({
          namalengkap: "",
          username: "",
          email: "",
          password: "",
        });
        toast.success(data.message);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">

      <h3 className="text-2xl font-semibold">Create Your Account</h3>

      <form
        onSubmit={registerUser}>
        <div className="mb-5">
          <div className="mb-2 block">
            <Label htmlFor="Name" value="Your Name" />
          </div>
          <TextInput
            type="text"
            placeholder="enter name..."
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>

        <div className="mb-5">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Your email" />
          </div>
          <TextInput
            type="email"
            placeholder="enter email..."
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>

        <div className="mb-5">
          <div className="mb-2 block">
            <Label htmlFor="password" value="Your password" />
          </div>
          <TextInput
            type="password"
            placeholder="enter password..."
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
        </div>
        <RoundedButton
          name="Sign Up"
          onClick={() => console.log("JMBT")}
          className="mt-2 rounded-lg text-white w-48 mb-4 text-sm py-2"
        />
        <br />
        <div className="justify-center text-center">
          <a href="#" className="mt-3 text-black ">
            Already have an Account?{" "}
            <span className="font-semibold">Sign In</span>
          </a>
        </div>

      </form>
    </div>
  );
}
