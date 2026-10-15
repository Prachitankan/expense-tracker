import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Award,
  Trophy,
  Flame,
  CheckCircle2,
  Info,
  Sparkles,
  TrendingUp,
  X,
  Volume2,
} from 'lucide-react';

export const AlertsSection = ({ summary, currency, onOpenProfile }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const {
    alerts = [],
    isLimitExceeded,
    isTargetAchieved,
    totalExpenses = 0,
    spendingLimit = 0,
    currentSavings = 0,
    monthlySavingTarget = 0,
    spendingLimitPercent = 0,
  } = summary || {};

  // Trigger celebratory confetti once when user hits/surpasses savings target
  useEffect(() => {
    if (isTargetAchieved && !hasTriggeredConfetti && monthlySavingTarget > 0) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899'],
        });
        setHasTriggeredConfetti(true);
      } catch (err) {
        // fallback silently
      }
    }
  }, [isTargetAchieved, hasTriggeredConfetti, monthlySavingTarget]);

  const fireManualConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  const handleDismiss = (code) => {
    setDismissedAlerts((prev) => [...prev, code]);
  };

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.includes(alert.code));

  if (!summary || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <div className="alerts-title-row">
          <div className="pulse-bell-ring">
            <Volume2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="alerts-heading">Financial Activity Alerts & Appraisals</h3>
          <span className="alerts-count-badge">{visibleAlerts.length} Active</span>
        </div>
        <span className="alerts-subtitle">
          Real-time monitoring of your spending threshold and monthly savings milestone
        </span>
      </div>

      <div className="alerts-list">
        {visibleAlerts.map((alert, index) => {
          const isAppraisal = alert.type === 'appraisal';
          const isDanger = alert.type === 'danger';
          const isWarning = alert.type === 'warning';

          return (
            <div
              key={alert.code || index}
              className={`alert-card ${
                isAppraisal
                  ? 'alert-appraisal'
                  : isDanger
                  ? 'alert-danger'
                  : isWarning
                  ? 'alert-warning'
                  : 'alert-info'
              }`}
            >
              <div className="alert-card-left">
                <div className="alert-icon-box">
                  {isAppraisal ? (
                    <Trophy className="w-6 h-6 text-amber animate-bounce-short" />
                  ) : isDanger ? (
                    <Flame className="w-6 h-6 text-rose animate-pulse" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-6 h-6 text-amber" />
                  ) : (
                    <Info className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="alert-content">
                  <div className="alert-top-row">
                    <h4 className="alert-title">{alert.title}</h4>
                    {isAppraisal && (
                      <span className="appraisal-ribbon">
                        <Sparkles className="w-3.5 h-3.5" />
                        {alert.badge || 'Goal Achieved!'}
                      </span>
                    )}
                    {isDanger && (
                      <span className="limit-exceeded-badge">
                        Limit Exceeded ({spendingLimitPercent}%)
                      </span>
                    )}
                    {isWarning && (
                      <span className="limit-warning-badge">
                        Caution ({spendingLimitPercent}%)
                      </span>
                    )}
                  </div>

                  <p className="alert-message">{alert.message}</p>

                  {/* Contextual Action Bar */}
                  <div className="alert-meta-actions">
                    {isAppraisal && (
                      <button
                        type="button"
                        className="appraisal-celebrate-btn"
                        onClick={fireManualConfetti}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Celebrate Milestone 🎉
                      </button>
                    )}

                    {isDanger && (
                      <div className="danger-advice">
                        <span>💡 Tip: Review discretionary expenses below or adjust your target in financial settings.</span>
                      </div>
                    )}

                    {onOpenProfile && (
                      <button
                        type="button"
                        className="alert-edit-settings-link"
                        onClick={onOpenProfile}
                      >
                        Edit Income & Limit Settings
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="alert-dismiss-btn"
                title="Dismiss Alert"
                onClick={() => handleDismiss(alert.code)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
