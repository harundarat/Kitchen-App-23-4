import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getErrorMessage } from "../../services/api";
import { adminService } from "../../services/admin";
import type { AdminManagedUser } from "../../types/api";
import { getAdminUserLoadErrorMessage } from "./adminUserMessages";

function userMatchesSearch(user: AdminManagedUser, search: string): boolean {
  const value = search.trim().toLocaleLowerCase();
  if (!value) return true;
  return (
    user.username.toLocaleLowerCase().includes(value) ||
    user.fullName.toLocaleLowerCase().includes(value)
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<AdminManagedUser | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsers(await adminService.getUsers(controller.signal));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return;
        setError(loadError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadUsers();
    return () => controller.abort();
  }, [retryKey]);

  const filteredUsers = useMemo(
    () => users.filter((user) => userMatchesSearch(user, search)),
    [search, users],
  );

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);

  const deleteUser = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteUser(pendingDelete._id);
      setUsers((current) =>
        current.filter((user) => user._id !== pendingDelete._id),
      );
      toast.success("Pengguna dan data terkait berhasil dihapus");
      setPendingDelete(null);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, "Gagal menghapus pengguna"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-primary text-2xl font-bold">Pengguna</h1>
          <p className="text-primary/65 mt-1">
            Kelola akun pengguna KitchenCraft.
          </p>
        </div>
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Cari pengguna</span>
          <Icon
            icon="ri:search-line"
            className="text-primary/50 absolute top-1/2 left-3 -translate-y-1/2"
            width={20}
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari username atau nama"
            className="bg-bg focus:border-primary focus:ring-primary border-primary/20 text-primary w-full rounded-full border py-2 pr-4 pl-10"
          />
        </label>
      </div>

      {loading ? (
        <UserTableSkeleton />
      ) : error ? (
        <LoadError error={error} onRetry={retry} />
      ) : users.length === 0 ? (
        <EmptyState title="Belum ada pengguna" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="Pengguna tidak ditemukan" />
      ) : (
        <div className="border-primary/10 bg-bg overflow-x-auto rounded-xl border shadow-sm">
          <Table hoverable>
            <UserTableHead />
            <TableBody className="divide-primary/10 divide-y">
              {filteredUsers.map((user) => (
                <TableRow key={user._id} className="bg-bg">
                  <TableCell className="text-primary font-medium">
                    @{user.username}
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-primary border-primary/20 hover:bg-primary hover:text-bg focus-visible:outline-primary rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Detail
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(user)}
                        className="text-accent-1 border-accent-1/30 hover:bg-accent-1 hover:text-bg focus-visible:outline-accent-1 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus pengguna?"
        description={`Tindakan ini akan menghapus akun ${pendingDelete?.username ?? ""}, resep yang dibuat, informasi gizi, suka, simpanan, dan laporan terkait. Tindakan ini tidak dapat dibatalkan.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void deleteUser()}
        loading={deleting}
      />
    </section>
  );
}

function UserTableHead() {
  return (
    <TableHead>
      <TableRow>
        <TableHeadCell>Username</TableHeadCell>
        <TableHeadCell>Nama lengkap</TableHeadCell>
        <TableHeadCell>Email</TableHeadCell>
        <TableHeadCell>
          <span className="sr-only">Aksi</span>
        </TableHeadCell>
      </TableRow>
    </TableHead>
  );
}

function UserTableSkeleton() {
  return (
    <div className="border-primary/10 bg-bg overflow-hidden rounded-xl border shadow-sm">
      <div className="space-y-4 p-5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-primary/10 h-11 animate-pulse rounded"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="border-primary/20 bg-bg rounded-xl border border-dashed px-6 py-14 text-center">
      <Icon
        icon="hugeicons:album-not-found-01"
        className="text-primary/45 mx-auto"
        width={44}
      />
      <p className="text-primary mt-3 font-medium">{title}</p>
    </div>
  );
}

function LoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const message = getAdminUserLoadErrorMessage(error);

  return (
    <div className="border-accent-1/25 bg-accent-1/5 rounded-xl border p-6 text-center">
      <p className="text-primary">{message}</p>
      <button
        type="button"
        className="bg-primary text-bg mt-4 rounded-full px-4 py-2 font-medium"
        onClick={onRetry}
      >
        Coba lagi
      </button>
    </div>
  );
}
