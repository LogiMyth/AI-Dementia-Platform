import { useState, useEffect } from "react";
import type { RoutineTask, MedicationSchedule, CreateRoutineRequest, CreateMedicationRequest } from "@dementia/contracts";
import { api } from "../api";

interface Props {
  patientId: string;
  token: string;
  onBack: () => void;
}

const statusColor: Record<string, string> = {
  COMPLETED: "status-done",
  TAKEN: "status-done",
  SKIPPED: "status-skipped",
  PENDING: "status-pending",
  LATER: "status-warn",
  HELP: "status-danger"
};

const statusLabel: Record<string, string> = {
  COMPLETED: "✓ Done", TAKEN: "✓ Taken", SKIPPED: "Skipped",
  PENDING: "Pending", LATER: "Later", HELP: "Help Needed"
};

type Panel = "routines" | "medications";

export function RoutineManagement({ patientId, token, onBack }: Props) {
  const [panel, setPanel] = useState<Panel>("routines");
  const [routines, setRoutines] = useState<RoutineTask[]>([]);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newRoutine, setNewRoutine] = useState<CreateRoutineRequest>({
    title: "", cue: "", scheduledTime: "09:00", recurrence: "DAILY"
  });
  const [newMed, setNewMed] = useState<CreateMedicationRequest>({
    medicationLabel: "", dosageText: "", scheduledTime: "08:00", instructions: ""
  });

  useEffect(() => {
    Promise.all([
      api.getCaregiverRoutines(patientId, token),
      api.getCaregiverMedications(patientId, token)
    ]).then(([r, m]) => { setRoutines(r); setMedications(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, token]);

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutine.title.trim()) return;
    setSubmitting(true);
    try {
      const task = await api.addRoutine(patientId, newRoutine, token);
      setRoutines(prev => [...prev, task]);
      setShowAddRoutine(false);
      setNewRoutine({ title: "", cue: "", scheduledTime: "09:00", recurrence: "DAILY" });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.medicationLabel.trim() || !newMed.dosageText.trim()) return;
    setSubmitting(true);
    try {
      const med = await api.addMedication(patientId, newMed, token);
      setMedications(prev => [...prev, med]);
      setShowAddMed(false);
      setNewMed({ medicationLabel: "", dosageText: "", scheduledTime: "08:00", instructions: "" });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="routine-management">
      <div className="view-header">
        <button className="btn-back" onClick={onBack}>← Overview</button>
        <h2>Routine & Medication Management</h2>
      </div>

      {/* Panel toggle */}
      <div className="panel-tabs">
        <button className={`panel-tab ${panel === "routines" ? "active" : ""}`} onClick={() => setPanel("routines")}>
          📋 Routines ({routines.length})
        </button>
        <button className={`panel-tab ${panel === "medications" ? "active" : ""}`} onClick={() => setPanel("medications")}>
          💊 Medications ({medications.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-inline"><div className="loading-spinner-sm" /> Loading...</div>
      ) : panel === "routines" ? (
        <>
          <div className="section-action-header">
            <h3>Daily Routines</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddRoutine(true)}>+ Add Routine</button>
          </div>

          {showAddRoutine && (
            <form className="add-form" onSubmit={handleAddRoutine}>
              <div className="form-row">
                <label>Task Name *</label>
                <input className="form-input" value={newRoutine.title}
                  onChange={e => setNewRoutine(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Morning Stretch" required />
              </div>
              <div className="form-row">
                <label>Reminder Cue</label>
                <input className="form-input" value={newRoutine.cue ?? ""}
                  onChange={e => setNewRoutine(p => ({ ...p, cue: e.target.value }))}
                  placeholder="e.g. After breakfast" />
              </div>
              <div className="form-row">
                <label>Scheduled Time</label>
                <input className="form-input" type="time" value={newRoutine.scheduledTime}
                  onChange={e => setNewRoutine(p => ({ ...p, scheduledTime: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Routine"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddRoutine(false)}>Cancel</button>
              </div>
            </form>
          )}

          {routines.length === 0 ? (
            <div className="empty-state"><p>No routines scheduled. Add one above.</p></div>
          ) : (
            <div className="routine-list">
              {routines.map(r => (
                <div key={r.id} className="routine-row">
                  <div className="routine-info">
                    <span className="routine-time">{r.scheduledTime}</span>
                    <div>
                      <div className="routine-title">{r.title}</div>
                      {r.cue && <div className="routine-cue">💬 {r.cue}</div>}
                      <div className="routine-recurrence">🔁 {r.recurrence}</div>
                    </div>
                  </div>
                  <span className={`status-badge ${statusColor[r.status] ?? ""}`}>
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="section-action-header">
            <h3>Medication Schedules</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddMed(true)}>+ Add Medication</button>
          </div>

          {showAddMed && (
            <form className="add-form" onSubmit={handleAddMed}>
              <div className="form-row">
                <label>Medication Name *</label>
                <input className="form-input" value={newMed.medicationLabel}
                  onChange={e => setNewMed(p => ({ ...p, medicationLabel: e.target.value }))}
                  placeholder="e.g. Donepezil" required />
              </div>
              <div className="form-row">
                <label>Dosage *</label>
                <input className="form-input" value={newMed.dosageText}
                  onChange={e => setNewMed(p => ({ ...p, dosageText: e.target.value }))}
                  placeholder="e.g. 5mg tablet" required />
              </div>
              <div className="form-row">
                <label>Scheduled Time</label>
                <input className="form-input" type="time" value={newMed.scheduledTime}
                  onChange={e => setNewMed(p => ({ ...p, scheduledTime: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Instructions</label>
                <input className="form-input" value={newMed.instructions ?? ""}
                  onChange={e => setNewMed(p => ({ ...p, instructions: e.target.value }))}
                  placeholder="e.g. Take with water after breakfast" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Medication"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddMed(false)}>Cancel</button>
              </div>
            </form>
          )}

          {medications.length === 0 ? (
            <div className="empty-state"><p>No medications scheduled. Add one above.</p></div>
          ) : (
            <div className="routine-list">
              {medications.map(m => (
                <div key={m.id} className="routine-row">
                  <div className="routine-info">
                    <span className="routine-time">{m.scheduledTime}</span>
                    <div>
                      <div className="routine-title">{m.medicationLabel}</div>
                      <div className="routine-cue">{m.dosageText}</div>
                      {m.instructions && <div className="routine-cue">📋 {m.instructions}</div>}
                    </div>
                  </div>
                  <span className={`status-badge ${statusColor[m.status] ?? ""}`}>
                    {statusLabel[m.status] ?? m.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
