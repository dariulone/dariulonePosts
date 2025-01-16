import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { getAllPosts } from '../server-side/posts'; // Функция для получения данных
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { LikeOutlined, MessageOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { Space } from "antd";

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const SyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const SyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  flexGrow: 1,
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  position: 'relative',
  textDecoration: 'none',
  '&:hover': { cursor: 'pointer' },
  '& .arrow': {
    visibility: 'hidden',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '&:hover .arrow': {
    visibility: 'visible',
    opacity: 0.7,
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '3px',
    borderRadius: '8px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: '1px',
    bottom: 0,
    left: 0,
    backgroundColor: (theme.vars || theme).palette.text.primary,
    opacity: 0.3,
    transition: 'width 0.3s ease, opacity 0.3s ease',
  },
  '&:hover::before': {
    width: '100%',
  },
}));

function formatDate(dateString) {
  const postDate = new Date(dateString);
  const now = new Date();
  const timeDifference = now - postDate; // Разница в миллисекундах
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) {
    // Если прошло больше 24 часов
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = postDate
      .toLocaleDateString('ru-RU', options)
      .replace(' г.', ''); // Удаляем 'г.' для корректного формата
    return formattedDate
  } else if (hours >= 1) {
    // Если прошло больше часа
    const hourForm = hours % 10 === 1 && hours !== 11 ? 'час' : (hours % 10 >= 2 && hours % 10 <= 4 && (hours < 12 || hours > 14)) ? 'часа' : 'часов';
    return `${hours} ${hourForm} назад`;
  } else if (minutes >= 1) {
    // Если прошло больше минуты
    return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`;
  } else {
    // Если прошло меньше минуты
    return `${seconds} ${seconds === 1 ? 'секунду' : seconds < 5 ? 'секунды' : 'секунд'} назад`;
  }
}

function Author({ author, date }) {
  if (!author) {
    return null; // Если данных об авторе нет, ничего не отображаем
  }

  const formattedDate = formatDate(date);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 0,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
        <Avatar
          alt={author.username}
          src={author.profile_image || 'https://via.placeholder.com/24'} // Плейсхолдер, если аватар отсутствует
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="caption">{author.username}</Typography>
      </Box>
      <Typography variant="caption">{formattedDate}</Typography>
    </Box>
  );
}

Author.propTypes = {
  author: PropTypes.shape({
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string, // Если аватар не обязателен
  }).isRequired,
};


export default function Latest() {
  const [posts, setPosts] = useState([]); // Состояние для хранения постов
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [filteredPosts, setFilteredPosts] = useState([]); // Состояние для отфильтрованных постов
  const [page, setPage] = useState(1); // Состояние текущей страницы
  const [focusedCardIndex, setFocusedCardIndex] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = useState(''); // Состояние для выбранной категории
  const [categories, setCategories] = useState(['Все категории', 'Крипто', 'Стиль', 'Политика', 'Экономика', 'Бизнес', 'Технологии и медиа', 'Финансы', 'Спорт']); // Заданные категории
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getAllPosts(page, 10); // Загружаем 10 постов на каждой странице
        // Проверяем, чтобы не было дублирования постов
        setPosts((prevPosts) => {
          const newPosts = data.filter(post => !prevPosts.some(existingPost => existingPost.id === post.id));
          return [...prevPosts, ...newPosts]; // Добавляем только новые посты
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]); // Загружаем посты каждый раз, когда меняется страница


  useEffect(() => {
    if (selectedCategory === '' || selectedCategory === 'Все категории') {
      setFilteredPosts(posts); // Если категория не выбрана или выбрана "Все категории", показываем все посты
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory)); // Фильтруем посты по категории
    }
  }, [selectedCategory, posts]); // Фильтруем посты, когда меняется категория или список постов

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1); // Увеличиваем страницу на 1 для загрузки следующих постов
  };

  const handleFocus = (index) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handlePostClick = (slug) => {
    navigate(`/posts/${slug}`);
    };

    const handleCategoryClick = (category) => {
      setSelectedCategory(category); // Устанавливаем выбранную категорию
      setPage(1); // Сбросить страницу на 1 при изменении категории
      //setPosts([]); // Очистить посты перед загрузкой новых
    };

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
      </Box>
      <Typography variant="h2" gutterBottom>
        Последние публикации
      </Typography>
      <Box sx={{ display: 'inline-flex', flexDirection: 'row', gap: 1, overflow: 'auto' }}>
        {categories.map((category) => (
          <Chip
            key={category}
            onClick={() => handleCategoryClick(category)}
            size="medium"
            label={category}
            sx={{  
              backgroundColor: selectedCategory === category ? 'primary' : "white",
              border: selectedCategory === category ? "primary" :'none',
            }}
          />
        ))}
      </Box>

      <Grid container spacing={2} columns={8} sx={{ my: 2 }}>
        {filteredPosts.map((post, index) => (
          <Grid key={index} size={{ xs: 12, sm: 8, md: 2 }}>
            <SyledCard
              variant="outlined"
              onFocus={() => handleFocus(0)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
              onClick={() => handlePostClick(post.slug)}
            >
              {post.main_image ? (
                  <CardMedia
                  component="img"
                  alt={post.title}
                  image={post.main_image ? `${post.main_image}` : 'https://placehold.co/800x450'}
                  sx={{
                    aspectRatio: '16 / 9',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                ) : null}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1,
                height: '100%',
                paddingBottom: 0,
                marginBottom: 0,
              }}
            >
              <SyledCardContent>
              <Typography gutterBottom variant="caption" component="div">
                {post.category || 'Главное'}
              </Typography>
              <TitleTypography
                gutterBottom
                variant="h6"
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                tabIndex={0}
                sx={{ display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                 }}
                className={focusedCardIndex === index ? 'Mui-focused' : ''}
              >
                {post.title}
                <NavigateNextRoundedIcon
                  className="arrow"
                  sx={{ fontSize: '1rem' }}
                />
              </TitleTypography>
              {/* <StyledTypography variant="body2" color="text.secondary" gutterBottom dangerouslySetInnerHTML={{ __html: post.body }}>
                {post.body}
              </StyledTypography> */}
              <Typography
                variant="body2"
                paragraph
                dangerouslySetInnerHTML={{ __html: post.body }}
                color="text.secondary"
                gutterBottom
                sx={{ display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                 }}
              />
              </SyledCardContent>

              <Author author={post.author} date={post.date} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingTop: 0,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <IconText
                    icon={LikeOutlined}
                    text={post.likes}
                    key="list-vertical-like-o"
                  />
                  <IconText
                    icon={MessageOutlined}
                    text={post.comments.length}
                    key="list-vertical-message"
                  />
                  <IconText
                    icon={EyeOutlined}
                    text={post.views_count}
                    key="list-vertical-eye-o"
                />
                </Box>
                
              </Box>
            </Box>
            </SyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Кнопка загрузки новых постов */}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        {filteredPosts.length >= 10 && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Загрузить ещё'}
          </Button>
        )}
      </Box>
    </div>
  );
}
