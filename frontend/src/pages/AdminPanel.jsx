import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AdminPanel = () => {
    const navigate = useNavigate();
    
    // Вкладки: 'requests' | 'projects_list' | 'project_create' | 'project_edit'
    const [activeTab, setActiveTab] = useState('requests');
    
    // Глобальные стейты данных
    const [requests, setRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- СТЕЙТЫ РЕДАКТИРОВАНИЯ ПРОЕКТА ---
    const [editProject, setEditProject] = useState(null);
    const [projectUpdates, setProjectUpdates] = useState([]);
    const [updateForm, setUpdateForm] = useState({ id: null, title: '', content: '', image: null });

    // Стейт формы создания
    const [newProject, setNewProject] = useState({ title: '', short_description: '', description: '', cover: null, developer_ids: [] });
    const [formStatus, setFormStatus] = useState('');

    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'projects_list') fetchProjects();
        if ((activeTab === 'project_create' || activeTab === 'project_edit') && developers.length === 0) fetchDevelopers();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('projects/requests/');
            setRequests(res.data.results || res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('projects/projects/');
            setProjects(res.data.results || res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchDevelopers = async () => {
        try {
            const res = await api.get('users/');
            const allUsers = res.data.results || res.data;
            setDevelopers(allUsers.filter(u => u.is_developer && u.developer_profile));
        } catch (err) { console.error(err); }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`projects/requests/${id}/`, { status: newStatus });
            setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
        } catch (err) { alert('Ошибка при обновлении статуса'); }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Вы уверены? Действие необратимо.')) return;
        try {
            await api.delete(`projects/projects/${id}/`);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) { alert('Ошибка удаления'); }
    };

    // --- ЛОГИКА СОЗДАНИЯ ПРОЕКТА ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        setFormStatus('Создание...');
        const formData = new FormData();
        formData.append('title', newProject.title);
        formData.append('short_description', newProject.short_description);
        formData.append('description', newProject.description);
        if (newProject.cover) formData.append('cover', newProject.cover);
        newProject.developer_ids.forEach(id => formData.append('developers', id));

        try {
            await api.post('projects/projects/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormStatus('Проект успешно опубликован!');
            setNewProject({ title: '', short_description: '', description: '', cover: null, developer_ids: [] });
            document.getElementById('cover-upload').value = '';
            setTimeout(() => { setActiveTab('projects_list'); setFormStatus(''); }, 1500);
        } catch (err) { setFormStatus('Ошибка создания.'); }
    };

    // --- ЛОГИКА РЕДАКТИРОВАНИЯ ПРОЕКТА ---
    const openEditMode = async (project) => {
        // Подготавливаем массив ID разработчиков для селекта
        const devIds = project.developers_info?.map(dev => dev.profile_id) || [];
        setEditProject({ ...project, developer_ids: devIds, new_cover: null });
        setActiveTab('project_edit');
        setFormStatus('');
        
        // Загружаем апдейты этого проекта
        try {
            const res = await api.get(`projects/updates/?project=${project.id}`);
            setProjectUpdates(res.data.results || res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        setFormStatus('Сохранение изменений...');
        const formData = new FormData();
        formData.append('title', editProject.title);
        formData.append('short_description', editProject.short_description);
        formData.append('description', editProject.description);
        if (editProject.new_cover) formData.append('cover', editProject.new_cover);
        
        // Важно очистить старые связи и отправить новые
        editProject.developer_ids.forEach(id => formData.append('developers', id));

        try {
            await api.patch(`projects/projects/${editProject.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormStatus('Изменения успешно сохранены!');
            setTimeout(() => setFormStatus(''), 2000);
        } catch (err) { setFormStatus('Ошибка при сохранении.'); }
    };

    // --- ЛОГИКА АПДЕЙТОВ (ДНЕВНИКОВ) ---
    const handleSaveUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', updateForm.title);
            formData.append('content', updateForm.content);
            formData.append('project', editProject.id);
            if (updateForm.image) formData.append('image', updateForm.image);

            if (updateForm.id) {
                const res = await api.patch(`projects/updates/${updateForm.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
                setProjectUpdates(projectUpdates.map(u => u.id === updateForm.id ? res.data : u));
            } else {
                const res = await api.post('projects/updates/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
                setProjectUpdates([res.data, ...projectUpdates]);
            }
            // Сбрасываем форму и поле файла
            setUpdateForm({ id: null, title: '', content: '', image: null });
            const fileInput = document.getElementById('update-image-upload');
            if (fileInput) fileInput.value = '';
        } catch (err) { alert('Ошибка сохранения апдейта'); }
    };

    const handleDeleteUpdate = async (id) => {
        if (!window.confirm('Удалить этот апдейт?')) return;
        try {
            await api.delete(`projects/updates/${id}/`);
            setProjectUpdates(projectUpdates.filter(u => u.id !== id));
        } catch (err) { alert('Ошибка удаления апдейта'); }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
            <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Управление Студией</h1>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('requests')} className={activeTab === 'requests' ? 'btn-gold' : ''} style={{ padding: '8px 16px', background: activeTab === 'requests' ? '' : 'transparent', border: activeTab === 'requests' ? 'none' : '1px solid #444', color: activeTab === 'requests' ? '#000' : 'var(--text-main)', borderRadius: '4px', cursor: 'pointer' }}>
                    📥 Заявки
                </button>
                <button onClick={() => setActiveTab('projects_list')} className={activeTab === 'projects_list' ? 'btn-gold' : ''} style={{ padding: '8px 16px', background: activeTab === 'projects_list' ? '' : 'transparent', border: activeTab === 'projects_list' ? 'none' : '1px solid #444', color: activeTab === 'projects_list' ? '#000' : 'var(--text-main)', borderRadius: '4px', cursor: 'pointer' }}>
                    🗂️ Список релизов
                </button>
                <button onClick={() => setActiveTab('project_create')} className={activeTab === 'project_create' ? 'btn-gold' : ''} style={{ padding: '8px 16px', background: activeTab === 'project_create' ? '' : 'transparent', border: activeTab === 'project_create' ? 'none' : '1px solid #444', color: activeTab === 'project_create' ? '#000' : 'var(--text-main)', borderRadius: '4px', cursor: 'pointer' }}>
                    ➕ Создать проект
                </button>
                
                {activeTab === 'project_edit' && (
                    <button style={{ padding: '8px 16px', background: '#2c2c2c', border: '1px solid var(--gold-solid)', color: 'var(--gold-solid)', borderRadius: '4px', cursor: 'default' }}>
                        ✏️ Редактирование: {editProject?.title}
                    </button>
                )}
            </div>

            {loading && <div style={{ color: 'var(--gold-solid)', textAlign: 'center' }}>Синхронизация...</div>}

            {/* ВКЛАДКА: ЗАЯВКИ */}
            {!loading && activeTab === 'requests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {requests.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Заявок нет.</p> : requests.map(req => (
                        <div key={req.id} style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--gold-solid)' }}>{req.name} ({req.request_type})</h3>
                                <select value={req.status} onChange={(e) => handleStatusChange(req.id, e.target.value)} style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '4px 8px' }}>
                                    <option value="new">Новая</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="closed">Закрыта</option>
                                </select>
                            </div>
                            <p style={{ margin: '0 0 1rem 0', color: '#ccc', whiteSpace: 'pre-wrap' }}>{req.message}</p>
                            <small style={{ color: 'var(--text-muted)' }}>Контакт: {req.contact_info} | Дата: {new Date(req.created_at).toLocaleString()}</small>
                        </div>
                    ))}
                </div>
            )}

            {/* ВКЛАДКА: СПИСОК ПРОЕКТОВ */}
            {!loading && activeTab === 'projects_list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Проекты не найдены.</p> : projects.map(proj => (
                        <div key={proj.id} style={{ background: 'var(--bg-panel)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{proj.title}</h3>
                                <small style={{ color: 'var(--text-muted)' }}>Создан: {new Date(proj.created_at).toLocaleDateString()}</small>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => openEditMode(proj)} style={{ background: 'transparent', color: 'var(--gold-solid)', border: '1px solid var(--gold-solid)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                                    Редактировать
                                </button>
                                <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ВКЛАДКА: РЕДАКТИРОВАНИЕ ПРОЕКТА */}
            {!loading && activeTab === 'project_edit' && editProject && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* ЛЕВАЯ КОЛОНКА: ДАННЫЕ ПРОЕКТА */}
                    <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Основа проекта</h2>
                        {formStatus && <div style={{ marginBottom: '1.5rem', color: formStatus.includes('Ошибка') ? '#ff4d4f' : 'var(--gold-solid)' }}>{formStatus}</div>}
                        
                        <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Название</label>
                                <input type="text" className="form-input" style={{ margin: 0 }} required value={editProject.title} onChange={e => setEditProject({...editProject, title: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Краткое описание</label>
                                <input type="text" className="form-input" style={{ margin: 0 }} required value={editProject.short_description} onChange={e => setEditProject({...editProject, short_description: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Полное описание</label>
                                <textarea className="form-input" rows="6" style={{ margin: 0, resize: 'vertical' }} required value={editProject.description} onChange={e => setEditProject({...editProject, description: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Заменить обложку (Опционально)</label>
                                <input type="file" accept="image/*" onChange={e => setEditProject({...editProject, new_cover: e.target.files[0]})} style={{ color: 'var(--text-main)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Команда (CTRL для нескольких)</label>
                                <select multiple className="form-input" style={{ margin: 0, height: '120px' }} value={editProject.developer_ids} onChange={(e) => setEditProject({...editProject, developer_ids: Array.from(e.target.selectedOptions, o => o.value)})}>
                                    {developers.map(dev => (
                                        <option key={dev.id} value={dev.developer_profile.id}>{dev.nickname}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start', padding: '10px 30px' }}>Сохранить проект</button>
                        </form>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА: АПДЕЙТЫ */}
                    <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Дневники и Патчноуты</h2>
                        
                        <form onSubmit={handleSaveUpdate} style={{ background: '#121212', padding: '1rem', borderRadius: '8px', border: '1px solid #222', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ margin: 0, color: updateForm.id ? 'var(--gold-solid)' : 'var(--text-main)' }}>
                                {updateForm.id ? 'Редактирование записи' : 'Новая запись'}
                            </h4>
                            <input type="text" placeholder="Заголовок (напр. Версия 1.1)" className="form-input" style={{ margin: 0 }} required value={updateForm.title} onChange={e => setUpdateForm({...updateForm, title: e.target.value})} />
                            
                            {/* ПОЛЕ ДЛЯ КАРТИНКИ */}
                            <input type="file" id="update-image-upload" accept="image/*" onChange={e => setUpdateForm({...updateForm, image: e.target.files[0]})} style={{ color: 'var(--text-main)', fontSize: '0.85rem' }} />
                            
                            <textarea placeholder="Что изменилось?" className="form-input" rows="3" style={{ margin: 0, resize: 'vertical' }} required value={updateForm.content} onChange={e => setUpdateForm({...updateForm, content: e.target.value})} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-gold" style={{ padding: '8px 20px' }}>{updateForm.id ? 'Обновить' : 'Добавить'}</button>
                                {updateForm.id && (
                                    <button type="button" onClick={() => setUpdateForm({ id: null, title: '', content: '' })} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>Отмена</button>
                                )}
                            </div>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projectUpdates.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Записей пока нет.</p> : projectUpdates.map(upd => (
                                <div key={upd.id} style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>{upd.title}</strong>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setUpdateForm({ id: upd.id, title: upd.title, content: upd.content })} style={{ background: 'transparent', border: 'none', color: '#409eff', cursor: 'pointer', padding: 0 }}>Ред.</button>
                                            <button onClick={() => handleDeleteUpdate(upd.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: 0 }}>Удал.</button>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', whiteSpace: 'pre-wrap' }}>{upd.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ВКЛАДКА: СОЗДАНИЕ (оставляем старую форму) */}
            {!loading && activeTab === 'project_create' && (
                <div style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    {/* ... (Тот же код формы создания, что был выше) ... */}
                    <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>Создать новый проект</h2>
                    {formStatus && <div style={{ marginBottom: '1.5rem', color: formStatus.includes('Ошибка') ? '#ff4d4f' : 'var(--gold-solid)' }}>{formStatus}</div>}
                    <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div><label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Название проекта</label><input type="text" className="form-input" style={{ margin: 0 }} required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} /></div>
                        <div><label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Краткое описание</label><input type="text" className="form-input" style={{ margin: 0 }} required value={newProject.short_description} onChange={e => setNewProject({...newProject, short_description: e.target.value})} /></div>
                        <div><label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Полное описание</label><textarea className="form-input" rows="6" style={{ margin: 0, resize: 'vertical' }} required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} /></div>
                        <div><label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Обложка проекта</label><input type="file" id="cover-upload" accept="image/*" onChange={e => setNewProject({...newProject, cover: e.target.files[0]})} style={{ color: 'var(--text-main)' }} /></div>
                        <div><label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Команда (CTRL для нескольких)</label><select multiple className="form-input" style={{ margin: 0, height: '120px' }} value={newProject.developer_ids} onChange={(e) => setNewProject({...newProject, developer_ids: Array.from(e.target.selectedOptions, o => o.value)})} >{developers.map(dev => (<option key={dev.id} value={dev.developer_profile.id}>{dev.nickname} - {dev.developer_profile.role}</option>))}</select></div>
                        <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start', padding: '10px 30px' }}>Опубликовать релиз</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;