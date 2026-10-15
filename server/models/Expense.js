import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter an expense title or description'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please enter expense amount'],
      min: [0.01, 'Expense amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please choose a category'],
      enum: [
        'Food & Dining',
        'Housing & Rent',
        'Utilities & Bills',
        'Transportation',
        'Entertainment & Leisure',
        'Health & Fitness',
        'Shopping & Personal',
        'Education',
        'Groceries',
        'Investments',
        'Other',
      ],
      default: 'Food & Dining',
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'],
      default: 'UPI',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
