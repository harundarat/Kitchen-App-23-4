import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-scroll";
import Logo from "/kitchen-craft-logo.svg";
import RoundedButton from "../common/RoundedButton";
import { Icon } from "@iconify/react";
import InputWbtn from "../common/InputWbtn";
import toast from "react-hot-toast";
import Hamburger from "hamburger-react";
import { useUser } from "../../context/userContext";
import BlankProfile from "../../assets/blank_profile.webp";
import {
  ModalProfileProvider,
  useModalProfile,
} from "../features/ModalProfile";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { api, getErrorMessage } from "../../services/api";
import { CURRENT_USER_SESSION_VALIDATION } from "../../services/sessionRecovery";
import type { UserProfile, UserResponse } from "../../types/api";

export default function Navbar() {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  const [toggleHamburger, setToggleHamburger] = useState(false);
  const { isAdmin, isUser, status } = useUser();
  const [searchFocus, setSearchFocus] = useState(false);
  const showNav = location.pathname === "/";
  const navigate = useNavigate();

  const handleSearch = (input: string) => {
    if (!input || input === "") {
      toast.error("Masukkan kata kunci pencarian");
      return;
    }
    urlSearchParams.set("recipe", input);
    urlSearchParams.set("page", "1");
    navigate(`/search?${urlSearchParams.toString()}`);
    setSearchFocus(false);
  };

  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <header className="bg-bg fixed top-0 z-50 flex h-24 w-full items-center shadow-sm lg:justify-center lg:px-0">
      <MenuBar toggled={toggleHamburger} toggle={setToggleHamburger} />
      <div className="flex w-full min-w-[360px] items-center px-5 lg:mx-auto lg:max-w-[1080px] lg:justify-center lg:px-0">
        {/* Hamburger */}
        <div className="z-20 mr-2 -translate-x-2 lg:hidden">
          <Hamburger
            toggled={toggleHamburger}
            toggle={setToggleHamburger}
            size={30}
            color="#1A1F2B"
            direction="left"
            distance="sm"
            duration={0}
            rounded
          />
        </div>

        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          onClick={() => navigate("/")}
          className={`mx-auto w-[88px] cursor-pointer sm:w-[118px] lg:mx-0 ${searchFocus ? "hidden" : ""}`}
        />

        {/* Navigasi */}
        {showNav ? (
          <nav
            className={`text-primary mx-14 hidden gap-8 font-semibold ${searchFocus ? "lg:hidden" : "lg:flex"}`}
          >
            <Link
              activeClass="text-accent-2"
              to="banner"
              spy={true}
              smooth={true}
              offset={-150}
              className="cursor-pointer"
            >
              Beranda
            </Link>
            <Link
              activeClass="text-accent-2"
              to="popular"
              spy={true}
              smooth={true}
              offset={-110}
              className="cursor-pointer"
            >
              Terpopuler
            </Link>
            <Link
              activeClass="text-accent-2"
              to="category"
              spy={true}
              smooth={true}
              offset={-110}
              className="cursor-pointer"
            >
              Kategori
            </Link>
            <Link
              activeClass="text-accent-2"
              to="ingredients"
              spy={true}
              smooth={true}
              offset={-120}
              className="cursor-pointer whitespace-nowrap"
            >
              Bahan Makanan
            </Link>
          </nav>
        ) : (
          <div
            className={`mx-14 hidden items-end lg:flex ${searchFocus ? "hidden" : ""}`}
            onClick={() => navigate("/")}
          >
            <button
              className={`text-primary active:bg-primary active:text-bg hidden rounded-lg border-[1.5px] border-gray-300 p-2 font-bold transition-all hover:bg-gray-100 lg:block ${searchFocus ? "lg:hidden" : ""}`}
            >
              <Icon icon="heroicons:home-16-solid" width={22} />
              {/* Beranda */}
            </button>
          </div>
        )}

        {/* Search Input */}
        <InputWbtn
          placeholder="Cari resep.."
          iconify="ri:search-line"
          className={`mr-3 ml-6 hidden w-56 transition-[width] duration-300 sm:ml-auto lg:flex ${searchFocus ? "w-full" : ""}`}
          onClick={(input) => handleSearch(input)}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
        />

        <button className="pr-5 lg:hidden">
          <Icon
            icon="iconamoon:search-bold"
            width={24}
            className="text-primary"
            onClick={() => setSearchFocus(true)}
          />
        </button>
        {searchFocus && (
          <div
            className={`bg-bg absolute left-0 z-40 flex h-full w-full items-center gap-3 px-6 opacity-0 transition-opacity duration-300 sm:px-8 lg:hidden ${searchFocus ? "visible opacity-100" : "invisible"}`}
          >
            <button
              className="bg-primary/30 text-bg active:bg-primary/15 rounded-full px-3 py-1 font-medium"
              onClick={() => setSearchFocus(false)}
            >
              Batal
            </button>
            <InputWbtn
              placeholder="Cari resep.."
              iconify="ri:search-line"
              className={"w-full"}
              onClick={(input) => handleSearch(input)}
            />
          </div>
        )}

        {/* Profile & Auth Button */}
        {status === "loading" ? (
          <div
            className="bg-primary/10 ml-3 hidden h-10 w-20 animate-pulse rounded-full lg:block"
            aria-label="Memuat sesi"
          />
        ) : isUser ? (
          <ModalProfileProvider>
            <Profile />
          </ModalProfileProvider>
        ) : isAdmin ? (
          <AdminSessionActions />
        ) : (
          <>
            <AuthButton />
            <div className="group">
              <button className="text-primary lg:hidden">
                <Icon icon="iconamoon:profile-fill" className="text-[34px]" />
              </button>
              <div className="bg-bg absolute right-4 hidden flex-col gap-4 rounded-sm border p-5 shadow-md group-focus-within:flex">
                <RoundedButton
                  className="h-10"
                  name="Masuk"
                  btnStroke={true}
                  onClick={() => setOpenLogin(true)}
                />
                <RoundedButton
                  className="h-10"
                  name="Daftar"
                  onClick={() => setOpenRegister(true)}
                />

                <Modal
                  show={openLogin}
                  size="md"
                  popup
                  dismissible
                  onClose={() => setOpenLogin(false)}
                  className="shadow-sm"
                >
                  <ModalHeader />
                  <ModalBody>
                    <Login
                      toRegister={(val) => {
                        setOpenRegister(val);
                        setOpenLogin(!openLogin);
                      }}
                    />
                  </ModalBody>
                </Modal>

                <Modal
                  show={openRegister}
                  size="md"
                  popup
                  dismissible
                  onClose={() => setOpenRegister(false)}
                  className="fixed shadow-sm"
                >
                  <ModalHeader>
                    <h1 className="m-4 font-semibold">Buat Akun Baru.</h1>
                  </ModalHeader>
                  <ModalBody className="max-h-[80vh] overflow-y-scroll">
                    <Register
                      toLogin={(val) => {
                        setOpenLogin(val);
                        setOpenRegister(!openRegister);
                      }}
                    />
                  </ModalBody>
                </Modal>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

// Modal Login & Register
function AuthButton() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <div>
      <div className="ml-3 hidden gap-2 sm:ml-6 lg:flex">
        <RoundedButton
          name="Masuk"
          btnStroke={true}
          onClick={() => setOpenLogin(true)}
        />
        <RoundedButton
          className="h-10"
          name="Daftar"
          onClick={() => setOpenRegister(true)}
        />
      </div>
      <Modal
        show={openLogin}
        size="md"
        popup
        dismissible
        onClose={() => setOpenLogin(false)}
        className="shadow-sm"
      >
        <ModalHeader />
        <ModalBody>
          <Login
            toRegister={(val) => {
              setOpenRegister(val);
              setOpenLogin(!openLogin);
            }}
          />
        </ModalBody>
      </Modal>

      <Modal
        show={openRegister}
        size="md"
        popup
        dismissible
        onClose={() => setOpenRegister(false)}
        className="fixed shadow-sm"
      >
        <ModalHeader>
          <h1 className="m-4 font-semibold">Buat Akun Baru.</h1>
        </ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-scroll">
          <Register
            toLogin={(val) => {
              setOpenLogin(val);
              setOpenRegister(!openRegister);
            }}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}
// Akhir Modal Login & Register

function Profile() {
  const { toggle, setToggle } = useModalProfile();
  const { isUser, user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    const getUser = async () => {
      if (!isUser || !user) return;
      try {
        const response = await api.get<UserResponse>(
          `/users/${user.username}`,
          { sessionValidation: CURRENT_USER_SESSION_VALIDATION },
        );
        setProfile(response.user);
      } catch (error) {
        console.error(error);
      }
    };
    void getUser();
  }, [isUser, user]);

  return (
    <div className="flex w-fit min-w-fit cursor-pointer items-center gap-1 lg:ml-3">
      <img
        src={profile?.image || BlankProfile}
        alt="Profile"
        className="aspect-square w-10 rounded-full bg-slate-300 object-cover sm:w-11"
        onClick={() => setToggle(!toggle)}
      />

      <div
        className={"text-primary hover:text-accent-1 hidden text-lg sm:flex"}
        onClick={() => setToggle(!toggle)}
      >
        {toggle ? (
          <Icon icon="mingcute:up-fill" />
        ) : (
          <Icon icon="mingcute:down-fill" />
        )}
      </div>
    </div>
  );
}

function AdminSessionActions() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      toast.success("Berhasil logout dari admin");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal logout"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-3 flex items-center gap-2 sm:ml-6">
      <button
        type="button"
        className="bg-primary text-bg rounded-full px-3 py-2 text-sm font-medium"
        onClick={() => navigate("/admin/users")}
      >
        Dasbor admin
      </button>
      <button
        type="button"
        className="text-accent-1 border-accent-1/30 hidden rounded-full border px-3 py-2 text-sm font-medium sm:inline-flex"
        onClick={() => void handleLogout()}
        disabled={loading}
      >
        {loading ? "Keluar..." : "Keluar"}
      </button>
    </div>
  );
}

function MenuBar({
  toggled,
  toggle,
}: {
  toggled: boolean;
  toggle: Dispatch<SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const showNav = useLocation().pathname === "/";

  return (
    <aside
      className={`bg-bg fixed top-0 left-0 h-svh w-0 border shadow-sm transition-all duration-200 ${toggled ? "z-50 w-[70%]" : "invisible"}`}
    >
      <div
        className={`mr-5 ml-7 flex h-24 items-center justify-between lg:hidden ${!toggled ? "hidden" : ""}`}
      >
        <img src={Logo} alt="Logo" className={`w-[88px]`} />
        <Hamburger
          toggled={toggled}
          toggle={toggle}
          size={30}
          color="#1A1F2B"
          direction="right"
          distance="sm"
          duration={0.9}
          rounded
        />
      </div>
      <hr />
      {showNav && (
        <nav
          className={`mx-7 mt-4 flex flex-col gap-6 ${!toggled ? "hidden" : ""}`}
        >
          <Link
            activeClass="text-accent-2"
            to="banner"
            spy={true}
            smooth={true}
            offset={-150}
            className="cursor-pointer"
            onClick={() => toggle(false)}
          >
            Beranda
          </Link>
          <Link
            activeClass="text-accent-2"
            to="popular"
            spy={true}
            smooth={true}
            offset={-110}
            className="cursor-pointer"
            onClick={() => toggle(false)}
          >
            Terpopuler
          </Link>
          <Link
            activeClass="text-accent-2"
            to="category"
            spy={true}
            smooth={true}
            offset={-110}
            className="cursor-pointer"
            onClick={() => toggle(false)}
          >
            Kategori
          </Link>
          <Link
            activeClass="text-accent-2"
            to="ingredients"
            spy={true}
            smooth={true}
            offset={-120}
            className="cursor-pointer"
            onClick={() => toggle(false)}
          >
            Bahan Makanan
          </Link>
        </nav>
      )}
      {!showNav && (
        <nav
          className={`mx-7 mt-4 flex flex-col gap-6 ${!toggled ? "hidden" : ""}`}
        >
          <Link
            activeClass="text-accent-2"
            to="banner"
            spy={true}
            smooth={true}
            offset={-150}
            className="cursor-pointer"
            onClick={() => {
              toggle(false);
              navigate("/");
            }}
          >
            Beranda
          </Link>
        </nav>
      )}
      <div
        className={`bg-primary/5 absolute top-0 -right-full h-svh w-full backdrop-blur-[2px] ${!toggled ? "hidden" : ""}`}
        onClick={() => toggle(false)}
      ></div>
    </aside>
  );
}
