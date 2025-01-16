import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const createPostForUser = async (user_id, postData, token) => {
    try {
        // Отправляем запрос на создание поста
        const response = await axios.post(
            `${API_URL}/create_post_for_user/${user_id}/`,
            {
                title: postData.title,
                body: postData.body,
                main_image: postData.main_image, // Добавляем картинку (если она есть)
                tags: postData.tags,
                category: postData.category,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Авторизация через Bearer token
                }
            }
        );

        // Возвращаем полученные данные поста (например, slug и прочее)
        return response.data;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

export const getPostsForUser = async (user_id) => {
    try {
        const response = await axios.get(`${API_URL}/get_posts_for_user/${user_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw error;
    }
};

export const getAllPosts = async (page = 1, count = 3) => {
    try {
        // Добавляем параметры page и count в запрос
        const response = await axios.get(`${API_URL}/get_all_posts`, {
            params: {
                page,
                count,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching all posts:", error);
        throw error;
    }
};

export const getPost = async (slug) => {
    try {
        const response = await axios.get(`${API_URL}/getpost/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all posts:', error);
        throw error;
    }
};

export const createComment = async (post_id, body, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/create_comment/${post_id}/`,
            { body },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

export const likePost = async (post_id, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/like_post/${post_id}/`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data.likes;
    } catch (error) {
        console.error("Error liking post:", error);
        throw error;
    }
};

export const unlikePost = async (post_id, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/unlike_post/${post_id}/`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data.likes;
    } catch (error) {
        console.error("Error unliking post:", error);
        throw error;
    }
};

export const checkPostIsLiked = async (post_id, token) => {
    try {
        const response = await axios.get(`${API_URL}/is_post_liked_by_user/${post_id}/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data.isLiked;
    } catch (error) {
        console.error("Error checking if post is liked:", error);
        throw error;
    }
};

export const getTopPosts = async (count = 6) => {
    try {
      const response = await axios.get(`${API_URL}/get_top_posts?count=${count}`);
      return response.data;
    } catch (error) {
        console.error("Error getting top posts:", error);
        throw error;
    }
  };

export const get_related_posts = async (slug) => {
    try {
        const response = await axios.get(`${API_URL}/relatedposts/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all posts:', error);
        throw error;
    }
};

export const increment_views = async (post_id) => {
    try {
        const response = await axios.post(`${API_URL}/increment_views/${post_id}`);
        return response.data;
    } catch (error) {
        console.error('Error incrementing view:', error);
        throw error;
    }
};