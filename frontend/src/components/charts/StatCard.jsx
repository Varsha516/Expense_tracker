import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AnimatedCounter } from './ChartComponents'

const StatCard = ({ title, value, change, icon: Icon, gradient = 'from-blue-500 to-purple-600', prefix = '', suffix = '' }) => {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-soft hover:shadow-medium transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{title}</p>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          {Icon && <Icon size={28} className="text-white" />}
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
