import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  TextField,
  Typography,
  styled,
  FormLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ReactQuill from 'react-quill'; // Импорт React Quill
import 'react-quill/dist/quill.snow.css'; // Импорт стилей React Quill
import { AuthContext } from '../contexts/AuthContext.jsx';
import { createPostForUser } from "../server-side/posts.js"; // Импортируем функцию для создания поста через API

const StyledQuillWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  padding: "8px 12px",
  border: `1px solid ${
    theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[300]
  }`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#FFFFFF",
  color: theme.palette.mode === "dark" ? "#FFFFFF" : theme.palette.text.primary,
  "&:hover": {
    borderColor: "#9000ff",
  },
  "&.Mui-focused": {
    borderColor: "#9000ff",
    boxShadow: `0 0 0 2px rgba(144, 0, 255, 0.4)`,
  },
  ".quill": {
    flex: 1,
    "& .ql-editor": {
      minHeight: "6rem",
      padding: "0",
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      color: theme.palette.text.primary,
      "&.ql-blank::before": {
        position: "absolute",
        left: 0,
        right: 0,
        color: theme.palette.mode === "dark" ? theme.palette.grey[500] : theme.palette.grey[700],
        opacity: 0.7, // Прозрачность плейсхолдера
        pointerEvents: "none", // Плейсхолдер не взаимодействует с мышью
      },
    },
    "& .ql-container": {
      border: "none",
      backgroundColor: "inherit",
    },
    "& .ql-toolbar": {
      border: "none",
      borderBottom: `1px solid ${
        theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[300]
      }`,
      backgroundColor: theme.palette.background.paper,
    },
  },
}));



const StyledPreview = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4)
}));

const ImagePlaceholder = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 200,
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius
}));

const CreatePost = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [post, setPost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [],
    image: null,
  });
  const [category, setCategory] = useState('');

  const handleChange = (event) => {
    setCategory(event.target.value);
  };

  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      getBase64(file)
        .then((result) => {
          const base64Image = result.startsWith("data:image/")
            ? result
            : `data:image/${file.type.split("/")[1]};base64,${result.split(",")[1]}`;
          console.log("Base64 Image:", base64Image); // Проверяем, что изображение корректное
          setMainImage(base64Image);
        })
        .catch((err) => {
          console.log("Error reading file", err);
        });
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
      }
      setCurrentTag("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete)
    }));
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Заголовок обязателен";
    // Проверка на пустоту body можно улучшить, например, удалив HTML-теги
    const strippedBody = formData.body.replace(/<[^>]+>/g, '').trim();
    if (!strippedBody) newErrors.body = "Текст обязателен";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Объявляем handleSubmit как асинхронную функцию
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Post submitted:", formData, category);
      const postData = {
        title: formData.title,
        body: formData.body,
        main_image: mainImage, // Передаем строку Base64 изображения
        tags: formData.tags,
        category: category
      };

      try {
        // Убедитесь, что createPostForUser возвращает промис
        const createPostResponse = await createPostForUser(user.id, postData, token); // Функция для отправки на сервер
        setPost(createPostResponse); // Сохраняем ответ от сервера
        setFormData({
          title: "",
          body: "",
          tags: [],
          image: null,
          category: "",
        }); // Очищаем форму
        setMainImage(null); // Очищаем изображение
        setCategory(null)
      } catch (err) {
        setError("Failed to create post");
        console.log("Error creating post", err);
        setSnackbar({ open: true, message: "Ошибка в заполнении поста", severity: "error" });
      } finally {
        setSnackbar({ open: true, message: "Пост опубликован!", severity: "success" });
      }

      // Дополнительная обработка отправки формы здесь, если необходимо
    }
  };


  // Настройки для React Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];
  const [focused, setFocused] = useState(false);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Создать новый пост
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormLabel htmlFor="body">Заголовок</FormLabel>
              <TextField
                fullWidth
                name="title"
                placeholder="Введите заголовок"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} >
              <FormLabel htmlFor="body">Текст</FormLabel>
              <StyledQuillWrapper className={focused ? "Mui-focused" : ""}>
              <ReactQuill
                theme="snow"
                value={formData.body}
                onChange={(content, delta, source, editor) => {
                  setFormData((prev) => ({
                    ...prev,
                    body: content
                  }));
                  if (errors.body) {
                    setErrors((prev) => ({ ...prev, body: "" }));
                  }
                }}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Введите текст поста..."
              />
              </StyledQuillWrapper>
              {errors.body && <Typography color="error">{errors.body}</Typography>}
            </Grid>

            <Grid item xs={12}>
              
                <InputLabel id="category-select-label">Категория</InputLabel>
                <Select
                  variant='outlined'
                  labelId="category-select-label"
                  id="category-select"
                  value={category}
                  label="Категория *"
                  onChange={handleChange}
                  sx = {{
                    "&:focus": {
                        outline: "none",
                      },
                  }}
                >
                  <MenuItem value="">
                    <em>Без</em>
                  </MenuItem>
                  <MenuItem value={"Крипто"}>Крипто</MenuItem>
                  <MenuItem value={"Стиль"}>Стиль</MenuItem>
                  <MenuItem value={"Политика"}>Политика</MenuItem>
                  <MenuItem value={"Экономика"}>Экономика</MenuItem>
                  <MenuItem value={"Бизнес"}>Бизнес</MenuItem>
                  <MenuItem value={"Технологии"}>Технологии и медиа</MenuItem>
                  <MenuItem value={"Финансы"}>Финансы</MenuItem>
                  <MenuItem value={"Спорт"}>Спорт</MenuItem>
                  <MenuItem value={"Общество"}>Общество</MenuItem>
                </Select>
              
            </Grid>

            <Grid item xs={12}>
              <InputLabel id="tags-select-label">Теги</InputLabel>
              <TextField
                fullWidth
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                variant="outlined"
                helperText="Нажмите Enter, чтобы добавить теги"
                sx = {{
                  "&:focus": {
                      outline: "none",
                      color: "#9000ff",
                    },
                }}
              />
              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                component="label"
                startIcon={<AddPhotoAlternateOutlinedIcon />}
              >
                Загрузить изображение
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>

            
          </Grid>
        </form>

        <StyledPreview>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ 
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "0 auto",
              }}>
              Предпросмотр
            </Typography>
            <Typography variant="h6" gutterBottom>
              {formData.title || "Заголовок"}
            </Typography>
            {mainImage ? (
              <CardMedia
                component="img"
                //height="300"
                image={mainImage}
                alt="Post preview"
                sx={{ objectFit: "cover", borderRadius: 1, width: "50%" }}
              />
            ) : (
              <ImagePlaceholder>
                <ImageOutlinedIcon style={{ fontSize: 48, color: '#bdbdbd' }} />
              </ImagePlaceholder>
            )}
            <Box
              variant="body1"
              paragraph
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{ __html: formData.body || "Ваш текст появится здесь..." }}
            />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {formData.tags.map((tag) => (
                <Chip key={tag} label={tag} color="primary" size="small" />
              ))}
            </Box>
          </CardContent>
        </StyledPreview>
        <Grid item xs={12} sx={{ 
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "0 auto",
              }}>
              <Button
                onClick={handleSubmit}
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Создать пост
              </Button>
            </Grid>
      </Box>
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

export default CreatePost;
