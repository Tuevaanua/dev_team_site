import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};
const Developers = () => {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                // Запрашиваем пользователей. Наш бэкенд возвращает профили.
                const response = await api.get('users/');
                const allUsers = response.data.results || response.data;
                // Фильтруем только тех, кто является членом студии
                const coreTeam = allUsers.filter(user => user.is_developer);
                setDevelopers(coreTeam);
            } catch (err) {
                console.error("Ошибка при загрузке списка команды", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDevelopers();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Наша Команда
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Закрытый состав разработчиков, инженеров и дизайнеров студии. Мы объединяем опыт для создания сложных цифровых продуктов.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--gold-solid)', fontSize: '1.2rem' }}>
                    Синхронизация данных команды...
                </div>
            ) : developers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Состав команды еще не сформирован в системе.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {developers.map(dev => (
                        <div 
                            key={dev.id}
                            style={{
                                background: 'var(--bg-panel)',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                transition: 'transform 0.3s ease, border-color 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'var(--gold-solid)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '#333';
                            }}
                        >
                            <img 
                                src={getMediaUrl(dev.avatar) || 'https://via.placeholder.com/100/333333/FFFFFF?text=Team'} 
                                alt={dev.nickname}
                                style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover', // <-- ИСПРАВЛЕНИЕ: автоматически вырезает центр картинки без искажений
                                    border: '2px solid var(--gold-solid)', 
                                    marginBottom: '1.5rem' 
                                }}
                            />
                            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                                {dev.nickname}
                            </h3>
                            <div style={{ color: 'var(--gold-solid)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '1.5rem' }}>
                                {dev.developer_profile?.role || 'Разработчик'}
                            </div>
                            
                            <Link 
                                to={`/developers/${dev.id}`} 
                                className="btn-gold" 
                                style={{ display: 'inline-block', width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '0.9rem', borderRadius: '6px' }}
                            >
                                Смотреть досье
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Developers;