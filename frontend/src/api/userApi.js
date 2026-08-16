import API from './axios';

// Get authenticated user budget & profile
export const getBudget = async () => {
  const response = await API.get('/users/budget');
  return response.data;
};

// Update authenticated user monthly budget
export const updateBudget = async (budget) => {
  const response = await API.put('/users/budget', { budget });
  return response.data;
};
