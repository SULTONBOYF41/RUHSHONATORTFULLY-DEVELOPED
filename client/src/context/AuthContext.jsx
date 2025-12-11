// client/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);   // { id, full_name, role, ... }
    const [loading, setLoading] = useState(true);

    // Sessiya tugaganini ko'rsatish uchun flag
    const [sessionExpired, setSessionExpired] = useState(false);

    // App ochilganda localStorage'dan token/userni o‘qib ko‘ramiz
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('rt_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            // URL'dan ?expired=1 ni tekshiramiz
            const params = new URLSearchParams(window.location.search);
            if (params.get('expired') === '1') {
                setSessionExpired(true);

                // expired=1 ni URL'dan olib tashlaymiz (ko'rinish uchun toza bo'lsin)
                params.delete('expired');
                const newSearch = params.toString();
                const newUrl =
                    window.location.pathname + (newSearch ? `?${newSearch}` : '');
                window.history.replaceState({}, '', newUrl);
            }
        } catch (e) {
            console.error('Auth init error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, user } = res.data;

        localStorage.setItem('rt_token', token);
        localStorage.setItem('rt_user', JSON.stringify(user));
        setUser(user);
        setSessionExpired(false); // qayta login bo‘lgandan keyin banner yo‘qolsin
    };

    const logout = () => {
        localStorage.removeItem('rt_token');
        localStorage.removeItem('rt_user');
        setUser(null);
    };

    const clearSessionExpired = () => {
        setSessionExpired(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                sessionExpired,
                clearSessionExpired,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
