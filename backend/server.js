import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/database.js";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import reportRoutes from "./routes/reportRoutes.js";


// buat route
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

// buat middleware handling error
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.json({
        message: "Sistem Point of Sale berjalan"
    });
});

/// hubungkan semua route ke express
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/kasir", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);

// middleware error
app.use(notFound);
app.use(errorHandler);



async function startServer() {
    try {
        await db.authenticate();
        console.log("Database MySQL berhasil terhubung");

        await db.sync();
        console.log("semua tabel database berhasil disinkronisasi.");

        const adminExist = await User.findOne({ where: { role: 'admin' } });
        if (!adminExist) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password123", salt);

            await User.create({
                id: 1, 
                name: "Super Admin",
                email: "admin@brew.com",
                password: hashedPassword,
                role: "admin"
            });
        }


        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server POS berjalan di http://localhost:${PORT}`);
        });
    } catch (error){
        console.error("Gagal terhubung dengan database:", error.message);
    }
}

startServer()