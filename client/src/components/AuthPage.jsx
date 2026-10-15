import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  Target,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export const AuthPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [monthlySavingTarget, setMonthlySavingTarget] = useState(15000);
  const [currency, setCurrency] = useState('₹');

  // Real-time calculated spending limit
  const incomeNum = Number(monthlyIncome) || 0;
  const savingTargetNum = Number(monthlySavingTarget) || 0;
  const calculatedSpendingLimit = Math.max(0, incomeNum - savingTargetNum);
  const savingPercent = incomeNum > 0 ? Math.round((savingTargetNum / incomeNum) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long');
        if (savingTargetNum > incomeNum) {
          throw new Error('Monthly saving target cannot exceed your monthly income');
        }

        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          monthlyIncome: incomeNum,
          monthlySavingTarget: savingTargetNum,
          currency,
        });
      } else {
        if (!email.trim()) throw new Error('Please enter your email');
        if (!password) throw new Error('Please enter your password');

        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setSavingPercentage = (pct) => {
    if (incomeNum > 0) {
      setMonthlySavingTarget(Math.round((incomeNum * pct) / 100));
    }
  };

  const fillDemoData = () => {
    setIsRegister(true);
    setName('Alex Morgan');
    setEmail(`alex_${Math.floor(Math.random() * 9000 + 1000)}@example.com`);
    setPassword('secret123');
    setMonthlyIncome(60000);
    setMonthlySavingTarget(18000);
    setCurrency('₹');
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Left hero brand panel */}
        <div className="auth-hero">
          <div className="auth-hero-header">
            <div className="brand-logo-pill">
              <div className="logo-icon-bg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="brand-title">SpendWise</span>
            </div>
            <span className="badge-pill">Smart Financial Intelligence</span>
          </div>

          <div className="auth-hero-body">
            <h1 className="hero-heading">
              Smart Tracking. <br />
              <span className="gradient-text">Guaranteed Savings.</span>
            </h1>
            <p className="hero-subtext">
              Take complete command of your personal budget with automated spending limit alerts
              and celebratory appraisal awards when you meet your monthly savings goal.
            </p>

            <div className="feature-highlights">
              <div className="feature-item">
                <div className="feature-icon bg-emerald-soft">
                  <Target className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <h4>Goal-Driven Budgeting</h4>
                  <p>Define your monthly income & saving target with automatic spending limits.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon bg-rose-soft">
                  <AlertCircle className="w-5 h-5 text-rose" />
                </div>
                <div>
                  <h4>Proactive Spending Alerts</h4>
                  <p>Get instant warning notifications when your spending reaches your budget limit.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon bg-amber-soft">
                  <Sparkles className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <h4>Monthly Appraisal Awards</h4>
                  <p>Celebrate achieving your monthly savings target with visual recognition & badges.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <div className="secure-badge">
              <ShieldCheck className="w-4 h-4 text-emerald" />
              <span>MongoDB Secured & JWT Encrypted Session</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div className="auth-toggle-tabs">
            <button
              type="button"
              className={`auth-tab ${!isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab ${isRegister ? 'active' : ''}`}
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
            >
              Register & Setup
            </button>
          </div>

          <div className="auth-form-header">
            <h2>{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
            <p>
              {isRegister
                ? 'Set up your income & savings targets to begin clean expense tracking.'
                : 'Log in to securely access your personal dashboard & live tracking details.'}
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Registration Financial Setup Configuration */}
            {isRegister && (
              <div className="financial-setup-box">
                <div className="financial-setup-header">
                  <div className="section-title-wrap">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Monthly Financial Target Setup</span>
                  </div>
                  <span className="info-tag">Customizable anytime</span>
                </div>

                <div className="grid-2-col">
                  {/* Currency Selection */}
                  <div className="form-group">
                    <label className="form-label">Currency</label>
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

                  {/* Monthly Income */}
                  <div className="form-group">
                    <label className="form-label">Monthly Income ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="e.g. 50000"
                      className="form-input"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Quick Income Presets */}
                <div className="quick-chip-row">
                  <span className="quick-label">Presets:</span>
                  {[30000, 50000, 75000, 100000].map((inc) => (
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

                {/* Monthly Saving Target */}
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
                    placeholder="e.g. 15000"
                    className="form-input"
                    value={monthlySavingTarget}
                    onChange={(e) => setMonthlySavingTarget(e.target.value)}
                    required
                  />
                </div>

                {/* Quick Saving Percentage Chips */}
                <div className="quick-chip-row">
                  <span className="quick-label">Target %:</span>
                  {[10, 20, 30, 40, 50].map((pct) => (
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

                {/* Live Calculation Box */}
                <div className="calculation-preview-card">
                  <div className="calc-row">
                    <span className="calc-label">Monthly Spending Limit:</span>
                    <span className="calc-value font-bold text-primary">
                      {currency}
                      {calculatedSpendingLimit.toLocaleString()}
                    </span>
                  </div>
                  <p className="calc-explanation">
                    💡 <strong>Formula:</strong> Income ({currency}
                    {incomeNum.toLocaleString()}) - Saving Target ({currency}
                    {savingTargetNum.toLocaleString()}) = Max budget of{' '}
                    <strong>
                      {currency}
                      {calculatedSpendingLimit.toLocaleString()}
                    </strong>
                    . If your spending exceeds this limit, an automated alert will trigger!
                  </p>
                </div>
              </div>
            )}

            <button type="submit" className="submit-auth-btn" disabled={loading}>
              {loading ? (
                <div className="spinner-sm" />
              ) : (
                <>
                  <span>{isRegister ? 'Complete Setup & Enter' : 'Sign In to Tracker'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="demo-helper-section">
            <button type="button" className="demo-fill-btn" onClick={fillDemoData}>
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>Fill Quick Demo Details (One Click)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
