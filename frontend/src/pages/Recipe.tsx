import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import Card from "../components/common/Card";
import BlankProfile from "../assets/blank_profile.webp";
import { useUser } from "../context/userContext";
import {
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Radio,
  Textarea,
} from "flowbite-react";
import { api } from "../services/api";
import type { Recipe as RecipeData, RecipeResponse } from "../types/api";

export default function Recipe() {
  const navigate = useNavigate();
  const { isLogged } = useUser();
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [toggleActivity, setToggleActivity] = useState({
    like: false,
    save: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRecipe = async () => {
      if (!id) {
        navigate("/search", { replace: true });
        return;
      }
      try {
        setLoading(true);
        const response = await api.get<RecipeResponse>(`/recipes/${id}`);
        const data = response.recipe;
        setRecipe(data);
        setToggleActivity({
          like: data.isLiked ?? false,
          save: data.isSaved ?? false,
        });
      } catch {
        toast.error("Resep tidak ditemukan");
        navigate("/search", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    void fetchRecipe();
  }, [id, isLogged, navigate]);

  const nutrition = useMemo(() => {
    const data = recipe?.nutrition;
    return {
      energi: data?.calories,
      lemakTotal: data?.totalFat?.amount,
      lemakJenuh: data?.saturatedFat?.amount,
      protein: data?.protein?.amount,
      karb: data?.carbohydrates?.amount,
      gula: data?.sugar?.amount,
      garam: data?.sodium?.amount,
    };
  }, [recipe]);

  const handleShare = () => {
    const url = window.location.href;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(
          "Alamat resep berhasil disalin ke clipboard, bagikan ke teman anda!",
        );
      })
      .catch((err) => {
        console.error("Gagal menyalin URL: ", err);
      });
  };
  const toggleLike = async () => {
    if (!isLogged) {
      toast.error("Silahkan login terlebih dahulu untuk menyukai resep");
      return;
    }
    try {
      const result = await api.post<{ liked: boolean; likeCount: number }>(
        `/recipes/${id}/like`,
      );
      setToggleActivity((current) => ({ ...current, like: result.liked }));
      setRecipe((current) =>
        current ? { ...current, likeCount: result.likeCount } : current,
      );
    } catch {
      toast.error("Gagal menyukai resep");
    }
  };
  const toggleSave = async () => {
    if (!isLogged) {
      toast.error("Silahkan login terlebih dahulu untuk menyimpan resep");
      return;
    }
    try {
      const result = await api.post<{ saved: boolean }>(`/recipes/${id}/save`);
      setToggleActivity((current) => ({ ...current, save: result.saved }));
    } catch {
      toast.error("Gagal menyimpan resep");
      setToggleActivity((val) => ({ ...val, save: false }));
    }
  };

  if (loading) {
    return (
      <>
        <div className="bg-primary bg-opacity-50 fixed top-1/2 left-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center backdrop-blur-lg">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
        <div className="h-svh w-full"></div>
      </>
    );
  }
  if (!recipe) return null;
  return (
    <main className="mt-28 mb-20 w-full px-5 lg:px-0">
      {/* Header */}
      <section className="relative mx-auto h-fit w-full max-w-[1080px] overflow-hidden rounded-lg">
        <img
          src={recipe.image}
          className="aspect-[16/11] w-full bg-gray-200 object-cover md:aspect-[16/6] md:blur-[5px]"
          alt="thumbnail"
        />
        <div className="bg-opacity-20 pointer-events-none absolute inset-0 flex items-center justify-center bg-black p-8">
          <h1 className="text-bg text-xl font-bold drop-shadow sm:text-3xl">
            {recipe.title}
          </h1>
          <img
            src="/kitchen-craft-ic.svg"
            alt="logo"
            width={30}
            className="absolute right-4 bottom-4 opacity-2 opacity-50 md:right-8 md:bottom-8"
          />
          <div className="bg-accent-2 text-bg absolute bottom-4 left-4 flex h-fit w-fit items-center gap-1 rounded-full px-3 py-1 text-xs sm:bottom-6 sm:left-6 sm:text-sm">
            <Icon width={19} icon="mingcute:time-line" />
            <p>{formatMinute(Number(recipe.totalTime) || 0)}</p>
          </div>
        </div>
      </section>
      <div className="mx-auto mt-5 flex max-w-[1080px] flex-col gap-8 md:flex-row">
        <main className="w-full min-w-[70%]">
          {/* Like, Save, Share, Total Time */}
          <header className="flex items-center gap-8">
            <div
              onClick={() => toggleLike()}
              className="group flex w-fit cursor-pointer flex-col items-center justify-center font-medium select-none"
            >
              <Icon
                icon={`${toggleActivity.like ? "icon-park-solid:like" : "icon-park-outline:like"}`}
                width={23}
                className="transition-all group-active:scale-125"
              />
              <p>{recipe.likeCount}</p>
            </div>
            <div
              onClick={() => toggleSave()}
              className="group flex w-fit cursor-pointer flex-col items-center justify-center font-medium"
            >
              <Icon
                icon={`${toggleActivity.save ? "majesticons:bookmark" : "majesticons:bookmark-line"}`}
                width={23}
                className="transition-all group-active:scale-125"
              />
              <p>Simpan</p>
            </div>
            <div
              onClick={() => handleShare()}
              className="group flex w-fit cursor-pointer flex-col items-center justify-center font-medium"
            >
              <Icon
                icon="tabler:share"
                width={24}
                className="transition-all group-active:scale-125"
              />
              <p>Bagikan</p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="group relative ml-auto"
            >
              <Icon width={24} icon="material-symbols:report-outline-rounded" />
              <p className="text-primary invisible absolute -top-5 right-1/2 translate-x-1/2 text-sm opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
                Laporkan
              </p>
            </button>
          </header>
          <hr className="my-4 border-gray-300" />
          {/* User Info */}
          <section className="flex flex-col items-start gap-2">
            <div
              onClick={() => navigate(`/user/${recipe.author.username}`)}
              className="text-accent-1 flex cursor-pointer items-center gap-2 hover:underline"
            >
              <img
                src={recipe.author.image || BlankProfile}
                alt="user"
                className="aspect-square w-11 rounded-full border object-cover shadow-sm"
              />
              <p className="font-semibold">
                {recipe.author.fullName || "User Creator"}
              </p>
            </div>
            <p>{recipe.description}</p>
          </section>
          <hr className="my-4 border-gray-300" />
          {/* Bahan Bahan */}
          <section className="flex flex-col gap-3">
            <h1 className="font-semibold">Bahan-bahan</h1>
            {recipe.ingredients?.map((item, index) => (
              <div
                key={index}
                className="flex h-11 w-full max-w-[90%] items-center justify-between rounded border border-gray-300 bg-gray-100 px-4 py-2 md:max-w-[80%]"
              >
                <p>{item}</p>
                <button
                  onClick={() =>
                    window.open(
                      `https://mart.grab.com/id/id/search?keyword=${item}`,
                      "_blank",
                    )
                  }
                  className="text-accent-1 font-medium"
                >
                  Cek Harga
                </button>
              </div>
            ))}
          </section>
          <hr className="my-4 border-gray-300" />
          {/* Informasi Nilai Gizi */}
          {nutrition.energi !== undefined && (
            <>
              <section>
                <h1 className="mb-4 font-semibold">Informasi Nilai Gizi</h1>
                <div className="grid w-full grid-cols-2 items-start gap-4 rounded border border-gray-300 bg-gray-100 px-6 py-4 sm:grid-cols-5 lg:grid-cols-7">
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Energi Total</h1>
                    <p className="font-semibold">{nutrition?.energi} kkal</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Lemak Total</h1>
                    <p className="font-semibold">{nutrition?.lemakTotal} g</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Lemak Jenuh</h1>
                    <p className="font-semibold">{nutrition?.lemakJenuh} g</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Protein</h1>
                    <p className="font-semibold">{nutrition?.protein} g</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Karbohidrat</h1>
                    <p className="font-semibold">{nutrition?.karb} g</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Gula</h1>
                    <p className="font-semibold">{nutrition?.gula} g</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <h1 className="text-center">Garam</h1>
                    <p className="font-semibold">{nutrition?.garam} mg</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  *Nilai gizi yang ditampilkan merupakan perkiraan dan mungkin
                  tidak sepenuhnya akurat.
                </p>
              </section>
              <hr className="my-4 border-gray-300" />
            </>
          )}

          {/* Langkah */}
          <section className="flex flex-col gap-4">
            <h1 className="mt-4 font-semibold">Langkah-langkah</h1>
            {recipe.video && (
              <iframe
                className="aspect-video w-full rounded-lg"
                src={`https://www.youtube.com/embed/${extractYouTubeID(recipe.video)}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            )}
            {recipe.steps.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <h1 className="bg-primary text-bg flex aspect-square w-7 items-center justify-center rounded-full">
                  {index + 1}
                </h1>
                <div className="flex w-full flex-col gap-2">
                  <p>{item.description}</p>
                  {item.image && (
                    <img
                      src={item.image}
                      alt="step"
                      className="aspect-square w-32 rounded"
                    />
                  )}
                </div>
              </div>
            ))}
          </section>
        </main>
        <hr className="border-gray-300 md:invisible" />
        <MoreRecipes category={recipe.categories} />
      </div>
      <ModalReport
        openModal={openModal}
        setOpenModal={(bol) => setOpenModal(bol)}
        isLogged={isLogged}
        idRecipe={id!}
      />
    </main>
  );
}

function MoreRecipes({ category }: { category: string[] }) {
  const categoryEncode = encodeURIComponent(category?.join(","));
  const [forYou, setForYou] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchForYou = async () => {
      try {
        setLoading(true);
        const data = await api.get<{ recipes: RecipeData[] }>(
          `/recipes?category=${categoryEncode}&limit=4`,
        );
        setForYou(data.recipes);
      } catch (error) {
        console.error(error);
        setError(error);
        toast.error("Gagal mengambil resep lainnya");
      } finally {
        setLoading(false);
      }
    };

    void fetchForYou();
  }, [categoryEncode]);

  if (error || loading) {
    return (
      <section className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:max-w-[255px] md:grid-cols-1">
        <h1 className="col-span-2 w-full font-semibold sm:col-span-3 md:col-span-1">
          Resep Lainnya Untuk Kamu
        </h1>
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
        <Card isLoad />
      </section>
    );
  }

  return (
    <section className="grid h-fit w-full grid-cols-2 gap-4 sm:grid-cols-3 md:max-w-[255px] md:grid-cols-1">
      <h1 className="col-span-2 mt-2 w-full font-semibold sm:col-span-3 md:col-span-1">
        Resep Lainnya Untuk Kamu
      </h1>
      {forYou.map((item) => (
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
    </section>
  );
}

const reportValue = [
  {
    reason: "spam",
    detail:
      "Resep ini adalah spam atau berisi konten promosi yang tidak relevan.",
    title: "Spam",
  },
  {
    reason: "konten-tidak-pantas",
    detail: "Resep ini berisi konten yang tidak pantas atau ofensif.",
    title: "Konten Tidak Pantas",
  },
  {
    reason: "informasi-salah",
    detail: "Resep ini mengandung informasi yang salah atau menyesatkan.",
    title: "Informasi Salah",
  },
  {
    reason: "resep-tidak-lengkap",
    detail: "Resep ini tidak lengkap atau informasi pentingnya hilang.",
    title: "Resep Tidak Lengkap",
  },
  {
    reason: "tindakan-kekerasan-atau-berbahaya",
    detail: "Resep ini mengandung saran yang berbahaya atau tidak aman.",
    title: "Tindakan Kekeerasan atau Berbahaya",
  },
  {
    reason: "lainnya",
    detail: "",
    title: "Lainnya",
  },
];
function ModalReport({
  openModal,
  setOpenModal,
  isLogged,
  idRecipe,
}: {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  isLogged: boolean | null;
  idRecipe: string;
}) {
  const [report, setReport] = useState({ reason: "", detail: "" });
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    setOpenModal(false);
    setReport({ reason: "", detail: "" });
  };

  const handleReasonChange = (reason: string, detail: string) => {
    setReport({ reason: reason, detail: detail });
  };

  const handleSubmit = async () => {
    if (!report.reason) {
      toast.error("Pilih alasan terlebih dahulu");
      return;
    }
    if (report.reason === "lainnya" && !report.detail) {
      toast.error("Jelaskan alasan anda");
      return;
    }
    if (!isLogged) {
      toast.error("Silahkan Login terlebih dahulu untuk melaporkan resep");
      return;
    }
    try {
      setLoading(true);
      setOpenModal(false);
      await api.post(`/recipes/${idRecipe}/report`, {
        reason: report.reason,
        description: report.detail,
      });
      setReport({ reason: "", detail: "" });
      toast.success("Resep berhasil dilaporkan");
    } catch {
      setOpenModal(true);
      toast.error("Gagal melaporkan resep");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="bg-primary bg-opacity-50 fixed top-1/2 left-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}
      <Modal show={openModal} onClose={closeModal}>
        <ModalHeader className="mx-4 mt-3">Laporkan Resep</ModalHeader>
        <ModalBody className="mx-4">
          <form className="flex max-w-md flex-col gap-4">
            <h1 className="font-medium">
              Pilih alasan untuk melaporkan resep ini:
            </h1>
            {reportValue.map((item) => (
              <div key={item.reason} className="flex items-start gap-2">
                <Radio
                  className="mt-1"
                  id={item.reason}
                  name="report_reason"
                  value={item.reason}
                  checked={report.reason === item.reason}
                  onChange={() => handleReasonChange(item.reason, item.detail)}
                />
                <Label className="" htmlFor={item.reason}>
                  <p className="text-[16px]">{item.title}</p>
                  <p className="mt-2 font-normal text-gray-400">
                    {item.detail}
                  </p>
                </Label>
              </div>
            ))}
            {report.reason === "lainnya" && (
              <Textarea
                id="details"
                name="report_details"
                placeholder="Jika memilih 'Lainnya', mohon jelaskan"
                value={report.detail}
                onChange={(e) => handleReasonChange("lainnya", e.target.value)}
              />
            )}
          </form>
        </ModalBody>
        <ModalFooter className="mx-4 flex justify-end gap-4">
          <button className="" onClick={() => setOpenModal(false)}>
            Batal
          </button>
          <button
            className="bg-primary text-bg h-10 rounded-full px-4"
            onClick={() => handleSubmit()}
          >
            Kirim
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function extractYouTubeID(url: string) {
  const regexList = [
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  ];

  for (const regex of regexList) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
function formatMinute(menit: number) {
  const jam = Math.floor(menit / 60);
  const sisaMenit = menit % 60;

  if (jam > 0 && sisaMenit > 0) {
    return `${jam} j ${sisaMenit} m`;
  } else if (jam > 0) {
    return `${jam} j`;
  } else {
    return `${sisaMenit} m`;
  }
}
