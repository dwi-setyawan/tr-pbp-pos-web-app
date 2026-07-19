import express from "express";
import {
    createTransaction,
    addItem,
    updateItem,
    removeItem,
    checkout,
    cancelTransaction,
    getTransactions,
    getTransactionById,
} from "../controllers/transactionController.js";
import { verifyToken, isKasir } from "../middleware/authMiddleware.js";

const router = express.Router();

// JIKA DIPERLUKAN / HAPUS
// Lihat riwayat/detail transaksi — Admin & Kasir boleh akses 
router.get("/", verifyToken, getTransactions);
router.get("/:id", verifyToken, getTransactionById);

// proses transaksi — khusus Kasir
router.post("/", verifyToken, isKasir, createTransaction);
router.post("/:id/items", verifyToken, isKasir, addItem);
router.put("/:id/items/:itemId", verifyToken, isKasir, updateItem);
router.delete("/:id/items/:itemId", verifyToken, isKasir, removeItem);
router.post("/:id/checkout", verifyToken, isKasir, checkout);
router.delete("/:id", verifyToken, isKasir, cancelTransaction);

export default router;