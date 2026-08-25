import React, { useState } from "react";
import type { CheckIn } from "@dementia/contracts";
import { api } from "../api";
import { speakText } from "../utils/speech";

interface DailyCheckInProps {
  patientId: string;
  patientName: string;
  token: string;
  voiceEnabled: boolean;
  onCheckInSubmitted: (checkIn: CheckIn) => void;
  onReturnHome: () => void;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  patientId,
  patientName,
  token,
  voiceEnabled,
  onCheckInSubmitted,
  onReturnHome
}) => {
  const [step, setStep] = useState<number>(1);
  const [mood, setMood] = useState<"GOOD" | "OKAY" | "LOW">("GOOD");
  const [sleep, setSleep] = useState<"GOOD" | "RESTLESS" | "POOR">("GOOD");
  const [orientation, setOrientation] = useState<string>("Morning");
  const [helpRequested, setHelpRequested] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const checkInPayload: CheckIn = {
        patientId,
        mood,
        sleepQuality: sleep,
        orientationResponse: orientation,
        helpRequested
      };
      const result = await api.submitCheckIn(checkInPayload, token);
      onCheckInSubmitted(result);
      setSubmitted(true);
      speakText(`Thank you ${patientName}. Your daily check-in is saved. You are doing wonderfully today.`, voiceEnabled);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <section className="checkin-complete-card">
        <div className="status-badge-large success">🎉 Check-in Complete</div>
        <h1>Thank you, {patientName}!</h1>
        <p className="checkin-feedback-text">
          Your rest and mood updates have been shared with your care team. Everything is in good order.
        </p>
        <div className="checkin-summary-box">
          <p><strong>Today's Mood:</strong> {mood === "GOOD" ? "😊 Good" : mood === "OKAY" ? "😐 Calm / Okay" : "😔 Low / Tired"}</p>
          <p><strong>Rest Quality:</strong> {sleep === "GOOD" ? "😴 Slept Well" : sleep === "RESTLESS" ? "🥱 Restless" : "😫 Poor Sleep"}</p>
          <p><strong>Caregiver Visit:</strong> {helpRequested ? "📞 Check-in Requested" : "🌿 Doing well"}</p>
        </div>
        <button type="button" className="btn-primary-large" onClick={onReturnHome}>
          Return to Today's Tasks
        </button>
      </section>
    );
  }

  return (
    <section className="checkin-wizard">
      <div className="wizard-progress-header">
        <p className="eyebrow-patient">Daily Check-in · Step {step} of 4</p>
        <div className="step-dots" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={`dot ${i === step ? "active" : i < step ? "completed" : ""}`} />
          ))}
        </div>
      </div>

      {/* Step 1: Mood */}
      {step === 1 && (
        <div className="wizard-step-card">
          <h2>How are you feeling today, {patientName}?</h2>
          <p className="wizard-subtitle">Tap the choice that best matches your mood right now.</p>
          <div className="choice-buttons-grid">
            <button
              type="button"
              className={`choice-card ${mood === "GOOD" ? "selected" : ""}`}
              onClick={() => { setMood("GOOD"); speakText("Feeling good and cheerful", voiceEnabled); }}
            >
              <span className="choice-emoji">😊</span>
              <span className="choice-label">Good & Cheerful</span>
            </button>
            <button
              type="button"
              className={`choice-card ${mood === "OKAY" ? "selected" : ""}`}
              onClick={() => { setMood("OKAY"); speakText("Feeling calm and okay", voiceEnabled); }}
            >
              <span className="choice-emoji">😐</span>
              <span className="choice-label">Calm / Okay</span>
            </button>
            <button
              type="button"
              className={`choice-card ${mood === "LOW" ? "selected" : ""}`}
              onClick={() => { setMood("LOW"); speakText("Feeling a little tired or low", voiceEnabled); }}
            >
              <span className="choice-emoji">😔</span>
              <span className="choice-label">Tired / A Bit Low</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Sleep */}
      {step === 2 && (
        <div className="wizard-step-card">
          <h2>How was your sleep last night?</h2>
          <p className="wizard-subtitle">Rest is important for your energy and peace.</p>
          <div className="choice-buttons-grid">
            <button
              type="button"
              className={`choice-card ${sleep === "GOOD" ? "selected" : ""}`}
              onClick={() => { setSleep("GOOD"); speakText("Slept well and soundly", voiceEnabled); }}
            >
              <span className="choice-emoji">😴</span>
              <span className="choice-label">Slept Very Well</span>
            </button>
            <button
              type="button"
              className={`choice-card ${sleep === "RESTLESS" ? "selected" : ""}`}
              onClick={() => { setSleep("RESTLESS"); speakText("Woke up a few times", voiceEnabled); }}
            >
              <span className="choice-emoji">🥱</span>
              <span className="choice-label">Restless Sleep</span>
            </button>
            <button
              type="button"
              className={`choice-card ${sleep === "POOR" ? "selected" : ""}`}
              onClick={() => { setSleep("POOR"); speakText("Did not sleep well", voiceEnabled); }}
            >
              <span className="choice-emoji">😫</span>
              <span className="choice-label">Poor Sleep</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Orientation */}
      {step === 3 && (
        <div className="wizard-step-card">
          <h2>What part of the day does it feel like?</h2>
          <p className="wizard-subtitle">Take a look outside the window.</p>
          <div className="choice-buttons-grid">
            <button
              type="button"
              className={`choice-card ${orientation === "Morning" ? "selected" : ""}`}
              onClick={() => { setOrientation("Morning"); speakText("Morning time", voiceEnabled); }}
            >
              <span className="choice-emoji">🌅</span>
              <span className="choice-label">Morning</span>
            </button>
            <button
              type="button"
              className={`choice-card ${orientation === "Afternoon" ? "selected" : ""}`}
              onClick={() => { setOrientation("Afternoon"); speakText("Afternoon time", voiceEnabled); }}
            >
              <span className="choice-emoji">☀️</span>
              <span className="choice-label">Afternoon</span>
            </button>
            <button
              type="button"
              className={`choice-card ${orientation === "Evening" ? "selected" : ""}`}
              onClick={() => { setOrientation("Evening"); speakText("Evening time", voiceEnabled); }}
            >
              <span className="choice-emoji">🌙</span>
              <span className="choice-label">Evening</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Help Request */}
      {step === 4 && (
        <div className="wizard-step-card">
          <h2>Would you like your caregiver to check in with you?</h2>
          <p className="wizard-subtitle">Asha is always happy to call or drop by.</p>
          <div className="choice-buttons-grid">
            <button
              type="button"
              className={`choice-card ${helpRequested ? "selected" : ""}`}
              onClick={() => { setHelpRequested(true); speakText("Yes, I would like a caregiver call", voiceEnabled); }}
            >
              <span className="choice-emoji">📞</span>
              <span className="choice-label">Yes, please call me</span>
            </button>
            <button
              type="button"
              className={`choice-card ${!helpRequested ? "selected" : ""}`}
              onClick={() => { setHelpRequested(false); speakText("No, I am doing fine right now", voiceEnabled); }}
            >
              <span className="choice-emoji">🌿</span>
              <span className="choice-label">No, doing fine today</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="wizard-footer-nav">
        {step > 1 ? (
          <button type="button" className="btn-wizard-back secondary" onClick={handleBack}>
            ← Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button type="button" className="btn-wizard-next primary" onClick={handleNext}>
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            className="btn-wizard-next btn-finish"
            disabled={busy}
            onClick={handleSubmit}
          >
            {busy ? "Saving Check-in…" : "✓ Complete Check-in"}
          </button>
        )}
      </div>
    </section>
  );
};
