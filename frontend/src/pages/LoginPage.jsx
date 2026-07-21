import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Coffee } from 'lucide-react';

import { login, isAuthenticated } from '../lib/auth';

const LoginPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!form.email.trim() || !form.password) {
            setError('Email dan password wajib diisi.');
            return;
        }

        setIsLoading(true);
        try {
            const session = await login(form.email.trim(), form.password);
            const target = session.role === 'owner' ? '/dashboard' : '/transaksi';
            navigate(target, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login gagal.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-espresso px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-copper text-cream shadow-lg">
                        <Coffee size={26} strokeWidth={2} />
                    </div>
                    <h1 className="font-display text-3xl font-semibold text-cream">
                        Kopi Kasir
                    </h1>
                    <p className="mt-1 text-sm text-parchment/60">
                        Sistem kasir untuk cafe Anda
                    </p>
                </div>

                <div className="ticket-edge rounded-2xl bg-cream p-8 pt-10 shadow-2xl">
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-semibold text-ink"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="owner@kopikasir.test"
                                autoComplete="email"
                                className="block w-full rounded-lg border border-ink-soft/25 bg-white px-3 py-2.5 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-copper focus:ring-4 focus:ring-copper/15"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-semibold text-ink"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Masukkan password"
                                autoComplete="current-password"
                                className="block w-full rounded-lg border border-ink-soft/25 bg-white px-3 py-2.5 text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-copper focus:ring-4 focus:ring-copper/15"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-copper px-4 py-3 font-semibold text-cream shadow-sm transition hover:bg-copper-dark focus:outline-none focus:ring-4 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
