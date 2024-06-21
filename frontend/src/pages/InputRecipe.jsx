import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { Icon } from "@iconify/react";
import { Button, Modal, Label, Checkbox } from "flowbite-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AdditionalInfoContext,
  AdditionalInfoProvider,
} from "../context/additionalInfoContext";

import InputForm from "../components/common/InputForm";
import TextAreaForm from "../components/common/TextAreaForm";
import DropdownForm from "../components/common/DropdownForm";
import ImageForm from "../components/common/ImageForm";
import axios from "axios";
import toast from "react-hot-toast";

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

export default function InputRecipe() {
  const navigate = useNavigate();
  const { isLogged } = useContext(UserContext);
  console.log("🚀 ~ InputRecipe ~ isLogged:", isLogged);
  const [tabActive, setTabActive] = useState(0);
  useEffect(() => {
    if (isLogged == false) {
      navigate(-1, { replace: true });
    }
  }, [isLogged]);

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

function Header({ tabActive, changeActiveTab }) {
  return (
    <header className="mx-auto grid h-fit w-full max-w-[1080px] select-none grid-cols-2 gap-x-2 gap-y-5 pt-5 sm:h-16 sm:grid-cols-4 sm:gap-y-0 sm:border-b sm:pt-0">
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 0 ? "border-b-2 border-accent-2" : ""}`}
        onClick={() => changeActiveTab(0)}
      >
        <h1>Dasar</h1>
      </div>
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 1 ? "border-b-2 border-accent-2" : ""}`}
        onClick={() => changeActiveTab(1)}
      >
        <h1>Bahan</h1>
      </div>
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 2 ? "border-b-2 border-accent-2" : ""}`}
        onClick={() => changeActiveTab(2)}
      >
        <h1>Langkah</h1>
      </div>
      <div
        className={`box-border flex cursor-pointer items-end justify-center border-b pb-4 hover:border-b-2 ${tabActive >= 3 ? "border-b-2 border-accent-2" : ""}`}
        onClick={() => changeActiveTab(3)}
      >
        <h1>Tambahan</h1>
      </div>
    </header>
  );
}

function FormRecipe({ activeTab, changeActiveTab }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState({
    input: {
      open: false,
      message: "",
    },
    cancel: false,
    delete: false,
  });
  const [formData, setFormData] = useState({});
  // console.log(formData);
  const [selectedImage, setSelectedImage] = useState({ file: null, url: null });
  const [waktu, setWaktu] = useState({ jam: 0, menit: 0 });

  // STATE BAHAN
  const [modalEditBahan, setModalEditBahan] = useState(false);
  const [inputBahan, setInputBahan] = useState({
    bahan: "",
    unit: "",
    jumlah: "0",
    jumlah_dec: "0",
  });
  const [listBahan, setListBahan] = useState([]);
  const [updatedBahan, setUpdatedBahan] = useState({ index: null, bahan: {} });
  // END STATE BAHAN

  useEffect(() => {
    let bahanString = listBahan.map((bahan) => {
      return bahanToString(bahan);
    });
    handleChange("ingredients", bahanString);
  }, [listBahan]);

  const handleChange = (name, value) => {
    setFormData((values) => ({ ...values, [name]: value }));
  };

  const handleImage = (file, url) => {
    setSelectedImage({ file, url });
    handleChange("image", file);
  };

  const handleWaktu = (j, m) => {
    let minute = parseInt(j) * 60 + parseInt(m);
    handleChange("time", minute);
  };

  // HANDLING BAHAN
  const handleClickImage = () => {
    document.getElementById("recipe-image").click();
  };
  const handleInputBahan = (name, value) => {
    setInputBahan((values) => ({ ...values, [name]: value }));
  };
  const alertInput = (message) => {
    setOpenAlert({
      input: {
        open: true,
        message: message,
      },
    });
  };
  const addListBahan = (e) => {
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
      if (inputBahan.jumlah <= 0 && inputBahan.jumlah_dec == "0") {
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
  const bahanToString = (objBahan) => {
    const bahan = `${!parseInt(objBahan.jumlah) ? "" : objBahan.jumlah} ${!parseInt(objBahan.jumlah_dec) ? "" : objBahan.jumlah_dec} ${objBahan.unit} ${objBahan.bahan}`;
    const bahanClear = bahan.replaceAll("  ", " ");
    return bahanClear;
  };
  function updateBahan(index, newValue) {
    if (index >= 0 && index < listBahan.length) {
      listBahan.splice(index, 1, newValue);
      let bahanString = listBahan.map((bahan) => {
        return bahanToString(bahan);
      });
      handleChange("ingredients", bahanString);
    } else {
      console.log("Index out of bounds");
    }
  }
  function deleteBahan(index) {
    let bahan = listBahan;
    if (index >= 0 && index < bahan.length) {
      let removedItem = bahan.splice(index, 1);
      setListBahan([...bahan]);
    } else {
      console.log("Index out of bounds");
    }
  }
  // END HANDLING BAHAN

  const handlingSimpan = async () => {
    if (!formData.title) {
      alertInput("Nama Resep belum terisi!");
      return;
    }
    if (!formData.image) {
      alertInput("Foto Resep belum terisi!");
      return;
    }
    if (!formData.description) {
      alertInput("Deskripsi Resep belum terisi!");
      return;
    }
    if (!formData.time || formData.time === 0) {
      alertInput("Waktu Memasak belum terisi!");
      return;
    }
    if (formData.ingredients?.length === 0) {
      alertInput("Bahan-bahan masih kosong!");
      return;
    }
    if (formData.steps?.step?.length === 0) {
      alertInput("Langkah-langkah masih kosong!");
      return;
    }
    if (formData.category?.length === 0) {
      alertInput("Pilih kategori setidaknya satu!");
      return;
    }
    const data = new FormData();
    data.append("title", formData.title);
    data.append("image", formData.image);
    data.append("description", formData.description);
    data.append("total_time", formData.time);
    formData.ingredients?.map((item) => {
      data.append("ingredients", item);
    });
    data.append("video", formData.steps.video);
    formData.steps.step.forEach((step, index) => {
      data.append(`stepDescription`, step.description);
      data.append(`stepImages`, step.image || "");
    });
    formData.category?.map((item) => {
      data.append("category", item);
    });
    console.log(formData);
    // return;

    try {
      setLoading(true);
      const response = await axios.post("/recipes", data);
      console.log(response);
      if (response.status == 200) {
        navigate(-1, { replace: true });
        toast.success("Resep berhasil diunggah");
      }
    } catch (error) {
      console.log("🚀 ~ handlingSimpan ~ error:", error);
      setOpenAlert({
        input: {
          open: true,
          message: "Error Upload data, try again later",
        },
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed left-1/2 top-1/2 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary bg-opacity-50">
          <div className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded bg-bg font-medium">
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
                  className="flex aspect-square max-w-56 cursor-pointer select-none flex-col items-center justify-center gap-2 rounded border bg-gray-100 p-4 text-gray-400 hover:border-4"
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
                  className="w-fit cursor-pointer select-none font-semibold text-primary underline"
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
            />
            <DropdownForm
              items={time.menit}
              onChange={(time) => {
                setWaktu((values) => ({ ...values, menit: parseInt(time) }));
                handleWaktu(waktu.jam, time);
              }}
              postfix="Menit"
            />
          </div>
          <p className="text-sm italic text-gray-500">*Required</p>
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
                    inputBahan.unit == "secukupnya"
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
              className="rounded bg-primary px-3 py-2 text-bg transition-all hover:bg-opacity-90 active:scale-95"
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
                  <h1>{bahanToString(bahan)}</h1>
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
          <FormLangkah getSteps={(data) => handleChange("steps", data)} />
        </div>
        {/* END TAB LANGKAH */}

        {/* TAB TAMBAHAN */}
        <div
          id="tambahan"
          className={`flex flex-col gap-7 ${activeTab !== 3 ? "hidden" : ""}`}
        >
          <AdditionalInfoProvider>
            <FormTambahan
              getCategory={(data) => handleChange("category", data)}
            />
          </AdditionalInfoProvider>
        </div>
        {/* END TAB TAMBAHAN */}
      </form>

      {/* BUTTON FOOT */}
      <hr className="mx-auto mt-8 max-w-[720px]" />
      <div className="mx-auto mt-6 flex max-w-[720px] justify-between">
        <button
          className="rounded border bg-gray-300 px-3 py-2 text-bg transition-all hover:bg-slate-400"
          onClick={() => setOpenAlert({ ...openAlert, cancel: true })}
        >
          Batal
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => changeActiveTab(activeTab - 1)}
            className={`rounded border border-primary bg-bg px-3 py-2 text-primary transition-all hover:border-slate-400 hover:bg-slate-400 hover:text-bg ${activeTab === 0 ? "hidden" : ""}`}
          >
            Sebelumnya
          </button>
          <button
            onClick={() => changeActiveTab(activeTab + 1)}
            className={`rounded border bg-primary px-3 py-2 text-bg transition-all hover:bg-slate-400 ${activeTab === 3 ? "hidden" : ""}`}
          >
            Selanjutnya
          </button>
          <button
            className={`rounded border bg-accent-2 px-7 py-2 text-bg transition-all hover:bg-opacity-85 ${activeTab != 3 ? "hidden" : ""}`}
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
          navigate(-1, { replace: true });
        }}
        onCancel={() => setOpenAlert({ ...openAlert, cancel: false })}
        open={openAlert.cancel}
        close={(e) => setOpenAlert({ ...openAlert, cancel: e })}
      />
      <ModalAlert
        message={openAlert.input.message}
        onYes={() => setOpenAlert({ ...openAlert, input: { open: false } })}
        open={openAlert.input.open}
        close={(e) => setOpenAlert({ ...openAlert, input: { open: e } })}
      />
      <ModalEditBahan
        open={modalEditBahan}
        onCancel={() => setModalEditBahan(false)}
        bahan={updatedBahan.bahan}
        onClose={(e) => setModalEditBahan(e)}
        onSave={(data) => updateBahan(updatedBahan.index, data)}
      />
    </>
  );
}

function FormLangkah({ getSteps }) {
  const [openAlert, setOpenAlert] = useState({ open: false, message: "" });
  const [modalEditLangkah, setModalEditLangkah] = useState(false);
  const [langkah, setLangkah] = useState({
    video: "",
    step: [],
  });

  const [inputLangkah, setInputLangkah] = useState({
    description: "",
    image: { file: null, url: "" },
  });
  const [updatedLangkah, setUpdatedLangkah] = useState({
    index: null,
    langkah: {
      description: "",
      image: { file: null, url: "" },
    },
  });
  useEffect(() => {
    const removedUrl = langkah.step.map((item) => ({
      ...item,
      image: item.image.file,
    }));

    if (getSteps) getSteps({ video: langkah.video, step: removedUrl });
  }, [langkah]);

  const handleClickImage = () => {
    document.getElementById("langkah-image").click();
  };

  const addLangkah = (e) => {
    e.preventDefault();
    if (!inputLangkah.description) {
      alert("Mohon masukan deskripsi langkah!");
      return;
    }
    setLangkah({
      ...langkah,
      step: [...langkah.step, inputLangkah],
    });
    setInputLangkah({
      description: "",
      image: { file: null, url: "" },
    });
  };

  function updateLangkah(index, newValue) {
    if (index >= 0 && index < langkah.step?.length) {
      langkah.step.splice(index, 1, newValue);
      const removedUrl = langkah.step.map((item) => ({
        ...item,
        image: item.image.file,
      }));

      if (getSteps) getSteps({ video: langkah.video, step: removedUrl });
    } else {
      console.log("Index out of bounds");
    }
  }

  function deleteLangkah(index) {
    let step = langkah.step;
    if (index >= 0 && index < step.length) {
      let removedItem = step.splice(index, 1);
      setLangkah({ ...langkah, step: [...step] });
    } else {
      console.log("Index out of bounds");
    }
  }

  function alert(message) {
    setOpenAlert({ open: true, message: message });
  }

  return (
    <>
      <div>
        <InputForm
          label="Video (optional)"
          name="video-langkah"
          placeholder="Masukan video berupa link video youtube"
          onChange={(e) => setLangkah({ ...langkah, video: e.target.value })}
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
                className="flex aspect-square w-56 cursor-pointer select-none flex-col items-center justify-center gap-2 rounded border bg-gray-100 p-4 text-gray-400 hover:border-4"
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
                className="mt-2 select-none font-medium text-accent-1 underline underline-offset-2"
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
              className="rounded bg-primary px-3 py-2 text-bg"
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
                    className="ml-auto text-primary underline underline-offset-2"
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
      <ModalEditLangkah
        open={modalEditLangkah}
        langkah={updatedLangkah.langkah}
        onClose={(e) => setModalEditLangkah(e)}
        onSave={(data) => updateLangkah(updatedLangkah.index, data)}
      />
    </>
  );
}

function FormTambahan({ getCategory }) {
  const { additionalInfo } = useContext(AdditionalInfoContext);
  const [checkedCategories, setCheckedCategories] = useState(
    additionalInfo?.kategori?.reduce((acc, category) => {
      acc[category.title] = false;
      return acc;
    }, {}),
  );
  useEffect(() => {
    if (getCategory) getCategory(getCheckedCategories());
  }, [checkedCategories]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedCategories((prevCheckedCategories) => ({
      ...prevCheckedCategories,
      [name]: checked,
    }));
  };

  const getCheckedCategories = () => {
    if (!checkedCategories) return [];
    return Object.keys(checkedCategories).filter(
      (category) => checkedCategories[category],
    );
  };

  return (
    <>
      <h1 className="font-semibold text-primary underline underline-offset-4">
        Kategori
      </h1>
      <div>
        <h4>Tambahkan beberapa kategori agar resep anda mudah ditemukan</h4>
        <p className="text-sm text-gray-500">*Pilih setidaknya satu kategori</p>
        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {additionalInfo?.kategori.map((kat, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                id={`kat-${i}`}
                name={kat.title}
                checked={
                  checkedCategories ? checkedCategories[kat.title] : false
                }
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

function ModalAlert({ open, message, onYes, onCancel, close }) {
  const [openModal, setOpenModal] = useState(open);

  return (
    <>
      {/* <Button onClick={() => setOpenModal(true)}>Toggle modal</Button> */}
      <Modal
        show={open}
        size="md"
        onClose={() => close(false)}
        popup
        className="flex items-center bg-primary"
        position="center"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="flex flex-col items-center gap-2 px-6 pb-7 pt-4">
            <Icon
              icon="line-md:alert-loop"
              className="text-accent-1"
              width={100}
            />
            <h3 className="mb-5 text-center text-lg font-normal text-primary">
              {message}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="rounded-md border bg-accent-1 px-4 py-2 text-bg"
                onClick={onYes}
              >
                Oke
              </button>
              {onCancel && (
                <button
                  className="rounded-md border border-gray-300 bg-bg px-4 py-2 text-primary"
                  onClick={onCancel}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

function ModalEditBahan({ open, onSave, bahan, onClose }) {
  const [inputBahan, setInputBahan] = useState({
    bahan: "",
    unit: "",
    jumlah: "0",
    jumlah_dec: "0",
  });

  useEffect(() => {
    if (bahan) {
      setInputBahan(bahan);
    }
  }, [bahan]);

  const handleInputBahan = (name, value) => {
    setInputBahan((values) => ({ ...values, [name]: value }));
  };

  return (
    <>
      <Modal
        show={open}
        onClose={() => onClose(false)}
        className="relative bg-primary"
      >
        <div className="absolute left-1/2 top-1/2 w-full max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded bg-inherit">
          <Modal.Header className="mx-auto">Edit Bahan</Modal.Header>
          <Modal.Body className="mx-auto flex h-fit flex-col items-end p-5">
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
                    inputBahan.unit == "secukupnya"
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
          </Modal.Body>
          <Modal.Footer className="z-40 flex justify-end gap-4 p-5">
            <button
              className="rounded-md border border-gray-400 bg-bg px-4 py-2 text-primary"
              onClick={() => onClose(false)}
            >
              Batal
            </button>
            <button
              className="rounded-md border bg-accent-2 px-4 py-2 text-bg"
              onClick={() => {
                onClose(false);
                onSave(inputBahan);
              }}
            >
              Simpan
            </button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
}

function ModalEditLangkah({ open, onSave, langkah, onClose }) {
  // console.log(langkah);
  const [inputLangkah, setInputLangkah] = useState({
    description: "",
    image: { file: null, url: "" },
  });
  useEffect(() => {
    if (langkah) {
      setInputLangkah(langkah);
    }
  }, [langkah]);

  const handleClickImage = () => {
    document.getElementById("langkah-image-update").click();
  };
  return (
    <>
      <Modal
        show={open}
        onClose={() => onClose(false)}
        className="relative bg-primary bg-opacity-50"
      >
        <div className="absolute left-1/2 top-1/2 w-full max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded bg-inherit">
          <Modal.Header className="mx-auto">Edit Langkah</Modal.Header>
          <Modal.Body className="mx-auto flex h-fit flex-col items-end p-5">
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
                      className="flex aspect-square w-40 cursor-pointer select-none flex-col items-center justify-center gap-2 rounded border bg-gray-100 p-2 text-gray-400 hover:border-4"
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
                      className="mt-2 select-none font-medium text-accent-1 underline underline-offset-2"
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
          </Modal.Body>
          <Modal.Footer className="z-40 flex justify-end gap-4 p-5">
            <button
              className="rounded-md border border-gray-400 bg-bg px-4 py-2 text-primary"
              onClick={() => onClose(false)}
            >
              Batal
            </button>
            <button
              className="rounded-md border bg-accent-2 px-4 py-2 text-bg"
              onClick={() => {
                onClose(false);
                onSave(inputLangkah);
              }}
            >
              Simpan
            </button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
}
