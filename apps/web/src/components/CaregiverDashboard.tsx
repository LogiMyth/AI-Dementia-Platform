import { useState, useEffect } from "react";
import type { CaregiverPatientSummary } from "@dementia/contracts";
import { api } from "../api";

interface Props {
  token: string;
  onSelectPatient: (patient: CaregiverPatientSummary) => void;
}

const riskColor: Record<string, string> = {
  LOW: "badge-ok",
  MEDIUM: "badge-warn",
  HIGH: "badge-danger"
};

const riskLabel: Record<string, string> = {
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk"
};

const moodEmoji: Record<string, string> = {
  GOOD: "😊",
  OKAY: "😐",
  LOW: "😔"
};

export function CaregiverDashboard({ token, onSelectPatient }: Props) {
  const [patients, setPatients] = useState<CaregiverPatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCaregiverDashboard(token)
      .then(setPatients)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading your patients...</p>
    </div>
  );

  if (error) return (
    <div className="error-card">
      <p>⚠️ {error}</p>
      <button className="btn btn-primary" onClick={() => { setLoading(true); setError(null); api.getCaregiverDashboard(token).then(setPatients).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }}>
        Retry
      </button>
    </div>
  );

  return (
    <div className="caregiver-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Patients</h1>
        <p className="dashboard-subtitle">{patients.length} patient{patients.length !== 1 ? "s" : ""} under your care</p>
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <p>👤 No patients linked yet.</p>
        </div>
      ) : (
        <div className="patient-grid">
          {patients.map(p => (
            <button
              key={p.patientId}
              className="patient-card"
              onClick={() => onSelectPatient(p)}
            >
              <div className="patient-card-header">
                <div className="patient-avatar">{p.preferredName.charAt(0)}</div>
                <div className="patient-card-info">
                  <h2 className="patient-name">{p.preferredName}</h2>
                  <p className="patient-relation">{p.relationship}</p>
                </div>
                <span className={`badge ${riskColor[p.riskLevel] ?? "badge-ok"}`}>
                  {riskLabel[p.riskLevel] ?? p.riskLevel}
                </span>
              </div>

              <div className="patient-stats-row">
                <div className="stat-chip">
                  <span className="stat-label">Tasks Today</span>
                  <span className="stat-value">{p.completedTasksToday}/{p.totalTasksToday}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-label">Med Adherence</span>
                  <span className="stat-value">{p.adherencePercentage}%</span>
                </div>
                {p.activeAlertsCount > 0 && (
                  <div className="stat-chip stat-alert">
                    <span className="stat-label">Alerts</span>
                    <span className="stat-value">{p.activeAlertsCount}</span>
                  </div>
                )}
                {p.latestMood && (
                  <div className="stat-chip">
                    <span className="stat-label">Mood</span>
                    <span className="stat-value">{moodEmoji[p.latestMood] ?? p.latestMood}</span>
                  </div>
                )}
              </div>

              <div className="patient-card-footer">
                <span className="last-active">
                  Last active: {p.lastActive ? new Date(p.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unknown"}
                </span>
                <span className="view-details">View Details →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
