import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);   // { id, full_name, role, ... }
    const [loading, setLoading] = useState(true);

    // App ochilganda localStorage'dan tokenni o‘qib ko‘ramiz
    useEffect(() => {
        const storedUser = localStorage.getItem('rt_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, user } = res.data;

        localStorage.setItem('rt_token', token);
        localStorage.setItem('rt_user', JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('rt_token');
        localStorage.removeItem('rt_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
