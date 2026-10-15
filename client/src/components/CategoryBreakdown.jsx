import React from 'react';
import {
  Utensils,
  Home,
  Zap,
  Car,
  Tv,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  ShoppingBasket,
  TrendingUp,
  MoreHorizontal,
  PieChart,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Housing & Rent': Home,
  'Utilities & Bills': Zap,
  'Transportation': Car,
  'Entertainment & Leisure': Tv,
  'Health & Fitness': HeartPulse,
  'Shopping & Personal': ShoppingBag,
  'Education': GraduationCap,
  'Groceries': ShoppingBasket,
  'Investments': TrendingUp,
  'Other': MoreHorizontal,
};

const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Housing & Rent': '#6366f1',
  'Utilities & Bills': '#eab308',
  'Transportation': '#06b6d4',
  'Entertainment & Leisure': '#ec4899',
  'Health & Fitness': '#10b981',
  'Shopping & Personal': '#8b5cf6',
  'Education': '#3b82f6',
  'Groceries': '#14b8a6',
  'Investments': '#10b981',
  'Other': '#64748b',
};

export const CategoryBreakdown = ({ breakdown = [], totalExpenses = 0, currency = '₹' }) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="card breakdown-empty-card">
        <div className="card-header">
          <div className="card-title-group">
            <PieChart className="w-5 h-5 text-primary" />
            <h3>Category Breakdown</h3>
          </div>
        </div>
        <div className="empty-breakdown-state">
          <p className="text-muted text-sm">No expenses logged for this period yet.</p>
          <span className="text-xs text-subtle">
            Add your expenses to see spending analytics across categories.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card category-breakdown-card">
      <div className="card-header">
        <div className="card-title-group">
          <PieChart className="w-5 h-5 text-primary" />
          <h3>Category Spending Breakdown</h3>
        </div>
        <span className="text-xs font-medium text-muted">
          {breakdown.length} Active Categories
        </span>
      </div>

      {/* Multi-segment visual bar */}
      <div className="category-strip-track">
        {breakdown.map((item) => (
          <div
            key={item.category}
            className="category-strip-segment"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: CATEGORY_COLORS[item.category] || '#6366f1',
            }}
            title={`${item.category}: ${currency}${item.total.toLocaleString()} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Category items list */}
      <div className="category-items-grid">
        {breakdown.map((item) => {
          const Icon = CATEGORY_ICONS[item.category] || MoreHorizontal;
          const color = CATEGORY_COLORS[item.category] || '#6366f1';

          return (
            <div key={item.category} className="category-item-card">
              <div className="category-item-top">
                <div
                  className="category-icon-bubble"
                  style={{ backgroundColor: `${color}18`, color: color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="category-info">
                  <span className="category-name">{item.category}</span>
                  <span className="category-pct">{item.percentage}%</span>
                </div>
              </div>

              <div className="category-amount-row">
                <span className="category-total-spent">
                  {currency}
                  {item.total.toLocaleString()}
                </span>
              </div>

              <div className="category-mini-bar">
                <div
                  className="category-mini-fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
