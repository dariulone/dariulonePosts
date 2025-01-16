import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getTopPosts } from '../server-side/posts'; // Предположим, этот метод обращается к вашему FastAPI
import MessageTwoToneIcon from '@mui/icons-material/MessageTwoTone';
import { LikeOutlined, MessageOutlined, EyeOutlined } from "@ant-design/icons";
import { Space } from "antd";

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const SyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
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
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

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
        padding: '16px',
        paddingBottom: 0,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
        <Avatar
          alt={author.username}
          src={author.profile_image   || 'https://via.placeholder.com/24'} // Плейсхолдер, если аватар отсутствует
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

export default function MainPage() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState(null);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const posts = await getTopPosts(6); // Запрашиваем 6 самых популярных постов
        setTopPosts(posts);
      } catch (error) {
        console.error('Ошибка при загрузке топовых постов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, []);

  const handleFocus = (index) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handlePostClick = (slug) => {
    navigate(`/posts/${slug}`);
    };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div>
        <Typography variant="h2" gutterBottom>
          Топовые посты
        </Typography>
        <Typography>Узнайте, что сейчас популярно!</Typography>
      </div>
      <Grid container spacing={2} columns={6}>
        {topPosts.map((post) => (
          <Grid key={post.id} size={{ xs: 12, sm: 12, md: 2 }}>
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
              <SyledCardContent>
                <Typography gutterBottom variant="caption" component="div">
                  {post.category || 'Главное'}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {post.title}
                </Typography>
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
                  padding: '16px',
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
            </SyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
