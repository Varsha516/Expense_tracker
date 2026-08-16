const prisma = require('../config/db');

// Update authenticated user's monthly budget
const updateBudget = async (req, res) => {
  try {
    const { budget } = req.body;

    // Strict numeric validation
    const parsedBudget = parseFloat(budget);

    if (
      budget === undefined ||
      budget === null ||
      isNaN(parsedBudget) ||
      !isFinite(parsedBudget) ||
      parsedBudget <= 0
    ) {
      return res.status(400).json({
        error: 'Budget must be a positive number greater than 0'
      });
    }

    // req.user.id derived exclusively from JWT authMiddleware
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { budget: parsedBudget },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        budget: true,
        avatar: true
      }
    });

    return res.status(200).json({
      message: 'Monthly budget updated successfully',
      budget: updatedUser.budget,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return res.status(500).json({
      error: 'Failed to update budget'
    });
  }
};

// Get authenticated user profile & budget
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        budget: true,
        avatar: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      budget: user.budget,
      user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      error: 'Failed to fetch user profile'
    });
  }
};

module.exports = {
  updateBudget,
  getProfile
};
