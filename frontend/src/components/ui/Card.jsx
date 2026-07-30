import React from 'react'

const Card = React.forwardRef(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-soft dark:shadow-lg transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-5 border-b border-gray-200 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
)

const CardFooter = ({ className = '', children, ...props }) => (
  <div
    className={`px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
