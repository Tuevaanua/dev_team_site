import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};
const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [isCommentCooldown, setIsCommentCooldown] = useState(false);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    
    const ws = useRef(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [projRes, commRes, updRes] = await Promise.all([
                    api.get(`projects/projects/${id}/`),
                    api.get(`projects/comments/?project=${id}`),
                    api.get(`projects/updates/?project=${id}`)
                ]);
                
                setProject(projRes.data);
                setComments(commRes.data.results || commRes.data);
                setUpdates(updRes.data.results || updRes.data);
            } catch (error) {
                console.error("Ошибка при сборке данных проекта", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            ws.current = new WebSocket(`ws://localhost:8000/ws/projects/${id}/comments/?token=${token}`);

            ws.current.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === 'new_comment') {
                    setComments((prev) => {
                        if (prev.find(c => c.id === parsedData.data.id)) return prev;
                        return [...prev, parsedData.data];
                    });
                }
            };

            return () => {
                if (ws.current) ws.current.close();
            };
        }
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || isCommentCooldown) return;

        setIsCommentCooldown(true); // Включаем блокировку

        try {
            const response = await api.post('projects/comments/', {
                project: id,
                text: newCommentText
            });
            
            setComments(prev => {
                if (prev.find(c => c.id === response.data.id)) return prev;
                return [...prev, response.data];
            });
            setNewCommentText('');
        } catch (error) {
            if (error.response?.status === 429) {
                alert("Слишком много комментариев. Подождите немного!");
            } else {
                console.error("Не удалось отправить комментарий", error);
            }
        } finally {
            setTimeout(() => setIsCommentCooldown(false), 2000); // Снимаем через 2 секунды
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--gold-solid)' }}>Загрузка спецификации проекта...</div>;
    if (!project) return <div style={{ textAlign: 'center', color: '#ff4d4f', marginTop: '4rem' }}>Проект не найден в базе студии.</div>;

    const defaultImage = 'https://via.placeholder.com/1200x500/1a1a1a/D4AF37?text=No+Image+Available';

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
            
            <Link to="/projects" style={{ color: 'var(--text-muted)', display: 'inline-block', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                ← Вернуться в портфолио
            </Link>

            {/* ИСПРАВЛЕНИЕ 1: HERO БЛОК. Заменили background: url() на абсолютный тег <img>, чтобы картинка больше не мигала при вводе текста */}
            <div style={{ 
                position: 'relative', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                marginBottom: '3rem', 
                border: '1px solid #222',
                height: '400px',
                backgroundColor: 'var(--bg-panel)'
            }}>
                <img 
                    src={project.cover || defaultImage} 
                    alt="Обложка проекта" 
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
                />
                
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 100%)',
                    zIndex: 1
                }} />
                
                <div style={{ position: 'absolute', bottom: '2rem', left: '2.5rem', right: '2.5rem', zIndex: 2 }}>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }} className="text-gradient">{project.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#ccc', margin: 0, maxWidth: '800px' }}>{project.short_description}</p>
                </div>
            </div>

            {/* ИСПРАВЛЕНИЕ 2: ИСПОЛЬЗУЕМ FLEXBOX ВМЕСТО GRID. Добавили minWidth: 0, чтобы Swiper не разрывал страницу по ширине, а alignItems: 'flex-start', чтобы правая колонка не растягивалась по высоте */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
                
                {/* ЛЕВАЯ КОЛОНКА */}
                <div style={{ flex: '1 1 60%', minWidth: 0 }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.5rem' }}>О проекте</h2>
                        <div style={{ lineHeight: '1.8', color: '#e0e0e0', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                            {project.description}
                        </div>
                    </section>

                    {project.gallery && project.gallery.length > 0 && (
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Галерея интерфейсов</h2>
                            <Swiper
                                modules={[Navigation, Pagination]}
                                spaceBetween={20}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true }}
                                style={{ borderRadius: '12px', border: '1px solid #333', background: '#121212', width: '100%' }}
                            >
                                {project.gallery.map((img) => (
                                    <SwiperSlide key={img.id}>
                                        <div style={{ position: 'relative', height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <img src={img.image} alt={img.caption || "Скриншот"} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            {img.caption && (
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '10px 20px', fontSize: '0.9rem', textAlign: 'center', color: '#ccc' }}>
                                                    {img.caption}
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </section>
                    )}

                    {updates.length > 0 && (
                        <section style={{ marginBottom: '4rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Дневник разработки</h2>
                            {/* Добавили marginLeft, чтобы кружки таймлайна не уезжали за экран */}
                            <div style={{ borderLeft: '2px solid var(--gold-solid)', paddingLeft: '1.5rem', marginLeft: '25px' }}>
                                {updates.map(update => (
                                    <div key={update.id} style={{ position: 'relative', marginBottom: '3rem' }}>
                                        <div style={{ position: 'absolute', left: '-31px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gold-solid)', border: '3px solid var(--bg-dark)' }} />
                                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', wordBreak: 'break-word' }}>{update.title}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
                                            {new Date(update.created_at).toLocaleDateString()}
                                        </span>
                                        
                                        {/* Если к апдейту прикреплена картинка - показываем её */}
                                        {update.image && (
                                            <img 
                                                src={getMediaUrl(update.image)} 
                                                alt="Update" 
                                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #333' }} 
                                            />
                                        )}
                                        
                                        {/* Добавили wordBreak: 'break-word', чтобы текст никогда не рвал верстку */}
                                        <p style={{ margin: 0, color: '#b0b0b0', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            {update.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* ПРАВАЯ КОЛОНКА (Сайдбар) */}
                <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
                    <div style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', position: 'sticky', top: '2rem' }}>
                        <h2 style={{ color: 'var(--text-main)', margin: '0 0 1.5rem 0', fontSize: '1.3rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            Команда проекта
                        </h2>
                        {project.developers_info && project.developers_info.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {project.developers_info.map(dev => (
                                    <div key={dev.id} style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <img 
                                            src={getMediaUrl(dev.avatar) || 'https://via.placeholder.com/45/333333/FFFFFF?text=D'} 
                                            alt={dev.nickname} 
                                            style={{ 
                                                width: '45px', 
                                                height: '45px', 
                                                borderRadius: '50%', 
                                                objectFit: 'cover', // <-- ИСПРАВЛЕНИЕ
                                                border: '1px solid var(--gold-solid)' 
                                            }}
                                        />
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {dev.nickname}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--gold-solid)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {dev.role}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Состав команды не указан.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* НИЖНИЙ БЛОК: ОБСУЖДЕНИЕ/ОТЗЫВЫ */}
            <section style={{ background: 'var(--bg-panel)', padding: '2.5rem', borderRadius: '12px', border: '1px solid #222', marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                    Обсуждение продукта ({comments.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {comments.map((comment) => (
                        <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                            <img src={getMediaUrl(comment.author_avatar) || 'https://via.placeholder.com/40/333333?text=U'} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <strong style={{ color: comment.author_is_developer ? 'var(--gold-solid)' : 'var(--text-main)' }}>
                                        {comment.author_nickname}
                                    </strong>
                                    {comment.author_is_developer && (
                                        <span style={{ fontSize: '9px', background: 'var(--gold-gradient)', color: '#000', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>TEAM</span>
                                    )}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <div style={{ background: '#121212', padding: '12px 16px', borderRadius: '0 8px 8px 8px', border: '1px solid #222', color: '#d0d0d0', lineHeight: '1.5' }}>
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Отзывов к этому релизу пока нет.</p>}
                </div>

                {user ? (
                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <textarea
                            className="form-input"
                            rows="3"
                            placeholder="Оставить отзыв или задать вопрос по продукту..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                        <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-end', padding: '10px 25px', opacity: isCommentCooldown ? 0.5 : 1 }} disabled={isCommentCooldown}>
                            {isCommentCooldown ? 'Отправка...' : 'Отправить отзыв'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', background: '#121212', borderRadius: '6px', border: '1px dashed #333' }}>
                        Авторизуйтесь, чтобы принять участие в обсуждении релиза.
                    </div>
                )}
            </section>

        </div>
    );
};

export default ProjectDetail;