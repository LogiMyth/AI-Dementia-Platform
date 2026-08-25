import React, { useState } from "react";
import type { MedicationSchedule, RoutineTask } from "@dementia/contracts";
import { speakText } from "../utils/speech";

interface RoutineMedicationViewProps {
  routines: RoutineTask[];
  medications: MedicationSchedule[];
  voiceEnabled: boolean;
  onUpdateRoutine: (taskId: string, status: "COMPLETED" | "SKIPPED" | "PENDING") => Promise<void>;
  onRecordMedication: (scheduleId: string, action: "TAKEN" | "LATER" | "HELP") => Promise<void>;
}

export const RoutineMedicationView: React.FC<RoutineMedicationViewProps> = ({
  routines,
  medications,
  voiceEnabled,
  onUpdateRoutine,
  onRecordMedication
}) => {
  const [activeTab, setActiveTab] = useState<"meds" | "routines">("meds");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleMedAction = async (scheduleId: string, action: "TAKEN" | "LATER" | "HELP", medName: string) => {
    setBusyId(scheduleId);
    setFeedback(null);
    try {
      await onRecordMedication(scheduleId, action);
      const msg = action === "TAKEN"
        ? `Well done! ${medName} recorded as taken.`
        : action === "LATER"
        ? `Okay, we will remind you about ${medName} later.`
        : `Asha has been notified that you requested help with ${medName}.`;
      setFeedback(msg);
      speakText(msg, voiceEnabled);
    } catch (e) {
      setFeedback("Unable to update medication. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRoutineAction = async (taskId: string, status: "COMPLETED" | "SKIPPED", taskTitle: string) => {
    setBusyId(taskId);
    setFeedback(null);
    try {
      await onUpdateRoutine(taskId, status);
      const msg = status === "COMPLETED"
        ? `Great job completing: ${taskTitle}!`
        : `Skipped: ${taskTitle}. No worries at all.`;
      setFeedback(msg);
      speakText(msg, voiceEnabled);
    } catch (e) {
      setFeedback("Unable to update routine task.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="routines-meds-section">
      <div className="section-header">
        <h1>Routines & Medications</h1>
        <p>Stay on track with your daily health and comfort.</p>
      </div>

      {feedback && (
        <div className="alert-banner-success" role="status">
          <p>{feedback}</p>
        </div>
      )}

      {/* Segment Switcher */}
      <div className="segment-control" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "meds"}
          className={`segment-btn ${activeTab === "meds" ? "active" : ""}`}
          onClick={() => setActiveTab("meds")}
        >
          💊 Medications ({medications.filter((m) => m.status === "PENDING").length} pending)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "routines"}
          className={`segment-btn ${activeTab === "routines" ? "active" : ""}`}
          onClick={() => setActiveTab("routines")}
        >
          📋 Daily Routines ({routines.filter((r) => r.status === "PENDING").length} pending)
        </button>
      </div>

      {/* Medications Tab */}
      {activeTab === "meds" && (
        <div className="medication-list">
          {medications.map((med) => {
            const isPending = med.status === "PENDING";
            const isTaken = med.status === "TAKEN";
            const isLater = med.status === "LATER";
            const isHelp = med.status === "HELP";

            return (
              <article key={med.id} className={`item-card ${isTaken ? "item-completed" : ""}`}>
                <div className="item-card-top">
                  <span className="item-time">⏰ {med.scheduledTime}</span>
                  <button
                    type="button"
                    className="btn-icon-speak"
                    onClick={() => speakText(`Medication: ${med.medicationLabel}. Dosage: ${med.dosageText}. Scheduled for ${med.scheduledTime}. ${med.instructions || ""}`, true)}
                    aria-label={`Read instructions for ${med.medicationLabel}`}
                  >
                    🔊
                  </button>
                </div>

                <h2 className="item-title">{med.medicationLabel}</h2>
                <p className="item-dosage"><strong>Dosage:</strong> {med.dosageText}</p>
                {med.instructions && <p className="item-instructions">📝 {med.instructions}</p>}

                {/* Status Badges */}
                {isTaken && <div className="status-badge success">✓ Taken Today</div>}
                {isLater && <div className="status-badge warning">⏰ Remind Later Selected</div>}
                {isHelp && <div className="status-badge danger">🙋 Caregiver Notified for Help</div>}

                {/* Action Buttons */}
                <div className="med-action-grid">
                  <button
                    type="button"
                    className={`btn-action btn-take ${isTaken ? "btn-active" : ""}`}
                    disabled={busyId === med.id}
                    onClick={() => handleMedAction(med.id, "TAKEN", med.medicationLabel)}
                  >
                    ✓ Taken
                  </button>
                  <button
                    type="button"
                    className={`btn-action btn-later ${isLater ? "btn-active" : ""}`}
                    disabled={busyId === med.id}
                    onClick={() => handleMedAction(med.id, "LATER", med.medicationLabel)}
                  >
                    ⏰ Later
                  </button>
                  <button
                    type="button"
                    className={`btn-action btn-help ${isHelp ? "btn-active" : ""}`}
                    disabled={busyId === med.id}
                    onClick={() => handleMedAction(med.id, "HELP", med.medicationLabel)}
                  >
                    🙋 Need Help
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Routines Tab */}
      {activeTab === "routines" && (
        <div className="routine-list">
          {routines.map((routine) => {
            const isCompleted = routine.status === "COMPLETED";
            const isSkipped = routine.status === "SKIPPED";

            return (
              <article key={routine.id} className={`item-card ${isCompleted ? "item-completed" : ""}`}>
                <div className="item-card-top">
                  <span className="item-time">⏰ {routine.scheduledTime}</span>
                  <button
                    type="button"
                    className="btn-icon-speak"
                    onClick={() => speakText(`Routine: ${routine.title}. ${routine.cue || ""}`, true)}
                    aria-label={`Read routine ${routine.title}`}
                  >
                    🔊
                  </button>
                </div>

                <h2 className="item-title">{routine.title}</h2>
                {routine.cue && <p className="item-cue">💡 {routine.cue}</p>}

                {isCompleted && <div className="status-badge success">✓ Activity Completed</div>}
                {isSkipped && <div className="status-badge muted">↷ Skipped for Today</div>}

                <div className="routine-action-grid">
                  <button
                    type="button"
                    className={`btn-action btn-take ${isCompleted ? "btn-active" : ""}`}
                    disabled={busyId === routine.id}
                    onClick={() => handleRoutineAction(routine.id, "COMPLETED", routine.title)}
                  >
                    ✓ Mark as Done
                  </button>
                  <button
                    type="button"
                    className={`btn-action secondary ${isSkipped ? "btn-active" : ""}`}
                    disabled={busyId === routine.id}
                    onClick={() => handleRoutineAction(routine.id, "SKIPPED", routine.title)}
                  >
                    Skip
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
