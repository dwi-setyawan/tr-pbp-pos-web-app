import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded; 
        
        next(); 
    } catch (error) {
        return res.status(403).json({ message: "Token tidak valid atau sudah kedaluwarsa!" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); 
    } else {
        return res.status(403).json({ message: "Akses ditolak! Fitur ini khusus untuk Admin." });
    }
};

export const isKasir = (req, res, next) => {
    if (req.user && req.user.role === "kasir") {
        next(); 
    } else {
        return res.status(403).json({ message: "Akses ditolak! Fitur ini khusus untuk Kasir." });
    }
};