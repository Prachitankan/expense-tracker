import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Edit,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
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
];

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
  'Other',
];

export const AddExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  editingExpense = null,
  currency = '₹',
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(editingExpense.amount || '');
      setCategory(editingExpense.category || 'Food & Dining');
      setDate(
        editingExpense.date
          ? new Date(editingExpense.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setPaymentMethod(editingExpense.paymentMethod || 'UPI');
      setNotes(editingExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
    }
    setError('');
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide an expense title');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        amount: numAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const addAmountPreset = (addVal) => {
    const curr = parseFloat(amount) || 0;
    setAmount((curr + addVal).toString());
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-bubble">
              {editingExpense ? (
                <Edit className="w-5 h-5 text-primary" />
              ) : (
                <PlusCircle className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3>{editingExpense ? 'Edit Expense Record' : 'Record New Expense'}</h3>
              <p className="text-xs text-muted">
                {editingExpense
                  ? 'Update details for this expenditure'
                  : 'Track your spending accurately against your budget'}
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

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Expense Title / Item</label>
            <input
              type="text"
              placeholder="e.g. Grocery Store, Dinner, Electric Bill"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Amount with Quick Add Chips */}
          <div className="form-group">
            <label className="form-label">Amount ({currency})</label>
            <div className="amount-input-wrapper">
              <span className="currency-prefix">{currency}</span>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="0.00"
                className="form-input amount-field"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="quick-chip-row mt-1">
              <span className="quick-label">Quick Add:</span>
              {[100, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="quick-chip"
                  onClick={() => addAmountPreset(preset)}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Payment Method in 2 columns */}
          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date of Expenditure</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Receipt #123, split with roommates, etc."
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <div className="spinner-sm" />
              ) : editingExpense ? (
                'Save Changes'
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
