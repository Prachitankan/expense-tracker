import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_expense_tracker_jwt_token_2026_xyz',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user with income & saving target
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, monthlyIncome, monthlySavingTarget, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const incomeNum = Number(monthlyIncome) || 0;
    const savingTargetNum = Number(monthlySavingTarget) || 0;

    if (savingTargetNum > incomeNum) {
      return res.status(400).json({
        message: 'Monthly saving target cannot be greater than monthly income',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      monthlyIncome: incomeNum,
      monthlySavingTarget: savingTargetNum,
      currency: currency || '₹',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        monthlySavingTarget: user.monthlySavingTarget,
        spendingLimit: user.getSpendingLimit(),
        currency: user.currency,
      },
      message: 'Registration successful! Welcome to Expense Tracker.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          monthlyIncome: user.monthlyIncome,
          monthlySavingTarget: user.monthlySavingTarget,
          spendingLimit: user.getSpendingLimit(),
          currency: user.currency,
        },
        message: 'Welcome back!',
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome,
      monthlySavingTarget: user.monthlySavingTarget,
      spendingLimit: user.getSpendingLimit(),
      currency: user.currency,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @desc    Update user profile & financial targets (income, saving target, currency)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, monthlyIncome, monthlySavingTarget, currency } = req.body;

    if (name) user.name = name;
    if (monthlyIncome !== undefined) {
      const incomeNum = Number(monthlyIncome);
      if (isNaN(incomeNum) || incomeNum < 0) {
        return res.status(400).json({ message: 'Monthly income must be a valid non-negative number' });
      }
      user.monthlyIncome = incomeNum;
    }

    if (monthlySavingTarget !== undefined) {
      const savingNum = Number(monthlySavingTarget);
      if (isNaN(savingNum) || savingNum < 0) {
        return res.status(400).json({ message: 'Monthly saving target must be a valid non-negative number' });
      }
      if (savingNum > user.monthlyIncome) {
        return res.status(400).json({
          message: 'Monthly saving target cannot be greater than monthly income',
        });
      }
      user.monthlySavingTarget = savingNum;
    }

    if (currency) user.currency = currency;

    const updatedUser = await user.save();

    return res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      monthlyIncome: updatedUser.monthlyIncome,
      monthlySavingTarget: updatedUser.monthlySavingTarget,
      spendingLimit: updatedUser.getSpendingLimit(),
      currency: updatedUser.currency,
      message: 'Financial details updated successfully!',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: error.message || 'Server error updating profile' });
  }
});

export default router;
