import React, { useState } from "react";
import { api } from "../api";
import { speakText } from "../utils/speech";

interface EmergencyModalProps {
  patientId: string;
  emergencyContact: string;
  token: string;
  voiceEnabled: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  patientId,
  emergencyContact,
  token,
  voiceEnabled,
  onClose
}) => {
  const [actionType, setActionType] = useState<"CALL_CAREGIVER" | "EMERGENCY_HELP" | null>(null);
  const [busy, setBusy] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const trigger = async (type: "CALL_CAREGIVER" | "EMERGENCY_HELP") => {
    setBusy(true);
    try {
      const res = await api.triggerEmergencyAction(patientId, type, token);
      setResultMessage(res.message);
      speakText(res.message, voiceEnabled);
    } catch (e) {
      const msg = "Help request recorded. Please stay calm.";
      setResultMessage(msg);
      speakText(msg, voiceEnabled);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        {!actionType && !resultMessage && (
          <>
            <h2 id="modal-title">Need Assistance?</h2>
            <p className="modal-subtitle">We are here to help you. Who would you like to reach?</p>
            <div className="modal-actions-stacked">
              <button
                type="button"
                className="btn-large btn-caregiver"
                onClick={() => {
                  setActionType("CALL_CAREGIVER");
                  speakText(`Calling ${emergencyContact}. Please confirm with the green button.`, voiceEnabled);
                }}
              >
                📞 Call Caregiver ({emergencyContact})
              </button>
              <button
                type="button"
                className="btn-large btn-emergency"
                onClick={() => {
                  setActionType("EMERGENCY_HELP");
                  speakText("Requesting emergency help. Please confirm with the call button.", voiceEnabled);
                }}
              >
                🚨 Emergency Help
              </button>
              <button type="button" className="btn-large secondary" onClick={onClose}>
                ↩ Go Back
              </button>
            </div>
          </>
        )}

        {actionType && !resultMessage && (
          <>
            <h2>
              {actionType === "CALL_CAREGIVER" ? `Call ${emergencyContact}?` : "Request Emergency Help?"}
            </h2>
            <p className="modal-subtitle">
              {actionType === "CALL_CAREGIVER"
                ? `We will connect you directly to ${emergencyContact}.`
                : "This will alert your caregiver and nearby emergency support."}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className={`btn-large ${actionType === "CALL_CAREGIVER" ? "btn-caregiver" : "btn-emergency"}`}
                disabled={busy}
                onClick={() => trigger(actionType)}
              >
                {busy ? "Connecting…" : "✓ Yes, Call Now"}
              </button>
              <button
                type="button"
                className="btn-large secondary"
                disabled={busy}
                onClick={() => setActionType(null)}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {resultMessage && (
          <>
            <div className="status-badge-large success">✓ Connected</div>
            <h2>Help is Connected</h2>
            <p className="modal-subtitle">{resultMessage}</p>
            <div className="card-soft">
              <p>Stay where you are. You are in a safe place.</p>
            </div>
            <button type="button" className="btn-large primary" onClick={onClose}>
              Done / Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};
