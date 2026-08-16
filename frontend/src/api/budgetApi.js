import API from './axios';

// Fetch all Category Budgets with server-calculated current month spending & alert statuses
export const fetchCategoryBudgets = async () => {
  const response = await API.get('/category-budgets');
  return response.data;
};

// Create or Upsert Category Budget
export const createCategoryBudget = async (data) => {
  const response = await API.post('/category-budgets', data);
  return response.data;
};

// Update Category Budget by ID
export const updateCategoryBudget = async (id, data) => {
  const response = await API.put(`/category-budgets/${id}`, data);
  return response.data;
};

// Delete Category Budget by ID
export const deleteCategoryBudget = async (id) => {
  const response = await API.delete(`/category-budgets/${id}`);
  return response.data;
};
