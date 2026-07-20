import User from "../models/User.js"; 
import bcrypt from "bcryptjs";

// CREATE / POST : Menambah akun kasir baru oleh Admin
export const createCashier = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Nama, email, dan password wajib diisi!" });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar!" });

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const newCashier = await User.create({
            name,
            email,
            password: hashPassword,
            role: "kasir"
        });

        res.status(201).json({
            message: "Akun kasir berhasil ditambahkan!",
            data: { id: newCashier.id, name: newCashier.name, email: newCashier.email, role: newCashier.role }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// READ / GET : Mengambil semua data KASIR
export const getCashiers = async (req, res) => {
    try {
        const response = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt'],
            where: {
                role: 'kasir'
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ DETAIL / GET: Mengambil  data kasir berdasarkan ID
export const getCashierById = async (req, res) => {
    try {
        const cashier = await User.findOne({
            attributes: ['id', 'name', 'email', 'role'],
            where: {
                id: req.params.id,
                role: 'kasir'
            }
        });
        if (!cashier) return res.status(404).json({ message: "Akun kasir tidak ditemukan!" });
        res.status(200).json(cashier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE / PUT : Mengubah data kasir 
export const updateCashier = async (req, res) => {
    const cashier = await User.findOne({
        where: {
            id: req.params.id,
            role: 'kasir'
        }
    });
    if (!cashier) return res.status(404).json({ message: "Akun kasir tidak ditemukan!" });

    const { name, email, password } = req.body;
    
    // jika password diubah, hashing
    let hashPassword;
    if (password === "" || password === null || password === undefined) {
        hashPassword = cashier.password; 
    } else {
        const salt = await bcrypt.genSalt();
        hashPassword = await bcrypt.hash(password, salt);
    }

    try {
        await User.update({
            name: name || cashier.name,
            email: email || cashier.email,
            password: hashPassword
        }, {
            where: {
                id: cashier.id
            }
        });
        res.status(200).json({ message: "Data akun kasir berhasil diperbarui!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE / DELete: Menghapus akun kasir
export const deleteCashier = async (req, res) => {
    const cashier = await User.findOne({
        where: {
            id: req.params.id,
            role: 'kasir'
        }
    });
    if (!cashier) return res.status(404).json({ message: "Akun kasir tidak ditemukan!" });

    try {
        await User.destroy({
            where: {
                id: cashier.id
            }
        });
        res.status(200).json({ message: "Akun kasir berhasil dihapus dari sistem!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};