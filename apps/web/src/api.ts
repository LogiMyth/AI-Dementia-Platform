import type {
  AcknowledgeAlertRequest,
  AIInsight,
  Alert,
  ApiResponse,
  CaregiverNote,
  CaregiverPatientSummary,
  CheckIn,
  CompanionRequest,
  CompanionResponse,
  CreateMedicationRequest,
  CreateNoteRequest,
  CreateRoutineRequest,
  LoginRequest,
  LoginResponse,
  MedicationSchedule,
  MemoryItem,
  PatientSettings,
  PatientTodaySummary,
  RoutineTask,
  TimelineEvent
} from "@dementia/contracts";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

function authHeader(token?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const payload: ApiResponse<T> = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(payload.message || `Request failed: ${res.status}`);
  }
  return payload.data;
}

export const api = {
  /* ── Auth ── */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    return handleResponse<LoginResponse>(res);
  },

  /* ── Patient (P1) ── */
  async getTodaySummary(patientId: string, token: string): Promise<PatientTodaySummary> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/today`, { headers: authHeader(token) });
    return handleResponse<PatientTodaySummary>(res);
  },

  async updateRoutineStatus(patientId: string, taskId: string, status: string, token: string): Promise<RoutineTask> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/routine/${taskId}/status`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ status })
    });
    return handleResponse<RoutineTask>(res);
  },

  async recordMedicationAction(patientId: string, scheduleId: string, action: string, note: string | undefined, token: string): Promise<MedicationSchedule> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/medications/${scheduleId}/action`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ action, note: note || "" })
    });
    return handleResponse<MedicationSchedule>(res);
  },

  async submitCheckIn(checkIn: CheckIn, token: string): Promise<CheckIn> {
    const res = await fetch(`${API_BASE}/patients/check-ins`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(checkIn)
    });
    return handleResponse<CheckIn>(res);
  },

  async getMemories(patientId: string, token: string): Promise<MemoryItem[]> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/memories`, { headers: authHeader(token) });
    return handleResponse<MemoryItem[]>(res);
  },

  async sendCompanionMessage(req: CompanionRequest, token: string): Promise<CompanionResponse> {
    const res = await fetch(`${API_BASE}/companion/messages`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(req)
    });
    return handleResponse<CompanionResponse>(res);
  },

  async getSettings(patientId: string, token: string): Promise<PatientSettings> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/settings`, { headers: authHeader(token) });
    return handleResponse<PatientSettings>(res);
  },

  async updateSettings(patientId: string, settings: Partial<PatientSettings>, token: string): Promise<PatientSettings> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/settings`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(settings)
    });
    return handleResponse<PatientSettings>(res);
  },

  async triggerEmergencyAction(patientId: string, actionType: "CALL_CAREGIVER" | "EMERGENCY_HELP", token: string): Promise<{ message: string; contactTarget: string }> {
    const res = await fetch(`${API_BASE}/emergency/action`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ patientId, actionType, details: "Patient triggered from UI" })
    });
    return handleResponse<{ message: string; contactTarget: string }>(res);
  },

  /* ── Caregiver (P2) ── */
  async getCaregiverDashboard(token: string): Promise<CaregiverPatientSummary[]> {
    const res = await fetch(`${API_BASE}/caregiver/dashboard`, { headers: authHeader(token) });
    return handleResponse<CaregiverPatientSummary[]>(res);
  },

  async getPatientSummary(patientId: string, token: string): Promise<CaregiverPatientSummary> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/summary`, { headers: authHeader(token) });
    return handleResponse<CaregiverPatientSummary>(res);
  },

  async getCaregiverRoutines(patientId: string, token: string): Promise<RoutineTask[]> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/routines`, { headers: authHeader(token) });
    return handleResponse<RoutineTask[]>(res);
  },

  async addRoutine(patientId: string, req: CreateRoutineRequest, token: string): Promise<RoutineTask> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/routines`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(req)
    });
    return handleResponse<RoutineTask>(res);
  },

  async getCaregiverMedications(patientId: string, token: string): Promise<MedicationSchedule[]> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/medications`, { headers: authHeader(token) });
    return handleResponse<MedicationSchedule[]>(res);
  },

  async addMedication(patientId: string, req: CreateMedicationRequest, token: string): Promise<MedicationSchedule> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/medications`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(req)
    });
    return handleResponse<MedicationSchedule>(res);
  },

  async getTimeline(patientId: string, token: string): Promise<TimelineEvent[]> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/timeline`, { headers: authHeader(token) });
    return handleResponse<TimelineEvent[]>(res);
  },

  async getAlerts(patientId: string, token: string): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/alerts`, { headers: authHeader(token) });
    return handleResponse<Alert[]>(res);
  },

  async acknowledgeAlert(alertId: string, req: AcknowledgeAlertRequest, token: string): Promise<Alert> {
    const res = await fetch(`${API_BASE}/caregiver/alerts/${alertId}/acknowledge`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(req)
    });
    return handleResponse<Alert>(res);
  },

  async getInsights(patientId: string, token: string): Promise<AIInsight[]> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/insights`, { headers: authHeader(token) });
    return handleResponse<AIInsight[]>(res);
  },

  async getCaregiverNotes(patientId: string, token: string): Promise<CaregiverNote[]> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/notes`, { headers: authHeader(token) });
    return handleResponse<CaregiverNote[]>(res);
  },

  async addNote(patientId: string, req: CreateNoteRequest, token: string): Promise<CaregiverNote> {
    const res = await fetch(`${API_BASE}/caregiver/patients/${patientId}/notes`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(req)
    });
    return handleResponse<CaregiverNote>(res);
  }
};
