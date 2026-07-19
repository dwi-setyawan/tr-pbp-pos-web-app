/**
 * ============================================
 * TRANSACTION ITEM MODEL
 * --------------------------------------------
 * Berisi operasi database untuk tabel
 * detail transaksi.
 *
 * Menyimpan daftar produk yang terdapat
 * pada setiap transaksi.
 *
 * Digunakan oleh:
 * - Transaction Controller
 * ============================================
 */

import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Product from "./Product.js";

const TransactionItem = db.define("TransactionItem", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    transactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    unitPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // snapshot harga produk SAAT transaksi dibuat,
        // supaya kalau harga produk berubah nanti, riwayat transaksi lama tidak ikut berubah
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // = quantity * unitPrice, dihitung otomatis di controller
    },
}, {
    timestamps: true,
});

// relasi transactionItem itu merujuk ke 1 produk
TransactionItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(TransactionItem, { foreignKey: "productId" });

export default TransactionItem;
