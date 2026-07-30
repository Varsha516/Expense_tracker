// Authentication middleware
// Verify JWT tokens and protect routes

const jwt = require('jsonwebtoken');

const prisma = require('../config/db');

const authMiddleware = async (req, res, next) => {

  try {

    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {

      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      }
    });

    if (!user) {

      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.user = user;

    next();

  } catch (error) {

    res.status(401).json({
      error: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;