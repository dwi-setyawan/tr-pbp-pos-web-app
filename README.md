# tr-pbp-pos-web-app

Sebuah contoh aplikasi Point of Sale (POS) full‑stack untuk digunakan di portofolio.
Proyek ini memisahkan frontend (React + Vite) dan backend (Node.js + Express) untuk
menunjukkan kemampuan membangun aplikasi web terstruktur lengkap.

## Ringkasan

- Tujuan: Demo sistem POS sederhana yang mendukung manajemen produk, transaksi,
  laporan, dan autentikasi pengguna.
- Cocok untuk: portofolio pengembang frontend/backend, demo teknis, dan pembelajaran.

## Fitur Utama

- Autentikasi pengguna (login/register)
- CRUD produk termasuk upload gambar
- Proses transaksi (tambah item, update jumlah, checkout)
- Laporan penjualan dan ringkasan transaksi
- Manajemen pengguna dan peran sederhana

## Teknologi

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MySQL (via Sequelize)
- Lainnya: Mulai pengaturan file upload, middleware autentikasi, dan REST API

## Demo & Screenshot

Tambahkan tautan demo atau screenshot di sini untuk memperkuat portofolio.
![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)

## Instalasi & Menjalankan (lokal)

1. Jalankan backend:

```bash
cd backend
npm install
npm run dev
```

2. Jalankan frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Buka browser ke alamat yang ditunjukkan (biasanya `http://localhost:5173` untuk frontend).

Catatan: Pastikan MySQL / Laragon berjalan dan file konfigurasi environment di `backend/.env`
telah disesuaikan.

Contoh `.env` minimal untuk `backend`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_pos_brew
DB_PORT=3306
```

## Struktur Proyek (ringkas)

- `backend/` — server API, controller, model, routes, dan folder `uploads/` untuk gambar
- `frontend/` — kode React (komponen, halaman, layanan API)

## Endpoint Utama (contoh)

- Autentikasi: `POST /api/auth/login`, `POST /api/auth/register`
- Produk: `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- Transaksi: `POST /api/transactions`, `POST /api/transactions/:id/items`, `POST /api/transactions/:id/checkout`

Untuk detail endpoint, lihat file route di `backend/routes/`.

## Pengembangan & Kontribusi

- Fork repo ini dan buat branch fitur (`feat/nama-fitur`)
- Sertakan deskripsi perubahan dan langkah menjalankan fitur di PR

## Catatan untuk Portofolio

- Personalisasi README dengan: nama Anda, peran (frontend/backend/full‑stack),
  link GitHub, email, dan link demo (jika tersedia).
- Tambahkan screenshot atau GIF singkat yang menunjukkan alur transaksi.

## Kontak

- Nama: (Masukkan nama Anda)
- Email: (Masukkan email Anda)
- GitHub: (Masukkan profil GitHub)

Jika Anda ingin, saya bisa menambahkan screenshot, menulis ringkasan singkat profil
Anda di bagian atas, atau menyertakan instruksi setup database lebih rinci.
