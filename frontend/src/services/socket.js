export const connectSocket = (userId) => {
  return new WebSocket(
    `${import.meta.env.VITE_WS_URL}/ws/${userId}`
  );
};