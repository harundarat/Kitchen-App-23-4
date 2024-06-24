import React, { useState } from "react";
import { Icon } from "@iconify/react";
import BlankProfile from "../../assets/blank_profile.webp";
import { useNavigate } from "react-router-dom";
import { Modal } from "flowbite-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Card(props) {
  const navigate = useNavigate();
  const [alertDelete, setAlertDelete] = useState(false);

  const handleClick = () => {
    if (props.id) {
      navigate(`/recipe/${props.id}`);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/recipe/edit/${props.id}`);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    setAlertDelete(true);
    // console.log("DELETE : ", props.id);
  };

  if (props.isLoad) {
    return (
      <div className="flex aspect-[9/10] w-full max-w-[255px] animate-pulse flex-col gap-2 overflow-hidden rounded-lg">
        <div className="h-[75%] w-full rounded-lg bg-gray-300"></div>
        <div className="h-[6%] w-full rounded-lg bg-gray-300"></div>
        <div className="flex items-center gap-3">
          <div className="aspect-square w-[15%] rounded-full bg-gray-300"></div>
          <div className="h-[35%] w-[50%] rounded-full bg-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="group w-full max-w-[255px] cursor-pointer select-none"
        onClick={props.onClick || handleClick}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          {/* image recipe */}
          <img
            src={props.image}
            alt="Recipe Image"
            className="absolute -z-10 aspect-square w-full rounded-lg object-cover transition duration-300 ease-in-out group-hover:scale-105"
          />

          {/* time cook */}
          <div className="absolute left-3 top-3 flex w-fit items-center gap-1 rounded-full bg-accent-2 px-2 py-1 text-bg shadow-md">
            <Icon className="text-sm" icon="mingcute:time-line" />
            <p className="text-xs">{formatMinute(parseInt(props.time))}</p>
          </div>

          {/* Edit */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            {props.editor === true && (
              <div>
                <button
                  className="flex aspect-square w-9 items-center justify-center rounded-full bg-bg p-1 text-primary shadow-md transition-none hover:bg-gray-200 lg:w-10"
                  onClick={(e) => handleEditClick(e)}
                >
                  <Icon
                    className="text-lg"
                    icon="material-symbols:edit-outline"
                  />
                </button>
              </div>
            )}
            {/* delete */}
            {props.delete === true && (
              <div>
                <button
                  className="flex aspect-square w-9 items-center justify-center rounded-full bg-accent-1 p-1 text-bg shadow-md transition-opacity duration-200 lg:invisible hover:bg-red-500 group-hover:visible group-hover:opacity-100 lg:w-10 lg:opacity-0"
                  onClick={(e) => handleDelete(e)}
                >
                  <Icon
                    className="text-lg"
                    icon="material-symbols:delete-outline"
                  />
                </button>
              </div>
            )}
          </div>

          {/* likes */}
          <div className="absolute bottom-3 right-3 flex w-fit items-center gap-1 rounded-full bg-bg px-2 py-1 text-primary shadow-lg">
            <Icon icon="icon-park-outline:like" />
            <p className="text-sm font-medium">{props.likes}</p>
          </div>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          {/* tittle recipe */}
          <h3 className="line-clamp-2 max-w-[255px] font-medium leading-tight md:font-semibold">
            {props.tittle}
          </h3>

          {/* creator */}
          <div className="flex items-center gap-2">
            <img
              className="aspect-square w-8 rounded-full object-cover"
              src={props.creatorImage || BlankProfile}
              alt="Creator Image"
            />
            <p className="line-clamp-1 text-accent-1 text-opacity-80 md:font-medium">
              {props.creatorName || "Creator"}
            </p>
          </div>
        </div>
      </div>
      <ModalAlert
        open={alertDelete}
        message={`Yakin ingin menghapus "${props.tittle}"`}
        onCancel={() => setAlertDelete(false)}
        close={(val) => setAlertDelete(val)}
        recipeId={props.id}
        reload={(val) => props.reload?.(val)}
      />
    </>
  );
}

function ModalAlert({ open, message, recipeId, onCancel, close, reload }) {
  const [loading, setLoading] = useState(false);

  const deleteRecipe = async () => {
    close(false);
    setLoading(true);
    try {
      setLoading(true);
      const response = await axios.delete(`/recipes/${recipeId}`);
      if (response.status === 204) {
        toast.success("Resep berhasil dihapus");
        reload(true);
        return;
      }
      toast.error("Gagal menghapus resep");
      console.log(response);
    } catch (error) {
      console.error(error);
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
                onClick={() => deleteRecipe()}
              >
                Oke
              </button>
              {onCancel && (
                <button
                  className="rounded-md border border-gray-300 bg-bg px-4 py-2 text-primary"
                  onClick={() => close(false)}
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
