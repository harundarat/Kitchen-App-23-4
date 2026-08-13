import { Icon } from "@iconify/react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { getErrorMessage } from "../../services/api";

interface ModalProfileContextValue {
  toggle: boolean;
  setToggle: Dispatch<SetStateAction<boolean>>;
}

const ModalProfileContext = createContext<ModalProfileContextValue | null>(
  null,
);

export function useModalProfile(): ModalProfileContextValue {
  const context = useContext(ModalProfileContext);
  if (!context) {
    throw new Error("useModalProfile must be used within ModalProfileProvider");
  }
  return context;
}

function ModalProfileProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const { logout, user } = useUser();
  const [loading, setLoading] = useState(false);
  const value = useMemo(() => ({ toggle, setToggle }), [toggle]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      toast.success("Berhasil Logout");
      setToggle(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal logout"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalProfileContext.Provider value={value}>
      {children}
      <div
        className={`bg-bg/30 fixed top-0 right-0 z-50 h-svh w-full cursor-default backdrop-blur-[2px] transition-all ${toggle ? "opacity-100" : "invisible opacity-0"}`}
        onClick={() => setToggle(false)}
      >
        <div
          className="mx-auto mt-20 h-7 min-w-[360px] px-10 select-none lg:max-w-[1080px] lg:px-0"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="bg-bg ml-auto flex h-fit w-36 flex-col items-start gap-2 rounded-md border p-5 shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (user) navigate(`/profile/${user.username}`);
                setToggle(false);
              }}
              className="text-primary hover:text-primary/60 flex w-full justify-start"
            >
              Resep
            </button>
            <button
              type="button"
              onClick={() => {
                if (user) navigate(`/profile/${user.username}?tab=saved`);
                setToggle(false);
              }}
              className="text-primary hover:text-primary/60 flex w-full justify-start"
            >
              Disimpan
            </button>
            <hr className="border-primary/20 w-full border" />
            <button
              type="button"
              onClick={() => {
                navigate("/profile/edit");
                setToggle(false);
              }}
              className="text-primary hover:text-primary/60 flex w-full justify-start"
            >
              Pengaturan
            </button>
            <button
              type="button"
              className="text-accent-1 hover:text-accent-1/60 flex w-full justify-start"
              onClick={() => void handleLogout()}
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
      {loading && (
        <div className="bg-primary/50 fixed top-1/2 left-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-sm font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}
    </ModalProfileContext.Provider>
  );
}

export { ModalProfileProvider, ModalProfileContext };
