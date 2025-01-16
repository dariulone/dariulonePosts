import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import UserProfile from './UserProfile';

const UserProfileWrapper = () => {
    const { user: currentUser, isAuthenticated } = useContext(AuthContext); // isAuthenticated добавлено для проверки
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            // Если пользователь авторизован, проверяем, нужно ли перенаправить
            if (currentUser && parseInt(userId, 10) === currentUser.id) {
                navigate('/profile/me', { replace: false });
            }
            setLoading(false);
        } else {
            // Если пользователь не авторизован, убираем загрузку
            setLoading(false);
        }
    }, [currentUser, userId, isAuthenticated, navigate]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    // Передаем флаг `isMyProfile`, если это профиль текущего пользователя
    return (
        <UserProfile isMyProfile={isAuthenticated && parseInt(userId, 10) === currentUser?.id} />
    );
};

export default UserProfileWrapper;
