// Generate JWT token
// Create and sign JWT tokens for authentication

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  return token;
};

module.exports = { generateToken };
