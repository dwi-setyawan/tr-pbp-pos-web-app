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

        const summary = await Transaction.findOne({
            attributes: [
                [Sequelize.fn("COUNT", Sequelize.col("id")), "totalTransactions"],
                [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalPendapatan"]
            ],
            where: whereCondition
        });

        const totalTransactions = Number(summary?.dataValues?.totalTransactions) || 0;
        const totalPendapatan = Number(summary?.dataValues?.totalPendapatan) || 0;

        const itemsSummary = await TransactionItem.findOne({
            attributes: [
                [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalItemsSold"]
            ],
            include: [{
                model: Transaction,
                attributes: [],
                where: whereCondition
            }]
        });
        const totalItemsSold = Number(itemsSummary?.dataValues?.totalItemsSold) || 0;

        const averagePerTransaction = totalTransactions > 0 ? Math.round(totalPendapatan / totalTransactions) : 0;

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
                    attributes: ["quantity", "unitPrice", "subtotal"],
                    include: [{
                        model: Product,
                        as: "product",
                        attributes: ["name"]
                    }]
                }
            ],
            order: [["transactionDate", "DESC"]]
        });

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