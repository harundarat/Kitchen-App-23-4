import { useState, useEffect, type ChangeEvent, type MouseEvent } from "react";
import { useUser } from "../context/userContext";
import { Icon } from "@iconify/react";
import {
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdditionalInfo } from "../context/additionalInfoContext";

import InputForm from "../components/common/InputForm";
import TextAreaForm from "../components/common/TextAreaForm";
import DropdownForm from "../components/common/DropdownForm";
import ImageForm from "../components/common/ImageForm";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../services/api";
import type { RecipeResponse, RecipeStep } from "../types/api";

interface IngredientDraft {
  bahan: string;
  unit: string;
  jumlah: string;
  jumlah_dec: string;
}

interface ImageDraft {
  file: File | null;
  url: string | null;
}

interface StepDraft {
  description: string;
  image: ImageDraft;
}

interface StepPayload {
  description: string;
  image: File | null;
}

interface StepsPayload {
  video: string;
  step: StepPayload[];
}

interface RecipeFormState {
  title: string;
  image: File | null;
  description: string;
  totalTime: number;
  steps: StepsPayload;
  categories: string[];
}

interface AlertState {
  input: { open: boolean; message: string };
  cancel: boolean;
  delete: boolean;
}

interface TabProps {
  activeTab: number;
  changeActiveTab: (tab: number) => void;
}

const time = {
  jam: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24,
  ],
  menit: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
};
const unitBahan = {
  pecahan: ["0", "1/2", "1/3", "1/4", "1/8", "3/4"],
  unit: [
    "--pilih--",
    "sdt",
    "sdm",
    "kg",
    "g",
    "mg",
    "liter",
    "ml",
    "gelas",
    "piring",
    "butir",
    "siung",
    "batang",
    "buah",
    "potong",
    "secukupnya",
  ],
};

function ingredientToString(ingredient: IngredientDraft): string {
  return `${Number.parseInt(ingredient.jumlah) ? ingredient.jumlah : ""} ${Number.parseInt(ingredient.jumlah_dec) ? ingredient.jumlah_dec : ""} ${ingredient.unit} ${ingredient.bahan}`
    .replaceAll("  ", " ")
    .trim();
}

export default function EditRecipe() {
  const navigate = useNavigate();
  const { isLogged } = useUser();
  const [tabActive, setTabActive] = useState(0);
  useEffect(() => {
    if (isLogged === false) {
      navigate(-1);
    }
  }, [isLogged, navigate]);

  return (
    <main className="px-5 pb-10">
      <Header tabActive={tabActive} changeActiveTab={(a) => setTabActive(a)} />
      <FormRecipe
        activeTab={tabActive}
        changeActiveTab={(a) => setTabActive(a)}
      />
    </main>
  );
}

function Header({
  tabActive,
  changeActiveTab,
}: {
  tabActive: number;
  changeActiveTab: (tab: number) => void;
}) {
  return (
    <header className="mx-auto grid h-fit w-full max-w-[1080px] grid-cols-2 gap-x-2 gap-y-5 pt-5 select-none sm:h-16 sm:grid-cols-4 sm:gap-y-0 sm:border-b sm:pt-0">
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 0 ? "border-accent-2 border-b-2" : ""}`}
        onClick={() => changeActiveTab(0)}
      >
        <h1>Dasar</h1>
      </div>
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 1 ? "border-accent-2 border-b-2" : ""}`}
        onClick={() => changeActiveTab(1)}
      >
        <h1>Bahan</h1>
      </div>
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 2 ? "border-accent-2 border-b-2" : ""}`}
        onClick={() => changeActiveTab(2)}
      >
        <h1>Langkah</h1>
      </div>
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 3 ? "border-accent-2 border-b-2" : ""}`}
        onClick={() => changeActiveTab(3)}
      >
        <h1>Tambahan</h1>
      </div>
    </header>
  );
}

function FormRecipe({ activeTab, changeActiveTab }: TabProps) {
  const { idRecipe } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState<AlertState>({
    input: {
      open: false,
      message: "",
    },
    cancel: false,
    delete: false,
  });
  const [selectedImage, setSelectedImage] = useState<ImageDraft>({
    file: null,
    url: null,
  });
  const [formData, setFormData] = useState<RecipeFormState>({
    title: "",
    image: null,
    description: "",
    totalTime: 0,
    steps: { video: "", step: [] },
    categories: [],
  });

  // STATE BAHAN
  const [modalEditBahan, setModalEditBahan] = useState(false);
  const [inputBahan, setInputBahan] = useState({
    bahan: "",
    unit: "",
    jumlah: "0",
    jumlah_dec: "0",
  });
  const [listBahan, setListBahan] = useState<IngredientDraft[]>([]);
  const [updatedBahan, setUpdatedBahan] = useState<{
    index: number | null;
    bahan: IngredientDraft | null;
  }>({ index: null, bahan: null });
  // END STATE BAHAN
  const [initSteps, setInitSteps] = useState<{
    video: string;
    step: RecipeStep[];
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<RecipeResponse>(`/recipes/${idRecipe}`);
        const recipe = data?.recipe;
        setFormData({
          title: recipe.title,
          description: recipe.description,
          image: null,
          categories: recipe.categories,
          totalTime: Number(recipe.totalTime) || 0,
          steps: {
            video: recipe.video,
            step: recipe.steps.map((step) => ({
              description: step.description,
              image: null,
            })),
          },
        });
        setInitSteps({ video: recipe.video, step: recipe.steps });
        setListBahan(parseBahan(recipe.ingredients));
        setSelectedImage({ file: null, url: recipe.image });
      } catch {
        navigate("/search");
        return;
      }
    })();
  }, [idRecipe, navigate]);

  const [waktu, setWaktu] = useState({ jam: 0, menit: 0 });

  const handleChange = <K extends keyof RecipeFormState>(
    name: K,
    value: RecipeFormState[K],
  ) => {
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleImage = (file: File | null, url: string | null) => {
    setSelectedImage({ file, url });
    handleChange("image", file);
  };

  const handleWaktu = (j: string | number, m: string | number) => {
    const minute = Number(j) * 60 + Number(m);
    handleChange("totalTime", minute);
  };

  // HANDLING BAHAN
  const handleClickImage = () => {
    document.getElementById("recipe-image")?.click();
  };
  const handleInputBahan = (name: keyof IngredientDraft, value: string) => {
    setInputBahan((values) => ({ ...values, [name]: value }));
  };
  const alertInput = (message: string) => {
    setOpenAlert((current) => ({
      ...current,
      input: { open: true, message },
    }));
  };
  const addListBahan = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!inputBahan.bahan) {
      alertInput("Mohon masukan nama bahan!");
      return;
    }
    if (inputBahan.unit === unitBahan.unit[0] || !inputBahan.unit) {
      alertInput(
        'Mohon pilih salah satu Unit, atau pilih Unit "secukupnya" jika jumlah tidak ditentukan',
      );
      return;
    }
    if (inputBahan.unit !== "secukupnya") {
      if (!inputBahan.jumlah && !inputBahan.jumlah_dec) {
        alertInput("Mohon masukan jumlah bahan!");
        return;
      }
      if (Number(inputBahan.jumlah) <= 0 && inputBahan.jumlah_dec === "0") {
        alertInput("Mohon masukan jumlah bahan!");
        return;
      }
    }

    setListBahan((list) => [inputBahan, ...list]);
    setInputBahan({
      bahan: "",
      unit: "",
      jumlah: "0",
      jumlah_dec: "0",
    });
  };
  function updateBahan(index: number | null, newValue: IngredientDraft) {
    if (index === null) return;
    if (index >= 0 && index < listBahan.length) {
      setListBahan((items) =>
        items.map((item, itemIndex) => (itemIndex === index ? newValue : item)),
      );
    }
  }
  function deleteBahan(index: number) {
    setListBahan((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }
  // END HANDLING BAHAN

  const handlingSimpan = async () => {
    const ingredients = listBahan.map(ingredientToString);
    if (!formData.title) {
      alertInput("Nama Resep belum terisi!");
      return;
    }
    if (!formData.image && !selectedImage.url) {
      alertInput("Foto Resep belum terisi!");
      return;
    }
    if (!formData.description) {
      alertInput("Deskripsi Resep belum terisi!");
      return;
    }
    if (!formData.totalTime) {
      alertInput("Waktu Memasak belum terisi!");
      return;
    }
    if (ingredients.length === 0) {
      alertInput("Bahan-bahan masih kosong!");
      return;
    }
    if (formData.steps?.step?.length === 0) {
      alertInput("Langkah-langkah masih kosong!");
      return;
    }
    if (formData.categories.length === 0) {
      alertInput("Pilih kategori setidaknya satu!");
      return;
    }
    const data = new FormData();
    data.append("title", formData.title);
    if (formData.image) data.append("image", formData.image);
    data.append("description", formData.description);
    data.append("totalTime", String(formData.totalTime));
    ingredients.forEach((item) => {
      data.append("ingredients", item);
    });
    data.append("video", formData.steps.video);
    formData.steps.step.forEach((step) => {
      data.append("stepDescription", step.description);
      if (step.image) data.append("stepImages", step.image);
    });
    formData.categories.forEach((item) => {
      data.append("categories", item);
    });

    try {
      setLoading(true);
      await api.put(`/recipes/${idRecipe}`, data);
      navigate(-1);
      toast.success("Resep berhasil diedit");
    } catch (error) {
      alertInput(getErrorMessage(error, "Gagal menyimpan perubahan resep"));
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="bg-primary bg-opacity-50 fixed top-1/2 left-1/2 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded font-medium">
            <Icon icon="svg-spinners:180-ring-with-bg" width={40} />
            <h1>Upload data...</h1>
          </div>
        </div>
      )}

      <form className="mx-auto mt-9 max-w-[720px]" action="">
        {/* TAB DASAR */}
        <div
          id="dasar"
          className={`flex flex-col gap-7 ${activeTab !== 0 ? "hidden" : ""}`}
        >
          <InputForm
            type="text"
            label="Nama Resep Anda *"
            name="title"
            placeholder="Cth. Nasi Goreng Ayam Rumahan"
            onChange={(e) => handleChange("title", e.target.value)}
            value={formData.title}
          />
          <div>
            <h1>Tambahkan Foto *</h1>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {selectedImage.url ? (
                <img
                  src={selectedImage.url}
                  alt="image recipe"
                  className="aspect-square max-w-56 rounded border bg-gray-100 object-cover"
                />
              ) : (
                <div
                  className="flex aspect-square max-w-56 cursor-pointer flex-col items-center justify-center gap-2 rounded border bg-gray-100 p-4 text-gray-400 select-none hover:border-4"
                  onClick={handleClickImage}
                >
                  <Icon
                    icon="majesticons:image-plus-line"
                    width={50}
                    className=""
                  />
                  <p className="text-center text-sm">
                    Tambahkan foto hidangan dari resep anda
                  </p>
                </div>
              )}

              <div className="w-fit">
                <h1
                  className="text-primary w-fit cursor-pointer font-semibold underline select-none"
                  onClick={handleClickImage}
                >
                  {selectedImage.url ? "Ganti Foto" : "Unggah Foto"}
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  Untuk tampilan yang lebih baik, mohon masukan gambar dengan
                  rasio 1 : 1 dan resolusi HD
                </p>
              </div>
            </div>
            <ImageForm
              id="recipe-image"
              name="recipe-image"
              onChange={(file, url) => handleImage(file, url)}
            />
          </div>

          <TextAreaForm
            name="desc"
            label="Deskripsi Untuk Resep Anda *"
            placeholder="Cth. Resep nasi goreng ayam rumahan yang lezat dan mudah dibuat. Cocok untuk ..."
            onChange={(e) => handleChange("description", e.target.value)}
            value={formData.description}
          />

          <div id="time" className="flex flex-wrap gap-2">
            <h1 className="block w-full">Waktu Memasak *</h1>
            <DropdownForm
              items={time.jam}
              onChange={(time) => {
                setWaktu((values) => ({ ...values, jam: parseInt(time) }));
                handleWaktu(time, waktu.menit);
              }}
              postfix={"Jam"}
              selected={minsToTime(formData.totalTime).jam}
            />
            <DropdownForm
              items={time.menit}
              onChange={(time) => {
                setWaktu((values) => ({ ...values, menit: parseInt(time) }));
                handleWaktu(waktu.jam, time);
              }}
              postfix="Menit"
              selected={minsToTime(formData.totalTime).menit}
            />
          </div>
          <p className="text-sm text-gray-500 italic">*Required</p>
        </div>
        {/* END TAB DASAR */}

        {/* TAB BAHAN */}
        <div
          id="bahan"
          className={`flex flex-col ${activeTab !== 1 ? "hidden" : ""}`}
        >
          <h1 className="mb-8 font-medium underline underline-offset-4">
            Tambahkan Bahan
          </h1>
          <div className="mb-8 flex flex-col items-end gap-5">
            <div className="flex w-full flex-col items-end gap-2 md:flex-row">
              <div className="flex w-full items-end gap-2 md:w-fit">
                <InputForm
                  className={"w-full sm:w-24"}
                  type="number"
                  label="Jumlah"
                  name="bahan-jumlah"
                  placeholder="0"
                  value={
                    inputBahan.unit === "secukupnya"
                      ? ""
                      : inputBahan.jumlah || ""
                  }
                  onChange={(e) => handleInputBahan("jumlah", e.target.value)}
                  disabled={inputBahan.unit === "secukupnya"}
                />
                <DropdownForm
                  items={unitBahan.pecahan}
                  onChange={(i) => handleInputBahan("jumlah_dec", i)}
                  selected={
                    inputBahan.unit === "secukupnya"
                      ? "0"
                      : inputBahan.jumlah_dec
                  }
                  disabled={inputBahan.unit === "secukupnya"}
                />
                <DropdownForm
                  label="Unit *"
                  items={unitBahan.unit}
                  onChange={(i) => handleInputBahan("unit", i)}
                  selected={inputBahan.unit}
                />
              </div>
              <InputForm
                className="ml-4 w-full"
                label="Bahan *"
                value={inputBahan.bahan || ""}
                name="bahan-nama"
                placeholder={"Cth. Bawang Merah"}
                onChange={(e) => handleInputBahan("bahan", e.target.value)}
              />
            </div>
            <button
              className="bg-primary text-bg hover:bg-opacity-90 rounded px-3 py-2 transition-all active:scale-95"
              onClick={addListBahan}
            >
              Tambahkan ke list bahan
            </button>
          </div>
          <hr />
          <h1 className="my-8 font-medium underline underline-offset-4">
            List Bahan Resep
          </h1>
          <div className="flex flex-col gap-4">
            {listBahan.length > 0 ? (
              listBahan.map((bahan, i) => (
                <div
                  key={i}
                  className="flex w-full items-center justify-between gap-4 rounded border border-gray-400 px-5 py-4 shadow"
                >
                  <h1>{ingredientToString(bahan)}</h1>
                  <div className="flex gap-4 font-medium">
                    <button
                      className="text-primary underline underline-offset-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setModalEditBahan(true);
                        setUpdatedBahan({ index: i, bahan });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-accent-1 underline underline-offset-2"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteBahan(i);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <h1 className="text-center text-gray-400">
                List bahan masih kosong
              </h1>
            )}
          </div>
        </div>
        {/* END TAB BAHAN */}

        {/* TAB LANGKAH */}
        <div
          id="langkah"
          className={`flex flex-col gap-7 ${activeTab !== 2 ? "hidden" : ""}`}
        >
          {initSteps && (
            <FormLangkah
              initialSteps={initSteps}
              getSteps={(data) => handleChange("steps", data)}
            />
          )}
        </div>
        {/* END TAB LANGKAH */}

        {/* TAB TAMBAHAN */}
        <div
          id="tambahan"
          className={`flex flex-col gap-7 ${activeTab !== 3 ? "hidden" : ""}`}
        >
          <FormTambahan
            getCategory={(data) => handleChange("categories", data)}
            selectedCategories={formData.categories}
          />
        </div>
        {/* END TAB TAMBAHAN */}
      </form>

      {/* BUTTON FOOT */}
      <hr className="mx-auto mt-8 max-w-[720px]" />
      <div className="mx-auto mt-6 flex max-w-[720px] justify-between">
        <button
          className="text-bg rounded border bg-gray-300 px-3 py-2 transition-all hover:bg-slate-400"
          onClick={() => setOpenAlert({ ...openAlert, cancel: true })}
        >
          Batal
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => changeActiveTab(activeTab - 1)}
            className={`border-primary bg-bg text-primary hover:text-bg rounded border px-3 py-2 transition-all hover:border-slate-400 hover:bg-slate-400 ${activeTab === 0 ? "hidden" : ""}`}
          >
            Sebelumnya
          </button>
          <button
            onClick={() => changeActiveTab(activeTab + 1)}
            className={`bg-primary text-bg rounded border px-3 py-2 transition-all hover:bg-slate-400 ${activeTab === 3 ? "hidden" : ""}`}
          >
            Selanjutnya
          </button>
          <button
            className={`bg-accent-2 text-bg hover:bg-opacity-85 rounded border px-7 py-2 transition-all ${activeTab !== 3 ? "hidden" : ""}`}
            onClick={() => handlingSimpan()}
          >
            Simpan
          </button>
        </div>
      </div>

      {/* MODAL */}
      <ModalAlert
        message="Yakin ingin membatalkan?"
        onYes={() => {
          navigate(-1);
        }}
        onCancel={() => setOpenAlert({ ...openAlert, cancel: false })}
        open={openAlert.cancel}
        close={(e) => setOpenAlert({ ...openAlert, cancel: e })}
      />
      <ModalAlert
        message={openAlert.input.message}
        onYes={() =>
          setOpenAlert({ ...openAlert, input: { open: false, message: "" } })
        }
        open={openAlert.input.open}
        close={(e) =>
          setOpenAlert({
            ...openAlert,
            input: { ...openAlert.input, open: e },
          })
        }
      />
      {modalEditBahan && (
        <ModalEditBahan
          open
          bahan={updatedBahan.bahan}
          onClose={setModalEditBahan}
          onSave={(data) => updateBahan(updatedBahan.index, data)}
        />
      )}
    </>
  );
}

function FormLangkah({
  getSteps,
  initialSteps,
}: {
  getSteps: (steps: StepsPayload) => void;
  initialSteps: { video: string; step: RecipeStep[] };
}) {
  const [openAlert, setOpenAlert] = useState({ open: false, message: "" });
  const [modalEditLangkah, setModalEditLangkah] = useState(false);
  const [langkah, setLangkah] = useState<{
    video: string;
    step: StepDraft[];
  }>(() => ({
    video: initialSteps.video,
    step: initialSteps.step.map((item) => ({
      description: item.description,
      image: { file: null, url: item.image || "" },
    })),
  }));

  const [inputLangkah, setInputLangkah] = useState<StepDraft>({
    description: "",
    image: { file: null, url: "" },
  });
  const [updatedLangkah, setUpdatedLangkah] = useState<{
    index: number | null;
    langkah: StepDraft;
  }>({
    index: null,
    langkah: {
      description: "",
      image: { file: null, url: "" },
    },
  });
  const commitSteps = (next: typeof langkah) => {
    setLangkah(next);
    getSteps({
      video: next.video,
      step: next.step.map((item) => ({
        description: item.description,
        image: item.image.file,
      })),
    });
  };

  const handleClickImage = () => {
    document.getElementById("langkah-image")?.click();
  };

  const addLangkah = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!inputLangkah.description) {
      alert("Mohon masukan deskripsi langkah!");
      return;
    }
    commitSteps({
      ...langkah,
      step: [...langkah.step, inputLangkah],
    });
    setInputLangkah({
      description: "",
      image: { file: null, url: "" },
    });
  };

  function updateLangkah(index: number | null, newValue: StepDraft) {
    if (index === null) return;
    if (index >= 0 && index < langkah.step?.length) {
      commitSteps({
        ...langkah,
        step: langkah.step.map((item, itemIndex) =>
          itemIndex === index ? newValue : item,
        ),
      });
    }
  }

  function deleteLangkah(index: number) {
    commitSteps({
      ...langkah,
      step: langkah.step.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  function alert(message: string) {
    setOpenAlert({ open: true, message: message });
  }

  return (
    <>
      <div>
        <InputForm
          label="Video (optional)"
          name="video-langkah"
          placeholder="Masukan video berupa link video youtube"
          onChange={(e) => commitSteps({ ...langkah, video: e.target.value })}
          value={langkah.video}
        />
      </div>
      <div>
        <h1>Tambahkan Langkah </h1>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row">
          <div className="">
            {inputLangkah.image.url ? (
              <img
                src={inputLangkah.image.url}
                alt="image recipe"
                className="aspect-square max-w-56 cursor-pointer rounded border bg-gray-100 object-cover"
                onClick={handleClickImage}
              />
            ) : (
              <div
                className="flex aspect-square w-56 cursor-pointer flex-col items-center justify-center gap-2 rounded border bg-gray-100 p-4 text-gray-400 select-none hover:border-4"
                onClick={handleClickImage}
              >
                <Icon
                  icon="majesticons:image-plus-line"
                  width={50}
                  className=""
                />
                <p className="text-center text-sm">
                  Tambahkan gambar yang menjelaskan langkah ini (optional)
                </p>
              </div>
            )}
            {inputLangkah.image.url && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setInputLangkah({
                    ...inputLangkah,
                    image: { file: null, url: "" },
                  });
                }}
                className="text-accent-1 mt-2 font-medium underline underline-offset-2 select-none"
              >
                Delete Image
              </button>
            )}

            <ImageForm
              id="langkah-image"
              name="langkah-image"
              onChange={(file, url) =>
                setInputLangkah({ ...inputLangkah, image: { file, url } })
              }
            />
          </div>
          <div className="flex w-full flex-col items-end gap-4">
            <TextAreaForm
              name="langkah"
              placeholder="Masukan deskripsi yang dilakukan pada langkah ini"
              value={inputLangkah.description}
              onChange={(e) =>
                setInputLangkah({
                  ...inputLangkah,
                  description: e.target.value,
                })
              }
            />
            <button
              className="bg-primary text-bg rounded px-3 py-2"
              onClick={addLangkah}
            >
              Tambahkan Langkah
            </button>
          </div>
        </div>
      </div>
      <hr />
      <h1 className="font-medium underline underline-offset-4">
        Langkah Langkah
      </h1>
      {
        <div className="flex flex-col gap-4">
          {langkah.step.length > 0 ? (
            langkah.step.map((step, i) => (
              <div
                key={i}
                className="flex w-full flex-col gap-4 rounded border border-gray-400 p-4 shadow"
              >
                <div className="flex gap-4 font-medium">
                  <h1>Langkah {i + 1}</h1>
                  <button
                    className="text-primary ml-auto underline underline-offset-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setModalEditLangkah(true);
                      setUpdatedLangkah({ index: i, langkah: step });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-accent-1 underline underline-offset-2"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteLangkah(i);
                    }}
                  >
                    Hapus
                  </button>
                </div>
                <hr />
                <div className="flex gap-4">
                  {step.image.url && (
                    <img
                      src={step.image.url}
                      className="aspect-square w-28 rounded bg-inherit object-cover"
                      alt="langkah"
                    />
                  )}
                  <h1>{step.description}</h1>
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-center text-gray-400">
              List langkah masih kosong
            </h1>
          )}
        </div>
      }
      <ModalAlert
        open={openAlert.open}
        message={openAlert.message}
        onYes={() => setOpenAlert({ open: false, message: "" })}
        close={(e) => setOpenAlert({ open: e, message: "" })}
      />
      {modalEditLangkah && (
        <ModalEditLangkah
          open
          langkah={updatedLangkah.langkah}
          onClose={setModalEditLangkah}
          onSave={(data) => updateLangkah(updatedLangkah.index, data)}
        />
      )}
    </>
  );
}

function FormTambahan({
  getCategory,
  selectedCategories,
}: {
  getCategory: (categories: string[]) => void;
  selectedCategories: string[];
}) {
  const { additionalInfo } = useAdditionalInfo();
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    getCategory(
      checked
        ? [...selectedCategories, name]
        : selectedCategories.filter((category) => category !== name),
    );
  };

  return (
    <>
      <h1 className="text-primary font-semibold underline underline-offset-4">
        Kategori
      </h1>
      <div>
        <h4>Tambahkan beberapa kategori agar resep anda mudah ditemukan</h4>
        <p className="text-sm text-gray-500">*Pilih setidaknya satu kategori</p>
        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {additionalInfo?.kategori.map((kat, i) => (
            <div key={kat._id ?? kat.title} className="flex items-center gap-2">
              <Checkbox
                id={`kat-${i}`}
                name={kat.title}
                checked={selectedCategories.includes(kat.title)}
                onChange={handleCheckboxChange}
              />
              <Label htmlFor={`kat-${i}`}>{kat.title}</Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ModalAlert({
  open,
  message,
  onYes,
  onCancel,
  close,
}: {
  open: boolean;
  message: string;
  onYes: () => void;
  onCancel?: () => void;
  close: (value: boolean) => void;
}) {
  return (
    <>
      {/* <Button onClick={() => setOpenModal(true)}>Toggle modal</Button> */}
      <Modal
        show={open}
        size="md"
        onClose={() => close(false)}
        popup
        className="bg-primary flex items-center"
        position="center"
      >
        <ModalHeader />
        <ModalBody>
          <div className="flex flex-col items-center gap-2 px-6 pt-4 pb-7">
            <Icon
              icon="line-md:alert-loop"
              className="text-accent-1"
              width={100}
            />
            <h3 className="text-primary mb-5 text-center text-lg font-normal">
              {message}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="bg-accent-1 text-bg rounded-md border px-4 py-2"
                onClick={onYes}
              >
                Oke
              </button>
              {onCancel && (
                <button
                  className="bg-bg text-primary rounded-md border border-gray-300 px-4 py-2"
                  onClick={onCancel}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}

function ModalEditBahan({
  open,
  onSave,
  bahan,
  onClose,
}: {
  open: boolean;
  onSave: (value: IngredientDraft) => void;
  bahan: IngredientDraft | null;
  onClose: (value: boolean) => void;
}) {
  const [inputBahan, setInputBahan] = useState<IngredientDraft>(
    () => bahan ?? { bahan: "", unit: "", jumlah: "0", jumlah_dec: "0" },
  );

  const handleInputBahan = (name: keyof IngredientDraft, value: string) => {
    setInputBahan((values) => ({ ...values, [name]: value }));
  };

  return (
    <>
      <Modal
        show={open}
        onClose={() => onClose(false)}
        className="bg-primary relative"
      >
        <div className="absolute top-1/2 left-1/2 w-full max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded bg-inherit">
          <ModalHeader className="mx-auto">Edit Bahan</ModalHeader>
          <ModalBody className="mx-auto flex h-fit flex-col items-end p-5">
            <div className="flex w-full flex-col items-end gap-2 md:flex-row">
              <div className="flex w-full items-end gap-2 md:w-fit">
                <InputForm
                  className={"w-full sm:w-24"}
                  type="number"
                  label="Jumlah"
                  name="bahan-jumlah"
                  placeholder="0"
                  value={
                    inputBahan.unit === "secukupnya"
                      ? ""
                      : inputBahan.jumlah || ""
                  }
                  onChange={(e) => handleInputBahan("jumlah", e.target.value)}
                  disabled={inputBahan.unit === "secukupnya"}
                />
                <DropdownForm
                  items={unitBahan.pecahan}
                  onChange={(i) => handleInputBahan("jumlah_dec", i)}
                  selected={
                    inputBahan.unit === "secukupnya"
                      ? "0"
                      : inputBahan.jumlah_dec
                  }
                  disabled={inputBahan.unit === "secukupnya"}
                />
                <DropdownForm
                  label="Unit"
                  items={unitBahan.unit}
                  onChange={(i) => handleInputBahan("unit", i)}
                  selected={inputBahan.unit}
                />
              </div>
              <InputForm
                className="ml-4 w-full"
                label="Bahan"
                value={inputBahan.bahan || ""}
                name="bahan-nama"
                placeholder={"Cth. Bawang Merah"}
                onChange={(e) => handleInputBahan("bahan", e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter className="z-40 flex justify-end gap-4 p-5">
            <button
              className="bg-bg text-primary rounded-md border border-gray-400 px-4 py-2"
              onClick={() => onClose(false)}
            >
              Batal
            </button>
            <button
              className="bg-accent-2 text-bg rounded-md border px-4 py-2"
              onClick={() => {
                onClose(false);
                onSave(inputBahan);
              }}
            >
              Simpan
            </button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}

function ModalEditLangkah({
  open,
  onSave,
  langkah,
  onClose,
}: {
  open: boolean;
  onSave: (value: StepDraft) => void;
  langkah: StepDraft;
  onClose: (value: boolean) => void;
}) {
  const [inputLangkah, setInputLangkah] = useState<StepDraft>(() => langkah);

  const handleClickImage = () => {
    document.getElementById("langkah-image-update")?.click();
  };
  return (
    <>
      <Modal
        show={open}
        onClose={() => onClose(false)}
        className="bg-primary bg-opacity-50 relative"
      >
        <div className="absolute top-1/2 left-1/2 w-full max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded bg-inherit">
          <ModalHeader className="mx-auto">Edit Langkah</ModalHeader>
          <ModalBody className="mx-auto flex h-fit flex-col items-end p-5">
            {/*  */}
            <div className="w-full">
              <div className="mt-2 flex flex-col gap-4 sm:flex-row">
                <div className="">
                  {inputLangkah.image?.url ? (
                    <img
                      src={inputLangkah.image.url}
                      alt="image recipe"
                      className="aspect-square max-w-40 cursor-pointer rounded border bg-gray-100 object-cover"
                      onClick={handleClickImage}
                    />
                  ) : (
                    <div
                      className="flex aspect-square w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded border bg-gray-100 p-2 text-gray-400 select-none hover:border-4"
                      onClick={handleClickImage}
                    >
                      <Icon
                        icon="majesticons:image-plus-line"
                        width={50}
                        className=""
                      />
                      <p className="text-center text-sm">
                        Tambahkan gambar yang menjelaskan langkah ini (optional)
                      </p>
                    </div>
                  )}
                  {inputLangkah.image?.url && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setInputLangkah({
                          ...inputLangkah,
                          image: { file: null, url: "" },
                        });
                      }}
                      className="text-accent-1 mt-2 font-medium underline underline-offset-2 select-none"
                    >
                      Delete Image
                    </button>
                  )}

                  <ImageForm
                    id="langkah-image-update"
                    name="langkah-image"
                    onChange={(file, url) =>
                      file && url
                        ? setInputLangkah({
                            ...inputLangkah,
                            image: { file, url },
                          })
                        : ""
                    }
                  />
                </div>
                <div className="flex w-full flex-col items-end gap-4">
                  <TextAreaForm
                    name="langkah"
                    placeholder="Masukan deskripsi yang dilakukan pada langkah ini"
                    value={inputLangkah?.description}
                    onChange={(e) =>
                      setInputLangkah({
                        ...inputLangkah,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/*  */}
          </ModalBody>
          <ModalFooter className="z-40 flex justify-end gap-4 p-5">
            <button
              className="bg-bg text-primary rounded-md border border-gray-400 px-4 py-2"
              onClick={() => onClose(false)}
            >
              Batal
            </button>
            <button
              className="bg-accent-2 text-bg rounded-md border px-4 py-2"
              onClick={() => {
                onClose(false);
                onSave(inputLangkah);
              }}
            >
              Simpan
            </button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}

function minsToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return {
    jam: hours,
    menit: remainingMinutes,
  };
}

function parseBahan(bahan: string[]): IngredientDraft[] {
  return bahan.map((item) => {
    const regex =
      /^(\d+\/\d+|\d+\s\d+\/\d+|\d+|\d+\/\d+)?\s*(secukupnya|[a-zA-Z]+)\s+(.*)$/;
    const match = item.match(regex);

    if (!match) {
      return {
        jumlah: "0",
        jumlah_dec: "0",
        unit: "secukupnya",
        bahan: item.trim(),
      };
    }

    let jumlah = match[1] || "0";
    let jumlah_dec = "0";

    if (jumlah.includes(" ")) {
      const parts = jumlah.split(" ");
      jumlah = parts[0];
      jumlah_dec = parts[1];
    } else if (jumlah.includes("/")) {
      jumlah_dec = jumlah;
      jumlah = "0";
    }

    const unit = match[2].trim();
    const bahan = match[3].trim();

    return {
      jumlah: jumlah,
      jumlah_dec: jumlah_dec,
      unit: unit,
      bahan: bahan,
    };
  });
}
