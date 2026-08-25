import React, { useState } from "react";
import type { CompanionResponse } from "@dementia/contracts";
import { api } from "../api";
import { speakText } from "../utils/speech";

interface CompanionViewProps {
  patientId: string;
  patientName: string;
  emergencyContact: string;
  token: string;
  voiceEnabled: boolean;
  onOpenEmergency: () => void;
}

export const CompanionView: React.FC<CompanionViewProps> = ({
  patientId,
  patientName,
  emergencyContact,
  token,
  voiceEnabled,
  onOpenEmergency
}) => {
  const [messages, setMessages] = useState<{ sender: "user" | "companion"; text: string; cue?: string; escalation?: boolean }[]>([
    {
      sender: "companion",
      text: `Hello ${patientName}! I am your daily digital companion. I am always right here to remind you, reassure you, and keep you company.`,
      cue: "You are at home and safe."
    }
  ]);
  const [customInput, setCustomInput] = useState("");
  const [busy, setBusy] = useState(false);

  const quickPrompts = [
    "Where am I right now?",
    "Tell me about my daughter Asha",
    "What medicine should I take today?",
    "Tell me about my flower garden",
    "I feel a little confused / need help"
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);

    // Add user message
    const userEntry = { sender: "user" as const, text };
    setMessages((prev) => [...prev, userEntry]);
    setCustomInput("");

    try {
      const response: CompanionResponse = await api.sendCompanionMessage({ patientId, message: text }, token);
      const companionEntry = {
        sender: "companion" as const,
        text: response.reply,
        cue: response.reassuringCue,
        escalation: response.escalationSuggested
      };
      setMessages((prev) => [...prev, companionEntry]);
      speakText(response.reply, voiceEnabled);
    } catch (e) {
      const fallbackEntry = {
        sender: "companion" as const,
        text: `You are safe at home, ${patientName}. Everything is taken care of. Take a deep breath and relax.`,
        cue: "You are in a safe place."
      };
      setMessages((prev) => [...prev, fallbackEntry]);
      speakText(fallbackEntry.text, voiceEnabled);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="companion-view-section">
      <div className="section-header">
        <h1>Your Daily Companion</h1>
        <p>A gentle companion to answer questions and keep you calm.</p>
      </div>

      {/* Suggested Quick Questions */}
      <div className="quick-prompts-container">
        <p className="eyebrow-patient">Tap a question to ask:</p>
        <div className="prompts-grid">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              disabled={busy}
              onClick={() => sendMessage(prompt)}
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="conversation-thread" aria-live="polite">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble ${m.sender === "user" ? "user-bubble" : "companion-bubble"}`}>
            <div className="bubble-header">
              <span className="bubble-sender">{m.sender === "user" ? "You" : "Companion 🤖"}</span>
              {m.sender === "companion" && (
                <button
                  type="button"
                  className="btn-bubble-speak"
                  onClick={() => speakText(m.text, true)}
                  aria-label="Read message aloud"
                >
                  🔊 Listen
                </button>
              )}
            </div>
            <p className="bubble-body">{m.text}</p>
            {m.cue && <div className="bubble-cue">🌿 <em>{m.cue}</em></div>}

            {m.escalation && (
              <div className="bubble-escalation-card">
                <p><strong>Would you like to connect with your caregiver?</strong></p>
                <button
                  type="button"
                  className="btn-primary-large btn-caregiver"
                  onClick={onOpenEmergency}
                >
                  📞 Call {emergencyContact}
                </button>
              </div>
            )}
          </div>
        ))}
        {busy && <div className="chat-bubble companion-bubble"><p className="bubble-body">Thinking calmly…</p></div>}
      </div>

      {/* Optional Freeform Input */}
      <form
        className="companion-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(customInput);
        }}
      >
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ask or say anything here…"
          aria-label="Ask companion a question"
        />
        <button type="submit" className="btn-send" disabled={busy || !customInput.trim()}>
          Ask
        </button>
      </form>
    </section>
  );
};
