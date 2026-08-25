import { useState, useEffect } from "react";
import type { Alert } from "@dementia/contracts";
import { api } from "../api";

interface Props {
  patientId: string;
  token: string;
  onBack: () => void;
}

const severityColor: Record<string, string> = {
  HIGH: "alert-high",
  MEDIUM: "alert-medium",
  LOW: "alert-low"
};

const severityIcon: Record<string, string> = {
  HIGH: "🔴",
  MEDIUM: "🟡",
  LOW: "🟢"
};

const typeLabel: Record<string, string> = {
  MISSED_MEDICATION: "Missed Medication",
  LOW_MOOD: "Low Mood Reported",
  HELP_REQUESTED: "Help Requested",
  ROUTINE_MISSED: "Routine Missed",
  EMERGENCY: "Emergency Alert"
};

export function AlertsView({ patientId, token, onBack }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"ACTIVE" | "ALL">("ACTIVE");

  useEffect(() => {
    api.getAlerts(patientId, token)
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, token]);

  const handleAcknowledge = async (alertId: string, status: "ACKNOWLEDGED" | "RESOLVED") => {
    setAcknowledging(alertId);
    try {
      const updated = await api.acknowledgeAlert(alertId, {
        status,
        note: noteInput[alertId] || undefined
      }, token);
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
    } catch (e) {
      console.error(e);
    } finally {
      setAcknowledging(null);
    }
  };

  const displayed = filter === "ACTIVE"
    ? alerts.filter(a => a.status === "ACTIVE")
    : alerts;

  if (loading) return <div className="loading-inline"><div className="loading-spinner-sm" /> Loading alerts...</div>;

  return (
    <div className="alerts-view">
      <div className="view-header">
        <button className="btn-back" onClick={onBack}>← Overview</button>
        <h2>Alerts</h2>
        <div className="toggle-filter">
          <button className={`filter-tab ${filter === "ACTIVE" ? "active" : ""}`} onClick={() => setFilter("ACTIVE")}>
            Active ({alerts.filter(a => a.status === "ACTIVE").length})
          </button>
          <button className={`filter-tab ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
            All ({alerts.length})
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">
          <p>✅ {filter === "ACTIVE" ? "No active alerts." : "No alerts found."}</p>
        </div>
      ) : (
        <div className="alerts-list">
          {displayed.map(alert => (
            <div key={alert.id} className={`alert-card ${severityColor[alert.severity] ?? ""} ${alert.status !== "ACTIVE" ? "alert-muted" : ""}`}>
              <div className="alert-card-header">
                <span className="alert-severity-icon">{severityIcon[alert.severity]}</span>
                <div className="alert-card-title">
                  <strong>{typeLabel[alert.type] ?? alert.type}</strong>
                  <span className="alert-timestamp">
                    {new Date(alert.createdAt).toLocaleString([], {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
                <span className={`badge ${alert.status === "ACTIVE" ? "badge-danger" : "badge-ok"}`}>
                  {alert.status}
                </span>
              </div>

              <p className="alert-rationale">{alert.rationale}</p>

              {alert.note && (
                <p className="alert-note">📝 Caregiver note: {alert.note}</p>
              )}

              {alert.status === "ACTIVE" && (
                <div className="alert-actions">
                  <input
                    type="text"
                    className="note-input"
                    placeholder="Optional note..."
                    value={noteInput[alert.id] ?? ""}
                    onChange={e => setNoteInput(prev => ({ ...prev, [alert.id]: e.target.value }))}
                  />
                  <div className="alert-action-btns">
                    <button
                      className="btn btn-secondary"
                      disabled={acknowledging === alert.id}
                      onClick={() => handleAcknowledge(alert.id, "ACKNOWLEDGED")}
                    >
                      {acknowledging === alert.id ? "..." : "✓ Acknowledge"}
                    </button>
                    <button
                      className="btn btn-success"
                      disabled={acknowledging === alert.id}
                      onClick={() => handleAcknowledge(alert.id, "RESOLVED")}
                    >
                      {acknowledging === alert.id ? "..." : "✅ Resolve"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
