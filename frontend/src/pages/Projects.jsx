import { useState, useEffect } from 'react';
import api from '../api/api';
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Запрашиваем список всех проектов
                const response = await api.get('projects/projects/');
                setProjects(response.data.results || response.data);
            } catch (err) {
                console.error("Ошибка загрузки каталога проектов", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Заголовок страницы */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Портфолио Студии
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Полный каталог наших работ. От интерактивных веб-приложений и сложных корпоративных систем до экспериментальных интерфейсов.
                </p>
            </div>

            {/* Сетка проектов */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--gold-solid)', fontSize: '1.2rem' }}>
                    Загрузка проектов...
                </div>
            ) : projects.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    color: 'var(--text-muted)', 
                    padding: '4rem 2rem', 
                    background: 'var(--bg-panel)', 
                    borderRadius: '12px', 
                    border: '1px dashed #333' 
                }}>
                    Проекты еще не опубликованы.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;