import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
    const defaultImage = 'https://via.placeholder.com/400x250/1a1a1a/D4AF37?text=No+Image';

    return (
        <div style={{
            background: 'var(--bg-panel)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #333',
            transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'var(--gold-solid)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.boxShadow = 'none';
        }}>
            {/* Обложка проекта */}
            <div style={{ height: '200px', overflow: 'hidden' }}>
                <img 
                    src={project.cover || defaultImage} 
                    alt={project.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            </div>
            
            {/* Контент */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--gold-solid)', fontSize: '1.25rem' }}>
                    {project.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1.5rem', flex: 1, lineHeight: '1.5' }}>
                    {project.short_description}
                </p>

                {/* Футер карточки */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        💬 Отзывов: {project.comments_count || 0}
                    </span>
                    <Link to={`/projects/${project.id}`} className="btn-gold" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '4px' }}>
                        Подробнее
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;