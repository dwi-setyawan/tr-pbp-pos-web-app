import express from "express";
import mongoose from "mongoose";
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

mongoose
    .connect(process.env.MONGO_URI)
    .then(() =>{
        console.log("database berhasil terhubung");
        app.listen(process.env.PORT, () =>{
            console.log(`Server POS berjalan di http://localhost:${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Tidak dapat terhubung dengan MongoDB", error.message);
    });