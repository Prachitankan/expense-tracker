import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Expense from './models/Expense.js';

dotenv.config();

const viewDatabase = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  console.log('\n========================================');
  console.log('🔍 EXPENSE TRACKER - DATABASE INSPECTOR');
  console.log('========================================');
  console.log(`Connecting to: ${uri} ...\n`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB successfully.\n');

    const users = await User.find().select('-password').lean();
    const expenses = await Expense.find().populate('user', 'name email').lean();

    console.log(`📁 USERS COLLECTION (${users.length} documents):`);
    if (users.length === 0) {
      console.log('   (No users found in database)');
    } else {
      console.table(
        users.map((u) => ({
          ID: u._id.toString().slice(-6),
          Name: u.name,
          Email: u.email,
          'Income': `${u.currency}${u.monthlyIncome}`,
          'Saving Target': `${u.currency}${u.monthlySavingTarget}`,
          'Spending Limit': `${u.currency}${u.monthlyIncome - u.monthlySavingTarget}`,
          Currency: u.currency,
        }))
      );
    }

    console.log(`\n📁 EXPENSES COLLECTION (${expenses.length} documents):`);
    if (expenses.length === 0) {
      console.log('   (No expenses found in database)');
    } else {
      console.table(
        expenses.map((e) => ({
          ID: e._id.toString().slice(-6),
          Title: e.title,
          Amount: e.amount,
          Category: e.category,
          Date: new Date(e.date).toISOString().split('T')[0],
          Payment: e.paymentMethod,
          User: e.user ? e.user.name : 'Unknown',
        }))
      );
    }

    console.log('\n========================================\n');
  } catch (err) {
    console.error('❌ Could not connect to external MongoDB:', err.message);
    console.log('\n💡 Note: If you are running the app with the built-in in-memory MongoDB,');
    console.log('you can view the live data directly in your browser while the server is running at:');
    console.log('👉 http://localhost:5000/api/dev/db-view\n');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

viewDatabase();
