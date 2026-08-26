import { useState } from "react";
import type { CaregiverPatientSummary, SessionUser } from "@dementia/contracts";
import { CaregiverDashboard } from "./CaregiverDashboard";
import { PatientOverview } from "./PatientOverview";
import { ActivityTimeline } from "./ActivityTimeline";
import { AlertsView } from "./AlertsView";
import { AIInsightsView } from "./AIInsightsView";
import { RoutineManagement } from "./RoutineManagement";
import { CaregiverNotesView } from "./CaregiverNotesView";

interface Props {
  user: SessionUser;
  token: string;
  onLogout: () => void;
}

type CaregiverTab = "dashboard" | "overview" | "routines" | "medications" | "timeline" | "alerts" | "insights" | "notes";

export function CaregiverShell({ user, token, onLogout }: Props) {
  const [selectedPatient, setSelectedPatient] = useState<CaregiverPatientSummary | null>(null);
  const [tab, setTab] = useState<CaregiverTab>("dashboard");

  const selectPatient = (p: CaregiverPatientSummary) => {
    setSelectedPatient(p);
    setTab("overview");
  };

  const backToOverview = () => setTab("overview");
  const backToDashboard = () => {
    setSelectedPatient(null);
    setTab("dashboard");
  };

  const navigateTo = (t: string) => setTab(t as CaregiverTab);

  return (
    <div className="caregiver-shell">
      {/* Top bar */}
      <header className="caregiver-topbar">
        <div className="topbar-left">
          {selectedPatient && tab !== "dashboard" && (
            <button type="button" className="btn-back-sm" onClick={tab === "overview" ? backToDashboard : backToOverview} aria-label="Go back">
              ←
            </button>
          )}
          <span className="topbar-logo">🌿 DementiaCare</span>
          {selectedPatient && (
            <span className="topbar-patient">{selectedPatient.preferredName}</span>
          )}
        </div>
        <div className="topbar-right">
          <span className="topbar-user">{user.displayName}</span>
          <button type="button" className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      {/* Main content */}
      <main className="caregiver-main">
        {tab === "dashboard" && (
          <CaregiverDashboard token={token} onSelectPatient={selectPatient} />
        )}

        {selectedPatient && tab === "overview" && (
          <PatientOverview
            patient={selectedPatient}
            token={token}
            onBack={backToDashboard}
            onNavigate={navigateTo}
          />
        )}

        {selectedPatient && tab === "routines" && (
          <RoutineManagement
            patientId={selectedPatient.patientId}
            token={token}
            onBack={backToOverview}
          />
        )}

        {selectedPatient && tab === "medications" && (
          <RoutineManagement
            patientId={selectedPatient.patientId}
            token={token}
            onBack={backToOverview}
          />
        )}

        {selectedPatient && tab === "timeline" && (
          <ActivityTimeline
            patientId={selectedPatient.patientId}
            token={token}
            onBack={backToOverview}
          />
        )}

        {selectedPatient && tab === "alerts" && (
          <AlertsView
            patientId={selectedPatient.patientId}
            token={token}
            onBack={backToOverview}
          />
        )}

        {selectedPatient && tab === "insights" && (
          <AIInsightsView
            patientId={selectedPatient.patientId}
            token={token}
            onBack={backToOverview}
          />
        )}

        {selectedPatient && tab === "notes" && (
          <CaregiverNotesView
            patientId={selectedPatient.patientId}
            caregiverId={user.id}
            token={token}
            onBack={backToOverview}
          />
        )}
      </main>

      {/* Bottom nav (only when patient selected) */}
      {selectedPatient && (
        <nav className="caregiver-bottom-nav" aria-label="Caregiver patient navigation">
          {([
            { key: "overview", icon: "🏠", label: "Overview" },
            { key: "timeline", icon: "📋", label: "Activity" },
            { key: "routines", icon: "📆", label: "Routines" },
            { key: "alerts", icon: "🔔", label: "Alerts" },
            { key: "insights", icon: "🧠", label: "Insights" },
            { key: "notes", icon: "📝", label: "Notes" }
          ] as const).map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              className={`caregiver-nav-btn ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
              aria-current={tab === key ? "page" : undefined}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
