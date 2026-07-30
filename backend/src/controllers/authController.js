// Authentication controller
// Handle user registration, login, and authentication logic

const bcrypt = require('bcryptjs');

const prisma = require('../config/db');

const { generateToken } = require('../utils/generateToken');

// Register controller
const register = async (req, res) => {

  try {

    const {
      name,
      email,
      mobile,
      password
    } = req.body;

    // Validation
    if ((!email && !mobile) || !password) {

      return res.status(400).json({
        error: 'Email or mobile and password required'
      });
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { mobile: mobile || undefined }
        ]
      }
    });

    if (existingUser) {

      return res.status(400).json({
        error: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
       user: {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    budget: user.budget,
    avatar: user.avatar
  }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });
  }
};

// Login controller
const login = async (req, res) => {

  try {

    const {
      emailOrMobile,
      password
    } = req.body;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrMobile },
          { mobile: emailOrMobile }
        ]
      }
    });

    if (!user) {

      return res.status(400).json({
        error: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    budget: user.budget,
    avatar: user.avatar
  }
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};