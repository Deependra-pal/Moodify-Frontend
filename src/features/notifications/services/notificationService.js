import api from '../../../services/api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
