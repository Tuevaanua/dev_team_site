import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const ProfileSettings = () => {
    const { user } = useAuth();
    
    // --- СТЕЙТЫ ТЕКСТОВЫХ ДАННЫХ ---
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        role: '',
        bio: '',
        skills: '',
        portfolio_link: ''
    });
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [textUploading, setTextUploading] = useState(false);
    
    // --- СТЕЙТЫ КРОППЕРА ---
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const [message, setMessage] = useState('');

    // 1. ЗАГРУЗКА ТЕКУЩИХ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get(`users/${user.id}/`);
                const data = res.data;
                setIsDeveloper(data.is_developer);
                setFormData({
                    nickname: data.nickname || '',
                    email: data.email || '',
                    role: data.developer_profile?.role || '',
                    bio: data.developer_profile?.bio || '',
                    skills: data.developer_profile?.skills || '',
                    portfolio_link: data.developer_profile?.portfolio_link || ''
                });
            } catch (err) {
                console.error("Ошибка загрузки профиля", err);
            } finally {
                setInitialLoading(false);
            }
        };
        if (user) fetchUserData();
    }, [user]);

    // 2. ОБРАБОТЧИК СОХРАНЕНИЯ ТЕКСТОВЫХ ДАННЫХ
    const handleTextSubmit = async (e) => {
        e.preventDefault();
        setTextUploading(true);
        setMessage('');

        try {
            const payload = {
                nickname: formData.nickname,
                email: formData.email,
            };

            // Если разработчик, прикрепляем вложенный объект с визиткой
            if (isDeveloper) {
                payload.developer_profile = {
                    role: formData.role,
                    bio: formData.bio,
                    skills: formData.skills,
                    portfolio_link: formData.portfolio_link
                };
            }

            await api.patch(`users/${user.id}/`, payload);
            setMessage('Данные профиля успешно обновлены!');
        } catch (error) {
            console.error(error);
            setMessage('Ошибка при сохранении текстовых данных.');
        } finally {
            setTextUploading(false);
        }
    };

    // 3. ЛОГИКА КРОППЕРА (Чтение, обрезка, отправка)
    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            let imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setIsCropping(true);
        }
    };

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropAndUpload = async () => {
        setImageUploading(true);
        setMessage('');
        try {
            const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            const uploadData = new FormData();
            uploadData.append('avatar', croppedImageFile);

            await api.patch(`users/${user.id}/`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Аватар успешно обновлен!');
            setIsCropping(false);
            setImageSrc(null);
        } catch (error) {
            console.error(error);
            setMessage('Ошибка при загрузке аватара.');
        } finally {
            setImageUploading(false);
        }
    };

    if (initialLoading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Загрузка настроек...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Настройки профиля</h1>

            {message && (
                <div style={{ padding: '1rem', background: message.includes('Ошибка') ? '#3a1111' : '#113a1b', border: `1px solid ${message.includes('Ошибка') ? '#ff4d4f' : '#52c41a'}`, borderRadius: '8px', marginBottom: '2rem', color: '#fff' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* === БЛОК 1: ТЕКСТОВЫЕ ДАННЫЕ === */}
                <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>
                        Основная информация
                    </h2>
                    
                    <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Никнейм</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ margin: 0 }}
                                    value={formData.nickname} 
                                    onChange={(e) => setFormData({...formData, nickname: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    style={{ margin: 0 }}
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ (Только для разработчиков студии) */}
                        {isDeveloper && (
                            <div style={{ marginTop: '1rem', borderTop: '1px dashed #333', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <h3 style={{ color: 'var(--gold-solid)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Досье разработчика (Публичное)</h3>
                                
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Специализация / Роль (Например: Senior 3D Artist)</label>
                                    <input type="text" className="form-input" style={{ margin: 0 }} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Стек технологий (через запятую)</label>
                                    <input type="text" className="form-input" style={{ margin: 0 }} value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="React, Django, PostgreSQL" />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Биография и опыт работы</label>
                                    <textarea className="form-input" rows="4" style={{ margin: 0, resize: 'vertical' }} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ссылка на внешнее портфолио (GitHub, ArtStation)</label>
                                    <input type="url" className="form-input" style={{ margin: 0 }} value={formData.portfolio_link} onChange={(e) => setFormData({...formData, portfolio_link: e.target.value})} placeholder="https://..." />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start', padding: '10px 25px', marginTop: '1rem' }} disabled={textUploading}>
                            {textUploading ? 'Сохранение...' : 'Сохранить информацию'}
                        </button>
                    </form>
                </div>

                {/* === БЛОК 2: АВАТАР И КРОППЕР === */}
                <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>
                        Фотография профиля
                    </h2>
                    
                    {!isCropping ? (
                        <div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={onFileChange} 
                                style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-main)' }}
                            />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Загрузите квадратное изображение. Вы сможете откадрировать его перед сохранением.
                            </p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', height: '400px', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                            
                            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '80%', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ color: '#fff', fontSize: '1.2rem' }}>-</span>
                                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} style={{ flex: 1 }} />
                                <span style={{ color: '#fff', fontSize: '1.2rem' }}>+</span>
                            </div>
                        </div>
                    )}

                    {isCropping && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleCropAndUpload} className="btn-gold" disabled={imageUploading}>
                                {imageUploading ? 'Загрузка...' : 'Обрезать и Сохранить'}
                            </button>
                            <button onClick={() => { setIsCropping(false); setImageSrc(null); }} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                                Отмена
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfileSettings;