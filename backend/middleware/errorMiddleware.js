// Middleware untuk menangani route yang tidak ditemukan (404 Not Found)
export const notFound = (req, res, next) => {
    const error = new Error(`Route Tidak Ditemukan - ${req.originalUrl}`);
    res.status(404);
    next(error); // Oper error ke handler utama di bawah
};

// Middleware utama untuk menangkap semua error aplikasi (500 atau status lainnya)
export const errorHandler = (err, req, res, next) => {
    // Jika status code masih 200 (sukses), ubah menjadi 500 (server error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        // Stack trace (jejak baris error) hanya ditampilkan saat mode development (koding)
        // Jika sudah production, disembunyikan demi keamanan
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};