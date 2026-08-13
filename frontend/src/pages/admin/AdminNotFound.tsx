import { Link } from "react-router-dom";

export default function AdminNotFound() {
  return (
    <section className="border-primary/10 bg-bg rounded-xl border p-8 text-center shadow-sm">
      <h1 className="text-primary text-2xl font-bold">
        Halaman admin tidak ditemukan
      </h1>
      <p className="text-primary/65 mt-2">
        Periksa kembali alamat yang dibuka.
      </p>
      <Link
        to="/admin/users"
        className="bg-primary text-bg mt-5 inline-flex rounded-full px-4 py-2 font-medium"
      >
        Kembali ke pengguna
      </Link>
    </section>
  );
}
