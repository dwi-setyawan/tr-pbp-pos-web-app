import { useEffect, useMemo, useState } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, CheckCircle2 } from 'lucide-react';

import { getProducts, createTransaction, addTransactionItem, checkoutTransaction } from '../lib/transactionService';
import { getCurrentUser } from '../lib/auth';

// Backend pakai "coffee"/"non-coffee", tampilan pakai "Kopi"/"Non-Kopi"
const CATEGORY_MAP = { coffee: 'Kopi', 'non-coffee': 'Non-Kopi' };

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const CATEGORIES = ['Semua', 'Kopi', 'Non-Kopi'];

const TransactionPage = () => {
    const user = getCurrentUser();
    
    const [menu, setMenu] = useState([]);
    const loadProducts = async () => {
        const products = await getProducts();
        setMenu(
            products.map((p) => ({
                ...p,
                category: CATEGORY_MAP[p.category] || p.category,
                active: true, // backend belum ada field 'active', anggap semua aktif
            }))
        );
    };
    useEffect(() => {
        loadProducts();
    }, []);

    const [category, setCategory] = useState('Semua');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [payment, setPayment] = useState('tunai');
    const [cashGiven, setCashGiven] = useState('');
    const [receipt, setReceipt] = useState(null);

    const visibleMenu = menu.filter((item) => {
        const matchesCategory = category === 'Semua' || item.category === category;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch && item.active;
    });

    const addToCart = (item) => {
        setCart((current) => {
            const existing = current.find((c) => c.id === item.id);
            const inCartQty = existing ? existing.qty : 0;

            if (inCartQty >= item.stock) return current;

            if (existing) {
                return current.map((c) =>
                    c.id === item.id ? { ...c, qty: c.qty + 1 } : c
                );
            }
            return [...current, { id: item.id, name: item.name, price: item.price, qty: 1 }];
        });
    };

    const changeQty = (id, delta) => {
        setCart((current) =>
            current
                .map((c) => {
                    if (c.id !== id) return c;
                    const stock = menu.find((m) => m.id === id)?.stock ?? Infinity;
                    const nextQty = Math.min(stock, Math.max(0, c.qty + delta));
                    return { ...c, qty: nextQty };
                })
                .filter((c) => c.qty > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((current) => current.filter((c) => c.id !== id));
    };

    const total = useMemo(
        () => cart.reduce((sum, c) => sum + c.qty * c.price, 0),
        [cart]
    );

    const change = payment === 'tunai' ? Math.max(0, Number(cashGiven || 0) - total) : 0;
    const canCheckout =
        cart.length > 0 && (payment !== 'tunai' || Number(cashGiven || 0) >= total);

const handleCheckout = async () => {
    if (!canCheckout) return;

    try {
        const transaction = await createTransaction();

        for (const item of cart) {
            await addTransactionItem(transaction.id, item.id, item.qty);
        }

        const amountPaid = payment === 'tunai' ? Number(cashGiven) : total;
        const result = await checkoutTransaction(
            transaction.id,
            payment === 'tunai' ? 'cash' : 'qris',
            amountPaid
        );

        await loadProducts(); // refresh stok terbaru dari backend

        setReceipt({
            items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
            total: result.totalAmount,
            payment: result.paymentMethod,
            createdAt: result.transactionDate,
        });
        setCart([]);
        setCashGiven('');
        setPayment('tunai');
    } catch (err) {
        alert(err.response?.data?.message || 'Checkout gagal, coba lagi.');
    }
};

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-6">
            <div className="flex flex-1 flex-col">
                <div className="mb-4">
                    <h1 className="font-display text-2xl font-semibold text-ink">
                        Transaksi Baru
                    </h1>
                    <p className="text-sm text-ink-soft">Pilih menu untuk ditambahkan ke keranjang.</p>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari menu..."
                        className="w-full max-w-xs rounded-lg border border-ink-soft/25 bg-white px-3 py-2 text-sm outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                    />

                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                                    category === c
                                        ? 'bg-espresso text-cream'
                                        : 'bg-white text-ink-soft ring-1 ring-ink-soft/20 hover:bg-parchment'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="scrollbar-thin grid flex-1 auto-rows-min grid-cols-2 gap-4 overflow-y-auto p-2 pb-2 pr-1 sm:grid-cols-3 xl:grid-cols-4">
                    {visibleMenu.map((item) => {
                        const inCart = cart.find((c) => c.id === item.id)?.qty || 0;
                        const soldOut = item.stock <= 0;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                disabled={soldOut || inCart >= item.stock}
                                onClick={() => addToCart(item)}
                                className="group relative flex flex-col items-start rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-ink-soft/10 transition hover:shadow-md hover:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {inCart > 0 && (
                                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-copper text-xs font-bold text-cream shadow">
                                        {inCart}
                                    </span>
                                )}
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    <span className="flex h-16 w-full items-center justify-center rounded-lg bg-parchment text-3xl">
                                        {item.emoji}
                                    </span>
                                )}
                                <span className="mt-2 line-clamp-2 text-sm font-semibold text-ink">
                                    {item.name}
                                </span>
                                <span className="mt-1 font-mono text-sm text-copper-dark">
                                    {formatRupiah(item.price)}
                                </span>
                                <span
                                    className={`mt-1.5 text-xs ${
                                        soldOut
                                            ? 'font-semibold text-brick'
                                            : item.stock <= 10
                                            ? 'text-brick/80'
                                            : 'text-ink-soft'
                                    }`}
                                >
                                    {soldOut ? 'Stok habis' : `Stok ${item.stock}`}
                                </span>
                            </button>
                        );
                    })}

                    {visibleMenu.length === 0 && (
                        <p className="col-span-full py-16 text-center text-ink-soft">
                            Tidak ada menu yang cocok.
                        </p>
                    )}
                </div>
            </div>

            <div className="ticket-edge flex w-96 shrink-0 flex-col rounded-2xl bg-white pt-8 shadow-sm ring-1 ring-ink-soft/10">
                <div className="flex items-center gap-2 border-b border-dashed border-ink-soft/20 px-6 pb-4">
                    <ShoppingBag size={18} className="text-copper" />
                    <h2 className="font-display text-lg font-semibold text-ink">Keranjang</h2>
                </div>

                <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-4">
                    {cart.length === 0 ? (
                        <p className="py-10 text-center text-sm text-ink-soft">
                            Keranjang masih kosong.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-ink">{item.name}</p>
                                        <p className="font-mono text-xs text-ink-soft">
                                            {formatRupiah(item.price)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => changeQty(item.id, -1)}
                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-parchment text-ink-soft hover:bg-copper/20"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-5 text-center text-sm font-semibold text-ink">
                                            {item.qty}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => changeQty(item.id, 1)}
                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-parchment text-ink-soft hover:bg-copper/20"
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.id)}
                                            className="ml-1 text-ink-soft/50 hover:text-brick"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-dashed border-ink-soft/20 px-6 py-4">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="font-display text-base font-semibold text-ink">
                            Total
                        </span>
                        <span className="font-mono text-xl font-bold text-copper-dark">
                            {formatRupiah(total)}
                        </span>
                    </div>

                    <div className="mb-3 grid grid-cols-3 gap-2">
                        {['tunai', 'qris'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPayment(method)}
                                className={`rounded-lg px-2 py-2 text-xs font-semibold capitalize transition ${
                                    payment === method
                                        ? 'bg-espresso text-cream'
                                        : 'bg-parchment text-ink-soft hover:bg-parchment/70'
                                }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>

                    {payment === 'tunai' && (
                        <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold text-ink-soft">
                                Uang Diterima
                            </label>
                            <input
                                type="number"
                                value={cashGiven}
                                onChange={(e) => setCashGiven(e.target.value)}
                                min="0"
                                placeholder="0"
                                className="w-full rounded-lg border border-ink-soft/25 px-3 py-2 font-mono text-sm outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                            />
                            {Number(cashGiven || 0) > 0 && (
                                <p className="mt-1 text-xs text-ink-soft">
                                    Kembalian:{' '}
                                    <span className="font-mono font-semibold text-sage-dark">
                                        {formatRupiah(change)}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={!canCheckout}
                        onClick={handleCheckout}
                        className="w-full rounded-lg bg-copper px-4 py-3 font-semibold text-cream shadow-sm transition hover:bg-copper-dark disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Bayar Sekarang
                    </button>
                </div>
            </div>

            {receipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex flex-col items-center text-center">
                            <CheckCircle2 size={40} className="mb-2 text-sage" />
                            <h2 className="font-display text-xl font-semibold text-ink">
                                Pembayaran Berhasil
                            </h2>
                            <p className="text-sm text-ink-soft">
                                {new Date(receipt.createdAt).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </p>
                        </div>

                        <div className="ticket-edge rounded-xl bg-parchment p-4 pt-6 font-mono text-sm">
                            {receipt.items.map((item, idx) => (
                                <div key={idx} className="mb-1 flex justify-between text-ink">
                                    <span>
                                        {item.qty}x {item.name}
                                    </span>
                                    <span>{formatRupiah(item.qty * item.price)}</span>
                                </div>
                            ))}
                            <div className="my-2 border-t border-dashed border-ink-soft/30" />
                            <div className="flex justify-between font-semibold text-ink">
                                <span>Total</span>
                                <span>{formatRupiah(receipt.total)}</span>
                            </div>
                            <div className="mt-1 flex justify-between text-ink-soft">
                                <span>Metode</span>
                                <span className="capitalize">{receipt.payment}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setReceipt(null)}
                            className="mt-5 w-full rounded-lg bg-copper px-4 py-2.5 font-semibold text-cream transition hover:bg-copper-dark"
                        >
                            Transaksi Baru
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionPage;
