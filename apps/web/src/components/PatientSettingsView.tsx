import React, { useEffect, useState } from "react";
import type { PatientSettings } from "@dementia/contracts";
import { api } from "../api";
import { speakText } from "../utils/speech";

interface PatientSettingsViewProps {
  patientId: string;
  token: string;
  onSettingsSaved: (settings: PatientSettings) => void;
  onSignOut: () => void;
}

export const PatientSettingsView: React.FC<PatientSettingsViewProps> = ({
  patientId,
  token,
  onSettingsSaved,
  onSignOut
}) => {
  const [settings, setSettings] = useState<PatientSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.getSettings(patientId, token)
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [patientId, token]);

  const handleToggle = (key: keyof PatientSettings) => {
    if (!settings) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
  };

  const handleLanguageChange = (lang: string) => {
    if (!settings) return;
    setSettings({ ...settings, preferredLanguage: lang });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await api.updateSettings(patientId, settings, token);
      onSettingsSaved(result);
      setFeedback("Preferences saved successfully!");
      speakText("Your preferences have been saved.", settings.voicePrompts);
    } catch (e) {
      setFeedback("Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <p className="loading-state">Loading your preferences…</p>;
  }

  return (
    <section className="settings-view-section">
      <div className="section-header">
        <h1>Comfort & Accessibility Settings</h1>
        <p>Adjust text size, contrast, voice, and language for your comfort.</p>
      </div>

      {feedback && (
        <div className="alert-banner-success" role="status">
          <p>{feedback}</p>
        </div>
      )}

      {/* Accessibility Toggles */}
      <div className="settings-card">
        <h2>Visual & Voice Comfort</h2>

        <div className="toggle-row">
          <div>
            <span className="toggle-title">🔤 Extra Large Text</span>
            <p className="toggle-description">Makes all text larger and easier to read.</p>
          </div>
          <button
            type="button"
            className={`switch-btn ${settings.largeText ? "switch-on" : ""}`}
            onClick={() => handleToggle("largeText")}
            aria-pressed={settings.largeText}
          >
            {settings.largeText ? "ON ✓" : "OFF"}
          </button>
        </div>

        <div className="toggle-row">
          <div>
            <span className="toggle-title">🌗 High Contrast Colors</span>
            <p className="toggle-description">Enhances contrast between background and buttons.</p>
          </div>
          <button
            type="button"
            className={`switch-btn ${settings.highContrast ? "switch-on" : ""}`}
            onClick={() => handleToggle("highContrast")}
            aria-pressed={settings.highContrast}
          >
            {settings.highContrast ? "ON ✓" : "OFF"}
          </button>
        </div>

        <div className="toggle-row">
          <div>
            <span className="toggle-title">🔊 Spoken Voice Guidance</span>
            <p className="toggle-description">Automatically reads reminders and activity steps.</p>
          </div>
          <button
            type="button"
            className={`switch-btn ${settings.voicePrompts ? "switch-on" : ""}`}
            onClick={() => handleToggle("voicePrompts")}
            aria-pressed={settings.voicePrompts}
          >
            {settings.voicePrompts ? "ON ✓" : "OFF"}
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="settings-card">
        <h2>Preferred Language</h2>
        <p className="toggle-description">Choose the language you feel most comfortable using.</p>
        <div className="language-grid">
          {[
            { code: "en", label: "English" },
            { code: "hi", label: "हिन्दी (Hindi)" },
            { code: "as", label: "অসমীয়া (Assamese)" },
            { code: "bn", label: "বাংলা (Bengali)" }
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`lang-card ${settings.preferredLanguage === lang.code ? "selected" : ""}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="settings-card">
        <h2>Emergency Caregiver</h2>
        <p className="toggle-description">Connected contact for alerts and check-in calls:</p>
        <div className="contact-display-badge">
          📞 {settings.emergencyContact || "Asha Sharma (Daughter)"}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="settings-action-row">
        <button
          type="button"
          className="btn-primary-large"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving Preferences…" : "Save Preferences"}
        </button>
        <button
          type="button"
          className="btn-secondary-large btn-signout"
          onClick={onSignOut}
        >
          Sign Out of Demo
        </button>
      </div>
    </section>
  );
};
