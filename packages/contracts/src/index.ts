export const roles = ["PATIENT", "CAREGIVER", "CLINICIAN_REVIEWER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export interface SessionUser { id: string; displayName: string; role: Role; }
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { accessToken: string; user: SessionUser; }
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
