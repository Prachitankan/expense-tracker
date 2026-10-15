import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Target,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  PiggyBank,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';

export const FinancialOverview = ({ summary, currency, onOpenProfile }) => {
  const {
    monthlyIncome = 0,
    monthlySavingTarget = 0,
    spendingLimit = 0,
    totalExpenses = 0,
    currentSavings = 0,
    remainingSpendingBudget = 0,
    spendingLimitPercent = 0,
    savingTargetPercent = 0,
    isLimitExceeded = false,
    isTargetAchieved = false,
    expenseCount = 0,
  } = summary || {};

  // Color dynamics for spending limit bar
  const getLimitBarColor = () => {
    if (spendingLimitPercent >= 100) return 'progress-fill-danger';
    if (spendingLimitPercent >= 85) return 'progress-fill-warning';
    return 'progress-fill-primary';
  };

  // Color dynamics for savings target bar
  const getSavingsBarColor = () => {
    if (isTargetAchieved) return 'progress-fill-success';
    if (savingTargetPercent >= 50) return 'progress-fill-primary';
    return 'progress-fill-amber';
  };

  return (
    <div className="overview-section">
      <div className="kpi-grid">
        {/* Card 1: Monthly Income */}
        <div className="kpi-card kpi-income">
          <div className="kpi-card-header">
            <span className="kpi-label">Monthly Income</span>
            <div className="kpi-icon-pill bg-blue-subtle">
              <Wallet className="w-5 h-5 text-blue" />
            </div>
          </div>
          <div className="kpi-amount">
            {currency}
            {monthlyIncome.toLocaleString()}
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Total monthly budget source</span>
            <button
              type="button"
              className="kpi-action-link"
              onClick={onOpenProfile}
              title="Edit Income"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Card 2: Spending Limit */}
        <div className={`kpi-card ${isLimitExceeded ? 'kpi-danger-border' : ''}`}>
          <div className="kpi-card-header">
            <span className="kpi-label">Spending Limit</span>
            <div
              className={`kpi-icon-pill ${
                isLimitExceeded ? 'bg-rose-subtle' : 'bg-indigo-subtle'
              }`}
            >
              {isLimitExceeded ? (
                <ShieldAlert className="w-5 h-5 text-rose" />
              ) : (
                <Target className="w-5 h-5 text-indigo" />
              )}
            </div>
          </div>
          <div className="kpi-amount">
            {currency}
            {spendingLimit.toLocaleString()}
          </div>
          <div className="kpi-progress-wrap">
            <div className="progress-label-row">
              <span className="text-xs text-muted">Limit Used:</span>
              <span
                className={`text-xs font-semibold ${
                  isLimitExceeded ? 'text-rose' : 'text-primary'
                }`}
              >
                {spendingLimitPercent}% ({currency}
                {totalExpenses.toLocaleString()})
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${getLimitBarColor()}`}
                style={{ width: `${Math.min(100, spendingLimitPercent)}%` }}
              />
            </div>
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">
              {isLimitExceeded ? (
                <span className="text-rose font-medium">Exceeded by {currency}{(totalExpenses - spendingLimit).toLocaleString()}</span>
              ) : (
                <span>Remaining: {currency}{remainingSpendingBudget.toLocaleString()}</span>
              )}
            </span>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Total Spent This Month</span>
            <div className="kpi-icon-pill bg-rose-subtle">
              <TrendingDown className="w-5 h-5 text-rose" />
            </div>
          </div>
          <div className="kpi-amount text-rose">
            {currency}
            {totalExpenses.toLocaleString()}
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">
              {expenseCount} transaction{expenseCount !== 1 ? 's' : ''} recorded
            </span>
            {spendingLimit > 0 && (
              <span className="kpi-badge-pill">
                {spendingLimitPercent}% of budget
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Monthly Savings vs Target */}
        <div
          className={`kpi-card ${
            isTargetAchieved ? 'kpi-success-border kpi-sparkle-bg' : ''
          }`}
        >
          <div className="kpi-card-header">
            <span className="kpi-label">Current Savings & Goal</span>
            <div
              className={`kpi-icon-pill ${
                isTargetAchieved ? 'bg-emerald-subtle' : 'bg-amber-subtle'
              }`}
            >
              <PiggyBank
                className={`w-5 h-5 ${
                  isTargetAchieved ? 'text-emerald' : 'text-amber'
                }`}
              />
            </div>
          </div>
          <div className="kpi-amount text-emerald">
            {currency}
            {currentSavings.toLocaleString()}
          </div>
          <div className="kpi-progress-wrap">
            <div className="progress-label-row">
              <span className="text-xs text-muted">
                Goal: {currency}
                {monthlySavingTarget.toLocaleString()}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isTargetAchieved ? 'text-emerald' : 'text-amber'
                }`}
              >
                {savingTargetPercent}% Saved
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${getSavingsBarColor()}`}
                style={{ width: `${Math.min(100, Math.max(0, savingTargetPercent))}%` }}
              />
            </div>
          </div>
          <div className="kpi-footer">
            {isTargetAchieved ? (
              <span className="badge-achieved">
                <CheckCircle className="w-3.5 h-3.5" /> Target Achieved 🏆
              </span>
            ) : (
              <span className="kpi-subtext">
                Target: {currency}{monthlySavingTarget.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
