import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  TrendingUp,
  Target,
  DollarSign,
  AlertCircle,
  Save,
  CheckCircle,
} from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [name, setName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlySavingTarget, setMonthlySavingTarget] = useState(0);
  const [currency, setCurrency] = useState('₹');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMonthlyIncome(user.monthlyIncome || 0);
      setMonthlySavingTarget(user.monthlySavingTarget || 0);
      setCurrency(user.currency || '₹');
    }
    setError('');
    setSuccessMsg('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const incomeNum = Number(monthlyIncome) || 0;
  const savingTargetNum = Number(monthlySavingTarget) || 0;
  const calculatedSpendingLimit = Math.max(0, incomeNum - savingTargetNum);
  const savingPercent = incomeNum > 0 ? Math.round((savingTargetNum / incomeNum) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (incomeNum < 0) {
      setError('Monthly income cannot be negative');
      return;
    }

    if (savingTargetNum > incomeNum) {
      setError('Monthly saving target cannot be greater than monthly income');
      return;
    }

    setLoading(true);
    try {
      await onUpdate({
        name: name.trim(),
        monthlyIncome: incomeNum,
        monthlySavingTarget: savingTargetNum,
        currency,
      });
      setSuccessMsg('Financial settings updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  const setSavingPercentage = (pct) => {
    if (incomeNum > 0) {
      setMonthlySavingTarget(Math.round((incomeNum * pct) / 100));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-bubble">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3>Edit Financial Settings & Targets</h3>
              <p className="text-xs text-muted">
                Adjust your monthly income, saving target, and currency anytime
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="modal-error-banner">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="modal-success-banner">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="₹">₹ - Indian Rupee (INR)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
                <option value="¥">¥ - Japanese Yen (JPY)</option>
                <option value="C$">C$ - Canadian Dollar</option>
                <option value="A$">A$ - Australian Dollar</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Income ({currency})</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Income Chips */}
          <div className="quick-chip-row">
            <span className="quick-label">Income Presets:</span>
            {[30000, 50000, 75000, 100000, 150000].map((inc) => (
              <button
                key={inc}
                type="button"
                className={`quick-chip ${incomeNum === inc ? 'active' : ''}`}
                onClick={() => setMonthlyIncome(inc)}
              >
                {currency}
                {inc.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="form-group mt-3">
            <div className="label-with-badge">
              <label className="form-label">Monthly Saving Target ({currency})</label>
              <span className="saving-pct-badge">{savingPercent}% of income</span>
            </div>
            <input
              type="number"
              min="0"
              max={incomeNum}
              step="500"
              className="form-input"
              value={monthlySavingTarget}
              onChange={(e) => setMonthlySavingTarget(e.target.value)}
              required
            />
          </div>

          {/* Quick Target % Chips */}
          <div className="quick-chip-row">
            <span className="quick-label">Target %:</span>
            {[10, 20, 25, 30, 40, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                className={`quick-chip ${savingPercent === pct ? 'active' : ''}`}
                onClick={() => setSavingPercentage(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Dynamic Spending Limit Calculation Card */}
          <div className="calculation-preview-card">
            <div className="calc-row">
              <span className="calc-label">Updated Spending Limit:</span>
              <span className="calc-value font-bold text-primary">
                {currency}
                {calculatedSpendingLimit.toLocaleString()}
              </span>
            </div>
            <p className="calc-explanation">
              Spending limit = Income ({currency}
              {incomeNum.toLocaleString()}) - Saving Target ({currency}
              {savingTargetNum.toLocaleString()}). If monthly spending hits this limit, alerts will
              activate in your alerts section.
            </p>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <div className="spinner-sm" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  <span>Update Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
