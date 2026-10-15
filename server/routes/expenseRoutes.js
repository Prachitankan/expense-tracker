import express from 'express';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all expense routes
router.use(protect);

// @desc    Get user expenses with filtering & search
// @route   GET /api/expenses
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { month, year, category, search, sortBy, order } = req.query;

    const query = { user: req.user._id };

    // Filter by month & year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title or notes
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sort order
    const sortField = sortBy || 'date';
    const sortDirection = order === 'asc' ? 1 : -1;

    const expenses = await Expense.find(query).sort({ [sortField]: sortDirection });

    return res.json(expenses);
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return res.status(500).json({ message: 'Server error fetching expenses' });
  }
});

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, paymentMethod, notes } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Title, amount, and category are required' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: amountNum,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      notes: notes ? notes.trim() : '',
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ message: error.message || 'Server error creating expense' });
  }
});

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check ownership
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this expense' });
    }

    const { title, amount, category, date, paymentMethod, notes } = req.body;

    if (title) expense.title = title.trim();
    if (amount !== undefined) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than zero' });
      }
      expense.amount = amountNum;
    }
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (notes !== undefined) expense.notes = notes.trim();

    const updatedExpense = await expense.save();
    return res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ message: error.message || 'Server error updating expense' });
  }
});

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();
    return res.json({ message: 'Expense deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ message: 'Server error deleting expense' });
  }
});

// @desc    Get monthly summary, analytics, alerts, and appraisals
// @route   GET /api/expenses/summary
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || (now.getMonth() + 1); // 1-12

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get user details
    const user = await User.findById(req.user._id);
    const monthlyIncome = user.monthlyIncome || 0;
    const monthlySavingTarget = user.monthlySavingTarget || 0;
    const spendingLimit = user.getSpendingLimit();
    const currency = user.currency || '₹';

    // Fetch this month's expenses
    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    // Calculate total expenses for the month
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    // Calculate current savings
    const currentSavings = monthlyIncome - totalExpenses;

    // Calculate Category Breakdown
    const categoryMap = {};
    expenses.forEach((item) => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
    });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      total: categoryMap[cat],
      percentage: totalExpenses > 0 ? ((categoryMap[cat] / totalExpenses) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.total - a.total);

    // Alerts generation
    const alerts = [];

    // 1. Spending limit alert check
    if (spendingLimit > 0) {
      if (totalExpenses >= spendingLimit) {
        alerts.push({
          type: 'danger',
          code: 'LIMIT_EXCEEDED',
          title: '🚨 Monthly Spending Limit Reached or Exceeded!',
          message: `Your total spending of ${currency}${totalExpenses.toLocaleString()} has reached or surpassed your monthly spending limit of ${currency}${spendingLimit.toLocaleString()}. Further expenses will directly impact your savings target.`,
          percentage: Math.round((totalExpenses / spendingLimit) * 100),
        });
      } else if (totalExpenses >= spendingLimit * 0.85) {
        alerts.push({
          type: 'warning',
          code: 'LIMIT_WARNING',
          title: '⚠️ Caution: Approaching Spending Limit',
          message: `You have consumed ${Math.round((totalExpenses / spendingLimit) * 100)}% of your monthly spending limit (${currency}${totalExpenses.toLocaleString()} of ${currency}${spendingLimit.toLocaleString()}). Only ${currency}${(spendingLimit - totalExpenses).toLocaleString()} remaining.`,
          percentage: Math.round((totalExpenses / spendingLimit) * 100),
        });
      }
    }

    // 2. Savings target appraisal check
    // "if user able to achieve his or her monthly saving target or more then this target soul generate a apprasel to alert section"
    if (monthlySavingTarget > 0) {
      if (currentSavings >= monthlySavingTarget) {
        alerts.push({
          type: 'appraisal',
          code: 'SAVING_TARGET_ACHIEVED',
          title: '🎉 Outstanding Milestone! Saving Target Achieved!',
          message: `Congratulations ${user.name}! You have successfully secured ${currency}${currentSavings.toLocaleString()} in savings this month, achieving or exceeding your goal of ${currency}${monthlySavingTarget.toLocaleString()}! Keep up the brilliant financial discipline! 🌟`,
          badge: 'Savings Champion 🏆',
          percentage: Math.min(100, Math.round((currentSavings / monthlySavingTarget) * 100)),
        });
      } else {
        const remainingToSave = monthlySavingTarget - currentSavings;
        alerts.push({
          type: 'info',
          code: 'SAVINGS_STATUS',
          title: '🎯 Savings Goal in Progress',
          message: `Current savings: ${currency}${currentSavings.toLocaleString()} / Goal: ${currency}${monthlySavingTarget.toLocaleString()}. You need ${currency}${remainingToSave.toLocaleString()} more to lock in your full monthly savings target.`,
          percentage: Math.max(0, Math.round((currentSavings / monthlySavingTarget) * 100)),
        });
      }
    }

    return res.json({
      month,
      year,
      monthlyIncome,
      monthlySavingTarget,
      spendingLimit,
      totalExpenses,
      currentSavings,
      remainingSpendingBudget: Math.max(0, spendingLimit - totalExpenses),
      spendingLimitPercent: spendingLimit > 0 ? Math.round((totalExpenses / spendingLimit) * 100) : 0,
      savingTargetPercent: monthlySavingTarget > 0 ? Math.round((currentSavings / monthlySavingTarget) * 100) : 0,
      isLimitExceeded: spendingLimit > 0 ? totalExpenses >= spendingLimit : false,
      isTargetAchieved: monthlySavingTarget > 0 ? currentSavings >= monthlySavingTarget : false,
      currency,
      expenseCount: expenses.length,
      categoryBreakdown,
      alerts,
    });
  } catch (error) {
    console.error('Summary error:', error);
    return res.status(500).json({ message: 'Server error generating financial summary' });
  }
});

// @desc    Optional: Seed sample expenses for demo if user clicks "Try Example Data"
// @route   POST /api/expenses/seed-demo
// @access  Private
router.post('/seed-demo', async (req, res) => {
  try {
    const today = new Date();
    const demoItems = [
      {
        title: 'Weekly Organic Grocery',
        amount: 3200,
        category: 'Groceries',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        paymentMethod: 'UPI',
        notes: 'Vegetables, fruits, dairy, and whole grains',
      },
      {
        title: 'Apartment Monthly Maintenance',
        amount: 2500,
        category: 'Housing & Rent',
        date: new Date(today.getFullYear(), today.getMonth(), 2),
        paymentMethod: 'Net Banking',
        notes: 'Society maintenance fee',
      },
      {
        title: 'Fiber Internet & Electricity Bill',
        amount: 1850,
        category: 'Utilities & Bills',
        date: new Date(today.getFullYear(), today.getMonth(), 5),
        paymentMethod: 'Credit Card',
        notes: 'Monthly utility payments',
      },
      {
        title: 'Weekend Dinner & Cafe',
        amount: 1450,
        category: 'Food & Dining',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
        paymentMethod: 'Debit Card',
        notes: 'Dinner with family',
      },
      {
        title: 'Fuel & Metro Recharge',
        amount: 1200,
        category: 'Transportation',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
        paymentMethod: 'UPI',
        notes: 'Commute expenses',
      },
    ];

    const inserted = await Expense.insertMany(
      demoItems.map((item) => ({ ...item, user: req.user._id }))
    );

    return res.status(201).json({
      message: 'Example expenses added for demonstration!',
      count: inserted.length,
    });
  } catch (error) {
    console.error('Seed demo error:', error);
    return res.status(500).json({ message: 'Server error seeding demo expenses' });
  }
});

// @desc    Clear all expenses for current user (reset)
// @route   DELETE /api/expenses/clear-all
// @access  Private
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await Expense.deleteMany({ user: req.user._id });
    return res.json({
      message: 'All expenses cleared successfully. Fresh clean slate!',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear all error:', error);
    return res.status(500).json({ message: 'Server error clearing expenses' });
  }
});

export default router;
