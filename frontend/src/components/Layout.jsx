import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/api';

// Хелпер для правильного пути к аватарке
const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Стейты для уведомлений
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

// Загрузка и живое получение уведомлений по WebSocket
    useEffect(() => {
        if (!user) return;

        // 1. Сначала загружаем историю старых уведомлений по HTTP
        api.get('users/notifications/').then(res => {
            setNotifications(res.data.results || res.data);
        }).catch(err => console.error("Ошибка загрузки уведомлений", err));

        // 2. ИСПРАВЛЕНИЕ: Подключаем WebSocket, чтобы ловить новые уведомления на лету без перезагрузки
        const token = localStorage.getItem('access_token');
        const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

        ws.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            
            // Зависит от того, как у тебя оформлен словарь в консьюмере бэкенда (обычно 'notification' или 'data')
            const newNotif = parsedData.notification || parsedData.data;
            
            if (newNotif) {
                setNotifications(prev => {
                    // Защита от дублирования записей
                    if (prev.find(n => n.id === newNotif.id)) return prev;
                    return [newNotif, ...prev]; // Добавляем новое уведомление в самый верх списка
                });
            }
        };

        ws.onerror = (err) => console.error("Ошибка сокета уведомлений", err);

        // При размонтировании компонента (или логауте) закрываем соединение
        return () => {
            ws.close();
        };
    }, [user]);

    const handleRead = async (id) => {
        try {
            await api.patch(`users/notifications/${id}/`, { is_read: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{ 
                background: 'var(--bg-panel)', 
                padding: '1rem 2rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #333',
                position: 'sticky', 
                top: 0, 
                zIndex: 100 
            }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }} className="text-gradient">
                        WEB STUDIO
                    </Link>
                    <nav style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link to="/projects" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Проекты</Link>
                        <Link to="/developers" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Команда</Link> 
                        <Link to="/chat" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Чат</Link>
                        <Link to="/contact" style={{ color: 'var(--gold-solid)', textDecoration: 'none' }}>Контакты</Link>
                    </nav>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {/* КОЛОКОЛЬЧИК УВЕДОМЛЕНИЙ */}
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowDropdown(!showDropdown)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}>
                                    🔔
                                    {unreadCount > 0 && (
                                        <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: '#ff4d4f', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* ВЫПАДАЮЩИЙ СПИСОК */}
                                {showDropdown && (
                                    <div style={{ position: 'absolute', right: 0, top: '40px', width: '300px', background: 'var(--bg-panel)', border: '1px solid #333', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 200 }}>
                                        <div style={{ padding: '10px 15px', borderBottom: '1px solid #222', background: '#0a0a0a', fontWeight: 'bold' }}>Уведомления</div>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Нет новых событий</div>
                                            ) : notifications.map(notif => (
                                                <div key={notif.id} style={{ padding: '12px 15px', borderBottom: '1px solid #222', background: notif.is_read ? 'transparent' : 'rgba(212, 175, 55, 0.05)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <div style={{ fontSize: '0.9rem', color: notif.is_read ? 'var(--text-muted)' : 'var(--text-main)' }}>{notif.message}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(notif.created_at).toLocaleDateString()}</span>
                                                        {!notif.is_read && <button onClick={() => handleRead(notif.id)} style={{ background: 'transparent', border: 'none', color: 'var(--gold-solid)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Прочитано</button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Исправленная аватарка с правильным URL и обрезкой */}
                                <img src={getMediaUrl(user.avatar) || 'https://via.placeholder.com/32/333333/FFFFFF?text=U'} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                <span>{user.nickname}</span>
                                {user.is_developer && (
                                    <span style={{ fontSize: '10px', background: 'var(--gold-gradient)', color: '#000', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                                        TEAM
                                    </span>
                                )}
                            </div>
                            
                            <Link to="/settings" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem' }}>Настройки</Link>
                            
                            {(user.is_staff || user.is_developer) && (
                                <Link to="/admin-panel" style={{ color: '#409eff', textDecoration: 'none', fontSize: '0.9rem' }}>CRM</Link>
                            )}
                            
                            <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', border: '1px solid #555', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                Выход
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Вход</Link>
                            <Link to="/register" className="btn-gold" style={{ padding: '8px 20px', textDecoration: 'none' }}>Регистрация</Link>
                        </>
                    )}
                </div>
            </header>

            {/* Основной контент страницы */}
            <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer style={{ 
                background: 'var(--bg-panel)', 
                padding: '2rem', 
                textAlign: 'center',
                borderTop: '1px solid #333',
                color: 'var(--text-muted)'
            }}>
                © 2026 Web Studio. Все права защищены.
            </footer>
        </div>
    );
};

export default Layout;