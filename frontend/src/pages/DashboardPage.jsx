import { useMemo } from 'react';
import { Wallet, ReceiptText, TrendingUp, Package } from 'lucide-react';

import { getTransactions, getMenu } from '../lib/db';
import { getCurrentUser } from '../lib/auth';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const isSameDay = (isoDate, ref) => {
    const d = new Date(isoDate);
    return (
        d.getFullYear() === ref.getFullYear() &&
        d.getMonth() === ref.getMonth() &&
        d.getDate() === ref.getDate()
    );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className="ticket-edge rounded-2xl bg-white p-6 pt-8 shadow-sm ring-1 ring-ink-soft/10">
        <div
            className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: accent + '20', color: accent }}
        >
            <Icon size={20} strokeWidth={2} />
        </div>
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
);

const DashboardPage = () => {
    const user = getCurrentUser();
    const transactions = getTransactions();
    const menu = getMenu();

    const today = new Date();

    const stats = useMemo(() => {
        const todays = transactions.filter((t) => isSameDay(t.createdAt, today));
        const revenueToday = todays.reduce((sum, t) => sum + t.total, 0);

        const itemCounts = {};
        transactions.forEach((t) => {
            t.items.forEach((item) => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
            });
        });

        const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
        const lowStock = menu.filter((m) => m.stock <= 10 && m.active).length;

        return {
            revenueToday,
            countToday: todays.length,
            topItem: topItem ? `${topItem[0]} (${topItem[1]}x)` : '—',
            lowStock,
        };
    }, [transactions, menu]);

    const last7Days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, idx) => {
            const day = new Date();
            day.setDate(day.getDate() - (6 - idx));
            const total = transactions
                .filter((t) => isSameDay(t.createdAt, day))
                .reduce((sum, t) => sum + t.total, 0);
            return {
                label: day.toLocaleDateString('id-ID', { weekday: 'short' }),
                total,
            };
        });
    }, [transactions]);

    const maxTotal = Math.max(...last7Days.map((d) => d.total), 1);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-semibold text-ink">
                    Selamat datang, {user?.name?.split(' ')[0] || 'Pemilik'} 👋
                </h1>
                <p className="mt-1 text-ink-soft">
                    Ini ringkasan performa cafe Anda hari ini.
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Wallet}
                    label="Pendapatan Hari Ini"
                    value={formatRupiah(stats.revenueToday)}
                    accent="#be6a3a"
                />
                <StatCard
                    icon={ReceiptText}
                    label="Transaksi Hari Ini"
                    value={stats.countToday}
                    accent="#7a8b69"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Menu Terlaris"
                    value={stats.topItem}
                    accent="#9a5228"
                />
                <StatCard
                    icon={Package}
                    label="Stok Menipis"
                    value={`${stats.lowStock} item`}
                    accent="#b33f3f"
                />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-soft/10">
                <h2 className="mb-6 font-display text-lg font-semibold text-ink">
                    Pendapatan 7 Hari Terakhir
                </h2>
                <div className="flex items-end gap-4" style={{ height: 180 }}>
                    {last7Days.map((day, idx) => (
                        <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                            <div className="flex h-full w-full items-end">
                                <div
                                    className="w-full rounded-t-lg bg-copper/80 transition-all"
                                    style={{
                                        height: `${(day.total / maxTotal) * 100}%`,
                                        minHeight: day.total > 0 ? 6 : 2,
                                        backgroundColor: day.total > 0 ? '#be6a3a' : '#e0a877',
                                    }}
                                    title={formatRupiah(day.total)}
                                />
                            </div>
                            <span className="text-xs font-medium capitalize text-ink-soft">
                                {day.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
