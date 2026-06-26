import { useState } from 'react';
import api from '../api/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact_info: '',
        request_type: 'order',
        message: ''
    });
    
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });

        try {
            await api.post('projects/requests/', formData);
            setStatus({ loading: false, success: true, error: '' });
            setFormData({ name: '', contact_info: '', request_type: 'order', message: '' });
        } catch (err) {
            console.error(err);
            setStatus({ loading: false, success: false, error: 'Произошла ошибка при отправке заявки. Попробуйте позже.' });
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Сотрудничество
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Оставьте заявку на разработку проекта, коммерческое предложение или запрос на интеграцию. Мы свяжемся с вами в кратчайшие сроки.
                </p>
            </div>

            <div style={{ background: 'var(--bg-panel)', padding: '3rem', borderRadius: '12px', border: '1px solid #333' }}>
                {status.success ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ color: 'var(--gold-solid)', marginBottom: '1rem' }}>Заявка успешно отправлена!</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Администратор студии рассмотрит ваше обращение и свяжется по указанным контактам.</p>
                        <button onClick={() => setStatus({ ...status, success: false })} className="btn-gold" style={{ marginTop: '2rem', padding: '10px 30px' }}>
                            Отправить еще одну
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {status.error && (
                            <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff4d4f' }}>
                                {status.error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 250px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Имя или название компании *</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ margin: 0 }} 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required 
                                />
                            </div>
                            <div style={{ flex: '1 1 250px' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Контакты (Telegram / Email) *</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ margin: 0 }} 
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Тип обращения *</label>
                            <select 
                                className="form-input" 
                                style={{ margin: 0, cursor: 'pointer', appearance: 'auto' }}
                                value={formData.request_type}
                                onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                            >
                                <option value="order">Заказ разработки</option>
                                <option value="collab">Сотрудничество / Партнерство</option>
                                <option value="ad">Реклама / PR</option>
                                <option value="other">Другое</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Суть предложения *</label>
                            <textarea 
                                className="form-input" 
                                rows="6" 
                                style={{ margin: 0, resize: 'vertical' }}
                                placeholder="Опишите вашу задачу, бюджет и сроки..."
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-gold" style={{ alignSelf: 'flex-start', padding: '12px 40px', marginTop: '1rem', fontSize: '1rem' }} disabled={status.loading}>
                            {status.loading ? 'Отправка...' : 'Оставить заявку'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Contact;