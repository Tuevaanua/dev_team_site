import { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const Chat = () => {
    const { user } = useAuth();
    const [isCooldown, setIsCooldown] = useState(false); // В начале компонента
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // 1. Загрузка списка каналов
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await api.get('forum/channels/');
                const data = res.data.results || res.data;
                setChannels(data);
                // Автоматически выбираем первый канал при загрузке
                if (data.length > 0) setActiveChannel(data[0]);
            } catch (err) {
                console.error("Ошибка загрузки каналов", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, []);

    // 2. Загрузка истории сообщений при смене канала
    useEffect(() => {
        if (!activeChannel) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`forum/messages/?channel=${activeChannel.id}`);
                setMessages(res.data.results || res.data);
            } catch (err) {
                console.error("Ошибка загрузки сообщений", err);
            }
        };
        fetchMessages();
    }, [activeChannel]);

    // 3. Подключение WebSocket для активного канала
    useEffect(() => {
        if (!activeChannel) return;

        const token = localStorage.getItem('access_token');
        if (token) {
            // Закрываем старое соединение, если переключились на другой канал
            if (ws.current) ws.current.close();

            ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${activeChannel.id}/?token=${token}`);

            ws.current.onmessage = (event) => {
                const parsed = JSON.parse(event.data);
                if (parsed.type === 'new_message') {
                    setMessages((prev) => {
                        // Защита от дублей (оптимистичный UI)
                        if (prev.find(m => m.id === parsed.data.id)) return prev;
                        return [...prev, parsed.data];
                    });
                }
            };

            return () => {
                if (ws.current) ws.current.close();
            };
        }
    }, [activeChannel]);

    // Автоскролл вниз при новом сообщении
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 4. Отправка сообщения
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChannel || isCooldown) return;

        setIsCooldown(true); // Блокируем кнопку
        
        try {
            const res = await api.post('forum/messages/', {
                channel: activeChannel.id,
                content: newMessage
            });
            
            setMessages(prev => {
                if (prev.find(m => m.id === res.data.id)) return prev;
                return [...prev, res.data];
            });
            setNewMessage('');
        } catch (err) {
            if (err.response?.status === 429) {
                alert("Вы отправляете сообщения слишком часто! Подождите.");
            } else {
                console.error("Ошибка отправки", err);
            }
        } finally {
            // Снимаем блокировку через 1.5 секунды
            setTimeout(() => setIsCooldown(false), 1500);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Загрузка коммуникационного модуля...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', gap: '2rem', paddingBottom: '2rem' }}>
            
            {/* ЛЕВАЯ ПАНЕЛЬ: СПИСОК КАНАЛОВ */}
            <div style={{ width: '300px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #222', background: '#0a0a0a' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--gold-solid)' }}>Студийные Чаты</h2>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {channels.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>Каналы не созданы</div>
                    ) : (
                        channels.map(channel => (
                            <div 
                                key={channel.id} 
                                onClick={() => setActiveChannel(channel)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    background: activeChannel?.id === channel.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                    border: activeChannel?.id === channel.id ? '1px solid var(--gold-solid)' : '1px solid transparent',
                                    color: activeChannel?.id === channel.id ? 'var(--gold-solid)' : 'var(--text-main)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}># {channel.name}</div>
                                {channel.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.description}</div>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ: АКТИВНЫЙ ЧАТ */}
            <div style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Шапка чата */}
                {activeChannel ? (
                    <>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #222', background: '#0a0a0a' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}># {activeChannel.name}</h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeChannel.description}</p>
                        </div>

                        {/* Зона сообщений */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#121212' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Здесь пока тихо. Напишите первое сообщение!</div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.author === user?.id;
                                    return (
                                        <div key={msg.id} style={{ display: 'flex', gap: '1rem', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                            <img 
                                                src={getMediaUrl(msg.author_avatar) || 'https://via.placeholder.com/40'} 
                                                alt="avatar" 
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: msg.author_is_developer ? '1px solid var(--gold-solid)' : '1px solid #444' }} 
                                            />
                                            <div style={{ maxWidth: '70%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                                    <strong style={{ color: msg.author_is_developer ? 'var(--gold-solid)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                                                        {msg.author_nickname}
                                                    </strong>
                                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    background: isMe ? 'rgba(212, 175, 55, 0.15)' : '#1a1a1a', 
                                                    border: isMe ? '1px solid var(--gold-solid)' : '1px solid #333',
                                                    padding: '12px 16px', 
                                                    borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                                    color: 'var(--text-main)',
                                                    lineHeight: '1.5',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Форма отправки */}
                        <div style={{ padding: '1.5rem', borderTop: '1px solid #222', background: '#0a0a0a' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ margin: 0, flex: 1, borderRadius: '24px', padding: '12px 20px' }} 
                                    placeholder={`Написать в #${activeChannel.name}...`} 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn-gold" style={{ borderRadius: '24px', padding: '0 25px', opacity: isCooldown ? 0.5 : 1 }} disabled={isCooldown}>
                                    {isCooldown ? '⏳' : 'Отправить'}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Выберите канал для начала общения
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;