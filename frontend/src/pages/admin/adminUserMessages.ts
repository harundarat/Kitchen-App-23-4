import { ApiError, getErrorMessage } from "../../services/api";

export function getAdminUserLoadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getErrorMessage(error, "Gagal memuat pengguna.");
  }
  if (error.status === 400) return "ID pengguna tidak valid.";
  if (error.status === 401)
    return "Sesi admin sudah berakhir. Silakan login kembali.";
  if (error.status === 403)
    return "Anda tidak memiliki izin untuk melihat pengguna ini.";
  if (error.status === 404)
    return "Pengguna tidak ditemukan atau sudah dihapus.";
  return "Server gagal memuat pengguna. Coba lagi.";
}

export function getAdminUserUpdateErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getErrorMessage(error, "Gagal memperbarui pengguna");
  }
  if (error.status === 400) return "Periksa kembali data pengguna yang diisi.";
  if (error.status === 401)
    return "Sesi admin sudah berakhir. Silakan login kembali.";
  if (error.status === 403)
    return "Anda tidak memiliki izin untuk mengubah pengguna ini.";
  if (error.status === 404) return "Pengguna sudah tidak ditemukan.";
  if (error.status === 409)
    return "Username atau email tersebut sudah digunakan.";
  return "Server gagal memperbarui pengguna. Coba lagi.";
}
