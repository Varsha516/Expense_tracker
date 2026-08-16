import API from './axios';

// Fetch financial calendar events for a specific month and year
export const fetchCalendarEvents = async (year, month) => {
  const params = {};
  if (year) params.year = year;
  if (month) params.month = month;
  const response = await API.get('/calendar', { params });
  return response.data;
};
