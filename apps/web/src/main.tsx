import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { CheckIn, LoginResponse, PatientSettings, PatientTodaySummary, Role } from "@dementia/contracts";
import { api } from "./api";
import { Navigation, type TabKey } from "./components/Navigation";
import { PatientToday } from "./components/PatientToday";
import { RoutineMedicationView } from "./components/RoutineMedicationView";
import { DailyCheckIn } from "./components/DailyCheckIn";
import { MemorySupport } from "./components/MemorySupport";
import { CompanionView } from "./components/CompanionView";
import { PatientSettingsView } from "./components/PatientSettingsView";
import { EmergencyModal } from "./components/EmergencyModal";
import { CaregiverShell } from "./components/CaregiverShell";
import "./styles.css";

function PatientShell({ session, onSignOut }: { session: LoginResponse; onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [summary, setSummary] = useState<PatientTodaySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [largeText, setLargeText] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const data = await api.getTodaySummary(session.user.id, session.accessToken);
      setSummary(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load patient data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    api.getSettings(session.user.id, session.accessToken).then((settings) => {
      setLargeText(settings.largeText);
      setHighContrast(settings.highContrast);
      setVoiceEnabled(settings.voicePrompts);
    }).catch(() => {});
  }, [session.user.id, session.accessToken]);

  const handleQuickCompleteRoutine = async (taskId: string) => {
    if (!summary) return;
    try {
      await api.updateRoutineStatus(summary.patientId, taskId, "COMPLETED", session.accessToken);
      await loadData();
      setFeedback("Well done — your activity is marked complete.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not save that activity. Please try again.");
    }
  };

  const handleQuickTakeMedication = async (scheduleId: string) => {
    if (!summary) return;
    try {
      await api.recordMedicationAction(summary.patientId, scheduleId, "TAKEN", "Marked taken from Today overview", session.accessToken);
      await loadData();
      setFeedback("Thank you — your medicine is marked taken.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not save that medicine update. Please try again.");
    }
  };

  const handleSettingsSaved = (settings: PatientSettings) => {
    setLargeText(settings.largeText);
    setHighContrast(settings.highContrast);
    setVoiceEnabled(settings.voicePrompts);
    if (summary) {
      setSummary({ ...summary, preferredName: settings.preferredName, emergencyContact: settings.emergencyContact });
    }
  };

  const shellClasses = [
    "patient-core-app",
    largeText ? "text-large" : "",
    highContrast ? "high-contrast" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={shellClasses}>
      {/* Top Header */}
      <header className="patient-app-header">
        <div className="header-info">
          <span className="demo-tag">SIH 2026 · Patient Core</span>
          <span className="patient-badge">👤 {summary?.preferredName || session.user.displayName}</span>
        </div>
        <div className="header-quick-actions">
          <button
            type="button"
            className="btn-call-caregiver-header"
            onClick={() => setShowEmergencyModal(true)}
            aria-label="Call Caregiver"
          >
            📞 Call Caregiver
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="patient-main-container">
        {loading && (
          <div className="loading-state-card">
            <p className="loading-state">Getting your day ready, please wait…</p>
          </div>
        )}

        {error && !loading && (
          <div className="alert-banner-error" role="alert">
            <p>{error}</p>
            <button type="button" className="btn-primary-large" onClick={loadData}>
              Try Again
            </button>
          </div>
        )}

        {feedback && !loading && (
          <div className="alert-banner-success" role="status">
            <p>{feedback}</p>
          </div>
        )}

        {!loading && summary && (
          <>
            {activeTab === "today" && (
              <PatientToday
                summary={summary}
                voiceEnabled={voiceEnabled}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onQuickCompleteRoutine={handleQuickCompleteRoutine}
                onQuickTakeMedication={handleQuickTakeMedication}
              />
            )}

            {activeTab === "routines" && (
              <RoutineMedicationView
                routines={summary.routineTasks}
                medications={summary.medications}
                voiceEnabled={voiceEnabled}
                onUpdateRoutine={async (taskId, status) => {
                  await api.updateRoutineStatus(summary.patientId, taskId, status, session.accessToken);
                  await loadData();
                }}
                onRecordMedication={async (scheduleId, action) => {
                  await api.recordMedicationAction(summary.patientId, scheduleId, action, undefined, session.accessToken);
                  await loadData();
                }}
              />
            )}

            {activeTab === "checkin" && (
              <DailyCheckIn
                patientId={summary.patientId}
                patientName={summary.preferredName}
                token={session.accessToken}
                voiceEnabled={voiceEnabled}
                onCheckInSubmitted={(newCheckIn: CheckIn) => {
                  setSummary({ ...summary, latestCheckIn: newCheckIn });
                }}
                onReturnHome={() => setActiveTab("today")}
              />
            )}

            {activeTab === "memories" && (
              <MemorySupport
                patientId={summary.patientId}
                token={session.accessToken}
                voiceEnabled={voiceEnabled}
              />
            )}

            {activeTab === "companion" && (
              <CompanionView
                patientId={summary.patientId}
                patientName={summary.preferredName}
                emergencyContact={summary.emergencyContact}
                token={session.accessToken}
                voiceEnabled={voiceEnabled}
                onOpenEmergency={() => setShowEmergencyModal(true)}
              />
            )}

            {activeTab === "settings" && (
              <PatientSettingsView
                patientId={summary.patientId}
                token={session.accessToken}
                onSettingsSaved={handleSettingsSaved}
                onSignOut={onSignOut}
              />
            )}
          </>
        )}
      </main>

      {/* Accessible Bottom Navigation */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Emergency / Call Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          patientId={summary?.patientId || session.user.id}
          emergencyContact={summary?.emergencyContact || "Asha Sharma"}
          token={session.accessToken}
          voiceEnabled={voiceEnabled}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
}

function RoleShell({ role, name, onSignOut }: { role: Role; name: string; onSignOut(): void }) {
  return (
    <main className="dashboard-shell">
      <header>
        <p className="eyebrow">SIH 2026 · Fictional demo data</p>
        <h1>{role.replace("_", " ")} Workspace</h1>
        <button className="secondary" onClick={onSignOut}>Sign out</button>
      </header>
      <section className="card">
        <h2>P0 Foundation Active</h2>
        <p>You are signed in as <strong>{name}</strong> ({role}).</p>
        <p>P1 Patient Core has been fully implemented for the patient role (Meera). Sign in as Patient to test the complete dementia-friendly experience.</p>
        <button className="btn-primary-large" onClick={onSignOut}>
          Switch to Patient Demo
        </button>
      </section>
      <p className="safety">This platform supports routines and engagement. It does not diagnose dementia or replace medical care.</p>
    </main>
  );
}

function Login({ onLogin }: { onLogin(session: LoginResponse): void }) {
  const [email, setEmail] = useState("patient.b@example.test");
  const [password, setPassword] = useState("DemoPass123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const performLogin = async (eEmail: string, ePass: string) => {
    setBusy(true);
    setError("");
    try {
      const data = await api.login({ email: eEmail, password: ePass });
      onLogin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow">AI Dementia Platform · SIH 2026</p>
        <h1>Welcome</h1>
        <p>Sign in to test the dementia-friendly patient journey.</p>

        {/* Quick Demo Sign-in Shortcuts */}
        <div className="demo-shortcuts">
          <p className="shortcuts-label">1-Tap Demo Sign-in:</p>
          <button
            type="button"
            className="btn-quick-patient"
            onClick={() => performLogin("patient.b@example.test", "DemoPass123!")}
          >
            👤 Sign In as Meera (Patient Core)
          </button>
          <button
            type="button"
            className="btn-quick-caregiver"
            onClick={() => performLogin("caregiver.asha@example.test", "DemoPass123!")}
          >
            👩 Sign In as Asha (Caregiver)
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" />
          </label>
          {error && <p role="alert" className="error">{error}</p>}
          <button type="submit" disabled={busy} className="btn-submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState<LoginResponse | null>(null);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  if (session.user.role === "PATIENT") {
    return <PatientShell session={session} onSignOut={() => setSession(null)} />;
  }

  if (session.user.role === "CAREGIVER") {
    return (
      <CaregiverShell
        user={session.user}
        token={session.accessToken}
        onLogout={() => setSession(null)}
      />
    );
  }

  return (
    <RoleShell
      role={session.user.role}
      name={session.user.displayName}
      onSignOut={() => setSession(null)}
    />
  );
}

createRoot(document.getElementById("root")!).render(<App />);
