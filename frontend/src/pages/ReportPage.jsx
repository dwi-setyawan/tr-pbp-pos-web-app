import { Fragment, useMemo, useState } from 'react';
import { ReceiptText } from 'lucide-react';

import { getTransactions } from '../lib/db';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const ReportPage = () => {
    const transactions = getTransactions();

    const today = toDateInputValue(new Date());
    const weekAgo = toDateInputValue(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

    const [startDate, setStartDate] = useState(weekAgo);
    const [endDate, setEndDate] = useState(today);
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return transactions.filter((t) => {
            const created = new Date(t.createdAt);
            return created >= start && created <= end;
        });
    }, [transactions, startDate, endDate]);

    const summary = useMemo(() => {
        const totalRevenue = filtered.reduce((sum, t) => sum + t.total, 0);
        const totalItems = filtered.reduce(
            (sum, t) => sum + t.items.reduce((s, i) => s + i.qty, 0),
            0
        );
        return {
            totalRevenue,
            totalTransactions: filtered.length,
            totalItems,
            avgTicket: filtered.length ? totalRevenue / filtered.length : 0,
        };
    }, [filtered]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-display text-3xl font-semibold text-ink">
                    Histori &amp; Laporan Penjualan
                </h1>
                <p className="mt-1 text-ink-soft">
                    Tinjau transaksi dan performa penjualan berdasarkan rentang tanggal.
                </p>
            </div>

            <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">
                        Dari Tanggal
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-ink-soft/25 px-3 py-2 text-sm outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink">
                        Sampai Tanggal
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={today}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-ink-soft/25 px-3 py-2 text-sm outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                    />
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Total Pendapatan</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {formatRupiah(summary.totalRevenue)}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Jumlah Transaksi</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {summary.totalTransactions}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Item Terjual</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {summary.totalItems}
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-soft/10">
                    <p className="text-sm font-medium text-ink-soft">Rata-rata / Transaksi</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">
                        {formatRupiah(summary.avgTicket)}
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
                        {filtered.map((t) => (
                            <Fragment key={t.id}>
                                <tr
                                    onClick={() =>
                                        setExpandedId(expandedId === t.id ? null : t.id)
                                    }
                                    className="cursor-pointer hover:bg-parchment/40"
                                >
                                    <td className="px-6 py-3.5 text-ink">
                                        {new Date(t.createdAt).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </td>
                                    <td className="px-6 py-3.5 text-ink-soft">{t.cashierName}</td>
                                    <td className="px-6 py-3.5 text-ink-soft">
                                        {t.items.reduce((s, i) => s + i.qty, 0)} item
                                    </td>
                                    <td className="px-6 py-3.5 text-ink-soft capitalize">
                                        {t.payment}
                                    </td>
                                    <td className="px-6 py-3.5 text-right font-mono font-semibold text-ink">
                                        {formatRupiah(t.total)}
                                    </td>
                                </tr>
                                {expandedId === t.id && (
                                    <tr className="bg-parchment/30">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                {t.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between text-sm text-ink-soft"
                                                    >
                                                        <span>
                                                            {item.qty}x {item.name}
                                                        </span>
                                                        <span className="font-mono">
                                                            {formatRupiah(item.qty * item.price)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center text-ink-soft">
                                    <ReceiptText
                                        size={32}
                                        className="mx-auto mb-3 text-ink-soft/40"
                                    />
                                    Tidak ada transaksi pada rentang tanggal ini.
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
