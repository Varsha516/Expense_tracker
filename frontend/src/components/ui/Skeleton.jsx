import React from 'react'
import { motion } from 'framer-motion'

const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`bg-gray-200 dark:bg-slate-700 rounded-lg ${className}`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </>
  )
}

export default Skeleton
