import { useState, useEffect } from "react";
import type { TimelineEvent } from "@dementia/contracts";
import { api } from "../api";

interface Props {
  patientId: string;
  token: string;
  onBack: () => void;
}

const typeIcon: Record<string, string> = {
  MEDICATION: "💊",
  ROUTINE: "📋",
  CHECKIN: "❤️",
  ALERT: "🔔",
  NOTE: "📝"
};

const severityClass: Record<string, string> = {
  HIGH: "event-danger",
  MEDIUM: "event-warn",
  LOW: "event-low",
  INFO: "event-info"
};

export function ActivityTimeline({ patientId, token, onBack }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    api.getTimeline(patientId, token)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, token]);

  const types = ["ALL", "MEDICATION", "CHECKIN", "ALERT", "NOTE"];
  const filtered = filter === "ALL" ? events : events.filter(e => e.type === filter);

  if (loading) return <div className="loading-inline"><div className="loading-spinner-sm" /> Loading timeline...</div>;

  return (
    <div className="timeline-view">
      <div className="view-header">
        <button className="btn-back" onClick={onBack}>← Overview</button>
        <h2>Activity Timeline</h2>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {types.map(t => (
          <button
            key={t}
            className={`filter-tab ${filter === t ? "active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t === "ALL" ? "All" : typeIcon[t] + " " + t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No {filter === "ALL" ? "" : filter.toLowerCase() + " "}events recorded yet.</p>
        </div>
      ) : (
        <div className="timeline-list">
          {filtered.map((evt) => (
            <div key={evt.id} className={`timeline-event ${severityClass[evt.severity ?? "INFO"] ?? "event-info"}`}>
              <div className="event-icon">{typeIcon[evt.type] ?? "📌"}</div>
              <div className="event-body">
                <div className="event-title">{evt.title}</div>
                <div className="event-desc">{evt.description}</div>
                <div className="event-time">
                  {new Date(evt.timestamp).toLocaleString([], {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
              {evt.severity && evt.severity !== "INFO" && (
                <div className={`event-severity-dot sev-${evt.severity.toLowerCase()}`} title={evt.severity} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
