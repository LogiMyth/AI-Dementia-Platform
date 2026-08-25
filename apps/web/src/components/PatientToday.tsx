import React from "react";
import type { PatientTodaySummary } from "@dementia/contracts";
import { speakText } from "../utils/speech";

interface PatientTodayProps {
  summary: PatientTodaySummary;
  voiceEnabled: boolean;
  onNavigateTab: (tab: "routines" | "checkin" | "memories" | "companion") => void;
  onQuickCompleteRoutine: (taskId: string) => void;
  onQuickTakeMedication: (scheduleId: string) => void;
}

export const PatientToday: React.FC<PatientTodayProps> = ({
  summary,
  voiceEnabled,
  onNavigateTab,
  onQuickCompleteRoutine,
  onQuickTakeMedication
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayDateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());

  const readTodayOverview = () => {
    const text = `${getGreeting()}, ${summary.preferredName}. Today is ${todayDateString}. You have completed ${summary.completedCount} of ${summary.totalCount} activities. Your next step is: ${summary.nextAction}.`;
    speakText(text, true);
  };

  const pendingMeds = summary.medications.filter((m) => m.status === "PENDING");
  const pendingRoutines = summary.routineTasks.filter((r) => r.status === "PENDING");
  const progressPct = summary.totalCount > 0
    ? Math.round((summary.completedCount / summary.totalCount) * 100)
    : 100;

  return (
    <section className="patient-today-flow">
      {/* Header & Greeting */}
      <div className="patient-greeting-card">
        <div className="greeting-text">
          <p className="eyebrow-patient">{todayDateString}</p>
          <h1>{getGreeting()}, {summary.preferredName}</h1>
        </div>
        <button
          type="button"
          className="btn-listen"
          onClick={readTodayOverview}
          aria-label="Hear instructions aloud"
        >
          🔊 Read Aloud
        </button>
      </div>

      {/* Primary Next Action Card (One screen, one dominant action) */}
      <div className="card-highlight">
        <div className="highlight-header">
          <span className="badge-next">⭐ Next Activity</span>
        </div>
        <h2 className="highlight-title">{summary.nextAction}</h2>
        <p className="highlight-subtitle">
          {pendingMeds.length > 0
            ? "Your scheduled daily medication is ready for you."
            : pendingRoutines.length > 0
            ? "Take your time. There is no rush."
            : "Wonderful work! You have completed your scheduled activities for now."}
        </p>

        {pendingMeds.length > 0 && (
          <div className="action-button-group">
            <button
              type="button"
              className="btn-primary-large"
              onClick={() => onQuickTakeMedication(pendingMeds[0].id)}
            >
              ✓ Take {pendingMeds[0].medicationLabel}
            </button>
            <button
              type="button"
              className="btn-secondary-large"
              onClick={() => onNavigateTab("routines")}
            >
              View All Medications
            </button>
          </div>
        )}

        {pendingMeds.length === 0 && pendingRoutines.length > 0 && (
          <div className="action-button-group">
            <button
              type="button"
              className="btn-primary-large"
              onClick={() => onQuickCompleteRoutine(pendingRoutines[0].id)}
            >
              ✓ Done: {pendingRoutines[0].title}
            </button>
            <button
              type="button"
              className="btn-secondary-large"
              onClick={() => onNavigateTab("routines")}
            >
              View Full Routine
            </button>
          </div>
        )}

        {pendingMeds.length === 0 && pendingRoutines.length === 0 && (
          <div className="action-button-group">
            <button
              type="button"
              className="btn-primary-large"
              onClick={() => onNavigateTab("memories")}
            >
              📸 View Memory Cards
            </button>
            <button
              type="button"
              className="btn-secondary-large"
              onClick={() => onNavigateTab("companion")}
            >
              💬 Chat with Companion
            </button>
          </div>
        )}
      </div>

      {/* Progress Overview Card */}
      <div className="card-summary">
        <div className="summary-row">
          <div>
            <h3>Today's Progress</h3>
            <p className="summary-subtext">
              {summary.completedCount} of {summary.totalCount} routines completed ({progressPct}%)
            </p>
          </div>
          <span className="summary-badge">{progressPct === 100 ? "🎉 All Done!" : "In Progress"}</span>
        </div>
        <div className="progress-bar-container" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Daily Check-in Card */}
      <div className="card-checkin-prompt">
        <div className="checkin-prompt-content">
          <span className="checkin-icon" aria-hidden="true">💖</span>
          <div>
            <h3>Daily Mood & Rest Check-in</h3>
            <p>
              {summary.latestCheckIn
                ? `Submitted today: Feeling ${summary.latestCheckIn.mood.toLowerCase()} and rested.`
                : "Let us know how you are feeling this morning."}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-checkin-trigger"
          onClick={() => onNavigateTab("checkin")}
        >
          {summary.latestCheckIn ? "Update Check-in" : "Start 1-Min Check-in →"}
        </button>
      </div>

      {/* Gentle Safety Banner */}
      <footer className="patient-safety-footer">
        <p>
          🌿 This companion is here for your daily comfort and routine. It does not replace medical advice.
        </p>
      </footer>
    </section>
  );
};
