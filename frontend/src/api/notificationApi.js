import API from './axios';

// Fetch all notifications and unread count
export const fetchNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

// Fetch unread count for Navbar badge
export const fetchUnreadCount = async () => {
  const response = await API.get('/notifications/unread-count');
  return response.data;
};

// Mark single notification as read
export const markNotificationAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};

// Delete a notification
export const deleteNotificationApi = async (id) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};

// Fetch user notification preferences
export const fetchNotificationPreferences = async () => {
  const response = await API.get('/notifications/preferences');
  return response.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (data) => {
  const response = await API.put('/notifications/preferences', data);
  return response.data;
};
