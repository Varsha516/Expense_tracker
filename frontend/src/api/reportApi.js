import API from './axios';

// Fetch aggregated financial report
export const fetchFinancialReport = async (period = 'this_month', startDate, endDate) => {
  const params = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await API.get('/reports', { params });
  return response.data;
};

// Export filtered transactions to CSV file
export const exportTransactionsCSV = async (filterParams = {}) => {
  const response = await API.get('/reports/csv', {
    params: filterParams,
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `transactions_export_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Generate AI Report Summary
export const fetchReportAISummary = async (period = 'this_month', startDate, endDate) => {
  const response = await API.post('/reports/ai-summary', {
    period,
    startDate,
    endDate
  });
  return response.data;
};
