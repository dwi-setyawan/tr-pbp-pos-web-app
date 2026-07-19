# tr-pbp-pos-web-app

Aplikasi Point of Sale (POS) web dengan struktur backend dan frontend terpisah.

## Teknologi yang Digunakan

- Frontend: React + Vite
- Backend: Node.js + Express + MySQL + Sequelize

## Prasyarat

- Node.js terinstall
- MySQL/Laragon sudah berjalan
- Database MySQL tersedia dengan nama `db_pos_brew`

## Instalasi

### 1. Backend

```bash
cd backend
npm install
```

Pastikan file `backend/.env` sudah benar, terutama:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_pos_brew
DB_PORT=3306
```

Jalankan backend:

```bash
npm run dev
```

Backend akan berjalan di:

```text
http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:5173
```

## Cara Cek Aplikasi

- Buka http://localhost:5173 untuk tampilan frontend
- Buka http://localhost:5000 untuk mengecek API backend

## Struktur Folder

- `backend/` untuk server API
- `frontend/` untuk aplikasi React

## Catatan

- Jika ada masalah terkait PowerShell dan npm, gunakan perintah berikut:

```bash
cmd /c npm run dev
```

====================================================== ENDPOIN TRANSAKASI

### 1. **POST** `/transactions`

Membuat transaksi baru dengan status **pending**.
Menghasilkan ID transaksi yang digunakan pada proses selanjutnya.

### 2. **POST** `/transactions/:id/items`

Menambahkan produk pertama ke dalam transaksi.
Menghitung subtotal dan memperbarui total transaksi.

### 3. **POST** `/transactions/:id/items`

Menambahkan produk lain ke transaksi yang sama.
Total transaksi diperbarui sesuai item yang ditambahkan.

### 4. **GET** `/transactions/:id`

Menampilkan detail transaksi beserta seluruh item.
Digunakan untuk memastikan total transaksi sudah benar.

### 5. **PUT** `/transactions/:id/items/:itemId`

Mengubah jumlah produk pada transaksi.
Subtotal dan total transaksi dihitung ulang secara otomatis.

### 6. **GET** `/transactions/:id`

Menampilkan detail transaksi setelah perubahan item.
Memastikan total transaksi telah diperbarui.

### 7. **DELETE** `/transactions/:id/items/:itemId`

Menghapus item tertentu dari transaksi.
Total transaksi dihitung ulang setelah item dihapus.

### 8. **GET** `/transactions/:id`

Menampilkan detail transaksi setelah penghapusan item.
Digunakan untuk memastikan total transaksi telah berkurang.

### 9. **POST** `/transactions/:id/checkout`

Menyelesaikan proses pembayaran transaksi.
Mengurangi stok produk dan mengubah status menjadi **completed**.

### 10. **GET** `/transactions/:id`

Menampilkan data transaksi yang telah selesai.
Memastikan nomor transaksi, status, dan kembalian sudah benar.

### 11. **Cek Database (phpMyAdmin)**

Memastikan stok produk telah berkurang setelah checkout.
Memverifikasi data pada tabel sesuai hasil transaksi.

### 12. **POST** `/transactions`

Membuat transaksi baru untuk pengujian pembatalan.
Status awal transaksi adalah **pending**.

### 13 **DELETE** `/transactions/:id`

Membatakan transaksi yang masih berstatus **pending**.
Transaksi yang dibatalkan tidak mengurangi stok produk.

### 14. **GET** `/transactions`

Menampilkan seluruh riwayat transaksi yang tersimpan.
Memastikan transaksi **completed** dan **cancelled** telah tercatat.
========================================================================
