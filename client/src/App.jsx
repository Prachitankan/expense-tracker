import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { AlertsSection } from './components/AlertsSection';
import { FinancialOverview } from './components/FinancialOverview';
import { ExpenseList } from './components/ExpenseList';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { AddExpenseModal } from './components/AddExpenseModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AuthPage } from './components/AuthPage';
import {
  Sparkles,
  TrendingUp,
  Target,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import './App.css';

export function App() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Fetch summary and expenses for the selected period
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataLoading(true);
    try {
      const [expensesData, summaryData] = await Promise.all([
        api.get(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/api/expenses/summary?month=${selectedMonth}&year=${selectedYear}`),
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Expense Add / Update
  const handleSaveExpense = async (expenseData) => {
    if (editingExpense) {
      await api.put(`/api/expenses/${editingExpense._id}`, expenseData);
      showToast('Expense updated successfully!');
    } else {
      await api.post('/api/expenses', expenseData);
      showToast('Expense added successfully!');
    }
    setEditingExpense(null);
    fetchData();
  };

  // Expense Delete
  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      showToast('Expense deleted successfully');
      fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting expense');
    }
  };

  // Seed sample demo data on demand
  const handleSeedDemo = async () => {
    try {
      const res = await api.post('/api/expenses/seed-demo', {});
      showToast(`${res.count} example expenses added!`);
      fetchData();
    } catch (err) {
      alert('Error loading sample data: ' + err.message);
    }
  };

  // Clear all expenses
  const handleClearAll = async () => {
    try {
      await api.delete('/api/expenses/clear-all');
      showToast('All expenses cleared. Starting fresh!');
      fetchData();
    } catch (err) {
      alert('Error clearing expenses: ' + err.message);
    }
  };

  // Update profile / financial settings
  const handleProfileUpdate = async (profileData) => {
    await updateProfile(profileData);
    showToast('Financial settings updated!');
    fetchData();
  };

  // If verifying authentication
  if (authLoading) {
    return (
      <div className="full-page-loader">
        <div className="app-loader-spinner" />
        <p className="mt-3 text-muted font-medium">Connecting to SpendWise...</p>
      </div>
    );
  }

  // If not logged in, show Auth Page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const currency = user?.currency || '₹';

  return (
    <div className="app-layout">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="floating-toast">
          <CheckCircle className="w-4 h-4 text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onChangeMonth={handleMonthChange}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        currency={currency}
      />

      <main className="dashboard-content">
        {/* Alerts and Appraisals Section */}
        <AlertsSection
          summary={summary}
          currency={currency}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Financial KPI Cards Overview */}
        <FinancialOverview
          summary={summary}
          currency={currency}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Dashboard 2-Column Section */}
        <div className="dashboard-main-grid">
          {/* Left Column: Expense Transactions List */}
          <div className="grid-left-pane">
            <ExpenseList
              expenses={expenses}
              currency={currency}
              onAddNew={() => {
                setEditingExpense(null);
                setIsAddModalOpen(true);
              }}
              onEdit={(item) => {
                setEditingExpense(item);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDeleteExpense}
              onSeedDemo={handleSeedDemo}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right Column: Analytics & Quick Guidance */}
          <div className="grid-right-pane">
            {/* Category Breakdown */}
            <CategoryBreakdown
              breakdown={summary?.categoryBreakdown || []}
              totalExpenses={summary?.totalExpenses || 0}
              currency={currency}
            />

            {/* Smart Budget Rules & Financial Tips Card */}
            <div className="card smart-tips-card">
              <div className="card-header">
                <div className="card-title-group">
                  <Lightbulb className="w-5 h-5 text-amber" />
                  <h3>Budget Rule & Health Guide</h3>
                </div>
              </div>

              <div className="tips-list">
                <div className="tip-item">
                  <div className="tip-bullet text-primary">1</div>
                  <div>
                    <strong>Spending Limit Rule:</strong>
                    <p className="text-xs text-muted">
                      Your limit is calculated as <code>Income - Savings Target</code>. Keep your expenses under this line to guarantee your target.
                    </p>
                  </div>
                </div>

                <div className="tip-item">
                  <div className="tip-bullet text-emerald">2</div>
                  <div>
                    <strong>Appraisal Recognition:</strong>
                    <p className="text-xs text-muted">
                      As long as your monthly savings equal or exceed {currency}
                      {user?.monthlySavingTarget?.toLocaleString()}, you unlock the Monthly Savings Champion appraisal!
                    </p>
                  </div>
                </div>

                <div className="tip-item">
                  <div className="tip-bullet text-rose">3</div>
                  <div>
                    <strong>Threshold Warnings:</strong>
                    <p className="text-xs text-muted">
                      Automated warning alerts activate when you reach 85% and 100% of your spending budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        currency={currency}
      />

      {/* Edit Profile / Financial Budget Settings Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default App;
