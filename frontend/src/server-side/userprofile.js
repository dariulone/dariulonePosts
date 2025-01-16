import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const fetchUserProfile = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/users/me/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        }
    );
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Fetch user profile error:", error);
        throw error;
    }
};

export const fetchUserById = async (user_id) => {
    try {
        const response = await axios.get(`${API_URL}/users/${user_id}/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        }
    );
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Fetch user profile error:", error);
        throw error;
    }
};

export const followUser = async (user_id, token) => {
    try {
        const response = await axios.post(`${API_URL}/users/${user_id}/follow`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to follow user:", error);
        throw error;
    }
};

export const unfollowUser = async (user_id, token) => {
    try {
        const response = await axios.post(`${API_URL}/users/${user_id}/unfollow`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to unfollow user:", error);
        throw error;
    }
};

export const checkIfFollowing = async (user_id, token) => {
    try {
        const response = await axios.get(`${API_URL}/users/${user_id}/is_following`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to check following status:", error);
        throw error;
    }
};

export const updateUserProfile = async (data, token) => {
    try {
      const response = await axios.put(
        `${API_URL}/update/user/me`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error.response?.data || error.message);
      throw error;
    }
  };