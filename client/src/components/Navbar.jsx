import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  LogOut,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const Navbar = ({
  selectedMonth,
  selectedYear,
  onChangeMonth,
  onOpenAddExpense,
  onOpenProfile,
  currency = '₹',
}) => {
  const { user, logout } = useAuth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onChangeMonth(12, selectedYear - 1);
    } else {
      onChangeMonth(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onChangeMonth(1, selectedYear + 1);
    } else {
      onChangeMonth(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-logo-small">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="brand-name-row">
              <span className="brand-title">SpendWise</span>
              <span className="live-status-dot" title="MongoDB Live Connected" />
            </div>
            <span className="brand-sub">Smart Budget & Savings</span>
          </div>
        </div>

        {/* Month & Year Navigation Selector */}
        <div className="month-navigator">
          <button
            type="button"
            className="month-nav-btn"
            onClick={handlePrevMonth}
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="current-period-display">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="period-label">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
          </div>

          <button
            type="button"
            className="month-nav-btn"
            onClick={handleNextMonth}
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right side controls */}
        <div className="navbar-right">
          <button
            type="button"
            className="btn-primary-navbar"
            onClick={onOpenAddExpense}
            title="Record New Expense"
          >
            <Plus className="w-4 h-4" />
            <span className="hide-on-mobile">Add Expense</span>
          </button>

          <button
            type="button"
            className="btn-icon-navbar"
            onClick={onOpenProfile}
            title="Edit Income, Saving Target & Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hide-on-mobile">Edit Budget</span>
          </button>

          <div className="user-profile-badge" onClick={onOpenProfile} title="View Profile">
            <div className="avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-name-box hide-on-mobile">
              <span className="user-full-name">{user?.name || 'User'}</span>
              <span className="user-income-tag">
                {currency}
                {user?.monthlyIncome?.toLocaleString()} / mo
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-logout"
            onClick={logout}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
