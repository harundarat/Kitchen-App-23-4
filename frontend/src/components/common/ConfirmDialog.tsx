import { Icon } from "@iconify/react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal show={open} size="md" popup dismissible={!loading} onClose={onClose}>
      <ModalHeader />
      <ModalBody>
        <div className="flex flex-col items-center gap-3 px-3 pt-2 text-center">
          <Icon
            icon="line-md:alert-loop"
            className="text-accent-1"
            width={72}
          />
          <h2 className="text-primary text-xl font-semibold">{title}</h2>
          <p className="text-primary/70 text-sm leading-6">{description}</p>
        </div>
      </ModalBody>
      <ModalFooter className="justify-center gap-3 border-t-0 pt-0">
        <button
          type="button"
          className="border-primary text-primary hover:bg-primary/5 rounded-full border px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className="bg-accent-1 text-bg hover:bg-accent-1/90 rounded-full px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Menghapus..." : confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
}
