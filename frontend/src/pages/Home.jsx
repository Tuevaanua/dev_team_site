import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

// Импорты Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation'; // <-- ДОБАВИЛИ СТИЛИ ДЛЯ СТРЕЛОЧЕК

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestProjects = async () => {
            try {
                const response = await api.get('projects/projects/');
                const allProjects = response.data.results || response.data;
                setProjects(allProjects.slice(0, 7));
            } catch (err) {
                console.error("Ошибка загрузки проектов", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestProjects();
    }, []);

    const defaultImage = 'https://via.placeholder.com/320x220/1a1a1a/D4AF37?text=No+Image';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            
            <section style={{ 
                textAlign: 'center', 
                padding: '5rem 1rem 3rem 1rem',
                background: 'radial-gradient(circle at center, #111 0%, #0a0a0a 100%)',
                borderRadius: '16px',
                marginBottom: '4rem',
                border: '1px solid #222'
            }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-1px' }} className="text-gradient">
                    Студия Цифровых Решений
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', maxWidth: '800px', margin: '0 auto 1.5rem auto', lineHeight: '1.7' }}>
                    Мы — закрытое объединение независимых разработчиков и дизайнеров. 
                    Создаем кастомные веб-технологии, интерактивные приложения, сложные игровые системы 
                    и уникальные интерфейсы для решения нестандартных задач.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                    Данная площадка является нашей единой витриной проектов, живым портфолио команды 
                    и точкой взаимодействия с доверенными клиентами.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/projects" className="btn-gold" style={{ padding: '12px 28px' }}>
                        Открыть каталог работ
                    </Link>
                    <Link to="/contact" style={{ border: '1px solid #444', color: 'white', padding: '12px 28px', borderRadius: '4px', fontWeight: 'bold' }}>
                        Оставить заявку
                    </Link>
                </div>
            </section>

            <section style={{ marginBottom: '5rem', position: 'relative' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1rem', fontWeight: '600' }}>
                    Последние релизы
                </h2>
                <div style={{ width: '60px', height: '3px', background: 'var(--gold-gradient)', margin: '0 auto 3rem auto', borderRadius: '2px' }} />

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--gold-solid)' }}>Загрузка галереи...</div>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Проекты еще не опубликованы.</div>
                ) : (
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        loop={projects.length >= 3}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        navigation={true} // <-- ВКЛЮЧИЛИ СТРЕЛОЧКИ
                        coverflowEffect={{
                            rotate: 0,       // <-- УБРАЛИ ПОВОРОТ КАРТОЧЕК
                            stretch: 0,      // Наложение карточек друг на друга
                            depth: 150,      // Эффект отдаления (масштаб)
                            modifier: 1.5,   // Сила эффекта
                            slideShadows: true, // Тени для глубины
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        modules={[EffectCoverflow, Pagination, Autoplay, Navigation]} // <-- ДОБАВИЛИ Navigation
                        className="home-projects-slider"
                    >
                        {projects.map((project) => (
                            <SwiperSlide key={project.id}>
                                <div className="coverflow-card">
                                    <img 
                                        src={project.cover || defaultImage} 
                                        alt={project.title} 
                                        style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                                    />
                                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ color: 'var(--gold-solid)', margin: '0 0 0.5rem 0', fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {project.title}
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                                {project.short_description}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #222', paddingTop: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                💬 {project.comments_count || 0}
                                            </span>
                                            <Link to={`/projects/${project.id}`} className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                                                Смотреть
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </section>
        </div>
    );
};

export default Home;