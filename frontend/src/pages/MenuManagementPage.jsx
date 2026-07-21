import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, ImagePlus, ImageOff } from 'lucide-react';

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getImageUrl,
} from '../lib/productService';
import { fileToCompressedDataUrl } from '../lib/image';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const CATEGORY_DISPLAY = {
    coffee: 'Kopi',
    'non-coffee': 'Non-Kopi',
};

const CATEGORY_VALUE = {
    Kopi: 'coffee',
    'Non-Kopi': 'non-coffee',
};

const EMPTY_FORM = {
    name: '',
    category: 'Kopi',
    price: '',
    stock: '',
    emoji: '☕',
    image: null,
    isActive: true,
};

const MenuManagementPage = () => {
    const [menu, setMenu] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [search, setSearch] = useState('');
    const [imageError, setImageError] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    const loadMenu = async () => {
        try {
            const products = await getProducts();
            setMenu(
                products.map((item) => ({
                    ...item,
                    category: CATEGORY_DISPLAY[item.category] || item.category,
                    isActive: item.isActive ?? true,
                    image: getImageUrl(item.image),
                }))
            );
        } catch (err) {
            console.error('Gagal memuat produk:', err);
        }
    };

    useEffect(() => {
        loadMenu();
    }, []);

    const filtered = menu.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setImageError('');
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            category: item.category,
            price: item.price,
            stock: item.stock,
            emoji: item.emoji,
            image: item.image || null,
            isActive: item.isActive,
        });
        setImageFile(null);
        setImageError('');
        setIsModalOpen(true);
    };

    const handleImageSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setImageError('');
        setIsUploadingImage(true);

        try {
            const dataUrl = await fileToCompressedDataUrl(file);
            setForm((current) => ({ ...current, image: dataUrl }));
            setImageFile(file);
        } catch (err) {
            setImageError(err.message);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setForm((current) => ({ ...current, image: null }));
        setImageFile(null);
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: form.name.trim(),
            category: CATEGORY_VALUE[form.category] || form.category,
            price: Number(form.price) || 0,
            stock: Number(form.stock) || 0,
            emoji: form.emoji || '☕',
            isActive: Boolean(form.isActive),
        };

        if (!payload.name) return;

        try {
            if (editingId) {
                await updateProduct(editingId, payload, imageFile);
            } else {
                await createProduct(payload, imageFile);
            }
            await loadMenu();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Gagal menyimpan produk:', err);
            setImageError(err.response?.data?.message || err.message || 'Gagal menyimpan produk.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus menu ini?')) return;

        try {
            await deleteProduct(id);
            await loadMenu();
        } catch (err) {
            console.error('Gagal menghapus produk:', err);
            alert(err.response?.data?.message || 'Gagal menghapus produk.');
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-ink">
                        Manajemen Menu
                    </h1>
                    <p className="mt-1 text-ink-soft">Kelola daftar menu, harga, dan stok.</p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-copper-dark"
                >
                    <Plus size={18} />
                    Tambah Menu
                </button>
            </div>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu..."
                className="mb-6 w-full max-w-sm rounded-lg border border-ink-soft/25 bg-white px-3 py-2.5 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-copper focus:ring-4 focus:ring-copper/15"
            />

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-soft/10">
                <table className="w-full text-left text-sm">
                    <thead className="bg-parchment text-xs uppercase tracking-wide text-ink-soft">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Menu</th>
                            <th className="px-6 py-3 font-semibold">Kategori</th>
                            <th className="px-6 py-3 font-semibold">Harga</th>
                            <th className="px-6 py-3 font-semibold">Stok</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-soft/10">
                        {filtered.map((item) => (
                            <tr key={item.id} className="hover:bg-parchment/40">
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-3">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-ink-soft/10"
                                            />
                                        ) : (
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment text-lg">
                                                {item.emoji}
                                            </span>
                                        )}
                                        <span className="font-medium text-ink">{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5 text-ink-soft">{item.category}</td>
                                <td className="px-6 py-3.5 font-mono text-ink">
                                    {formatRupiah(item.price)}
                                </td>
                                <td className="px-6 py-3.5 text-ink">
                                    <span className={item.stock <= 10 ? 'font-semibold text-brick' : ''}>
                                        {item.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                            item.isActive
                                                ? 'bg-sage/15 text-sage-dark'
                                                : 'bg-ink-soft/15 text-ink-soft'
                                        }`}
                                    >
                                        {item.isActive ? 'Tersedia' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(item)}
                                            className="rounded-lg p-2 text-ink-soft transition hover:bg-copper/10 hover:text-copper"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            className="rounded-lg p-2 text-ink-soft transition hover:bg-brick/10 hover:text-brick"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-ink-soft">
                                    Tidak ada menu ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-display text-xl font-semibold text-ink">
                                {editingId ? 'Ubah Menu' : 'Tambah Menu'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1.5 text-ink-soft hover:bg-parchment"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-ink">
                                    Foto Menu
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-parchment ring-1 ring-ink-soft/10">
                                        {form.image ? (
                                            <img
                                                src={form.image}
                                                alt="Pratinjau menu"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl">{form.emoji || '☕'}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                            className="flex items-center justify-center gap-2 rounded-lg border border-ink-soft/25 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-parchment disabled:opacity-60"
                                        >
                                            <ImagePlus size={16} />
                                            {isUploadingImage
                                                ? 'Mengunggah...'
                                                : form.image
                                                ? 'Ganti Foto'
                                                : 'Unggah Foto'}
                                        </button>

                                        {form.image && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-brick"
                                            >
                                                <ImageOff size={14} />
                                                Hapus foto, pakai ikon
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {imageError && (
                                    <p className="mt-2 text-xs font-medium text-brick">{imageError}</p>
                                )}

                                {!form.image && (
                                    <div className="mt-3">
                                        <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
                                            Ikon cadangan (dipakai jika belum ada foto)
                                        </label>
                                        <input
                                            name="emoji"
                                            value={form.emoji}
                                            onChange={handleChange}
                                            className="w-20 rounded-lg border border-ink-soft/25 px-3 py-2 text-center outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-ink">
                                    Nama Menu
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-ink-soft/25 px-3 py-2.5 outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-ink">
                                    Kategori
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-ink-soft/25 bg-white px-3 py-2.5 outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                >
                                    <option>Kopi</option>
                                    <option>Non-Kopi</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-ink">
                                        Harga (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full rounded-lg border border-ink-soft/25 px-3 py-2.5 outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-ink">
                                        Stok
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full rounded-lg border border-ink-soft/25 px-3 py-2.5 outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm font-medium text-ink">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={form.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-ink-soft/40 text-copper focus:ring-copper"
                                />
                                Tersedia untuk dijual
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-lg border border-ink-soft/25 px-4 py-2.5 font-semibold text-ink-soft transition hover:bg-parchment"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-copper px-4 py-2.5 font-semibold text-cream transition hover:bg-copper-dark"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagementPage;
