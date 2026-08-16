import API from './axios';

// Fetch all recurring transactions
export const fetchRecurringTransactions = async () => {
  const response = await API.get('/recurring');
  return response.data;
};

// Create a new recurring transaction
export const createRecurringTransaction = async (data) => {
  const response = await API.post('/recurring', data);
  return response.data;
};

// Update an existing recurring transaction
export const updateRecurringTransaction = async (id, data) => {
  const response = await API.put(`/recurring/${id}`, data);
  return response.data;
};

// Pause / Resume a recurring transaction
export const togglePauseRecurring = async (id) => {
  const response = await API.patch(`/recurring/${id}/pause`);
  return response.data;
};

// Delete a recurring transaction
export const deleteRecurringTransaction = async (id) => {
  const response = await API.delete(`/recurring/${id}`);
  return response.data;
};

// Fetch financial forecast & upcoming commitments
export const fetchFinancialForecast = async () => {
  const response = await API.get('/recurring/forecast');
  return response.data;
};
