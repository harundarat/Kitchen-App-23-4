import { useEffect, useState, useRef } from "react";
import Card from "../components/common/Card";
import CategoryCard from "../components/common/CategoryCard";
import { useDraggable } from "react-use-draggable-scroll";
import { api } from "../services/api";
import RoundedButton from "../components/common/RoundedButton";
import { useAdditionalInfo } from "../context/additionalInfoContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // import stylesheet
import { Carousel } from "react-responsive-carousel";
import Banner1 from "../assets/banner/10.png";
import Banner2 from "../assets/banner/11.png";
import Banner3 from "../assets/banner/5.png";
import Banner4 from "../assets/banner/4.png";
import Banner5 from "../assets/banner/3.png";
import Banner6 from "../assets/banner/2.png";
import type { Recipe, RecipesResponse } from "../types/api";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto my-24 w-full max-w-[1080px] min-w-[360px] px-5 py-1 lg:mx-auto lg:px-0">
      {/* Banner */}
      <section id="banner" className="mx-auto my-6 w-full overflow-hidden">
        {/* Mobile */}
        <Carousel
          showThumbs={false}
          infiniteLoop={true}
          useKeyboardArrows={true}
          autoPlay={true}
          interval={5000}
          showStatus={false}
          swipeable={true}
          className="select-none md:hidden"
        >
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              className="aspect-video w-full object-cover"
              src={Banner1}
              alt="Image 1"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              className="aspect-video w-full object-cover"
              src={Banner2}
              alt="Image 1"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              className="aspect-video w-full object-cover"
              src={Banner3}
              alt="Image 1"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              className="aspect-video w-full object-cover"
              src={Banner4}
              alt="Image 1"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              className="aspect-video w-full object-cover"
              src={Banner5}
              alt="Image 1"
            />
          </div>
          <div className="overflow-hidden rounded-lg shadow-md">
            <img
              className="aspect-video w-full object-cover"
              src={Banner6}
              alt="Image 1"
            />
          </div>
        </Carousel>
        {/* Desktop */}
        <Carousel
          showThumbs={false}
          infiniteLoop={true}
          useKeyboardArrows={true}
          autoPlay={true}
          interval={5000}
          showStatus={false}
          swipeable={true}
          className="hidden select-none md:block"
        >
          <div className="hidden gap-3 md:flex">
            <div className="flex-1 overflow-hidden rounded-lg shadow-md">
              <img
                className="aspect-video w-full object-cover"
                src={Banner1}
                alt="Image 1"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-lg shadow-md">
              <img
                className="aspect-video w-full object-cover"
                src={Banner2}
                alt="Image 1"
              />
            </div>
          </div>
          <div className="hidden gap-3 md:flex">
            <div className="flex-1 overflow-hidden rounded-lg shadow-md">
              <img
                className="aspect-video w-full object-cover"
                src={Banner3}
                alt="Image 1"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-lg shadow-md">
              <img
                className="aspect-video w-full object-cover"
                src={Banner4}
                alt="Image 1"
              />
            </div>
          </div>
          <div className="hidden gap-3 md:flex">
            <div className="flex-1 overflow-hidden rounded-lg shadow-md">
              <img
                className="aspect-video w-full object-cover"
                src={Banner5}
                alt="Image 1"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-lg shadow-md">
              <img
                className="aspect-video w-full object-cover"
                src={Banner6}
                alt="Image 1"
              />
            </div>
          </div>
        </Carousel>
      </section>

      {/* SECTION Terpopuler */}
      <section id="popular">
        <h1 className="mt-10 font-bold lg:text-lg">Resep Terpopuler</h1>
        <PopularSection />
      </section>

      {/* SECTION Kategori */}
      <section id="category">
        <h1 className="mt-10 font-bold lg:text-lg">Berdasarkan Kategori</h1>
        <CategorySection />
      </section>

      {/* SECTION Untuk Kamu */}
      <section id="for-you">
        <h1 className="mt-10 font-bold lg:text-lg">Untuk Kamu</h1>
        <ForYouSection />
        <div className="flex w-full justify-center">
          <RoundedButton
            className="mx-auto mt-10"
            btnStroke
            name="Lihat resep menarik lainya"
            onClick={() => navigate("/search")}
          />
        </div>
      </section>

      {/* SECTION Berdasarkan Bahan */}
      <section id="ingredients">
        <h1 className="mt-10 font-bold lg:text-lg">Berdasarkan Bahan</h1>
        <BasedOnIngredients />
        <div className="flex w-full justify-center">
          <button
            className="text-primary hover:text-primary/75 mx-auto mt-4 font-semibold underline transition-all active:scale-95"
            onClick={() => navigate("/search")}
          >
            Lihat Bahan Lainya
          </button>
        </div>
      </section>
    </main>
  );
}

function PopularSection() {
  const [popular, setPopular] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const data = await api.get<RecipesResponse>(
          "/recipes?popular=true&limit=4",
        );
        setPopular(data.recipes);
      } catch (error) {
        console.error(error);
        setError(error);
        toast.error("Gagal mengambil rekomendasi resep");
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);
  if (loading || error)
    return (
      <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
      </div>
    );

  return (
    <div className="mx-auto mt-2 grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {popular.map((item) => (
        <Card
          key={item._id}
          id={item._id}
          title={item.title}
          image={item.image}
          time={item.totalTime}
          likes={item.likeCount}
          creatorName={item.author?.fullName}
          creatorImage={item.author?.image}
        />
      ))}
    </div>
  );
}

function CategorySection() {
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const ref = useRef<HTMLDivElement>(null!);
  const { events } = useDraggable(ref);
  const { additionalInfo, loading } = useAdditionalInfo();
  const kategori = additionalInfo?.kategori ?? [];

  const handleClick = (title: string) => {
    urlSearchParams.set("category", title);
    navigate(`/search?${urlSearchParams.toString()}`);
  };

  if (loading) {
    return (
      <div
        className="no-scrollbar mt-2 h-fit w-full overflow-x-scroll"
        {...events}
        ref={ref}
      >
        <div className="flex w-full gap-3 whitespace-nowrap">
          <CategoryCard isLoad={true} />
          <CategoryCard isLoad={true} />
          <CategoryCard isLoad={true} />
          <CategoryCard isLoad={true} />
          <CategoryCard isLoad={true} />
          <CategoryCard isLoad={true} />
          <CategoryCard isLoad={true} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="no-scrollbar mt-2 h-fit w-full overflow-x-scroll"
      {...events}
      ref={ref}
    >
      <div className="flex w-full gap-3 whitespace-nowrap">
        {kategori.map((item) => (
          <CategoryCard
            onClick={() => handleClick(item.title)}
            key={item._id ?? item.title}
            title={item.title}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
}

function ForYouSection() {
  const [forYou, setForYou] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchForYou = async () => {
      try {
        setLoading(true);
        const data = await api.get<{ recipes: Recipe[] }>("/for-you");
        setForYou(data.recipes);
      } catch (error) {
        console.error(error);
        setError(error);
        toast.error("Gagal mengambil rekomendasi untuk Anda");
      } finally {
        setLoading(false);
      }
    };

    fetchForYou();
  }, []);

  if (error || loading) {
    return (
      <div className="mx-auto mt-2 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        {/* Taruh kodingan section 'untuk kamu' disini */}
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
      </div>
    );
  }
  return (
    <div className="mx-auto mt-2 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
      {forYou.map((item) => (
        <Card
          key={item._id}
          id={item._id}
          title={item.title}
          image={item.image}
          time={item.totalTime}
          likes={item.likeCount}
          creatorName={item.author.fullName}
          creatorImage={item.author.image}
        />
      ))}
    </div>
  );
}
function BasedOnIngredients() {
  const navigate = useNavigate();
  const { additionalInfo, loading } = useAdditionalInfo();
  const bahan = additionalInfo?.bahan ?? [];

  if (loading) {
    return (
      <div className="mx-auto mt-2 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        <RoundedButton btnStroke />
        <RoundedButton btnStroke />
        <RoundedButton btnStroke />
        <RoundedButton btnStroke />
      </div>
    );
  }

  return (
    <div className="mt-3 flex w-full flex-wrap justify-center gap-2">
      {/* Taruh kodingan section 'berdasarkan bahan' disini */}
      {bahan.slice(0, 28).map((item) => (
        <RoundedButton
          btnStroke
          key={item}
          name={item}
          onClick={() =>
            navigate(`/search?ingredients=${encodeURIComponent(item)}&page=1`)
          }
        />
      ))}
    </div>
  );
}
