CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    severity VARCHAR(24) NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH')),
    type VARCHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ACKNOWLEDGED','RESOLVED')),
    rationale TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    note TEXT
);

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    summary TEXT NOT NULL,
    risk_level VARCHAR(24) NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH')),
    contributing_signals TEXT NOT NULL DEFAULT '[]',
    recommended_action TEXT NOT NULL,
    provider VARCHAR(64) NOT NULL DEFAULT 'deterministic-rules',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE caregiver_notes (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    caregiver_id UUID NOT NULL REFERENCES users(id),
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_patient ON alerts(patient_id, status);
CREATE INDEX idx_insights_patient ON ai_insights(patient_id, created_at DESC);
CREATE INDEX idx_notes_patient ON caregiver_notes(patient_id, created_at DESC);

-- Seed Alerts
INSERT INTO alerts (id, patient_id, severity, type, status, rationale, created_at) VALUES
('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'MEDIUM', 'MISSED_MEDICATION', 'ACTIVE', 'Two evening medication reminders were marked later/missed in the past 48 hours.', CURRENT_TIMESTAMP);

-- Seed AI Insights
INSERT INTO ai_insights (id, patient_id, summary, risk_level, contributing_signals, recommended_action, provider, created_at) VALUES
('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Recent routine completion is stable, but evening medication was delayed and a mild low-mood check-in was reported.', 'MEDIUM', '["2 evening medication reminders delayed", "Check-in indicated feeling a bit tired", "Morning gentle stretch completed on schedule"]', 'Consider calling Meera after lunch to gently remind her about the afternoon Multivitamin and check her hydration.', 'deterministic-rules', CURRENT_TIMESTAMP);

-- Seed Caregiver Note
INSERT INTO caregiver_notes (id, patient_id, caregiver_id, note_text, created_at) VALUES
('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Spoke to mother yesterday morning; she was cheerful and enjoying the marigolds in the garden.', CURRENT_TIMESTAMP);
