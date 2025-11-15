# Vercel Deployment Setup

## Environment Variables Required

Pastikan environment variables berikut sudah dikonfigurasi di Vercel Dashboard:

1. **MONGO_URL** - MongoDB connection string
2. **JWT_SECRET** - Secret key untuk JWT authentication
3. **FB_API_KEY** - Firebase API key
4. **FB_AUTH_DOMAIN** - Firebase auth domain
5. **FB_PROJECT_ID** - Firebase project ID
6. **FB_STORAGE_BUCKET** - Firebase storage bucket
7. **FB_MESSAGING_SENDER** - Firebase messaging sender ID
8. **FB_APP_ID** - Firebase app ID
9. **DEEPL_AUTH_KEY** - DeepL API authentication key
10. **EDAMAM_API_URL** - Edamam nutrition API URL
11. **CORS_ORIGIN_PROD** - Allowed CORS origins (comma-separated)
    - Contoh: `https://kitchencraft-eight.vercel.app,https://your-other-frontend.vercel.app`
12. **NODE_ENV** - Set to `production` untuk Vercel deployment

## Cara Menambahkan Environment Variables di Vercel

1. Buka Vercel Dashboard
2. Pilih project backend Anda
3. Masuk ke **Settings** → **Environment Variables**
4. Tambahkan setiap environment variable yang diperlukan
5. Pastikan scope-nya di-set ke **Production**, **Preview**, dan **Development** sesuai kebutuhan

## CORS Configuration

Backend ini sudah dikonfigurasi untuk mendukung multiple origins melalui:

1. **app.js** - Middleware CORS yang membaca dari environment variable `CORS_ORIGIN_PROD`
2. **vercel.json** - Headers configuration untuk Vercel serverless functions

### Menambahkan Frontend Origin Baru

Untuk menambahkan frontend origin baru:

1. Update environment variable `CORS_ORIGIN_PROD` di Vercel
2. Format: `https://origin1.vercel.app,https://origin2.vercel.app`
3. Jika perlu multiple origins secara permanen, update juga di `vercel.json` bagian headers

## Testing Locally

Untuk testing lokal:

1. Copy `.env-example` menjadi `.env`
2. Isi semua environment variables yang diperlukan
3. Jalankan `npm run dev`

## Troubleshooting CORS Issues

Jika masih mengalami CORS error setelah deployment:

1. Verifikasi environment variable `CORS_ORIGIN_PROD` sudah di-set dengan benar di Vercel
2. Pastikan URL frontend yang digunakan persis sama dengan yang ada di `CORS_ORIGIN_PROD`
3. Redeploy backend setelah mengubah environment variables
4. Clear browser cache atau gunakan incognito mode untuk testing
