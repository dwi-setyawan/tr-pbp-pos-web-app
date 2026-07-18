// Sebagai ujicoba
const KEYS = {
    users: 'pos_users',
    menu: 'pos_menu',
    transactions: 'pos_transactions',
    session: 'pos_session',
};

const uid = () => Math.random().toString(36).slice(2, 10);

const read = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const SEED_USERS = [
    {
        id: uid(),
        name: 'Bu Ratna',
        email: 'owner@kopikasir.test',
        password: 'owner123',
        role: 'owner',
    },
    {
        id: uid(),
        name: 'Dimas',
        email: 'kasir@kopikasir.test',
        password: 'kasir123',
        role: 'kasir',
    },
];

const SEED_MENU = [
    { id: uid(), name: 'Kopi Susu Gula Aren', category: 'Kopi', price: 22000, stock: 40, emoji: '🥤', image: null, active: true },
    { id: uid(), name: 'Espresso', category: 'Kopi', price: 18000, stock: 50, emoji: '☕', image: null, active: true },
    { id: uid(), name: 'Cappuccino', category: 'Kopi', price: 25000, stock: 30, emoji: '☕', image: null, active: true },
    { id: uid(), name: 'Matcha Latte', category: 'Non-Kopi', price: 27000, stock: 25, emoji: '🍵', image: null, active: true },
    { id: uid(), name: 'Cokelat Panas', category: 'Non-Kopi', price: 23000, stock: 20, emoji: '🍫', image: null, active: true },
    { id: uid(), name: 'Teh Melati', category: 'Non-Kopi', price: 12000, stock: 40, emoji: '🍃', image: null, active: true },
    { id: uid(), name: 'Croissant', category: 'Makanan', price: 20000, stock: 15, emoji: '🥐', image: null, active: true },
    { id: uid(), name: 'Roti Bakar Coklat', category: 'Makanan', price: 18000, stock: 20, emoji: '🍞', image: null, active: true },
    { id: uid(), name: 'Kentang Goreng', category: 'Makanan', price: 17000, stock: 25, emoji: '🍟', image: null, active: true },
];

export const ensureSeeded = () => {
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users, SEED_USERS);
    if (!localStorage.getItem(KEYS.menu)) write(KEYS.menu, SEED_MENU);
    if (!localStorage.getItem(KEYS.transactions)) write(KEYS.transactions, []);
};

// --- Users ---
export const getUsers = () => read(KEYS.users, []);
export const saveUsers = (users) => write(KEYS.users, users);

export const addUser = (user) => {
    const users = getUsers();
    const next = [...users, { id: uid(), ...user }];
    saveUsers(next);
    return next;
};

export const updateUser = (id, patch) => {
    const next = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
    saveUsers(next);
    return next;
};

export const deleteUser = (id) => {
    const next = getUsers().filter((u) => u.id !== id);
    saveUsers(next);
    return next;
};

export const findUserByCredentials = (email, password) =>
    getUsers().find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

// --- Menu ---
export const getMenu = () => read(KEYS.menu, []);
export const saveMenu = (menu) => write(KEYS.menu, menu);

export const addMenuItem = (item) => {
    const next = [...getMenu(), { id: uid(), active: true, ...item }];
    saveMenu(next);
    return next;
};

export const updateMenuItem = (id, patch) => {
    const next = getMenu().map((m) => (m.id === id ? { ...m, ...patch } : m));
    saveMenu(next);
    return next;
};

export const deleteMenuItem = (id) => {
    const next = getMenu().filter((m) => m.id !== id);
    saveMenu(next);
    return next;
};

export const adjustStock = (id, delta) => {
    const next = getMenu().map((m) =>
        m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m
    );
    saveMenu(next);
    return next;
};

// --- Transactions ---
export const getTransactions = () => read(KEYS.transactions, []);

export const addTransaction = (tx) => {
    const next = [{ id: uid(), createdAt: new Date().toISOString(), ...tx }, ...getTransactions()];
    write(KEYS.transactions, next);
    return next;
};

// --- Session ---
export const getSession = () => read(KEYS.session, null);
export const setSession = (session) => write(KEYS.session, session);
export const clearSession = () => localStorage.removeItem(KEYS.session);
