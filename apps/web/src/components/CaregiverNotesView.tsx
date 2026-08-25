import { useState, useEffect, useRef } from "react";
import type { CaregiverNote } from "@dementia/contracts";
import { api } from "../api";

interface Props {
  patientId: string;
  caregiverId: string;
  token: string;
  onBack: () => void;
}

export function CaregiverNotesView({ patientId, token, onBack }: Props) {
  const [notes, setNotes] = useState<CaregiverNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.getCaregiverNotes(patientId, token)
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const note = await api.addNote(patientId, { noteText: text.trim() }, token);
      setNotes(prev => [note, ...prev]);
      setText("");
      textRef.current?.focus();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="notes-view">
      <div className="view-header">
        <button className="btn-back" onClick={onBack}>← Overview</button>
        <h2>📝 Caregiver Notes</h2>
      </div>

      <form className="add-note-form" onSubmit={handleSubmit}>
        <textarea
          ref={textRef}
          className="note-textarea"
          rows={3}
          placeholder="Record an observation about the patient..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting || !text.trim()}>
          {submitting ? "Saving..." : "Save Note"}
        </button>
      </form>

      {loading ? (
        <div className="loading-inline"><div className="loading-spinner-sm" /> Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state"><p>No notes yet. Add an observation above.</p></div>
      ) : (
        <div className="notes-list">
          {notes.map(note => (
            <div key={note.id} className="note-card">
              <p className="note-text">{note.noteText}</p>
              <div className="note-meta">
                {new Date(note.createdAt).toLocaleString([], {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
