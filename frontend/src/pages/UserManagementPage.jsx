import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

import { getUsers, addUser, updateUser, deleteUser } from '../lib/db';
import api from '../lib/api';
import { getCurrentUser } from '../lib/auth';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'kasir' };

const UserManagementPage = () => {
    const currentUser = getCurrentUser();
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kasir');
            if (Array.isArray(response.data)) {
            setUsers(response.data);
            } else {
                setUsers([]); 
            }
        } catch (err) {
            console.error("Gagal mengambil data user:", err);
            setUsers([]); 
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError('');
        setIsModalOpen(true);
    };

    const openEdit = (user) => {
        setEditingId(user.id);
        setForm({ name: user.name, email: user.email, password: '', role: user.role });
        setError('');
        setIsModalOpen(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            if (editingId) {
                const patch = {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    role: form.role,
                };
                if (form.password) patch.password = form.password;

                await api.put(`/kasir/${editingId}`, patch);
            } else {
        
                if (!form.password) {
                    setError('Password wajib diisi');
                    return;
                }
                
                await api.post('/kasir', {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    role: form.role,
                });
            }

            await fetchUsers();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data ke database.');
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser?.id) {
            alert('Anda tidak bisa menghapus akun sendiri.');
            return;
        }
        if (confirm('Hapus pengguna ini?')) {
            try {
                await api.delete(`/users/${id}`);
                alert('Pengguna berhasil dihapus!');
                await fetchUsers(); 
            } catch (err) {
                alert(err.response?.data?.message || 'Gagal menghapus pengguna.');
            }
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold text-ink">
                        Manajemen Pengguna
                    </h1>
                    <p className="mt-1 text-ink-soft">Kelola akun owner dan kasir.</p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-copper px-4 py-2.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-copper-dark"
                >
                    <Plus size={18} />
                    Tambah Pengguna
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-soft/10">
                <table className="w-full text-left text-sm">
                    <thead className="bg-parchment text-xs uppercase tracking-wide text-ink-soft">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Nama</th>
                            <th className="px-6 py-3 font-semibold">Email</th>
                            <th className="px-6 py-3 font-semibold">Peran</th>
                            <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-soft/10">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-parchment/40">
                                <td className="px-6 py-3.5 font-medium text-ink">
                                    {user.name}
                                    {user.id === currentUser?.id && (
                                        <span className="ml-2 rounded-full bg-copper/15 px-2 py-0.5 text-xs font-medium text-copper-dark">
                                            Anda
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-3.5 text-ink-soft">{user.email}</td>
                                <td className="px-6 py-3.5">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                            user.role === 'owner'
                                                ? 'bg-copper/15 text-copper-dark'
                                                : 'bg-sage/15 text-sage-dark'
                                        }`}
                                    >
                                       {user.role === 'owner' || user.role === 'admin' ? 'Owner' : 'Kasir'}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(user)}
                                            className="rounded-lg p-2 text-ink-soft transition hover:bg-copper/10 hover:text-copper"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(user.id)}
                                            className="rounded-lg p-2 text-ink-soft transition hover:bg-brick/10 hover:text-brick"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-display text-xl font-semibold text-ink">
                                {editingId ? 'Ubah Pengguna' : 'Tambah Pengguna'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1.5 text-ink-soft hover:bg-parchment"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-brick/30 bg-brick/10 px-4 py-2.5 text-sm text-brick">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-ink">
                                    Nama
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
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-ink-soft/25 px-3 py-2.5 outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-ink">
                                    Password {editingId && (
                                        <span className="font-normal text-ink-soft">
                                            (kosongkan jika tidak diubah)
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-ink-soft/25 px-3 py-2.5 outline-none focus:border-copper focus:ring-4 focus:ring-copper/15"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-ink">
                                    Peran
                                </label>
                                <input
                                    type="text"
                                    value="Kasir"
                                    disabled
                                    className="w-full rounded-lg border border-ink-soft/25 bg-parchment/50 px-3 py-2.5 font-medium text-ink-soft cursor-not-allowed outline-none"
                                />
                            </div>

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

export default UserManagementPage;
