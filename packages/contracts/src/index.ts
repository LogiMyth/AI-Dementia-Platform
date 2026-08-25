export const roles = ["PATIENT", "CAREGIVER", "CLINICIAN_REVIEWER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export interface SessionUser {
  id: string;
  displayName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SessionUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface RoutineTask {
  id: string;
  patientId: string;
  title: string;
  cue?: string;
  scheduledTime: string;
  recurrence: string;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  completedAt?: string;
}

export interface MedicationSchedule {
  id: string;
  patientId: string;
  medicationLabel: string;
  dosageText: string;
  scheduledTime: string;
  instructions?: string;
  status: "PENDING" | "TAKEN" | "LATER" | "HELP";
}

export interface CheckIn {
  id?: string;
  patientId: string;
  mood: "GOOD" | "OKAY" | "LOW";
  sleepQuality: "GOOD" | "RESTLESS" | "POOR";
  orientationResponse?: string;
  helpRequested: boolean;
  submittedAt?: string;
}

export interface MemoryItem {
  id: string;
  patientId: string;
  title: string;
  cue: string;
  imageEmoji?: string;
  relationshipTag?: string;
  mediaUrl?: string;
}

export interface CompanionMessage {
  id?: string;
  patientId: string;
  userMessage: string;
  responseText: string;
  escalationSuggested: boolean;
  createdAt?: string;
}

export interface CompanionRequest {
  patientId: string;
  message: string;
}

export interface CompanionResponse {
  reply: string;
  reassuringCue?: string;
  escalationSuggested: boolean;
}

export interface PatientTodaySummary {
  patientId: string;
  preferredName: string;
  emergencyContact: string;
  preferredLanguage: string;
  routineTasks: RoutineTask[];
  medications: MedicationSchedule[];
  latestCheckIn?: CheckIn;
  nextAction: string;
  completedCount: number;
  totalCount: number;
}

export interface PatientSettings {
  patientId: string;
  preferredName: string;
  preferredLanguage: string;
  largeText: boolean;
  highContrast: boolean;
  voicePrompts: boolean;
  emergencyContact: string;
}

/* --- P2 Caregiver Core Contracts --- */

export interface CaregiverPatientSummary {
  patientId: string;
  userId: string;
  preferredName: string;
  relationship: string;
  preferredLanguage: string;
  emergencyContact: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  activeAlertsCount: number;
  adherencePercentage: number;
  completedTasksToday: number;
  totalTasksToday: number;
  latestMood?: string;
  latestSleep?: string;
  lastActive: string;
}

export interface Alert {
  id: string;
  patientId: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  type: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  rationale: string;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  note?: string;
}

export interface AIInsight {
  id: string;
  patientId: string;
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  contributingSignals: string[];
  recommendedAction: string;
  provider: string;
  createdAt: string;
}

export interface CaregiverNote {
  id: string;
  patientId: string;
  caregiverId: string;
  noteText: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  type: "MEDICATION" | "ROUTINE" | "CHECKIN" | "ALERT" | "NOTE";
  title: string;
  description: string;
  timestamp: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "INFO";
}

export interface CreateRoutineRequest {
  title: string;
  cue?: string;
  scheduledTime: string;
  recurrence?: string;
}

export interface CreateMedicationRequest {
  medicationLabel: string;
  dosageText: string;
  scheduledTime: string;
  instructions?: string;
  missedThreshold?: number;
}

export interface AcknowledgeAlertRequest {
  status: "ACKNOWLEDGED" | "RESOLVED";
  note?: string;
}

export interface CreateNoteRequest {
  noteText: string;
}
