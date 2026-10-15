import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// @desc    Inspect raw database contents (Collections, Documents, Schemas)
// @route   GET /api/dev/db-view
// @access  Public (Dev helper)
router.get('/db-view', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const dbName = mongoose.connection.name || 'expense_tracker';
    const host = mongoose.connection.host || 'localhost';
    const port = mongoose.connection.port || 27017;

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const expenses = await Expense.find().populate('user', 'name email').sort({ createdAt: -1 });

    return res.json({
      databaseStatus: {
        connected: isConnected,
        databaseName: dbName,
        host: host,
        port: port,
        connectionString: `${host}:${port}/${dbName}`,
        totalCollections: 2,
      },
      collections: {
        users: {
          count: users.length,
          documents: users,
        },
        expenses: {
          count: expenses.length,
          documents: expenses,
        },
      },
      howToViewInCompass: {
        message: 'To view data in MongoDB Compass GUI, connect to MongoDB using the URI in your server/.env',
        defaultLocalURI: 'mongodb://127.0.0.1:27017/expense_tracker',
      },
    });
  } catch (error) {
    console.error('Error fetching database contents:', error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
