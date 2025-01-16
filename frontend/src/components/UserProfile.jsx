import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Modal,
  Paper,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import { styled } from "@mui/system";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AuthContext } from "../contexts/AuthContext";
import { fetchUserById, followUser, unfollowUser, checkIfFollowing, updateUserProfile } from '../server-side/userprofile.js';
import { getPostsForUser } from '../server-side/posts.js';
import { FaSave, FaTrash, FaEdit } from "react-icons/fa";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ProfileImage = styled(Avatar)({
  width: 150,
  height: 150,
  margin: "0 auto 20px",
  border: "4px solid #fff",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
});

const StatBox = styled(Box)({
  textAlign: "center",
  padding: "10px",
  paddingTop: 0,
});

function formatDate(dateString) {
  const postDate = new Date(dateString);
  const formattedDate = postDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = postDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} ${formattedTime}`;
}

const UserProfile = ({ isMyProfile }) => {
  const { user: currentUser, isAuthenticated, token } = useContext(AuthContext);
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);



  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const userData = isMyProfile
          ? await fetchUserById(currentUser.id)
          : await fetchUserById(userId);
        setUser(userData);

        if (!isMyProfile) {
          if (isAuthenticated) {
            const following = await checkIfFollowing(userId, token);
            setIsFollowing(following);
          }
        }

        const userPosts = await getPostsForUser(userData.id, token);
        setPosts(userPosts);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, isMyProfile, userId, currentUser, token]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        username: editForm.username,
        email: editForm.email,
        profile_image: previewImage || "", // Передаем строку Base64
      };
  
      console.log("Submitting Form Data:", formData); // Проверяем отправляемые данные
      const updatedUser = await updateUserProfile(formData, token);
  
      setUser(updatedUser);
      setSnackbar({ open: true, message: "Профиль обновлён!", severity: "success" });
      setOpenModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({ open: true, message: "Ошибка обновления профиля", severity: "error" });
    }
  };
  

  const handleFollow = async () => {
    setActionLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId, token);
      } else {
        await followUser(userId, token);
      }
      setIsFollowing(!isFollowing);
      setSnackbar({
        open: true,
        message: isFollowing ? "Вы отписались!" : "Вы подписались!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({ open: true, message: "Ошибка обновления статуса подписки", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };


  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result); // Возвращаем строку Base64
      };

      reader.onerror = (error) => {
        reject(error); // В случае ошибки
      };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      getBase64(file)
        .then((result) => {
          const base64String = result.split(",")[1];
          console.log("Base64 String:", base64String);
  
          setPreviewImage(result); // Устанавливаем полный Base64 для предварительного просмотра
          setEditForm((prevState) => ({
            ...prevState,
            profile_image: base64String, // Сохраняем только строку Base64
          }));
        })
        .catch((err) => {
          console.error("Error reading file:", err);
        });
    }
  };
  

  const handleOpenModal = () => {
    setEditForm({
      username: user.username,
      email: user.email,
      profile_image: user.profile_image, // Если требуется
    });
    setOpenModal(true);
  };
  

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <ProfileImage
                src={user.profile_image || "f"}
                alt={user.username}
              />
              <Typography variant="h4" gutterBottom>
                {user.username}
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                {!isMyProfile && isAuthenticated && (
                  <Button
                    variant="contained"
                    color={isFollowing ? "primary" : "primary"}
                    onClick={handleFollow}
                    disabled={actionLoading}
                  >
                    {isFollowing ? "Отписаться" : "Подписаться"}
                  </Button>
                )}
              </Stack>
              {isMyProfile && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FaEdit />}
                  onClick={handleOpenModal}
                  fullWidth
                  sx = {
                    {
                      height: "45px",
                      width: "200px",
                    }
                  }
                >
                  Редактировать
                </Button>
              )}
              <Typography sx={{ mt: 2 }}variant="h6">Статистика</Typography>
                <Grid container sx={{ mt: 2 }}>
                  <Grid item xs={6} sm={6}>
                    <StatBox>
                      <PostAddIcon fontSize="medium" sx={{color: "#9000ff"}} />
                      <Typography variant="body2">{posts.length}</Typography>
                      <Typography variant="body2">Постов</Typography>
                    </StatBox>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <StatBox>
                      <PeopleIcon fontSize="medium" sx={{color: "#9000ff"}} />
                      <Typography variant="body2">{user.followers_count}</Typography>
                      <Typography variant="body2">Подписчиков</Typography>
                    </StatBox>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        

        <Grid item xs={12} md={8}>
          {isMyProfile && (
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Личные данные
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Имя пользователя" secondary={user.username} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="E-mail" secondary={user.email} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          )}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isMyProfile ? 'Ваши посты' : `Посты пользователя "${user.username}"`}
              </Typography>
              <List>
              {posts.length === 0 ? (
                <p>Постов не найдено.</p>
            ) : (
                <>
                    {posts.map((post) => (
                        <ListItem key={post.id}>
                        <ListItemText
                          primary={post.title}
                          secondary={formatDate(post.date)}
                        />
                      </ListItem>
                    ))}
                    </>
            )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <StyledModal open={openModal} onClose={() => setOpenModal(false)}>
        <Paper sx={{ p: 4, maxWidth: 500, width: "90%", maxHeight: "90vh", overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Редактирование
          </Typography>
          <form onSubmit={handleEditSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <input
                    accept="image/*"
                    type="file"
                    id="profile-image-upload"
                    hidden
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-image-upload">
                  <Avatar
                    src={previewImage || editForm.profile_image}
                    sx={{ width: 100, height: 100, margin: "0 auto", cursor: "pointer" }}
                  />

                  </label>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя пользователя"
                  value={editForm.username || ""} // Обеспечивает отсутствие ошибки при undefined
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} // Используем username
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editForm.email || ""} // Обеспечивает отсутствие ошибки при undefined
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  error={!!errors.email} // Показывает ошибку, если она есть
                  helperText={errors.email} // Сообщение об ошибке
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  startIcon={<FaSave />}
                  onClick={handleOpenModal}
                  fullWidth
                  color="primary"
                  variant="contained"
                  type ="submit"
                  
                >
                  Сохранить
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </StyledModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;
