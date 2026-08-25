CREATE TABLE routine_tasks (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    title VARCHAR(160) NOT NULL,
    cue VARCHAR(255),
    scheduled_time VARCHAR(16) NOT NULL,
    recurrence VARCHAR(32) NOT NULL DEFAULT 'DAILY',
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','SKIPPED')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    medication_label VARCHAR(160) NOT NULL,
    dosage_text VARCHAR(120) NOT NULL,
    scheduled_time VARCHAR(16) NOT NULL,
    instructions VARCHAR(255),
    missed_threshold INTEGER NOT NULL DEFAULT 2,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','TAKEN','LATER','HELP')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medication_events (
    id UUID PRIMARY KEY,
    schedule_id UUID REFERENCES medication_schedules(id),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    action VARCHAR(32) NOT NULL CHECK (action IN ('TAKEN','LATER','HELP','MISSED')),
    note VARCHAR(255),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE check_ins (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    mood VARCHAR(32) NOT NULL CHECK (mood IN ('GOOD','OKAY','LOW')),
    sleep_quality VARCHAR(32) NOT NULL CHECK (sleep_quality IN ('GOOD','RESTLESS','POOR')),
    orientation_response VARCHAR(120),
    help_requested BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE memory_items (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    title VARCHAR(120) NOT NULL,
    cue VARCHAR(255) NOT NULL,
    image_emoji VARCHAR(32) NOT NULL DEFAULT '📸',
    relationship_tag VARCHAR(80),
    media_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companion_messages (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id),
    user_message TEXT NOT NULL,
    response_text TEXT NOT NULL,
    escalation_suggested BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routine_patient ON routine_tasks(patient_id, status);
CREATE INDEX idx_medication_patient ON medication_schedules(patient_id);
CREATE INDEX idx_check_ins_patient ON check_ins(patient_id, submitted_at DESC);
CREATE INDEX idx_memory_patient ON memory_items(patient_id);

-- Seed Patient B (Meera: 10000000-0000-0000-0000-000000000002) Routine Tasks
INSERT INTO routine_tasks(id, patient_id, title, cue, scheduled_time, recurrence, status) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Morning Gentle Stretch & Water', 'Drink one glass of fresh water and stretch arms', '08:30 AM', 'DAILY', 'PENDING'),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Morning Tea on Balcony', 'Enjoy a warm cup of herbal tea in the fresh air', '09:00 AM', 'DAILY', 'PENDING'),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Afternoon Garden Walk', 'Take a calm 10-minute walk near the flowers', '04:30 PM', 'DAILY', 'PENDING');

-- Seed Patient B Medication Schedules
INSERT INTO medication_schedules(id, patient_id, medication_label, dosage_text, scheduled_time, instructions, status) VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Donepezil 5mg', '1 tablet with morning meal', '09:30 AM', 'Take with food and water', 'PENDING'),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Multivitamin & Calcium', '1 capsule after lunch', '01:30 PM', 'Take with full glass of water', 'PENDING');

-- Seed Patient B Memory Cards
INSERT INTO memory_items(id, patient_id, title, cue, image_emoji, relationship_tag) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Daughter Asha', 'Your daughter Asha calls every evening and visits on Sundays.', '👩', 'Family'),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Grandson Aarav', 'Aarav is 8 years old and loves drawing pictures for you.', '👦', 'Grandchild'),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Home Garden & Marigolds', 'You planted the yellow marigolds in the garden in autumn.', '🌼', 'Home & Joy');
