import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import '../assets/styles/Header.css';
import logo from '../assets/logo.png';
import AuthModal from './AuthModal.jsx';
import Chat from './Chat.jsx';
import Notifications from './Notifications.jsx';
import { Input, Avatar, Badge } from 'antd';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import { useNotificationContext } from "../contexts/NotificationContext.jsx";
const { Search } = Input;

const HeaderContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Управление dropdown
  const { isAuthenticated, user, logout } = useContext(AuthContext); // Данные пользователя
  const { notificationCount } = useNotificationContext();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleIconClick = () => {
    if (isAuthenticated) {
        //toggleDropdown(menu);
    } else {
      setIsLogin(true);
      setShowAuthModal(true); // Открываем модальное окно
    }
  };

  const toggleDropdown = (menu) => {
    setDropdownOpen((prev) => (prev === menu ? null : menu));
  };

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleClickOutside = (event) => {
    // Если клик произошел вне dropdown меню, закрыть его
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null);
    }
  };

  useEffect(() => {
    // Добавляем обработчик кликов по документу
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Убираем обработчик при размонтировании компонента
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setShowAuthModal(false);
  };

  const onSearch = (value, _e, info) => console.log(info?.source, value);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary">
        <div className="container-fluid contentindent" ref={dropdownRef}>
          <button
            data-mdb-collapse-init
            className="navbar-toggler"
            type="button"
            data-mdb-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <a className="navbar-brand mt-2 mt-lg-0" href="#">
              <img
                src={logo}
                height="50"
                alt="DW"
                loading="lazy"
                style={{ transform: "scale(2)" }}
              />
            </a>
            
          </div>
          <div className="d-flex align-items-center">
            <a className="text-reset me-3" href="#">
              <i className="fas fa-shopping-cart"></i>
            </a>
            <div className="profile align-items-center" onClick={handleIconClick} ref={dropdownRef}>
              <div className='profileindent'>
                <Search
                placeholder="Найти"
                allowClear
                onSearch={onSearch}
              />
              </div>
                {isAuthenticated ? (
                <>
                    {/* Контент для авторизованных пользователей */}
                    {/*
                    <div className="dropdown">
                      <a
                        className="text-reset me-3"
                        href="#"
                        id="navbarDropdownMenuChat"
                        role="button"
                        aria-expanded={dropdownOpen === 'messages' ? 'true' : 'false'}
                        onClick={() => toggleDropdown('messages')}
                      >
                        <img
                          src="https://st3.depositphotos.com/8089676/32835/v/450/depositphotos_328355014-stock-illustration-notification-bell-icon-black-web.jpg"
                          className="rounded-circle"
                          height="35"
                          alt="Chat"
                          loading="lazy"
                        />
                      </a>
                      <ul
                        className={`dropdown-menu custom-dropdown-menu-end ${
                          dropdownOpen === 'messages' ? 'show2' : ''
                        }`}
                        aria-labelledby="navbarDropdownMenuChat"
                      >
                        <li>
                          <Chat />
                        </li>
                      </ul>
                    </div>
                    */}
                    <div className="dropdown">
                      <div
                        className="text-reset me-3"
                        id="navbarDropdownMenuLink"
                        role="button"
                        aria-expanded={dropdownOpen === 'notifications' ? 'true' : 'false'}
                        onClick={() => toggleDropdown('notifications')}
                      >
                      <Badge count={notificationCount} overflowCount={99}>
                          <Avatar icon={<BellOutlined />} />
                      </Badge>
                      </div>
                      <ul
                        className={`dropdown-menu custom-dropdown-menu-end ${
                          dropdownOpen === 'notifications' ? 'show2' : ''
                        }`}
                        aria-labelledby="navbarDropdownMenuLink"
                      >
                        <Notifications />
                      </ul>
                    </div>
                    <div className="dropdown">
                      <div
                        className="d-flex align-items-center"
                        id="navbarDropdownMenuAvatar"
                        role="button"
                        aria-expanded={dropdownOpen === 'profile' ? 'true' : 'false'}
                        onClick={() => toggleDropdown('profile')}
                      >
                        <Avatar icon={<UserOutlined />} />
                      </div>
                      <ul
                        className={`dropdown-menu custom-dropdown-menu-end ${
                          dropdownOpen === 'profile' ? 'show2' : ''
                        }`}
                        aria-labelledby="navbarDropdownMenuAvatar"
                      >
                        <li>
                          <a className="dropdown-item" href="/profile/me">My profile</a>
                        </li>
                        <li>
                          <a className="dropdown-item">Settings</a>
                        </li>
                        <li>
                          <a className="dropdown-item" onClick={logout}>Logout</a>
                        </li>
                      </ul>
                    </div>
                </>
                ) : (
                  <>
                    {/* Контент для неавторизованных пользователей */}
                    <i className="bx bx-log-in profile_icon"></i>
                    <span className="log-in_text">Вход</span>
                  </>
                )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          onClose={handleClose}
          toggleForm={handleToggleForm}
          isLogin={isLogin}
        />
      )}
    </>
  );
};

const Header = () => <HeaderContent />;

export default Header;
