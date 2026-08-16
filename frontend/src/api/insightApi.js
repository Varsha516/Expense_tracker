import API from './axios';

// Fetch AI Financial Insights & Recommendations
export const fetchAIInsights = async () => {
  const response = await API.get('/insights/ai');
  return response.data;
};
