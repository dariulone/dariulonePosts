import React, { useState, useContext } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword.jsx';
import { GoogleIcon, FacebookIcon } from './CustomIcons.jsx';
import SitemarkIcon from "./dariuloneIcon.jsx"
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../contexts/AuthContext.jsx';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInModal = ( {onClose, toggleForm}) => {
  const [showPassword, setShowPassword] = useState(false); // Для управления видимостью пароля
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const { login } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');
  
    try {
      // Вызываем функцию `login` из AuthContext
      await login(username, password);
  
      // Если успешно, показываем сообщение об успехе и закрываем модальное окно
      setSnackbar({ open: true, message: 'Вы успешно вошли!', severity: 'success' });
      onClose(); // Закрываем модальное окно
    } catch (error) {
      // Если ошибка, показываем сообщение
      const errorMessage = error.response?.data?.detail || 'Неверный логин или пароль';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const validateInputs = () => {
    const username = document.getElementById('username');
    const password = document.getElementById('password');

    let isValid = true;

    if (!username.value || username.value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage('Пользователь > 3 символов.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Пароль должен быть не менее 6 символов.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Card>
          <IconButton
            onClick={onClose}
            sx={{
              top: 0,
              right: 8,
              color: 'grey.500',
              alignSelf: "end",
              "&:focus": {
                          outline: "none", // Убираем обводку
                          },
            }}
          >
            <CloseIcon />
          </IconButton>
            
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
              Вход
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="username">Имя пользователя</FormLabel>
                <TextField
                  id="username"
                  name="username"
                  placeholder="username"
                  required
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
              <FormControl>
              <FormLabel htmlFor="password">Пароль</FormLabel>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type={showPassword ? 'text' : 'password'} // Меняется тип для видимости пароля
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                />
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    "&:focus": {
                          outline: "none", // Убираем обводку
                          },
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Box>
            </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Запомнить меня"
              />
              <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Войти
            </Button>
              <Link
                component="button"
                type="button"
                onClick={() => alert('Forgot password clicked')}
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Забыли пароль?
              </Link>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ textAlign: 'center' }}>
                Нету аккаунта?{' '}
                <Link
                  onClick={toggleForm}
                  variant="body2"
                  sx={{ alignSelf: 'center', cursor: "pointer" }}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Box>
          </Card>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default SignInModal;
