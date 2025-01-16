import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import '../assets/styles/Header.css';
import logo from '../assets/logo.png';
import AuthModal from './AuthModal.jsx';
import { Input, Avatar } from 'antd';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import { useNotificationContext } from '../contexts/NotificationContext.jsx';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import { Drawer } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import Person from '@mui/icons-material/Person';
import SitemarkIcon from './dariuloneIcon.jsx'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Notifications from '../components/Notifications.jsx'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const { Search } = Input;

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar( ) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null); // Якорь для меню уведомлений
  const [anchorElAccount, setAnchorElAccount] = useState(null); // Якорь для меню аккаунта
  const [open, setOpen] = useState(false); // Drawer
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { notificationCount } = useNotificationContext();
  const [hasNotifications, setHasNotifications] = useState(true); // Контроль состояния иконки
  const navigate = useNavigate();

  const handleIconClickNotifications = (event) => {
    if (isAuthenticated) {
      setAnchorElNotifications(event.currentTarget); // Открываем меню уведомлений
      setHasNotifications(false); // Сбрасываем состояние при клике
    }
  };

  const handleIconClickAccount = (event) => {
    if (isAuthenticated) {
      setAnchorElAccount(event.currentTarget); // Открываем меню аккаунта
    } else {
      setHasNotifications(true); // Восстанавливаем состояние иконки уведомлений
      setAnchorElNotifications(null); // Закрываем меню уведомлений
      setAnchorElAccount(null); // Закрываем меню аккаунта
    }
  };
  
  const handleLoginClick = () => {
    if (isAuthenticated) {
        //toggleDropdown(menu);
    } else {
      setHasNotifications(true); // Восстанавливаем состояние иконки уведомлений
      setAnchorElNotifications(null); // Закрываем меню уведомлений
      setAnchorElAccount(null); // Закрываем меню аккаунта
      setIsLogin(true);
      setShowAuthModal(true); // Открываем модальное окно
    }
  };

  const handleCloseMenu = () => {
    setAnchorElNotifications(null); // Закрываем меню уведомлений
    setAnchorElAccount(null); // Закрываем меню аккаунта
    setHasNotifications(true); // Восстанавливаем состояние иконки уведомлений
  };

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const onSearch = (value) => {
    console.log('Search value:', value);
  };

  const profileClick = () => {
    setAnchorElNotifications(null); // Закрываем меню уведомлений
    setAnchorElAccount(null); // Закрываем меню аккаунта
    navigate('/profile/me')

  }

  const logoClick = () => {
    setAnchorElNotifications(null); // Закрываем меню уведомлений
    setAnchorElAccount(null); // Закрываем меню аккаунта
    navigate('/');

  }

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleClose = () => {
    setShowAuthModal(false);
  };


  const handleCreateClick = () => {
    navigate('/createpost');
  };

  return (
    <AppBar
      position="static"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container
        sx={{
          width: 'auto',
          margin: '0 auto',
          paddingLeft: 'calc(2 * var(--template-spacing))',
          paddingRight: 'calc(2 * var(--template-spacing))',
        }}
      >
        <StyledToolbar variant="dense" disableGutters>
          <Box onClick={logoClick} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0, cursor: "pointer" }}
          >
            <SitemarkIcon onClick={logoClick} sx={{ cursor: "pointer" }}/>
          </Box>
          <Box sx={{ display: 'flex', gap: 0, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Badge color="secondary" badgeContent={notificationCount} max={99}>
                  <IconButton
                    variant="contained"
                    onClick={handleIconClickNotifications}
                    size="medium"
                    sx={{ 
                      color: "#9000ff",
                      border: 0, 
                        "&:focus": {
                          outline: "none", // Убираем обводку
                          }, 
                        }}
                    aria-controls={anchorElNotifications ? 'notifications' : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorElNotifications)}
                  >
                    {hasNotifications ? (
                      <NotificationsNoneIcon />
                    ) : (
                      <NotificationsIcon />
                    )}
                  </IconButton>
                </Badge>

                <Menu
                  anchorEl={anchorElNotifications}
                  id="notifications"
                  open={Boolean(anchorElNotifications)}
                  onClose={handleCloseMenu}
                  keepMounted
                  
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                      "&:focus": {
                        outline: "none", // Убираем обводку
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Notifications />
                </Menu>
                <IconButton
                  variant="contained"
                  onClick={handleCreateClick}
                  size="medium"
                  sx={{ 
                    color: "#9000ff",
                    border: 0, 
                    "&:focus": {
                          outline: "none", // Убираем обводку
                          }, 
                  }}
                >
                  <AddCircleOutlineIcon />
                  </IconButton>
                <IconButton
                  variant="contained"
                  onClick={handleIconClickAccount}
                  size="medium"
                  sx={{ 
                    color: "#9000ff",
                    border: 0, 
                    "&:focus": {
                          outline: "none", // Убираем обводку
                          }, 
                  }}
                  aria-controls={anchorElAccount ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorElAccount)}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorElAccount}
                  id="account-menu"
                  open={Boolean(anchorElAccount)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={profileClick}>
                    <ListItemIcon>
                      <Person sx={{color: "#9000ff"}} />
                    </ListItemIcon>
                    Профиль
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    <ListItemIcon>
                      <Logout sx={{color: "#9000ff"}} />
                    </ListItemIcon>
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                size="medium"
                aria-label="Login button"
                onClick={handleLoginClick}
                sx={{ 
                  color: "#9000ff",
                  border: 0, 
                    "&:focus": {
                      outline: "none", // Убираем обводку
                      }, 
                    }}
              >
                <LoginIcon />
              </IconButton>
            )}
            <ColorModeIconDropdown size="medium" sx={{ color: "#9000ff", border: 0, "&:focus": {
                          outline: "none", // Убираем обводку
                          },  }} />
          </Box>
          {/* <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)} sx={{border: 0, "&:focus": {
                          outline: "none", // Убираем обводку
                          }, }}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <MenuItem>Features</MenuItem>
                <MenuItem>Testimonials</MenuItem>
                <MenuItem>Highlights</MenuItem>
                <MenuItem>Pricing</MenuItem>
                <MenuItem>FAQ</MenuItem>
                <MenuItem>Blog</MenuItem>
              </Box>
            </Drawer>
          </Box> */}
        </StyledToolbar>
      </Container>
      {showAuthModal && (
        <AuthModal
          onClose={handleClose}
          toggleForm={handleToggleForm}
          isLogin={isLogin}
        />
      )}
    </AppBar>
  );
}
