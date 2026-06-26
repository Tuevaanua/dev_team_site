import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Пускает только залогиненных юзеров, иначе кидает на логин
export const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;
    
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Пускает только разработчиков (для админ-панели фронтенда)
export const DeveloperRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;
    
    return (user && user.is_developer) ? <Outlet /> : <Navigate to="/" replace />;
};