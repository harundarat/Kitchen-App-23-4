import { Icon } from "@iconify/react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BlankProfile from "../../assets/blank_profile.webp";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import InputForm from "../../components/common/InputForm";
import RoundedButton from "../../components/common/RoundedButton";
import { ApiError, getErrorMessage } from "../../services/api";
import { adminService } from "../../services/admin";
import type { AdminManagedUser, AdminUserUpdateInput } from "../../types/api";
import { isValidObjectId } from "../../utils/validation";
import {
  getAdminUserLoadErrorMessage,
  getAdminUserUpdateErrorMessage,
} from "./adminUserMessages";

const emptyForm: Required<AdminUserUpdateInput> = {
  username: "",
  fullName: "",
  email: "",
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminManagedUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!isValidObjectId(id)) {
      setError(new ApiError(400, "ID pengguna tidak valid"));
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const nextUser = await adminService.getUser(id, controller.signal);
        if (controller.signal.aborted) return;
        setUser(nextUser);
        setForm({
          username: nextUser.username,
          fullName: nextUser.fullName,
          email: nextUser.email,
        });
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return;
        setError(loadError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadUser();
    return () => controller.abort();
  }, [id, retryKey]);

  const changeField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const cancelEdit = () => {
    if (user) {
      setForm({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
      });
    }
    setEditing(false);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !user) return;
    try {
      setSaving(true);
      const response = await adminService.updateUser(id, form);
      setUser(response.user);
      setForm({
        username: response.user.username,
        fullName: response.user.fullName,
        email: response.user.email,
      });
      setEditing(false);
      toast.success("Data pengguna diperbarui");
    } catch (saveError) {
      toast.error(getAdminUserUpdateErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await adminService.deleteUser(id);
      toast.success("Pengguna dan data terkait berhasil dihapus");
      navigate("/admin/users", { replace: true });
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, "Gagal menghapus pengguna"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (error || !user) {
    return (
      <DetailError
        error={error}
        onRetry={() => setRetryKey((value) => value + 1)}
      />
    );
  }

  return (
    <section className="mx-auto max-w-[720px]">
      <button
        type="button"
        className="text-primary mb-5 inline-flex items-center gap-2 font-medium hover:underline"
        onClick={() => navigate("/admin/users")}
      >
        <Icon icon="solar:arrow-left-linear" width={20} /> Kembali ke pengguna
      </button>
      <div className="border-primary/10 bg-bg rounded-xl border p-5 shadow-sm sm:p-7">
        <div className="mb-7 flex items-center gap-4">
          <img
            src={user.image || BlankProfile}
            alt=""
            className="border-primary/10 h-16 w-16 rounded-full border object-cover"
          />
          <div>
            <h1 className="text-primary text-2xl font-bold">{user.fullName}</h1>
            <p className="text-primary/65">@{user.username}</p>
          </div>
        </div>

        {editing ? (
          <form className="space-y-5" onSubmit={save}>
            <InputForm
              name="username"
              label="Username"
              value={form.username}
              onChange={changeField}
              required
            />
            <InputForm
              name="fullName"
              label="Nama lengkap"
              value={form.fullName}
              onChange={changeField}
              required
            />
            <InputForm
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={changeField}
              required
            />
            <div className="flex flex-wrap gap-3 pt-2">
              <RoundedButton
                type="submit"
                name={saving ? "Menyimpan..." : "Simpan perubahan"}
                disabled={saving}
              />
              <RoundedButton
                name="Batal"
                btnStroke
                onClick={cancelEdit}
                disabled={saving}
              />
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <DetailRow label="Username" value={`@${user.username}`} />
            <DetailRow label="Nama lengkap" value={user.fullName} />
            <DetailRow label="Email" value={user.email} />
            <div className="border-primary/10 flex flex-wrap gap-3 border-t pt-5">
              <RoundedButton
                name="Edit pengguna"
                onClick={() => setEditing(true)}
              />
              <button
                type="button"
                className="text-accent-1 border-accent-1/30 hover:bg-accent-1 hover:text-bg rounded-full border px-4 py-1 font-medium"
                onClick={() => setConfirmDelete(true)}
              >
                Hapus pengguna
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus pengguna?"
        description={`Tindakan ini akan menghapus akun ${user.username}, resep yang dibuat, informasi gizi, suka, simpanan, dan laporan terkait. Tindakan ini tidak dapat dibatalkan.`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void deleteUser()}
        loading={deleting}
      />
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-primary/60 text-sm">{label}</p>
      <p className="text-primary mt-1 font-medium">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="border-primary/10 bg-bg mx-auto max-w-[720px] animate-pulse rounded-xl border p-7 shadow-sm">
      <div className="bg-primary/10 h-16 w-16 rounded-full" />
      <div className="mt-7 space-y-5">
        {[0, 1, 2].map((index) => (
          <div key={index} className="bg-primary/10 h-12 rounded" />
        ))}
      </div>
    </div>
  );
}

function DetailError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const status = error instanceof ApiError ? error.status : undefined;
  const message = getAdminUserLoadErrorMessage(error);
  return (
    <div className="border-accent-1/25 bg-accent-1/5 mx-auto max-w-[720px] rounded-xl border p-7 text-center">
      <p className="text-primary">{message}</p>
      {status !== 400 && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary text-bg mt-4 rounded-full px-4 py-2 font-medium"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
