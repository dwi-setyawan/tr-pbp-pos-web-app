/**
 * ============================================
 * TRANSACTION CONTROLLER
 * --------------------------------------------
 * Mengelola proses transaksi penjualan.
 *
 * Contoh:
 * - Menambahkan transaksi
 * - Menghitung total 
 * - Menyimpan Detail Transaksi
 * - Mengurangi stok produk
 * - Checkout
 * - Cetak Struk
 * ============================================
 */

import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import Product from "../models/Product.js";
import { Op } from "sequelize";

// halper untuk generate nomor transaksi unik
const generateTransactionNumber = async  () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const countToday = await Transaction.count({
    where: { createdAt: { [Op.gte]: startOfDay } }, });
            
    const sequence = String(countToday + 1).padStart(4, "0");
    return `TRX-${dateStr}-${sequence}`;   
};

// helper untuk menghitung total transaksi berdasarkan detail item
const recalculateTotal = async (transactionId) => {
    const items = await TransactionItem.findAll({ where: { transactionId } });
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    await Transaction.update({ totalAmount: total }, { where: { id: transactionId } });
    return total;
};

// 1. mulai transaksi baru 
export const createTransaction = async (req, res) => {
    try {
        const newTransaction = await Transaction.create({
            transactionNumber: `TEMP-${Date.now()}`, // nomor asli di-generate ulang saat checkout
            userId: req.user.id,
            status: "pending",
        });
        res.status(201).json({ message: "Transaksi baru dibuat", data: newTransaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. tambahkan item ke transaksi 
export const addItem = async (req, res) => {
    try {
        const { id } = req.params; // id transaksi
        const { productId, quantity } = req.body;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaksi sudah selesai/dibatalkan, tidak bisa diubah" });
        }

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Stok ${product.name} tidak cukup. Sisa: ${product.stock}` });
        }

        const subtotal = product.price * quantity;
        const newItem = await TransactionItem.create({
            transactionId: id,
            productId,
            quantity,
            unitPrice: product.price,
            subtotal,
        });

        const total = await recalculateTotal(id);
        res.status(201).json({ message: "Item ditambahkan", data: newItem, totalAmount: total });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. ubah jumlah item 
export const updateItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const { quantity } = req.body;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaksi sudah selesai/dibatalkan, tidak bisa diubah" });
        }

        const item = await TransactionItem.findByPk(itemId);
        if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

        const product = await Product.findByPk(item.productId);
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Stok ${product.name} tidak cukup. Sisa: ${product.stock}` });
        }

        const subtotal = item.unitPrice * quantity;
        await item.update({ quantity, subtotal });

        const total = await recalculateTotal(id);
        res.status(200).json({ message: "Item diperbarui", data: item, totalAmount: total });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. hapus item dari transaksi 
export const removeItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaksi sudah selesai/dibatalkan, tidak bisa diubah" });
        }

        const item = await TransactionItem.findByPk(itemId);
        if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

        await item.destroy();
        const total = await recalculateTotal(id);
        res.status(200).json({ message: "Item dihapus", totalAmount: total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. checkout: kunci transaksi, proses pembayaran, kurangi stok
export const checkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, amountPaid } = req.body;

        const transaction = await Transaction.findByPk(id, {
            include: [{ model: TransactionItem, as: "items" }],
        });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaksi ini sudah diproses sebelumnya" });
        }
        if (!transaction.items || transaction.items.length === 0) {
            return res.status(400).json({ message: "Tidak bisa checkout, belum ada item dipilih" });
        }
        if (!["cash", "qris"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Metode pembayaran harus 'cash' atau 'qris'" });
        }
        if (amountPaid < transaction.totalAmount) {
            return res.status(400).json({ message: "Nominal bayar kurang dari total transaksi" });
        }

        // Validasi ulang & kurangi stok tiap produk
        for (const item of transaction.items) {
            const product = await Product.findByPk(item.productId);
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Stok ${product.name} tidak cukup saat checkout. Sisa: ${product.stock}`,
                });
            }
        }
        for (const item of transaction.items) {
            const product = await Product.findByPk(item.productId);
            await product.update({ stock: product.stock - item.quantity });
        }

        const transactionNumber = await generateTransactionNumber();
        const changeAmount = amountPaid - transaction.totalAmount;

        await transaction.update({
            transactionNumber,
            transactionDate: new Date(),   // ← tambahan ini
            paymentMethod,
            amountPaid,
            changeAmount,
            status: "completed",
        });

        res.status(200).json({ message: "Checkout berhasil", data: transaction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 6. batalkan transaksi (hanya boleh selama masih pending)
export const cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaksi yang sudah selesai tidak bisa dibatalkan" });
        }

        await transaction.update({ status: "cancelled" });
        res.status(200).json({ message: "Transaksi dibatalkan" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//========== OPTIONAL JIKA MAU DIPAKAI/DITAMBAHKAN FITUR RIWAYAT / LAPORAN TRANSAKSI ==========


// 7. LIHAT SEMUA TRANSAKSI (untuk riwayat/laporan dasar — Admin & Kasir)
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{ model: TransactionItem, as: "items" }],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. LIHAT DETAIL 1 TRANSAKSI (dipakai untuk data struk)
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, {
            include: [
                {
                    model: TransactionItem,
                    as: "items",
                    include: [{ model: Product, as: "product" }],
                },
            ],
        });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};