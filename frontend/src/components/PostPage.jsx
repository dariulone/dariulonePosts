import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  IconButton,
  TextField,
  Button,
  Paper,
  Box,
  Chip,
  Divider
} from "@mui/material";
import { Link } from 'react-router-dom';
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { get_related_posts, createComment, likePost, unlikePost, checkPostIsLiked, increment_views } from "../server-side/posts";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { AuthContext } from "../contexts/AuthContext";

const ContentPost = ({ post }) => {
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post?.comments || []);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
        try {
            const isLiked = await checkPostIsLiked(post.id, token);
            setHasLiked(isLiked);
        } catch (error) {
            console.error("Error checking like status:", error);
        }
    };

    const increment_post_view = async () => {
      try {
          const hasViewed = await increment_views(post.id);
          setHasViewed(hasViewed);
      } catch (error) {
          console.error("Error viewed:", error);
      }
  };

    fetchLikeStatus();
    increment_post_view();
}, [post.id, token]);

  useEffect(() => {
    // Загружаем похожие посты
    const fetchRelatedPosts = async () => {
      try {
        const response = await get_related_posts(post.slug);
        setRelatedPosts(response.related_posts || []);
      } catch (error) {
        console.error("Error fetching related posts:", error);
      }
    };

    fetchRelatedPosts();
  }, [post.slug]);

  const handleLike = async () => {
    try {
        const updatedLikes = hasLiked
            ? await unlikePost(post.id, token)
            : await likePost(post.id, token);
        setLikes(updatedLikes);
        setHasLiked(!hasLiked);
    } catch (error) {
        console.error("Failed to update likes:", error);
    }
};

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      console.error("Comment is empty");
      return;
    }

    try {
      // Вызываем API для создания комментария
      const createdComment = await createComment(post.id, newComment, token);

      // Обновляем список комментариев
      setComments((prevComments) => [...prevComments, createdComment]);

      // Сбрасываем поле ввода
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            {post.main_image && (
              <CardMedia
                component="img"
                height="400"
                image={`${post.main_image}`}
                alt={post.title}
              />
            )}
            <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              {/* Левый блок: автор */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar src={post.author.profile_image || ""} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.author.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    опубликовано {new Date(post.date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Правый блок: просмотры */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <VisibilityOutlinedIcon />
                <Typography variant="body2">{post.views_count}</Typography>
              </Box>
            </Box>

              <Typography variant="h4" gutterBottom>
                {post.title}
              </Typography>

              <Typography
                variant="body1"
                paragraph
                sx={{
                  "& img": {
                    maxWidth: "90%", // Уменьшение размера в два раза
                    display: "block", // Устанавливает блочное отображение
                    margin: "16px auto", // Центрирование по горизонтали
                  },
                }}
                dangerouslySetInnerHTML={{ __html: post.body }}
              />

              
              {isAuthenticated && (
                <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <IconButton sx={{ 
                    color: "#9000ff",
                    border: 0, 
                    "&:focus": {
                          outline: "none", // Убираем обводку
                          }, 
                  }} onClick={handleLike} color="primary">
                  {hasLiked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
                </IconButton>
                <Typography variant="body2">{likes}</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Комментарии
              </Typography>
              <form onSubmit={handleCommentSubmit}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" type="submit">
                  Отправить
                </Button>
              </form>
              
              <Box sx={{ mt: 3 }}>
              {comments.map((comment) => (
                <>
                <Paper key={comment.id} sx={{ p: 1, mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Avatar src={comment.author.profile_image} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2">{comment.author.username}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ paddingLeft: "10px" }}variant="body2">{comment.body}</Typography>
                </Paper>
                </>
              ))}
              </Box>
              </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Похожее</Typography>
          {relatedPosts.map((relatedPost) => (
            <Link key={relatedPost.slug} to={`/posts/${relatedPost.slug}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ mb: 2 }}>
                {relatedPost.image ? (
                  <CardMedia
                    component="img"
                    image={relatedPost.image}
                  />
                ) : null}
                <CardContent>
                  <Typography variant="subtitle1">{relatedPost.title}</Typography>
                </CardContent>
              </Card>
            </Link>
          ))}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Теги</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {post.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentPost;
