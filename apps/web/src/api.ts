import type {
  ApiResponse,
  CheckIn,
  CompanionRequest,
  CompanionResponse,
  LoginRequest,
  LoginResponse,
  MedicationSchedule,
  MemoryItem,
  PatientSettings,
  PatientTodaySummary,
  RoutineTask
} from "@dementia/contracts";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

function authHeader(token?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const payload: ApiResponse<LoginResponse> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Sign in failed.");
    }
    return payload.data;
  },

  async getTodaySummary(patientId: string, token: string): Promise<PatientTodaySummary> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/today`, {
      headers: authHeader(token)
    });
    const payload: ApiResponse<PatientTodaySummary> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not load today's summary.");
    }
    return payload.data;
  },

  async updateRoutineStatus(patientId: string, taskId: string, status: string, token: string): Promise<RoutineTask> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/routine/${taskId}/status`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ status })
    });
    const payload: ApiResponse<RoutineTask> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not update routine.");
    }
    return payload.data;
  },

  async recordMedicationAction(patientId: string, scheduleId: string, action: string, note: string | undefined, token: string): Promise<MedicationSchedule> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/medications/${scheduleId}/action`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ action, note: note || "" })
    });
    const payload: ApiResponse<MedicationSchedule> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not record medication.");
    }
    return payload.data;
  },

  async submitCheckIn(checkIn: CheckIn, token: string): Promise<CheckIn> {
    const res = await fetch(`${API_BASE}/patients/check-ins`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(checkIn)
    });
    const payload: ApiResponse<CheckIn> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not submit check-in.");
    }
    return payload.data;
  },

  async getMemories(patientId: string, token: string): Promise<MemoryItem[]> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/memories`, {
      headers: authHeader(token)
    });
    const payload: ApiResponse<MemoryItem[]> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not load memories.");
    }
    return payload.data;
  },

  async sendCompanionMessage(req: CompanionRequest, token: string): Promise<CompanionResponse> {
    const res = await fetch(`${API_BASE}/companion/messages`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(req)
    });
    const payload: ApiResponse<CompanionResponse> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Companion is temporarily resting.");
    }
    return payload.data;
  },

  async getSettings(patientId: string, token: string): Promise<PatientSettings> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/settings`, {
      headers: authHeader(token)
    });
    const payload: ApiResponse<PatientSettings> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not load settings.");
    }
    return payload.data;
  },

  async updateSettings(patientId: string, settings: Partial<PatientSettings>, token: string): Promise<PatientSettings> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/settings`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(settings)
    });
    const payload: ApiResponse<PatientSettings> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not update settings.");
    }
    return payload.data;
  },

  async triggerEmergencyAction(patientId: string, actionType: "CALL_CAREGIVER" | "EMERGENCY_HELP", token: string): Promise<{ message: string; contactTarget: string }> {
    const res = await fetch(`${API_BASE}/emergency/action`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ patientId, actionType, details: "Patient triggered from UI" })
    });
    const payload: ApiResponse<{ message: string; contactTarget: string }> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "Could not contact support.");
    }
    return payload.data;
  }
};
