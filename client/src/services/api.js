// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Har bir requestdan oldin tokenni headerga qo'shamiz
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('rt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Har bir responsedan keyin 401 / jwt expired'ni ushlab olamiz
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || '';

        if (status === 401) {
            const lower = message.toLowerCase();

            // JWT muddati tugagan bo'lsa
            if (lower.includes('jwt expired')) {
                // Token va userni tozalaymiz
                localStorage.removeItem('rt_token');
                localStorage.removeItem('rt_user');

                // Login sahifaga sessiya tugagan flag bilan yuboramiz
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?expired=1';
                }
            }

            // Agar umumiy 401 bo'lsa (masalan, token umuman noto‘g‘ri):
            // xohlasang shu yerda ham xuddi shunday logout qilsak bo'ladi.
        }

        return Promise.reject(error);
    }
);

export default api;
