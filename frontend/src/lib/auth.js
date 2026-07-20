import { loginRequest } from './authService';

const SESSION_KEY = 'session';

// Backend pakai "admin", frontend pakai "owner" — disamakan di sini saja
const normalizeRole = (backendRole) => (backendRole === 'admin' ? 'owner' : backendRole);

export const login = async (email, password) => {
    const data = await loginRequest(email, password);

    const session = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: normalizeRole(data.user.role),
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(SESSION_KEY);
};

export const getSession = () => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
};

export const getCurrentUser = () => getSession();

export const isAuthenticated = () => Boolean(getSession());