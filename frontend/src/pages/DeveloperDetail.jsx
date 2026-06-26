import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import ProjectCard from '../components/ProjectCard';

const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const DeveloperDetail = () => {
    const { id } = useParams();
    const [devData, setDevData] = useState(null);
    const [devProjects, setDevProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeveloperAndProjects = async () => {
            try {
                const devRes = await api.get(`users/${id}/`);
                setDevData(devRes.data);

                const projectsRes = await api.get('projects/projects/');
                const allProjects = projectsRes.data.results || projectsRes.data;
                
                // ЖЕЛЕЗОБЕТОННАЯ ФИЛЬТРАЦИЯ
                const relatedProjects = allProjects.filter(project => {
                    if (!project.developers_info || !Array.isArray(project.developers_info)) return false;
                    // Проверяем, совпадает ли ID пользователя или ID его профиля
                    return project.developers_info.some(dev => 
                        String(dev.id) === String(id) || String(dev.profile_id) === String(id)
                    );
                });
                
                setDevProjects(relatedProjects);
            } catch (err) {
                console.error("Ошибка при сборке досье", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeveloperAndProjects();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--gold-solid)' }}>Загрузка профиля специалиста...</div>;
    if (!devData) return <div style={{ textAlign: 'center', color: '#ff4d4f', marginTop: '4rem' }}>Профиль не найден в системе студии.</div>;

    const profile = devData.developer_profile || {};

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
            <Link to="/developers" style={{ color: 'var(--text-muted)', display: 'inline-block', marginBottom: '2rem', fontSize: '0.9rem' }}>← Назад к составу команды</Link>

            <div style={{ background: 'var(--bg-panel)', border: '1px solid #222', borderRadius: '16px', padding: '3rem', display: 'flex', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', flex: '1 1 200px' }}>
                    <img src={getMediaUrl(devData.avatar) || 'https://via.placeholder.com/180/333333/FFFFFF?text=User'} alt={devData.nickname} style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-solid)', marginBottom: '1rem' }} />
                </div>
                <div style={{ flex: '2 1 500px' }}>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }} className="text-gradient">{devData.nickname}</h1>
                    <div style={{ fontSize: '1.2rem', color: 'var(--gold-solid)', fontWeight: 'bold', marginBottom: '1.5rem' }}>{profile.role || 'Специалист студии'}</div>
                    {profile.skills && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Стек и Технологии</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {profile.skills.split(',').map((skill, index) => <span key={index} style={{ background: '#121212', border: '1px solid #333', color: 'var(--text-main)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>{skill.trim()}</span>)}
                            </div>
                        </div>
                    )}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Биография и Опыт</h3>
                        <p style={{ color: '#ccc', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>{profile.bio || 'Информация не заполнена.'}</p>
                    </div>
                    {profile.portfolio_link && <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ display: 'inline-block', padding: '10px 24px', fontSize: '0.9rem' }}>Открыть внешнее портфолио →</a>}
                </div>
            </div>

            <section>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Проекты специалиста в студии ({devProjects.length})</h2>
                {devProjects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Этот разработчик пока не привязан к опубликованным релизам.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                        {devProjects.map(project => <ProjectCard key={project.id} project={project} />)}
                    </div>
                )}
            </section>
        </div>
    );
};

export default DeveloperDetail;