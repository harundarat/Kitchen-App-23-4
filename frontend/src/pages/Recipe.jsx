import React, { useState, useEffect, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import Card from "../components/common/Card";
import BlankProfile from "../assets/blank_profile.webp";
import { UserContext } from "../context/userContext";
import { Modal, Label, Radio, Textarea } from "flowbite-react";

export default function Recipe() {
  const navigate = useNavigate();
  const { isLogged } = useContext(UserContext);
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState({});
  const [nutrition, setNutrition] = useState({});
  const [toggleActivity, setToggleActivity] = useState({
    like: false,
    save: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/recipes/${id}`);
        const data = response.data.recipe;
        setRecipe(data);
        setToggleActivity((val) => ({ ...val, like: data.isLiked }));
        setToggleActivity((val) => ({ ...val, save: data.isSaved }));
        console.log("🚀 ~ fetchRecipe ~ response:", response);
      } catch (error) {
        navigate("/recipe");
        console.log("🚀 ~ fetchRecipe ~ error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, isLogged]);

  useEffect(() => {
    const nutrisi = recipe.nutrition ? recipe.nutrition[0] : "";
    setNutrition({
      energi: nutritionFormat(nutrisi?.total_cal),
      lemakTotal: nutritionFormat(nutrisi?.total_fat?.g),
      lemakJenuh: nutritionFormat(nutrisi?.fatsat?.g),
      protein: nutritionFormat(nutrisi?.protein?.g),
      karb: nutritionFormat(nutrisi?.carb?.g),
      gula: nutritionFormat(nutrisi?.sugar?.g),
      garam: nutritionFormat(nutrisi?.salt?.mg),
    });
    console.log("🚀 ~ useEffect ~ nutrisi:", nutrisi);
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
    setToggleActivity((val) => ({ ...val, like: !toggleActivity.like }));
    if (toggleActivity.like) {
      setRecipe((val) => ({ ...val, likes: parseInt(recipe.likes) - 1 }));
    } else {
      setRecipe((val) => ({ ...val, likes: parseInt(recipe.likes) + 1 }));
    }

    try {
      const response = await axios.post(`/recipes/${id}/like`);
      console.log("🚀 ~ toggleLike ~ response:", response);
    } catch (error) {
      toast.error("Gagal menyukai resep");
      setToggleActivity((val) => ({ ...val, like: !toggleActivity.like }));
      if (toggleActivity.like) {
        setRecipe((val) => ({ ...val, likes: parseInt(recipe.likes) - 1 }));
      } else {
        setRecipe((val) => ({ ...val, likes: parseInt(recipe.likes) + 1 }));
      }
    }
  };
  const toggleSave = async () => {
    if (!isLogged) {
      toast.error("Silahkan login terlebih dahulu untuk menyimpan resep");
      return;
    }
    setToggleActivity((val) => ({ ...val, save: !toggleActivity.save }));
    try {
      const response = await axios.post(`/recipes/${id}/save`);
      console.log("🚀 ~ toggleLike ~ response:", response);
    } catch (error) {
      toast.error("Gagal menyimpan resep");
      setToggleActivity((val) => ({ ...val, save: false }));
    }
  };

  if (loading) {
    return (
      <>
        <div className="fixed left-1/2 top-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary bg-opacity-50 backdrop-blur-lg">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded bg-bg font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
        <div className="h-svh w-full"></div>
      </>
    );
  }
  return (
    <main className="mb-20 mt-28 w-full px-5 lg:px-0">
      {/* Header */}
      <section className="relative mx-auto h-fit w-full max-w-[1080px] overflow-hidden rounded-lg">
        <img
          src={recipe.image}
          className="aspect-[16/11] w-full bg-gray-200 object-cover md:aspect-[16/6] md:blur-[5px]"
          alt="thumbnail"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 p-8">
          <h1 className="text-xl font-bold text-bg drop-shadow sm:text-3xl">
            {recipe.title}
          </h1>
          <img
            src="/kitchen-craft-ic.svg"
            alt="logo"
            width={30}
            className="opacity-2 absolute bottom-4 right-4 opacity-50 md:bottom-8 md:right-8"
          />
          <div className="absolute bottom-4 left-4 flex h-fit w-fit items-center gap-1 rounded-full bg-accent-2 px-3 py-1 text-xs text-bg sm:bottom-6 sm:left-6 sm:text-sm">
            <Icon width={19} icon="mingcute:time-line" />
            <p className="">{formatMinute(parseInt(recipe.total_time))}</p>
          </div>
        </div>
      </section>
      <div className="mx-auto mt-5 flex max-w-[1080px] flex-col gap-8 md:flex-row">
        <main className="w-full min-w-[70%]">
          {/* Like, Save, Share, Total Time */}
          <header className="flex items-center gap-8">
            <div
              onClick={() => toggleLike()}
              className="group flex w-fit cursor-pointer select-none flex-col items-center justify-center font-medium"
            >
              <Icon
                icon={`${toggleActivity.like ? "icon-park-solid:like" : "icon-park-outline:like"}`}
                width={23}
                className="transition-all group-active:scale-125"
              />
              <p>{recipe.likes}</p>
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
              <p className="invisible absolute -top-5 right-1/2 translate-x-1/2 text-sm text-primary opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
                Laporkan
              </p>
            </button>
          </header>
          <hr className="my-4 border-gray-300" />
          {/* User Info */}
          <section className="flex flex-col items-start gap-2">
            <div
              onClick={() => navigate(`/user/${recipe.user_id?.username}`)}
              className="flex cursor-pointer items-center gap-2 text-accent-1 hover:underline"
            >
              <img
                src={recipe.user_id?.image || BlankProfile}
                alt="user"
                className="aspect-square w-11 rounded-full border object-cover shadow-sm"
              />
              <p className="font-semibold">
                {recipe.user_id?.fullName || "User Creator"}
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
                  className="font-medium text-accent-1"
                >
                  Cek Harga
                </button>
              </div>
            ))}
          </section>
          <hr className="my-4 border-gray-300" />
          {/* Informasi Nilai Gizi */}
          {nutrition.energi && (
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
                <p className="mt-2 text-xs italic text-gray-500">
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
            {recipe.steps?.video && (
              <iframe
                className="aspect-video w-full rounded-lg"
                src={`https://www.youtube.com/embed/${extractYouTubeID(recipe.steps?.video)}`}
                allowFullScreen="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            )}
            {recipe.steps?.step.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <h1 className="flex aspect-square w-7 items-center justify-center rounded-full bg-primary text-bg">
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
        <MoreRecipes category={recipe.category} />
      </div>
      <ModalReport
        openModal={openModal}
        setOpenModal={(bol) => setOpenModal(bol)}
        isLogged={isLogged}
        idRecipe={id}
      />
    </main>
  );
}

function MoreRecipes({ category }) {
  let categoryEncode = encodeURIComponent(category?.join(","));
  // console.log("🚀 ~ MoreRecipes ~ categoryEncode:", categoryEncode);
  const [forYou, setForYou] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // console.log(forYou);

  useEffect(() => {
    const fetchForYou = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `/recipes?category=${categoryEncode}&limit=4`,
        );
        setForYou(data.recipes);
      } catch (error) {
        console.error(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchForYou();
  }, []);

  if (error || loading) {
    if (error) toast.error("Gagal mengambil data lainya");
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
      {forYou?.map((item, index) => (
        <Card
          key={index}
          id={item._id}
          tittle={item.title}
          image={item.image}
          time={item.total_time}
          likes={item.likes}
          creatorName={item.user?.fullName || item.user_id?.fullName}
          creatorImage={item.user?.image || item.user_id?.image}
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
function ModalReport({ openModal, setOpenModal, isLogged, idRecipe }) {
  const [report, setReport] = useState({ reason: "", detail: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReport({ reason: "", detail: "" });
  }, [openModal]);

  const handleReasonChange = (reason, detail) => {
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
      const { data } = await axios.post(`recipes/${idRecipe}/report`, {
        reason: report.reason,
        description: report.detail,
      });
      toast.success("Resep berhasil dilaporkan");
    } catch (error) {
      setOpenModal(true);
      console.log(error);
      toast.error("Gagal melaporkan resep");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed left-1/2 top-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary bg-opacity-50">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded bg-bg font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Loading...</h1>
          </div>
        </div>
      )}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header className="mx-4 mt-3">Laporkan Resep</Modal.Header>
        <Modal.Body className="mx-4">
          <form className="flex max-w-md flex-col gap-4">
            <h1 className="font-medium">
              Pilih alasan untuk melaporkan resep ini:
            </h1>
            {reportValue.map((item, index) => (
              <div className="flex items-start gap-2">
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
        </Modal.Body>
        <Modal.Footer className="mx-4 flex justify-end gap-4">
          <button className="" onClick={() => setOpenModal(false)}>
            Batal
          </button>
          <button
            className="h-10 rounded-full bg-primary px-4 text-bg"
            onClick={() => handleSubmit()}
          >
            Kirim
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function nutritionFormat(numberString) {
  if (!numberString) return "";
  let decimalIndex = numberString.indexOf(".");
  let result;
  if (decimalIndex !== -1) {
    result = numberString.substring(0, decimalIndex + 2);
  } else {
    result = numberString;
  }
  return result;
}
function extractYouTubeID(url) {
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
function formatMinute(menit) {
  let jam = Math.floor(menit / 60);
  let sisaMenit = menit % 60;

  if (jam > 0 && sisaMenit > 0) {
    return `${jam} j ${sisaMenit} m`;
  } else if (jam > 0) {
    return `${jam} j`;
  } else {
    return `${sisaMenit} m`;
  }
}
