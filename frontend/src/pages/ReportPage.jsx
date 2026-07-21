import { Fragment, useEffect, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import api from '../lib/api';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

const ReportPage = () => {
    const [expandedId, setExpandedId] = useState(null);

    const [cards, setCards] = useState({
        totalPendapatan: 0,
        totalTransactions: 0,
        totalItemsSold: 0,
        averagePerTransaction: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDailyReport();
    }, []);

    const fetchDailyReport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports');

            if (response.data.success) {
                setCards(response.data.data.cards);
                setTransactions(response.data.data.table);
            }
        } catch (err) {
            console.error('Gagal mengambil laporan harian:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-display text-3xl font-semibold text-ink">
                    Histori &amp; Laporan Penjualan
                </h1>
                <p className="mt-1 text-ink-soft">
                    Tinjau transaksi dan performa penjualan hari ini.
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Total Pendapatan</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {formatRupiah(cards.totalPendapatan)}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Jumlah Transaksi</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {cards.totalTransactions}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Item Terjual</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {cards.totalItemsSold}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Rata-rata / Transaksi</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {formatRupiah(cards.averagePerTransaction)}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-soft/10">
                <table className="w-full text-left text-sm">
                    <thead className="bg-parchment text-xs uppercase tracking-wide text-ink-soft">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Waktu</th>
                            <th className="px-6 py-3 font-semibold">Kasir</th>
                            <th className="px-6 py-3 font-semibold">Item</th>
                            <th className="px-6 py-3 font-semibold">Pembayaran</th>
                            <th className="px-6 py-3 font-semibold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-soft/10">
                        {transactions.map((t) => (
                            <Fragment key={t.id}>
                                <tr
                                    onClick={() =>
                                        setExpandedId(expandedId === t.id ? null : t.id)
                                    }
                                    className="cursor-pointer hover:bg-parchment/40"
                                >
                                    <td className="px-6 py-3.5 text-ink">
                                        {new Date(t.waktu).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </td>
                                    <td className="px-6 py-3.5 text-ink-soft">{t.kasir}</td>
                                    <td className="px-6 py-3.5 text-ink-soft">
                                        {t.itemCountString}
                                    </td>
                                    <td className="px-6 py-3.5 text-ink-soft capitalize">
                                        {t.pembayaran}
                                    </td>
                                    <td className="px-6 py-3.5 text-right font-mono font-semibold text-ink">
                                        {formatRupiah(t.total)}
                                    </td>
                                </tr>
                                {expandedId === t.id && (
                                    <tr className="bg-parchment/30">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                {t.products && t.products.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between text-sm text-ink-soft"
                                                    >
                                                        <span>{item.detailString}</span>
                                                        <span className="font-mono">
                                                            {formatRupiah(item.subtotal)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}

                        {!loading && transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center text-ink-soft">
                                    <ReceiptText
                                        size={32}
                                        className="mx-auto mb-3 text-ink-soft/40"
                                    />
                                    Belum ada transaksi pada hari ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportPage;