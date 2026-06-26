import axios from 'axios';

// Базовый URL нашего Django API
const API_URL = 'http://localhost:8000/api/v1/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: прикрепляем access токен ко всем запросам
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: обрабатываем протухший токен (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка 401 и мы еще не пытались обновить токен
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Пытаемся получить новый access токен
                    const response = await axios.post(`${API_URL}token/refresh/`, {
                        refresh: refreshToken,
                    });

                    // Сохраняем новый токен
                    localStorage.setItem('access_token', response.data.access);

                    // Меняем заголовок в оригинальном запросе и повторяем его
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Если refresh тоже протух — разлогиниваем (чистим storage)
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login'; // Жесткий редирект на логин
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;