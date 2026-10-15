import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Plus,
  FileSpreadsheet,
  AlertCircle,
  Inbox,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

const CATEGORIES = [
  'All',
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

export const ExpenseList = ({
  expenses = [],
  currency = '₹',
  onEdit,
  onDelete,
  onAddNew,
  onSeedDemo,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [deletingId, setDeletingId] = useState(null);

  // Filter expenses locally
  const filtered = expenses.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort expenses
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const confirmDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (sorted.length === 0) return;
    const headers = ['Title', 'Amount', 'Currency', 'Category', 'Date', 'Payment Method', 'Notes'];
    const rows = sorted.map((item) => [
      `"${item.title.replace(/"/g, '""')}"`,
      item.amount,
      `"${currency}"`,
      `"${item.category}"`,
      `"${new Date(item.date).toLocaleDateString()}"`,
      `"${item.paymentMethod || 'UPI'}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card expense-list-card">
      {/* Header and Toolbar */}
      <div className="card-header flex-wrap-mobile">
        <div className="card-title-group">
          <h3>Expense Log & Transactions</h3>
          <span className="count-pill">{sorted.length} Records</span>
        </div>

        <div className="header-actions">
          {expenses.length > 0 && (
            <button
              type="button"
              className="btn-outline-sm"
              onClick={handleExportCSV}
              title="Download CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}

          {expenses.length > 0 && (
            <button
              type="button"
              className="btn-danger-outline-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to remove ALL your expenses for a fresh start?')) {
                  onClearAll();
                }
              }}
              title="Reset all expenses"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button type="button" className="btn-primary-sm" onClick={onAddNew}>
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by title or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="select-wrapper">
            <Filter className="w-3.5 h-3.5 select-icon" />
            <select
              className="toolbar-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <ArrowUpDown className="w-3.5 h-3.5 select-icon" />
            <select
              className="toolbar-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* List or Table */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Inbox className="w-8 h-8 text-muted" />
          </div>
          <h4>No Expenses Found</h4>
          <p className="text-muted text-sm max-w-md">
            {expenses.length === 0
              ? 'Your account is completely clean with 0 records in the database. Start tracking by recording an expense or preview with example data.'
              : 'No expenses match your search or category filter. Try clearing the filters.'}
          </p>

          <div className="empty-state-buttons">
            <button type="button" className="btn-primary-sm" onClick={onAddNew}>
              <Plus className="w-4 h-4" />
              <span>Record First Expense</span>
            </button>

            {expenses.length === 0 && (
              <button
                type="button"
                className="btn-outline-sm"
                onClick={onSeedDemo}
                title="Populate 5 sample expenses"
              >
                <Sparkles className="w-4 h-4 text-amber" />
                <span>Try Example Data</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Title & Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item._id} className="expense-row">
                  <td className="expense-title-col">
                    <span className="expense-title-text">{item.title}</span>
                    {item.notes && <span className="expense-notes-text">{item.notes}</span>}
                  </td>
                  <td>
                    <span className="category-pill">{item.category}</span>
                  </td>
                  <td className="date-col">
                    <span className="date-text">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    <span className="payment-pill">{item.paymentMethod || 'UPI'}</span>
                  </td>
                  <td className="text-right amount-col">
                    <span className="expense-amount-badge">
                      -{currency}
                      {Number(item.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="text-center action-col">
                    <div className="action-buttons-wrap">
                      <button
                        type="button"
                        className="btn-action-icon edit-icon"
                        title="Edit Expense"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="btn-action-icon delete-icon"
                        title="Delete Expense"
                        onClick={() => confirmDelete(item._id)}
                        disabled={deletingId === item._id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
