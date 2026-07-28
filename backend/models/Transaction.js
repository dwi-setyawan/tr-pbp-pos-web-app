import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./User.js";
import TransactionItem from "./TransactionItem.js";

const Transaction = db.define("Transaction", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    transactionNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    transactionDate: {
        type: DataTypes.DATE,
        allowNull: true,
        // diisi saat checkout berhasil (bukan saat transaksi dibuat/pending)
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    paymentMethod: {
        type: DataTypes.ENUM("cash", "qris"),
        allowNull: true,
    },
    amountPaid: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    changeAmount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM("pending", "completed", "cancelled"),
        defaultValue: "pending",
        allowNull: false,
    },
}, {
    timestamps: true,
    // createdAt tetap ada (otomatis), berguna untuk tahu kapan transaksi MULAI dibuat
    // transactionDate berbeda tujuan: kapan transaksi SELESAI/checkout
});

Transaction.belongsTo(User, { foreignKey: "userId", as: "kasir" });
User.hasMany(Transaction, { foreignKey: "userId" });

Transaction.hasMany(TransactionItem, { foreignKey: "transactionId", as: "items", onDelete: "CASCADE" });
TransactionItem.belongsTo(Transaction, { foreignKey: "transactionId" });

export default Transaction;
