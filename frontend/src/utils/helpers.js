export const formatCurrency = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
  return formatter.format(amount)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTimeShort = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric'
  })
}

export const getCategoryIcon = (category) => {
  const icons = {
    food: '🍔',
    transport: '🚗',
    shopping: '🛍️',
    entertainment: '🎬',
    utilities: '💡',
    health: '🏥',
    salary: '💰',
    freelance: '💻',
    investment: '📈',
    other: '📌'
  }
  return icons[category?.toLowerCase()] || '📌'
}

export const getCategoryColor = (category) => {
  const colors = {
    food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    salary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    freelance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    investment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return colors[category?.toLowerCase()] || colors.other
}

export const getTransactionTypeColor = (type) => {
  return type === 'income'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'
}

export const calculatePercentage = (value, total) => {
  return total === 0 ? 0 : ((value / total) * 100).toFixed(1)
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const formatNumberCompact = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
