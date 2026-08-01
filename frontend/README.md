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

## Perintah

- `npm run dev` — menjalankan development server.
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
- `src/types/api.ts` mendefinisikan kontrak data frontend dengan API backend.
