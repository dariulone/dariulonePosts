import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import UserProfile from './components/UserProfile';
import AuthModal from './components/AuthModal';
import CreatePost from './components/CreatePost';
import PostLoader from './components/PostLoader';
import UserProfileWrapper from './components/UserProfileWrapper';
import MainPage from './components/MainPage';
import { NotificationProvider } from "./contexts/NotificationContext";
import './assets/styles/App.css';
import Latest from './components/Latest';
import Footer from './components/Footer';
import Container from '@mui/material/Container';
import AppAppBar from './components/Appbar';
import AppTheme from '../shared-theme/AppTheme'
import CssBaseline from '@mui/material/CssBaseline';


const App = (props) => {
  const [showAuthModal, setShowAuthModal] = useState(false); // Управляет отображением модального окна
  const [isLogin, setIsLogin] = useState(true); // Управляет типом формы (логин или регистрация)
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Показываем модальное окно только для маршрутов авторизации
    if (location.pathname === '/login') {
      setShowAuthModal(true);
      setIsLogin(true); // Устанавливаем логин
    } else if (location.pathname === '/register') {
      setShowAuthModal(true);
      setIsLogin(false); // Устанавливаем регистрацию
    } else {
      setShowAuthModal(false); // Закрываем модальное окно
    }
  }, [location]);

  const handleClose = () => {
    setShowAuthModal(false);
    navigate('/'); // Возвращаемся на главную страницу при закрытии
  };

  const handleToggleForm = () => {
    // Переключаем между логином и регистрацией
    navigate(isLogin ? '/register' : '/login');
  };

  return (
    <>
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <NotificationProvider>
        <AppAppBar />
      </NotificationProvider>
      {showAuthModal && (
        <AuthModal
          onClose={handleClose}
          toggleForm={handleToggleForm}
          isLogin={isLogin}
        />
      )}
      <Routes>
          <Route path="/profile/me" element={<UserProfile isMyProfile={true} />} />
          <Route path="/profile/:userId" element={<UserProfileWrapper />} />
          <Route path="/" element={
           <Container
            maxWidth="lg"
            component="main"
            sx={{ display: 'flex', flexDirection: 'column', my: 8, gap: 4 }}
          >
            <MainPage />
            <Latest />
            <Footer />
        </Container>} />
          <Route path="/createpost" element={<CreatePost />} />
          <Route path="/posts/*" element={<PostLoader />} />
      </Routes>
    </AppTheme>
    </>
  );
};

const Root = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default Root;
