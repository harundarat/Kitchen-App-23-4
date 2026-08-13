# Kitchen Craft Frontend

Frontend Kitchen Craft dibangun dengan React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, dan Flowbite React.

## Menjalankan aplikasi

Gunakan Node.js `^20.19.0` atau `>=22.12.0`, lalu jalankan:

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_BASE_URL` harus menunjuk ke root API tanpa garis miring di akhir. Jika variabel ini tidak diisi, aplikasi menggunakan API produksi Kitchen Craft.

## Portal administrator

Portal administrator berada di aplikasi ini pada `/admin/login`. Buat akun
administrator dari backend dengan mengisi `ADMIN_USERNAME`, `ADMIN_FULL_NAME`,
`ADMIN_EMAIL`, dan `ADMIN_PASSWORD`, lalu menjalankan `npm run seed:admin` dari
direktori `backend`.

Browser memakai satu cookie sesi HTTP-only. Login administrator menggantikan
sesi pengguna biasa, dan login pengguna biasa menggantikan sesi administrator.
Jalankan dan deploy backend lebih dahulu karena halaman admin memakai route API
yang terlindungi di backend.

## Perintah

- `npm run dev` — menjalankan development server.
- `npm test` — menjalankan pengujian Vitest dan React Testing Library.
- `npm run typecheck` — memeriksa tipe TypeScript tanpa menghasilkan file.
- `npm run lint` — menjalankan ESLint dengan toleransi nol terhadap warning.
- `npm run format:check` — memeriksa format source dan konfigurasi.
- `npm run build` — membuat production build di `dist/`.
- `npm run preview` — melihat production build secara lokal.

## Struktur utama

- `src/pages` berisi halaman yang dimuat per route.
- `src/components` berisi komponen UI bersama dan layout.
- `src/context` menyediakan session pengguna dan metadata kategori/bahan.
- `src/services/api.ts` adalah client Fetch terpusat dengan cookie credentials, timeout, parsing response, dan error HTTP bertipe.
- `src/services/admin.ts` menyediakan operasi admin bertipe yang memakai client API yang sama.
- `src/types/api.ts` mendefinisikan kontrak data frontend dengan API backend.
