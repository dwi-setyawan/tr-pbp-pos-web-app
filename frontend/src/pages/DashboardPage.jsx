import { useState, useEffect, useMemo } from 'react';
import { Wallet, ReceiptText, TrendingUp, Package, Award } from 'lucide-react';
import api from '../lib/api';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const [cards, setCards] = useState({
        totalPendapatan: 0,
        totalTransactions: 0,
        totalItemsSold: 0,
        averagePerTransaction: 0,
    });
    const [transactions, setTransactions] = useState([]);

   
    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error('Gagal memuat info user:', err);
        }
    }, []);


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports');

            if (response.data.success) {
                setCards(response.data.data.cards);
                setTransactions(response.data.data.table || []);
            }
        } catch (err) {
            console.error('Gagal mengambil data dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const topProducts = useMemo(() => {
        const productMap = {};

        transactions.forEach((t) => {
            if (t.products && Array.isArray(t.products)) {
                t.products.forEach((p) => {
                    // Ekstrak kuantitas dan nama produk dari string "2x Teh Melati"
                    const match = p.detailString?.match(/^(\d+)x\s+(.*)$/);
                    if (match) {
                        const qty = parseInt(match[1], 10) || 0;
                        const name = match[2];

                        if (!productMap[name]) {
                            productMap[name] = { name, quantity: 0, revenue: 0 };
                        }
                        productMap[name].quantity += qty;
                        productMap[name].revenue += (p.subtotal || 0);
                    }
                });
            }
        });

        return Object.values(productMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [transactions]);

    const topItemLabel = topProducts.length > 0
        ? `${topProducts[0].name} (${topProducts[0].quantity}x)`
        : '—';

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-semibold text-ink">
                    Selamat datang, {user?.name?.split(' ')[0] || 'Admin'} 👋
                </h1>
                <p className="mt-1 text-ink-soft">
                    Ini ringkasan performa cafe Anda hari ini.
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    icon={Wallet}
                    label="Pendapatan Hari Ini"
                    value={formatRupiah(cards.totalPendapatan)}
                    accent="#be6a3a"
                />
                <StatCard
                    icon={ReceiptText}
                    label="Transaksi Hari Ini"
                    value={cards.totalTransactions}
                    accent="#7a8b69"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Menu Terlaris"
                    value={topItemLabel}
                    accent="#9a5228"
                />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-soft/10">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-xl font-semibold text-ink">
                            5 Menu Terlaris Hari Ini
                        </h2>
                        <p className="mt-0.5 text-xs text-ink-soft">
                            Daftar menu dengan peringkat penjualan tertinggi hari ini.
                        </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-parchment text-copper">
                        <Award size={22} />
                    </div>
                </div>
                
                {!loading && topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-parchment/60 text-xs uppercase tracking-wide text-ink-soft">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Peringkat</th>
                                    <th className="px-4 py-3 font-semibold">Nama Menu</th>
                                    <th className="px-4 py-3 font-semibold text-center">Jumlah Terjual</th>
                                    <th className="px-4 py-3 font-semibold text-right">Total Penjualan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink-soft/10">
                                {topProducts.map((prod, idx) => (
                                    <tr key={idx} className="hover:bg-parchment/30">
                                        <td className="px-4 py-3.5 font-bold text-copper">
                                            #{idx + 1}
                                        </td>
                                        <td className="px-4 py-3.5 font-medium text-ink">
                                            {prod.name}
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-ink-soft">
                                            <span className="inline-flex items-center rounded-full bg-parchment px-3 py-1 text-xs font-semibold text-ink">
                                                {prod.quantity} pcs
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-ink">
                                            {formatRupiah(prod.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-ink-soft">
                        <Package size={32} className="mx-auto mb-2 text-ink-soft/40" />
                        Belum ada transaksi menu hari ini.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;