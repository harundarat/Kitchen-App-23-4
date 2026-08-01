# Vercel deployment

Entry point serverless berada di `api/index.ts`; koneksi MongoDB dibuat saat invocation pertama dan digunakan kembali oleh Mongoose selama instance masih hidup.

Tambahkan environment berikut di project settings Vercel:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET` dengan panjang minimal 32 karakter
- `CORS_ORIGINS`, berupa daftar origin frontend yang dipisahkan koma
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=none` bila frontend dan API berbeda site
- variabel `FB_*` dari `.env.example` bila upload gambar digunakan

Deploy dilakukan dari root backend. `vercel.json` sudah mengarahkan semua request ke handler TypeScript dan CORS hanya dikelola aplikasi, sehingga tidak ada header CORS statis yang bertentangan dengan allowlist runtime.
