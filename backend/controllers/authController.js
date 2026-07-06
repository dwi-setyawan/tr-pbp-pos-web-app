import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "Email sudah terdaftar"});
        }

        //buat hash, 10 itu berarti acak sebanyak 2^10 kali
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        res.status(201).json({ mesaage: "Registrasi Akun Berhasil"});
    } catch (error) {
        res.status(500).json({ message: "Registrasi gagal!", error: error.mesaage});
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user){
            return res.status(400).json({ message: "Email atau password salah!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({ message: "Email atau password salah!"});
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "Id" }
        );

        res.status(200).json({
            message: "Berhasil login.",
            token,
            user: { id: user._id, name: user.name, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.mesaage });
    }
};