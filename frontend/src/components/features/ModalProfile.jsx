import axios from "axios";
import { useState, createContext, useContext } from "react";
import { UserContext } from "../../context/userContext";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const ModalProfileContext = createContext();

function ModalProfileProvider({ children }) {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const { setIsLogged, user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setToggle(!toggle);
  };
  const logout = async () => {
    try {
      setLoading(true);
      const logout = await axios.post("/auth/logout");
      if (logout.status != 200) {
        toast.error("Erorr logout");
        return;
      }
      toast.success("Berhasil Logout");
      setIsLogged(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalProfileContext.Provider value={{ toggle, setToggle }}>
      {children}
      <div
        id="container"
        className={`fixed right-0 top-0 z-50 h-svh w-full cursor-default bg-bg bg-opacity-30 opacity-0 backdrop-blur-[2px] transition-all ${toggle ? "opacity-100" : "invisible opacity-0"} `}
        onClick={() => handleToggle()}
      >
        <div
          id="wrapper"
          className="mx-auto mt-20 h-7 min-w-[360px] select-none px-10 lg:max-w-[1080px] lg:px-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ml-auto flex h-fit w-36 flex-col items-start gap-2 rounded-md border bg-bg p-5 shadow">
            <button
              onClick={() => {
                navigate(`/profile/${user.username}`);
                setToggle(false);
              }}
              className="flex w-full justify-start text-primary hover:text-opacity-60"
            >
              Resep
            </button>
            <button
              onClick={() => {
                navigate(`/profile/${user.username}?tab=saved`);
                setToggle(false);
              }}
              className="flex w-full justify-start text-primary hover:text-opacity-60"
            >
              Disimpan
            </button>
            <hr className="w-full border-[1px] border-primary border-opacity-20" />
            <button
              onClick={() => {
                navigate(`/profile/edit`);
                setToggle(false);
              }}
              className="flex w-full justify-start text-primary hover:text-opacity-60"
            >
              Pengaturan
            </button>
            <button
              className="flex w-full justify-start text-accent-1 hover:text-opacity-60"
              onClick={() => logout()}
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary bg-opacity-50">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded bg-bg font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}
    </ModalProfileContext.Provider>
  );
}

export { ModalProfileProvider, ModalProfileContext };
