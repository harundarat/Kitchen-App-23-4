import Logo from "/kitchen-craft-logo.svg";
import { Icon } from "@iconify/react";
import IconPalestine from "../../assets/ic-support-palestine.svg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-accent-2 bg-opacity-10 px-10 py-10">
      <div className="m-auto flex max-w-[1080px] flex-col gap-7 md:flex-row">
        <div className="flex w-full flex-col justify-start gap-4 sm:flex-row md:w-[40%] md:flex-col md:gap-4">
          <Link to="/" aria-label="Kembali ke beranda">
            <img
              width={140}
              src={Logo}
              className="h-fit"
              alt="Kitchen Craft Logo"
            />
          </Link>
          <h1 className="font-bold">
            Temukan berbagai resep lezat yang mudah diikuti dan cocok untuk
            segala suasana.
          </h1>
        </div>
        <div className="flex flex-wrap justify-between gap-4 sm:flex-nowrap md:w-[60%] md:justify-end md:gap-10">
          <div className="flex flex-col gap-1">
            <h1 className="mb-2 font-semibold">Resep Makanan</h1>
            <Link
              className="hover:underline"
              to="/search?category=Makanan%20Ringan"
            >
              Makanan Ringan
            </Link>
            <Link className="hover:underline" to="/search?category=Minuman">
              Minuman
            </Link>
            <Link className="hover:underline" to="/search?category=Roti">
              Roti
            </Link>
            <Link className="hover:underline" to="/search?category=Seafood">
              Seafood
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="mb-2 font-semibold">Informasi & Layanan</h1>
            <Link className="hover:underline" to="/about">
              Tentang Kami
            </Link>
            <Link className="hover:underline" to="/about/kontak-saran">
              Kontak
            </Link>
            <Link className="hover:underline" to="/about/kontak-saran">
              Kirim Saran
            </Link>
            <Link className="hover:underline" to="/about/privasi">
              Kebijakan Privasi
            </Link>
          </div>
          <div className="flex flex-col">
            <div>
              <h1 className="mb-3 font-semibold">Follow Us</h1>
              <div className="flex gap-3">
                <button type="button" aria-label="Instagram">
                  <Icon width={25} icon="mdi:instagram" />
                </button>
                <button type="button" aria-label="Facebook">
                  <Icon width={25} icon="ic:baseline-facebook" />
                </button>
                <button type="button" aria-label="X">
                  <Icon width={21} icon="bi:twitter-x" />
                </button>
                <button type="button" aria-label="YouTube">
                  <Icon width={25} icon="mingcute:youtube-fill" />
                </button>
              </div>
            </div>
            <a
              href="https://kitabisa.com/search/results?q=palestina"
              target="_blank"
              rel="noopener noreferrer"
              className="border-primary hover:bg-bg mt-5 flex w-40 items-center justify-center gap-1 rounded-full border bg-transparent px-3 py-1 text-sm"
            >
              Support Palestine
              <img src={IconPalestine} alt="" width={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
