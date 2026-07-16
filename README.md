# Kopi Kasir — Aplikasi Kasir Cafe

Aplikasi kasir (POS) untuk cafe, dibangun dengan React + React Router + Tailwind CSS v4.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Data & Login

Proyek ini berjalan **tanpa backend** — semua data (pengguna, menu, transaksi) disimpan di
`localStorage` browser lewat `src/lib/db.js`. Ini membuat aplikasi langsung bisa dicoba.
Kalau kamu punya backend sendiri, tinggal ganti isi fungsi-fungsi di `src/lib/db.js` dan
`src/lib/auth.js` dengan pemanggilan API (lihat `api.jsx` yang kamu upload sebagai contoh pola axios + interceptor token).

Akun demo (sudah tersedia otomatis saat pertama kali dibuka):

| Peran | Email | Password |
|---|---|---|
| Owner | owner@kopikasir.test | owner123 |
| Kasir | kasir@kopikasir.test | kasir123 |

## Fitur

**Owner**
- Dasbor: pendapatan hari ini, jumlah transaksi, menu terlaris, stok menipis, grafik 7 hari terakhir
- Manajemen Menu: tambah/ubah/hapus menu, kategori, harga, stok, status aktif, **unggah foto menu**
  (foto otomatis dikompresi/diperkecil di browser sebelum disimpan agar tidak membengkak;
  kalau belum ada foto, ikon emoji cadangan tetap ditampilkan)
- Manajemen Pengguna: tambah/ubah/hapus akun owner & kasir
- Histori & Laporan Penjualan: filter rentang tanggal, ringkasan, rincian per transaksi
- Juga bisa mengakses halaman Transaksi

**Kasir**
- Transaksi: pilih menu (dengan filter kategori & pencarian), keranjang, pembayaran (tunai/QRIS/debit),
  hitung kembalian otomatis, struk setelah checkout, stok otomatis berkurang

## Struktur proyek

```
src/
  lib/db.js         → "database" mock di localStorage (users, menu, transactions)
  lib/auth.js        → login/logout/getCurrentUser
  components/ProtectedRoute.jsx  → guard route + role-based access
  layouts/AppLayout.jsx          → sidebar navigasi (menu berbeda per peran)
  pages/             → LoginPage, DashboardPage, MenuManagementPage,
                        UserManagementPage, ReportPage, TransactionPage
```
