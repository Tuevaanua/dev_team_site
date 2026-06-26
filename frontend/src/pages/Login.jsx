import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Состояние переключателя Вход / Регистрация
    const [isLoginView, setIsLoginView] = useState(true);
    
    // Состояния полей формы
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nickname: '',
        email: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoginView) {
                // ЛОГИКА ВХОДА
                const result = await login(formData.username, formData.password);
                if (result.success) {
                    navigate('/'); // Редирект на главную при успехе
                } else {
                    setError(result.error);
                }
            } else {
                // ЛОГИКА РЕГИСТРАЦИИ
                // 1. Создаем пользователя через API
                await api.post('users/', {
                    username: formData.username,
                    password: formData.password,
                    nickname: formData.nickname,
                    email: formData.email
                });
                
                // 2. Автоматически логиним его после успешной регистрации
                const result = await login(formData.username, formData.password);
                if (result.success) {
                    navigate('/');
                } else {
                    setError('Регистрация прошла успешно, но не удалось войти.');
                }
            }
        } catch (err) {
            // Обработка ошибок валидации DRF
            if (err.response && err.response.data) {
                const errorMessages = Object.values(err.response.data).flat();
                setError(errorMessages.join(' '));
            } else {
                setError('Произошла ошибка соединения с сервером.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }} className="text-gradient">
                {isLoginView ? 'С возвращением' : 'Присоединиться к DevTeam'}
            </h2>
            
            {error && (
                <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4f', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <input
                    type="text"
                    name="username"
                    placeholder="Логин (Username)"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                
                {!isLoginView && (
                    <>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="Отображаемое имя (Nickname)"
                            className="form-input"
                            value={formData.nickname}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </>
                )}

                <input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="btn-gold" style={{ marginTop: '1rem' }} disabled={loading}>
                    {loading ? 'Загрузка...' : (isLoginView ? 'Войти' : 'Зарегистрироваться')}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                    {isLoginView ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                </span>
                <button 
                    onClick={() => {
                        setIsLoginView(!isLoginView);
                        setError('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--gold-solid)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                    {isLoginView ? 'Создать' : 'Войти'}
                </button>
            </div>
        </div>
    );
};

export default Login;