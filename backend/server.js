import express from "express";
import { Sequelize } from "sequelize";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//buat route
// import authRoutes from "./routes/authRoutes.js"
import { error } from "console";
// import productRoutes from "./routes/productRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({
        message: "Sistem Point of Sale berjalan"
    });
});

///hubungkan route ke express
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productsRoutes);
// app.use("/api/orders", orderRoutes);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3307,
        dialect: "mysql",
        logging: false,
    }
);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Database MySQL berhasil terhubung");

        await sequelize.sync({ alter: true });
        console.log("semua tabel database berhasil disinkronisasi.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server POS berjalan di http://localhost:${PORT}`);
        });
    } catch (error){
        console.error("Gagal terhubung dengan database:", error.message);
    }
}

startServer()