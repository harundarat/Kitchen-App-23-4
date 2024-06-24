import React from "react";
import Logo from "/kitchen-craft-logo.svg";
import { Icon } from "@iconify/react";
import IconPalestine from "../../assets/ic-support-palestine.svg";

const Footer = () => {
  return (
    <footer className="bg-accent-2 bg-opacity-10 px-10 py-10">
      <div className="m-auto flex max-w-[1080px] flex-col gap-7 md:flex-row">
        <div className="flex w-full flex-col justify-start gap-4 sm:flex-row md:w-[40%] md:flex-col md:gap-4">
          <img
            width={140}
            src={Logo}
            className="h-fit cursor-pointer"
            onClick={() => (window.location.href = "/")}
            alt="Kitchen Craft Logo"
          />
          <h1 className="font-bold">
            Temukan berbagai resep lezat yang mudah diikuti dan cocok untuk
            segala suasana.
          </h1>
        </div>
        <div className="flex flex-wrap justify-between gap-4 sm:flex-nowrap md:w-[60%] md:justify-end md:gap-10">
          <div className="flex flex-col gap-1">
            <h1 className="mb-2 font-semibold">Resep Makanan</h1>
            <a
              className="hover:underline"
              href="/search?category=Makanan%20Ringan"
            >
              Makanan Ringan
            </a>
            <a className="hover:underline" href="/search?category=Minuman">
              Minuman
            </a>
            <a className="hover:underline" href="/search?category=Roti">
              Roti
            </a>
            <a className="hover:underline" href="/search?category=Seafood">
              Seafood
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="mb-2 font-semibold">Informasi & Layanan</h1>
            <a className="hover:underline" href="/about">
              Tentang Kami
            </a>
            <a className="hover:underline" href="/about/kontak-saran">
              Kontak
            </a>
            <a className="hover:underline" href="/about/kontak-saran">
              Kirim Saran
            </a>
            <a className="hover:underline" href="/about/privasi">
              Kebijakan Privasi
            </a>
          </div>
          <div className="flex flex-col">
            <div>
              <h1 className="mb-3 font-semibold">Follow Us</h1>
              <div className="flex gap-3">
                <button>
                  <Icon width={25} icon="mdi:instagram" />
                </button>
                <button>
                  <Icon width={25} icon="ic:baseline-facebook" />
                </button>
                <button>
                  <Icon width={21} icon="bi:twitter-x" />
                </button>
                <button>
                  <Icon width={25} icon="mingcute:youtube-fill" />
                </button>
              </div>
            </div>
            <button
              onClick={() =>
                window.open(
                  "https://kitabisa.com/search/results?q=palestina",
                  "_blank",
                )
              }
              className="mt-5 flex w-40 items-center justify-center gap-1 rounded-full border border-primary bg-transparent px-3 py-1 text-sm hover:bg-bg"
            >
              Support Palestine
              <img src={IconPalestine} alt="" width={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
