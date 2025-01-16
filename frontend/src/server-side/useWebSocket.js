import { useEffect } from "react";

/**
 * Хук для работы с WebSocket
 * @param {string} url - URL для подключения WebSocket
 * @param {function} onMessage - Функция-обработчик входящих сообщений
 * @param {function} onError - Функция-обработчик ошибок WebSocket
 */
export function useWebSocket(url, onMessage, onError) {
  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (onMessage) {
          onMessage(message); // Вызываем обработчик сообщений
        }
      } catch (err) {
        console.error("Failed to process WebSocket message:", err);
        if (onError) {
          onError(err);
        }
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      if (onError) {
        onError(event);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Закрываем WebSocket при размонтировании компонента
    return () => {
      ws.close();
    };
  }, [url, onMessage, onError]);
}
