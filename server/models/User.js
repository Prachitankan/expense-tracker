import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    monthlyIncome: {
      type: Number,
      required: [true, 'Please provide your monthly income'],
      default: 0,
      min: [0, 'Monthly income cannot be negative'],
    },
    monthlySavingTarget: {
      type: Number,
      required: [true, 'Please provide your monthly saving target'],
      default: 0,
      min: [0, 'Monthly saving target cannot be negative'],
    },
    currency: {
      type: String,
      default: '₹',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate monthly spending limit helper
userSchema.methods.getSpendingLimit = function () {
  // Spending Limit = Monthly Income - Monthly Saving Target
  const limit = this.monthlyIncome - this.monthlySavingTarget;
  return limit > 0 ? limit : 0;
};

const User = mongoose.model('User', userSchema);
export default User;
