import API from './axios';

// Fetch all Savings Goals with calculated financial trajectory & required monthly savings
export const fetchSavingsGoals = async () => {
  const response = await API.get('/goals');
  return response.data;
};

// Create Savings Goal
export const createSavingsGoal = async (data) => {
  const response = await API.post('/goals', data);
  return response.data;
};

// Update Savings Goal by ID
export const updateSavingsGoal = async (id, data) => {
  const response = await API.put(`/goals/${id}`, data);
  return response.data;
};

// Delete Savings Goal by ID
export const deleteSavingsGoal = async (id) => {
  const response = await API.delete(`/goals/${id}`);
  return response.data;
};
