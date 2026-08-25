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
