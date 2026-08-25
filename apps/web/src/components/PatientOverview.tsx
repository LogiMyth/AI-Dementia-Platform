import { useState, useEffect } from "react";
import type { CaregiverPatientSummary, RoutineTask, MedicationSchedule } from "@dementia/contracts";
import { api } from "../api";

interface Props {
  patient: CaregiverPatientSummary;
  token: string;
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

const riskColor: Record<string, string> = {
  LOW: "badge-ok",
  MEDIUM: "badge-warn",
  HIGH: "badge-danger"
};

const statusColor: Record<string, string> = {
  COMPLETED: "status-done",
  TAKEN: "status-done",
  SKIPPED: "status-skipped",
  PENDING: "status-pending",
  LATER: "status-warn",
  HELP: "status-danger"
};

const statusLabel: Record<string, string> = {
  COMPLETED: "✓ Done",
  TAKEN: "✓ Taken",
  SKIPPED: "Skipped",
  PENDING: "Pending",
  LATER: "Later",
  HELP: "Help Needed"
};

export function PatientOverview({ patient, token, onBack, onNavigate }: Props) {
  const [routines, setRoutines] = useState<RoutineTask[]>([]);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCaregiverRoutines(patient.patientId, token),
      api.getCaregiverMedications(patient.patientId, token)
    ]).then(([r, m]) => {
      setRoutines(r);
      setMedications(m);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [patient.patientId, token]);

  const takenMeds = medications.filter(m => m.status === "TAKEN").length;
  const adherence = medications.length > 0
    ? Math.round(100 * takenMeds / medications.length)
    : 100;
  const completedTasks = routines.filter(r => r.status === "COMPLETED").length;

  return (
    <div className="patient-overview">
      {/* Header */}
      <div className="overview-header">
        <button className="btn-back" onClick={onBack}>← Dashboard</button>
        <div className="overview-title">
          <div className="patient-avatar large">{patient.preferredName.charAt(0)}</div>
          <div>
            <h1 className="patient-name">{patient.preferredName}</h1>
            <p className="patient-meta">{patient.relationship} · {patient.preferredLanguage.toUpperCase()}</p>
          </div>
          <span className={`badge ${riskColor[patient.riskLevel] ?? "badge-ok"} large`}>
            {patient.riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        <div className="status-card">
          <div className="status-card-value">{completedTasks}/{routines.length}</div>
          <div className="status-card-label">Tasks Today</div>
        </div>
        <div className="status-card">
          <div className={`status-card-value ${adherence < 70 ? "value-warn" : ""}`}>{adherence}%</div>
          <div className="status-card-label">Med Adherence</div>
        </div>
        <div className={`status-card ${patient.activeAlertsCount > 0 ? "status-card-alert" : ""}`}>
          <div className="status-card-value">{patient.activeAlertsCount}</div>
          <div className="status-card-label">Active Alerts</div>
        </div>
        <div className="status-card">
          <div className="status-card-value">{patient.latestMood === "LOW" ? "😔" : patient.latestMood === "GOOD" ? "😊" : "😐"}</div>
          <div className="status-card-label">Mood</div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="quick-nav-row">
        {(["timeline", "alerts", "insights", "notes"] as const).map(tab => (
          <button key={tab} className="quick-nav-btn" onClick={() => onNavigate(tab)}>
            {tab === "timeline" ? "📋 Timeline" :
             tab === "alerts" ? "🔔 Alerts" :
             tab === "insights" ? "🧠 Insights" : "📝 Notes"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-inline"><div className="loading-spinner-sm" /> Loading...</div>
      ) : (
        <>
          {/* Today's Routines */}
          <section className="overview-section">
            <div className="section-header">
              <h2>Today's Routine</h2>
              <button className="btn-manage" onClick={() => onNavigate("routines")}>Manage →</button>
            </div>
            {routines.length === 0 ? (
              <p className="empty-inline">No routines set up.</p>
            ) : (
              <div className="routine-list compact">
                {routines.map(r => (
                  <div key={r.id} className="routine-row">
                    <div className="routine-info">
                      <span className="routine-time">{r.scheduledTime}</span>
                      <span className="routine-title">{r.title}</span>
                      {r.cue && <span className="routine-cue">{r.cue}</span>}
                    </div>
                    <span className={`status-badge ${statusColor[r.status] ?? ""}`}>
                      {statusLabel[r.status] ?? r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Medications */}
          <section className="overview-section">
            <div className="section-header">
              <h2>Medications</h2>
              <button className="btn-manage" onClick={() => onNavigate("medications")}>Manage →</button>
            </div>
            {medications.length === 0 ? (
              <p className="empty-inline">No medications scheduled.</p>
            ) : (
              <div className="routine-list compact">
                {medications.map(m => (
                  <div key={m.id} className="routine-row">
                    <div className="routine-info">
                      <span className="routine-time">{m.scheduledTime}</span>
                      <span className="routine-title">{m.medicationLabel}</span>
                      <span className="routine-cue">{m.dosageText}</span>
                    </div>
                    <span className={`status-badge ${statusColor[m.status] ?? ""}`}>
                      {statusLabel[m.status] ?? m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
