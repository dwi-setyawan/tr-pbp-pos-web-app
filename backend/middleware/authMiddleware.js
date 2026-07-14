import jwt from "jsonwebtoken";

//Memeriksa apakah user membawa token JWT yang sah
export const verifyToken = (req, res, next) => {
    // Mengambil token dari header 'Authorization'
    const authHeader = req.headers["authorization"];
    // Format biasanya: "Bearer <kunci_token>", kita ambil tokennya saja
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });
    }

    try {
        // Verifikasi token menggunakan secret key kita
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data user yang ada di dalam token (id & role) ke objek request (req.user)
        req.user = decoded; 
        
        next(); // Silakan lewat ke proses berikutnya (Controller)
    } catch (error) {
        return res.status(403).json({ message: "Token tidak valid atau sudah kedaluwarsa!" });
    }
};

//Memastikan yang mengakses memiliki role 'admin'
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); // Lolos validasi admin
    } else {
        return res.status(403).json({ message: "Akses ditolak! Fitur ini khusus untuk Admin." });
    }
};

//Memastikan yang mengakses memiliki role 'kasir'
export const isKasir = (req, res, next) => {
    if (req.user && req.user.role === "kasir") {
        next(); // Lolos validasi kasir
    } else {
        return res.status(403).json({ message: "Akses ditolak! Fitur ini khusus untuk Kasir." });
    }
};