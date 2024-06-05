import React, { useState, useContext } from 'react';
import { NavLink } from "react-router-dom";
import Logo from "/kitchen-craft-logo.svg";
import DefaultButton from "../common/RoundedButton";
import { Icon } from "@iconify/react";
import InputWbtn from "../common/InputWbtn";
import toast from "react-hot-toast";
import Hamburger from "hamburger-react";
import {
  ModalProfileContext,
  ModalProfileProvider,
} from "../features/ModalProfile";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import Card from "../Card/Card";

export default function Navbar() {
  const [toggleHamburger, setToggleHamburger] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const handleSearch = (input) => {
    if (!input || input === "") {
      toast.error("Masukkan kata kunci pencarian");
    }
    console.log(input);
  };

  const hoverNav = "hover:text-accent-2 transition-all";

  return (
    <header className="relative flex h-24 w-full items-center justify-center bg-bg shadow">
      <MenuBar toggled={toggleHamburger} toggle={setToggleHamburger} />
      <div className="mx-10 flex w-full min-w-[360px] items-center lg:mx-auto lg:max-w-[1080px] lg:justify-center">
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
          className={`mx-auto w-[88px] sm:w-[118px] lg:mx-0 ${searchFocus ? "hidden" : ""}`}
        />

        {/* Navigasi */}
        <nav
          className={`mx-14 hidden gap-8 font-semibold text-primary ${searchFocus ? "lg:hidden" : "lg:flex"}`}
        >
          <NavLink
            className={({ isActive }) =>
              isActive ? `text-accent-1` : hoverNav
            }
            to="/"
          >
            Beranda
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive
                ? `w-fit whitespace-nowrap text-accent-1`
                : hoverNav + " w-fit whitespace-nowrap"
            }
            to="/login"
          >
            Bahan Makanan
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? `text-accent-1` : hoverNav
            }
            to="/register"
          >
            Kategori
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? `text-accent-1` : hoverNav
            }
            to="/register"
          >
            Populer
          </NavLink>
        </nav>

        {/* Search Input */}
        <InputWbtn
          placeholder="Cari resep.."
          iconify="ri:search-line"
          className={`ml-6 mr-3 hidden w-56 transition-[width] duration-300 sm:ml-auto lg:flex ${searchFocus ? "w-full" : ""}`}
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
            className={`absolute left-0 z-40 flex h-full w-full items-center gap-3 bg-bg px-6 opacity-0 transition-opacity duration-300 sm:px-8 lg:hidden ${searchFocus ? "visible opacity-100" : "invisible"}`}
          >
            <button
              className="rounded-full bg-primary bg-opacity-30 px-3 py-1 font-medium text-bg active:bg-opacity-15"
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
        {isLoggedIn ? (
          <ModalProfileProvider>
            <Profile />
          </ModalProfileProvider>
        ) : (
          <>
            <AuthButton />
            <div className="group">
              <button className="text-primary lg:hidden">
                <Icon icon="iconamoon:profile-fill" className="text-[34px]" />
              </button>
              <div className="absolute right-4 hidden flex-col gap-4 rounded border bg-bg p-5 shadow-md group-focus-within:flex">
                <DefaultButton
                  className="h-10"
                  name="Masuk"
                  btnStroke={true}
                  onClick={() => console.log("Login")}
                />
                <DefaultButton
                  className="h-10"
                  name="Daftar"
                  onClick={() => console.log("Daftar")}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function AuthButton() {
  const [showModal, setShowModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <div className="ml-3 hidden gap-2 sm:ml-6 lg:flex">
      <DefaultButton
        data-modal-target="default-modal"
        data-modal-toggle="default-modal"
        className="block text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-10"
        name="Masuk"
        btnStroke={true}
        onClick={() => setShowModal(true)}
      />

      {/* Modal Login */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <Login />
        </Modal>
      )}

      <DefaultButton
        className="h-10"
        name="Daftar"
        onClick={() => setShowRegisterModal(true)}
      />

      {/* Modal Register */}
      {showRegisterModal && (
        <Modal onClose={() => setShowRegisterModal(false)}>
          <Register />
        </Modal>
      )}
    </div>
  );
}


// Desain Modal
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-1 mx-2 bg-white rounded-lg shadow-lg">
        <button
          className="absolute top-2 right-2 text-black"
          onClick={onClose}
        >
          <span>x</span>
        </button>
        {children}
      </div>
    </div>
  );
}

function Profile() {
  const { toggle, setToggle } = useContext(ModalProfileContext);

  return (
    <div className="flex w-fit min-w-fit cursor-pointer items-center gap-1 lg:ml-3">
      <img
        src="https://pics.craiyon.com/2023-07-15/dc2ec5a571974417a5551420a4fb0587.webp"
        alt="Profile"
        className="aspect-square w-10 rounded-full bg-slate-300 object-cover sm:w-11"
        onClick={() => setToggle(!toggle)}
      />

      <div
        className={"hidden text-lg text-primary hover:text-accent-1 sm:flex"}
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

function MenuBar(props) {
  return (
    <aside
      className={`fixed left-0 top-0 h-svh w-0 border bg-bg shadow transition-all duration-200 ${props.toggled ? "z-50 w-[70%]" : "invisible"}`}
    >
      <div
        className={`ml-7 mr-5 flex h-24 items-center justify-between lg:hidden ${!props.toggled ? "hidden" : ""}`}
      >
        <img src={Logo} alt="Logo" className={`w-[88px]`} />
        <Hamburger
          toggled={props.toggled}
          toggle={(t) => props.toggle(t)}
          size={30}
          color="#1A1F2B"
          direction="right"
          distance="sm"
          duration={0.9}
          rounded
        />
      </div>
      <hr />
      <nav
        className={`mx-7 mt-4 flex flex-col gap-6 ${!props.toggled ? "hidden" : ""}`}
      >
        <NavLink
          className="font-medium text-primary hover:text-accent-1"
          to="/"
          onClick={() => props.toggle(false)}
        >
          Beranda
        </NavLink>
        <NavLink
          className="w-fit whitespace-nowrap font-medium text-primary hover:text-accent-1"
          to="/login"
          onClick={() => props.toggle(false)}
        >
          Bahan Makanan
        </NavLink>
        <NavLink
          className="font-medium text-primary hover:text-accent-1"
          to="/register"
          onClick={() => props.toggle(false)}
        >
          Kategori
        </NavLink>
        <NavLink
          className="font-medium text-primary hover:text-accent-1"
          to="/register"
          onClick={() => props.toggle(false)}
        >
          Populer
        </NavLink>
      </nav>
      <div
        className={`absolute -right-full top-0 h-svh w-full bg-primary bg-opacity-5 backdrop-blur-[2px] ${!props.toggled ? "hidden" : ""}`}
        onClick={() => props.toggle(false)}
      ></div>
    </aside>
  );
}
