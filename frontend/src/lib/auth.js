import {
    findUserByCredentials,
    getSession,
    setSession,
    clearSession,
} from './db';

export const login = (email, password) => {
    const user = findUserByCredentials(email, password);

    if (!user) {
        throw new Error('Email atau password salah.');
    }

    const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    setSession(session);
    return session;
};

export const logout = () => {
    clearSession();
};

export const getCurrentUser = () => getSession();

export const isAuthenticated = () => Boolean(getSession());
