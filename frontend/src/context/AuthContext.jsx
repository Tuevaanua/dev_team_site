import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // При первой загрузке приложения проверяем, есть ли токен, и грузим профиль
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('users/me/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Ошибка загрузки профиля", error);
                    // Если api.js не смог обновить токен, стейт останется null
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Функция входа
    const login = async (username, password) => {
        try {
            // Получаем токены
            const response = await api.post('token/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Сразу же запрашиваем данные пользователя
            const userResponse = await api.get('users/me/');
            setUser(userResponse.data);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || "Ошибка авторизации" 
            };
        }
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {/* Не рендерим приложение, пока не проверим авторизацию */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Удобный хук для использования в компонентах
export const useAuth = () => useContext(AuthContext);