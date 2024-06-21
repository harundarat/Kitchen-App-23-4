import React from "react";
import NotFoundImage from "../assets/not-found.svg";
import RoundedButton from "../components/common/RoundedButton";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const handleBackHome = () => {
    navigate("/");
  };
  return (
    <div className="mt-24 flex flex-col justify-center gap-8 px-5 py-12">
      <img
        src={NotFoundImage}
        alt="Not Found"
        className="mx-auto w-full max-w-[550px]"
      />
      <RoundedButton
        name="Back to Home"
        className="mx-auto"
        onClick={handleBackHome}
      />
    </div>
  );
};

export default NotFound;
