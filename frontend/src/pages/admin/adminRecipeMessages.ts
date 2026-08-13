import { ApiError, getErrorMessage } from "../../services/api";

export function getAdminRecipeErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getErrorMessage(error, "Gagal memuat resep.");
  }
  if (error.status === 400) return "ID resep tidak valid.";
  if (error.status === 401)
    return "Sesi admin sudah berakhir. Silakan login kembali.";
  if (error.status === 403)
    return "Anda tidak memiliki izin untuk melihat resep ini.";
  if (error.status === 404) return "Resep tidak ditemukan atau sudah dihapus.";
  return "Server gagal memuat resep. Coba lagi.";
}
