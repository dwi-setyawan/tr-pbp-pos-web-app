import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. REGISTER USER
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi input dasar
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Semua kolom wajib diisi!" });
        }

        // Cari user berdasarkan email (Gaya Sequelize)
        const userExist = await User.findOne({ where: { email } });
        if (userExist) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        // Buat salt dan hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Buat user baru langsung di MySQL (Gaya Sequelize)
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "kasir",
        });

        res.status(201).json({ 
            message: "Registrasi Akun Berhasil",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Registrasi gagal!", error: error.message });
    }
};

// 2. LOGIN USER
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password wajib diisi!" });
        }

        // Cari user berdasarkan email (Gaya Sequelize)
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email atau password salah!" });
        }

        // Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email atau password salah!" });
        }

        // Buat token JWT (Menggunakan id bawaan MySQL & masa aktif 1 hari)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } 
        );

        res.status(200).json({
            message: "Berhasil login.",
            token,
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role 
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};