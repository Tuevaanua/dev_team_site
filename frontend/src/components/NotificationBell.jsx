import { useState, useEffect, useRef } from 'react';
import api from '../api/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const ws = useRef(null);

    // 1. При загрузке получаем старые уведомления по API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('notifications/');
                setNotifications(response.data.results || response.data);
            } catch (err) {
                console.error("Ошибка загрузки уведомлений", err);
            }
        };
        fetchNotifications();
    }, []);

    // 2. Подключаем персональный WebSocket
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            ws.current = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

            ws.current.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === 'notification') {
                    // Добавляем новое уведомление в начало списка
                    setNotifications((prev) => [parsedData.data, ...prev]);
                }
            };

            return () => {
                if (ws.current) ws.current.close();
            };
        }
    }, []);

    // 3. Отметка о прочтении
    const markAsRead = async (id) => {
        try {
            await api.post(`notifications/${id}/mark_read/`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error("Ошибка", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div style={{ position: 'relative', cursor: 'pointer' }}>
            {/* Иконка колокольчика */}
            <div onClick={() => setIsOpen(!isOpen)} style={{ fontSize: '1.2rem', userSelect: 'none' }}>
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-8px',
                        background: '#ff4d4f', color: 'white', borderRadius: '50%',
                        padding: '2px 6px', fontSize: '10px', fontWeight: 'bold',
                        border: '2px solid var(--bg-panel)'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* Выпадающий список */}
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '35px', right: '-10px',
                    width: '320px', background: 'var(--bg-panel)',
                    border: '1px solid #333', borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 1000,
                    maxHeight: '400px', overflowY: 'auto'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #333', fontWeight: 'bold' }}>
                        Уведомления
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Нет уведомлений</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                    style={{ 
                                        padding: '1rem', 
                                        borderBottom: '1px solid #222',
                                        background: n.is_read ? 'transparent' : 'rgba(212, 175, 55, 0.05)',
                                        borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--gold-solid)',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', lineHeight: '1.4', color: n.is_read ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                        {n.message}
                                    </p>
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                        {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;