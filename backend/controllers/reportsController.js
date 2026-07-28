
import { Sequelize, Op } from "sequelize";
import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getSalesReport = async (req, res) => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const whereCondition = {
            status: "completed",
            transactionDate: { [Op.between]: [start, end] }
        };

        if (req.query.kasir) {
            whereCondition.userId = req.query.kasir;
        }

        const transactionsHistory = await Transaction.findAll({
            where: whereCondition,
            attributes: ["id", "transactionDate", "paymentMethod", "totalAmount"],
            include: [
                {
                    model: User,
                    as: "kasir",
                    attributes: ["name"]
                },
                {
                    model: TransactionItem,
                    as: "items",
                    attributes: ["quantity", "subtotal"],
                    include: [{
                        model: Product,
                        as: "product",
                        attributes: ["name"]
                    }]
                }
            ],
            order: [["transactionDate", "DESC"]]
        });

        const totalTransactions = transactionsHistory.length;
        const totalPendapatan = transactionsHistory.reduce((sum, transaction) => sum + Number(transaction.totalAmount || 0), 0);
        const totalItemsSold = transactionsHistory.reduce((sum, transaction) => {
            const itemQty = transaction.items?.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0) || 0;
            return sum + itemQty;
        }, 0);
        const averagePerTransaction = totalTransactions > 0 ? Math.round(totalPendapatan / totalTransactions) : 0;

        const tableData = transactionsHistory.map(t => {
            const totalItemCount = t.items ? t.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            const productsDetail = t.items ? t.items.map(item => ({
                detailString: `${item.quantity}x ${item.product ? item.product.name : "Menu Terhapus"}`,
                subtotal: item.subtotal
            })) : [];

            return {
                id: t.id,
                waktu: t.transactionDate,
                kasir: t.kasir ? t.kasir.name : "Tanpa Nama",
                itemCountString: `${totalItemCount} item`,
                pembayaran: t.paymentMethod === "cash" ? "Tunai" : "Qris",
                total: t.totalAmount,
                products: productsDetail
            };
        });

        res.status(200).json({
            success: true,
            message: "Berhasil memuat laporan harian",
            data: {
                cards: {
                    totalPendapatan,
                    totalTransactions,
                    totalItemsSold,
                    averagePerTransaction
                },
                table: tableData
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal memuat laporan penjualan",
            error: error.message
        });
    }
};