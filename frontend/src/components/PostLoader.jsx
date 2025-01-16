import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPost } from '../server-side/posts';
import PostPage from "./PostPage";

const PostLoader = () => {
  const { "*": slug } = useParams(); // Извлекаем остаточный путь как slug
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPost(slug); // Используем функцию из api.js
        setPost(data);
      } catch (err) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return <PostPage post={post} />;
};

export default PostLoader;
