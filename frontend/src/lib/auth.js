import { loginRequest } from './authService';

const SESSION_KEY = 'session';

const normalizeRole = (backendRole) => (backendRole === 'admin' ? 'owner' : backendRole);

export const login = async (email, password) => {
    const data = await loginRequest(email, password);

    const session = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: normalizeRole(data.user.role),
    };

    sessionStorage.setItem('token', data.token);
    localStorage.setItem('token', data.token);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
};

export const logout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
};

export const getSession = () => {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
};

export const getCurrentUser = () => getSession();

export const isAuthenticated = () => Boolean(getSession());


