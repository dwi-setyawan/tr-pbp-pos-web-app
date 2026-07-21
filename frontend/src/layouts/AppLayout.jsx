import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
    LayoutGrid,
    Coffee,
    Users,
    ReceiptText,
    ShoppingCart,
    LogOut,
} from 'lucide-react';

import { getCurrentUser } from '../lib/auth';
import { logout } from '../lib/auth';

const NAV_ITEMS = {
    owner: [
        { to: '/dashboard', label: 'Dasbor', icon: LayoutGrid },
        // { to: '/transaksi', label: 'Transaksi', icon: ShoppingCart },
        { to: '/menu', label: 'Menu', icon: Coffee },
        { to: '/users', label: 'Pengguna', icon: Users },
        { to: '/laporan', label: 'Laporan', icon: ReceiptText },
    ],
    kasir: [{ to: '/transaksi', label: 'Transaksi', icon: ShoppingCart }],
};

const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();
    const items = NAV_ITEMS[user?.role] || [];
    const hideSidebar = location.pathname === '/transaksi';

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            isActive
                ? 'bg-copper text-cream shadow-sm'
                : 'text-parchment/70 hover:bg-espresso-light hover:text-cream'
        }`;

    return (
        <div className="flex min-h-screen bg-cream">
            <aside className="flex w-64 shrink-0 flex-col bg-espresso px-4 py-6">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <span className="text-2xl">☕</span>
                    <div>
                        <p className="font-display text-lg font-semibold leading-tight text-cream">
                            Brew Coffee
                        </p>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col gap-1.5">
                    {items.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={to} className={linkClass}>
                            <Icon size={18} strokeWidth={2} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto border-t border-cream/10 pt-4">
                    <div className="mb-3 px-2">
                        <p className="truncate text-sm font-semibold text-cream">
                            {user?.name}
                        </p>
                        <p className="text-xs capitalize text-parchment/60">
                            {user?.role === 'owner' ? 'Pemilik' : 'Kasir'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-brick/90 transition hover:bg-brick/10"
                    >
                        <LogOut size={18} strokeWidth={2} />
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
