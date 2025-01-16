import React, { useEffect, useCallback, useContext, useState } from "react";
import {
  Avatar,
  Typography,
  Button,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
} from "@mui/material";
import { SmileOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useNotificationContext } from "../contexts/NotificationContext.jsx";
import {
  clearNotifications as clearNotificationsAPI,
  fetchNotifications,
} from "../server-side/notifications";
import { useWebSocket } from "../server-side/useWebSocket";
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

const Notifications = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const { notifications, updateNotifications, clearNotifications } =
    useNotificationContext();
  const [loading, setLoading] = useState(true); // Индикатор загрузки
  const [error, setError] = useState(null); // Ошибки загрузки

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true); // Показываем индикатор загрузки
      const data = await fetchNotifications(token);
      updateNotifications(data);
    } catch (err) {
      setError("Failed to fetch notifications. Please try again.");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false); // Убираем индикатор загрузки
    }
  }, [token, updateNotifications]);

  const handleClearNotifications = async () => {
    try {
      if (!token) throw new Error("Authorization token is missing");
      await clearNotificationsAPI(token);
      clearNotifications(); // Очищаем уведомления в контексте
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  useWebSocket(
    `ws://localhost:8000/ws?token=${token}`,
    useCallback(
      (message) => {
        if (message.update) {
          loadNotifications();
        }
      },
      [loadNotifications]
    ),
    useCallback((error) => {
      console.error("WebSocket error:", error);
    }, [])
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  const containerStyle = {
    minWidth: notifications.length === 0 ? 240 : 400,
    maxHeight: "400px",
    overflowY: "auto",
  };

  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <Typography color="warning.main">
          You need to log in to view notifications.
        </Typography>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <Typography color="error.main">{error}</Typography>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <Typography variant="h6">Уведомления</Typography>
        <Button onClick={handleClearNotifications} variant="contained" color="primary">
          Очистить
        </Button>
      </div>
      <List sx={{ width: "100%" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <SmileOutlined style={{ fontSize: 20 }} />
            <Typography>Нет уведомлений</Typography>
          </div>
        ) : (
          notifications.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar sx={{minWidth: "32px", marginRight: 0, paddingLeft: 0, paddingRight: 0 }}>
                  <Avatar
                    alt={item.title}
                    src={item.title === "Новый подписчик" 
                      ? "https://images.vexels.com/content/147087/preview/instagram-discover-people-icon-249488.png" 
                      : `https://cdn-icons-png.flaticon.com/512/12623/12623254.png`}
              />
                </ListItemAvatar>
                <ListItemText
                  primary={item.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "text.primary", display: "inline" }}
                      >
                        <a href={item.link}>{item.description}</a>
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))
        )}
      </List>
    </div>
  );
};

export default Notifications;
