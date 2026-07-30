import { useState } from 'react'

import { motion } from 'framer-motion'

import {
  Plus,
  Pencil,
  Trash2,
  IndianRupee
} from 'lucide-react'

import AddTransactionModal from '../components/transactions/AddTransactionModal'

const Dashboard = () => {

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [transactions, setTransactions] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)

  const handleAddTransaction = (transaction) => {

  if (editingTransaction) {

    setTransactions((prev) =>
      prev.map((item) =>
        item.id === editingTransaction.id
          ? {
              ...transaction,
              id: editingTransaction.id
            }
          : item
      )
    )

    setEditingTransaction(null)

    return
  }

  setTransactions((prev) => [
    transaction,
    ...prev
  ])
}

  const handleDelete = (id) => {

    setTransactions(
      transactions.filter((item) => item.id !== id)
    )
  }

  return (

    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your finances beautifully
          </p>

        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:scale-[1.02] transition-all duration-300 text-white font-semibold px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/20"
        >

          <Plus className="w-5 h-5" />

          Add Transaction

        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >

          <p className="text-slate-500">
            Total Transactions
          </p>

          <h2 className="text-4xl font-bold mt-3 text-slate-900">
            {transactions.length}
          </h2>

        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >

          <p className="text-slate-500">
            Total Income
          </p>

          <h2 className="text-4xl font-bold mt-3 text-emerald-500">

            ₹
            {
              transactions
                .filter((item) => item.type === 'income')
                .reduce((acc, item) => acc + Number(item.amount), 0)
            }

          </h2>

        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >

          <p className="text-slate-500">
            Total Expense
          </p>

          <h2 className="text-4xl font-bold mt-3 text-red-500">

            ₹
            {
              transactions
                .filter((item) => item.type === 'expense')
                .reduce((acc, item) => acc + Number(item.amount), 0)
            }

          </h2>

        </motion.div>

      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-slate-900">
            Recent Transactions
          </h2>

        </div>

        {
          transactions.length === 0 ? (

            <div className="py-16 text-center">

              <IndianRupee className="mx-auto text-slate-300 w-14 h-14 mb-4" />

              <h3 className="text-xl font-semibold text-slate-700">
                No transactions yet
              </h3>

              <p className="text-slate-500 mt-2">
                Start by adding your first transaction
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {
                transactions.map((item) => (

                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-200 rounded-3xl p-5"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* Left */}
                      <div className="flex items-start gap-5">

                        {
                          item.image && (

                            <img
                              src={item.image}
                              alt="receipt"
                              className="w-24 h-24 rounded-2xl object-cover border border-slate-200"
                            />

                          )
                        }

                        <div>

                          <div className="flex items-center gap-3 flex-wrap">

                            <h3 className="text-xl font-bold text-slate-900">
                              ₹{item.amount}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                item.type === 'income'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {item.type}
                            </span>

                          </div>

                          <p className="text-slate-600 mt-2">
                            {item.category}
                          </p>

                          <p className="text-slate-400 text-sm mt-1">
                            {item.date}
                          </p>

                          {
                            item.note && (

                              <p className="text-slate-500 mt-3">
                                {item.note}
                              </p>

                            )
                          }

                        </div>

                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">

                        <button
  onClick={() => {

    setEditingTransaction(item)

    setIsModalOpen(true)
  }}
  className="w-12 h-12 rounded-2xl bg-cyan-100 hover:bg-cyan-200 transition-all duration-300 flex items-center justify-center"
>

                          <Pencil className="w-5 h-5 text-cyan-600" />

                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-12 h-12 rounded-2xl bg-red-100 hover:bg-red-200 transition-all duration-300 flex items-center justify-center"
                        >

                          <Trash2 className="w-5 h-5 text-red-600" />

                        </button>

                      </div>

                    </div>

                  </motion.div>

                ))
              }

            </div>

          )
        }

      </div>

      {/* Modal */}
      <AddTransactionModal
  isOpen={isModalOpen}
  onClose={() => {

    setIsModalOpen(false)

    setEditingTransaction(null)
  }}
  onAddTransaction={handleAddTransaction}
  editingTransaction={editingTransaction}
/>

    </div>
  )
}

export default Dashboard