# KitchenCraft Backend

Backend KitchenCraft versi 2 adalah REST API berbasis TypeScript, Express 5, dan MongoDB/Mongoose. Runtime yang ditargetkan adalah Node.js 24 LTS.

## Menjalankan development lokal

Cara termudah adalah Docker Compose:

```bash
docker compose up --build
```

API tersedia di `http://localhost:3000`, MongoDB di `mongodb://localhost:27017`, dan health check di `GET /health`. Source directory di-mount ke container sehingga perubahan TypeScript memicu restart otomatis. Data MongoDB dan `node_modules` disimpan di named volume.

Compose sementara mem-pin MongoDB `7.0.39` karena seluruh MongoDB 8.x yang tersedia saat ini memiliki incompatibility upstream dengan host Linux kernel 6.19+. Pin ini dapat dinaikkan setelah `SERVER-121912` diperbaiki.

Untuk menjalankan tanpa Docker:

```bash
cp .env.example .env
npm install
npm run dev
```

MongoDB harus tersedia pada nilai `MONGO_URI`. Perintah verifikasi utama:

```bash
npm run check
npm run build
npm audit
```

## Environment

Daftar lengkap tersedia di `.env.example`. `JWT_SECRET` wajib berisi minimal 32 karakter di production. Konfigurasi Firebase hanya wajib bila endpoint upload gambar digunakan. Cookie lintas origin HTTPS umumnya membutuhkan `COOKIE_SECURE=true` dan `COOKIE_SAME_SITE=none`.

Edamam dan DeepL sengaja tidak lagi menjadi dependency. Nutrisi dapat dikirim sebagai field `nutrition` ketika resep dibuat atau diubah; pada multipart field tersebut berbentuk JSON string. Field `source` menerima `manual` atau `ai`, sehingga integrasi Gemini di masa depan tidak perlu mengubah skema lagi.

## Membuat administrator lokal

Isi `ADMIN_USERNAME`, `ADMIN_FULL_NAME`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD`, kemudian jalankan:

```bash
npm run seed:admin
```

Password administrator disimpan sebagai bcrypt hash. Database lama yang masih menyimpan password admin plaintext tidak kompatibel dan sebaiknya di-reset karena proyek ini belum pernah masuk production.

## Perubahan API dan database utama

- Properti resep memakai `author`, `totalTime`, `categories`, `likeCount`, `video`, dan array `steps`.
- Timestamp dikelola Mongoose sebagai `createdAt` dan `updatedAt`.
- Like, saved recipe, dan report memakai compound unique index untuk mencegah duplikasi.
- Semua route data admin, selain login/logout, sekarang membutuhkan JWT administrator.
- JWT diterima dari cookie `token` atau header `Authorization: Bearer <token>`.
- Pencarian nutrisi modern tersedia di `GET /api/nutrition/search`; alias `/api/searchgizi` masih tersedia sementara.
- Endpoint eksperimen `/api/coba` dihapus.

Karena skema lama tidak dipertahankan, database development lama dapat dibuang sebelum mulai:

```bash
docker compose down -v
docker compose up --build
```

Perintah pertama menghapus volume database lokal dan seluruh isinya.
