INSERT INTO users(id,email,password_hash,display_name,role,status) VALUES
('00000000-0000-0000-0000-000000000001','caregiver.asha@example.test','$2b$10$u8GcYMYVPxS1C7gQ3qNmM.icqYOzGQuMOgrEsi46NcM2Gh0ZQzQEO','Asha Sharma','CAREGIVER','ACTIVE'),
('00000000-0000-0000-0000-000000000002','patient.b@example.test','$2b$10$u8GcYMYVPxS1C7gQ3qNmM.icqYOzGQuMOgrEsi46NcM2Gh0ZQzQEO','Meera','PATIENT','ACTIVE'),
('00000000-0000-0000-0000-000000000003','reviewer.isha@example.test','$2b$10$u8GcYMYVPxS1C7gQ3qNmM.icqYOzGQuMOgrEsi46NcM2Gh0ZQzQEO','Dr Isha Rao','CLINICIAN_REVIEWER','ACTIVE'),
('00000000-0000-0000-0000-000000000004','admin@example.test','$2b$10$u8GcYMYVPxS1C7gQ3qNmM.icqYOzGQuMOgrEsi46NcM2Gh0ZQzQEO','Demo Administrator','ADMIN','ACTIVE');
INSERT INTO patient_profiles(id,user_id,preferred_name,preferred_language,emergency_contact,consent_status) VALUES ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Meera','en','Asha Sharma · Demo contact','GRANTED');
INSERT INTO caregiver_patient_links(id,caregiver_id,patient_id,relationship_label,permissions,active) VALUES ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Daughter','{"view":true,"manageReminders":true}',TRUE);
INSERT INTO consent_records(id,patient_id,purpose,status,granted_at,recorded_by) VALUES ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','SIH fictional demo','GRANTED',CURRENT_TIMESTAMP,'00000000-0000-0000-0000-000000000004');
