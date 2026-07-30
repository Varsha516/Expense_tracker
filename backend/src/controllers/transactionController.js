const prisma = require('../config/db')

// CREATE
const createTransaction = async (req, res) => {

  try {

    const {
      amount,
      type,
      category,
      description,
      date
    } = req.body

    if (!amount || !type || !date) {

      return res.status(400).json({
        error: 'Amount, type and date required'
      })
    }

    const transaction =
      await prisma.transaction.create({
        data: {
          amount: Number(amount),
          type,
          category,
          description,
          date: new Date(date),
          userId: req.user.id
        }
      })

    res.status(201).json(transaction)

  } catch (error) {

    res.status(500).json({
      error: error.message
    })
  }
}

// GET ALL
const getTransactions = async (req, res) => {

  try {

    const transactions =
      await prisma.transaction.findMany({
        where: {
          userId: req.user.id
        },
        orderBy: {
          date: 'desc'
        }
      })

    res.status(200).json(transactions)

  } catch (error) {

    res.status(500).json({
      error: error.message
    })
  }
}

// UPDATE
const updateTransaction = async (req, res) => {

  try {

    const { id } = req.params

    const existingTransaction =
      await prisma.transaction.findFirst({
        where: {
          id: Number(id),
          userId: req.user.id
        }
      })

    if (!existingTransaction) {

      return res.status(404).json({
        error: 'Transaction not found'
      })
    }

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: Number(id)
        },
        data: {
          amount: Number(req.body.amount),
          type: req.body.type,
          category: req.body.category,
          description: req.body.description,
          date: new Date(req.body.date)
        }
      })

    res.status(200).json(updatedTransaction)

  } catch (error) {

    res.status(500).json({
      error: error.message
    })
  }
}

// DELETE
const deleteTransaction = async (req, res) => {

  try {

    const { id } = req.params

    const existingTransaction =
      await prisma.transaction.findFirst({
        where: {
          id: Number(id),
          userId: req.user.id
        }
      })

    if (!existingTransaction) {

      return res.status(404).json({
        error: 'Transaction not found'
      })
    }

    await prisma.transaction.delete({
      where: {
        id: Number(id)
      }
    })

    res.status(200).json({
      message: 'Transaction deleted successfully'
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
}