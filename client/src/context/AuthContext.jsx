import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('bharatfix_token');
        const savedUser = localStorage.getItem('bharatfix_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        const { user: u, token: t } = data.data;
        setUser(u);
        setToken(t);
        localStorage.setItem('bharatfix_token', t);
        localStorage.setItem('bharatfix_user', JSON.stringify(u));
        return u;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        const { user: u, token: t } = data.data;
        setUser(u);
        setToken(t);
        localStorage.setItem('bharatfix_token', t);
        localStorage.setItem('bharatfix_user', JSON.stringify(u));
        return u;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore logout API errors
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('bharatfix_token');
        localStorage.removeItem('bharatfix_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
