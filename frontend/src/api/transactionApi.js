import API from './axios'

// Get transactions (with search, filtering, sorting, pagination)
export const fetchTransactions = async (params = {}) => {
  const response = await API.get('/transactions', { params })
  return response.data
}

// Create transaction
export const createTransaction = async (data) => {

  const response = await API.post(
    '/transactions',
    data
  )

  return response.data
}

// Update transaction
export const updateTransaction = async (
  id,
  data
) => {

  const response = await API.put(
    `/transactions/${id}`,
    data
  )

  return response.data
}

// Delete transaction
export const deleteTransaction = async (id) => {

  const response = await API.delete(
    `/transactions/${id}`
  )

  return response.data
}