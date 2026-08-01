import { useState, type MouseEvent } from "react";
import { Icon } from "@iconify/react";
import BlankProfile from "../../assets/blank_profile.webp";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";

export interface CardProps {
  id?: string;
  image?: string;
  time?: string | number;
  likes?: number | string;
  title?: string;
  creatorImage?: string;
  creatorName?: string;
  editor?: boolean;
  deletable?: boolean;
  isLoad?: boolean;
  onClick?: () => void;
  reload?: (value: boolean) => void;
}

export default function Card(props: CardProps) {
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
  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (props.id) navigate(`/recipe/edit/${props.id}`);
  };
  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAlertDelete(true);
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
            alt={props.title ? `Resep ${props.title}` : "Foto resep"}
            loading="lazy"
            decoding="async"
            className="absolute -z-10 aspect-square w-full rounded-lg object-cover transition duration-300 ease-in-out group-hover:scale-105"
          />

          {/* time cook */}
          <div className="bg-accent-2 text-bg absolute top-3 left-3 flex w-fit items-center gap-1 rounded-full px-2 py-1 shadow-md">
            <Icon className="text-sm" icon="mingcute:time-line" />
            <p className="text-xs">{formatMinute(Number(props.time) || 0)}</p>
          </div>

          {/* Edit */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {props.editor === true && (
              <div>
                <button
                  type="button"
                  aria-label={`Edit resep ${props.title ?? ""}`.trim()}
                  className="bg-bg text-primary flex aspect-square w-9 items-center justify-center rounded-full p-1 shadow-md transition-none hover:bg-gray-200 lg:w-10"
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
            {props.deletable === true && (
              <div>
                <button
                  type="button"
                  aria-label={`Hapus resep ${props.title ?? ""}`.trim()}
                  className="bg-accent-1 text-bg flex aspect-square w-9 items-center justify-center rounded-full p-1 shadow-md transition-opacity duration-200 group-hover:visible group-hover:opacity-100 hover:bg-red-500 lg:invisible lg:w-10 lg:opacity-0"
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
          <div className="bg-bg text-primary absolute right-3 bottom-3 flex w-fit items-center gap-1 rounded-full px-2 py-1 shadow-lg">
            <Icon icon="icon-park-outline:like" />
            <p className="text-sm font-medium">{props.likes}</p>
          </div>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          {/* recipe title */}
          <h3 className="line-clamp-2 max-w-[255px] leading-tight font-medium md:font-semibold">
            {props.title}
          </h3>

          {/* creator */}
          <div className="flex items-center gap-2">
            <img
              className="aspect-square w-8 rounded-full object-cover"
              src={props.creatorImage || BlankProfile}
              alt="Creator Image"
            />
            <p className="text-accent-1/80 line-clamp-1 md:font-medium">
              {props.creatorName || "Creator"}
            </p>
          </div>
        </div>
      </div>
      <ModalAlert
        open={alertDelete}
        message={`Yakin ingin menghapus "${props.title}"`}
        onCancel={() => setAlertDelete(false)}
        close={(val) => setAlertDelete(val)}
        recipeId={props.id}
        reload={(val) => props.reload?.(val)}
      />
    </>
  );
}

interface ModalAlertProps {
  open: boolean;
  message: string;
  recipeId?: string;
  onCancel?: () => void;
  close: (value: boolean) => void;
  reload: (value: boolean) => void;
}

function ModalAlert({
  open,
  message,
  recipeId,
  onCancel,
  close,
  reload,
}: ModalAlertProps) {
  const [loading, setLoading] = useState(false);

  const deleteRecipe = async () => {
    close(false);
    try {
      setLoading(true);
      await api.delete(`/recipes/${recipeId}`);
      toast.success("Resep berhasil dihapus");
      reload(true);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus resep");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="bg-primary/50 fixed top-1/2 left-1/2 z-50 flex h-svh w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="bg-bg flex h-40 w-40 flex-col items-center justify-center gap-2 rounded font-medium">
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
                onClick={() => deleteRecipe()}
              >
                Oke
              </button>
              {onCancel && (
                <button
                  className="bg-bg text-primary rounded-md border border-gray-300 px-4 py-2"
                  onClick={() => close(false)}
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
