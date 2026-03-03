// ── Domain enums ──────────────────────────────────────────────────────────────
export type Role = 'ELDER' | 'CHILD';
export type RelationshipStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';
export type VitalType =
  | 'BLOOD_SUGAR'
  | 'BLOOD_PRESSURE'
  | 'HEART_RATE'
  | 'OXYGEN_SATURATION'
  | 'TEMPERATURE';
export type AlertSeverity = 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

// ── Response DTOs (mirrors Java backend) ──────────────────────────────────────
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  expiresIn: number;
}

export interface RelationshipResponse {
  id: string;
  elder: UserResponse;
  child: UserResponse;
  status: RelationshipStatus;
  requestedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalRecordResponse {
  id: string;
  elderId: string;
  elderName: string;
  vitalType: VitalType;
  vitalTypeDisplayName: string;
  value: number;
  secondaryValue?: number;
  unit: string;
  notes?: string;
  recordedAt: string;
  isAbnormal: boolean;
  createdAt: string;
}

export interface MedicationResponse {
  id: string;
  elderId: string;
  elderName: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  reminderTime?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}

export interface LabReportResponse {
  id: string;
  elderId: string;
  elderName: string;
  testName: string;
  result: string;
  testDate: string;
  fileUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface HealthAlertResponse {
  id: string;
  elderId: string;
  elderName: string;
  vitalRecordId?: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  acknowledgedById?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ── Request DTOs ──────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
  pushToken?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  dateOfBirth?: string;
}

export interface RelationshipRequest {
  targetEmail: string;
}

export interface VitalRecordRequest {
  elderId: string;
  vitalType: VitalType;
  value: number;
  secondaryValue?: number;
  unit?: string;
  notes?: string;
  recordedAt?: string;
}

export interface MedicationRequest {
  elderId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  reminderTime?: string;
  isActive?: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface LabReportRequest {
  elderId: string;
  testName: string;
  result: string;
  testDate: string;
  fileUrl?: string;
  notes?: string;
}

// ── Paginated response wrapper ────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ── Navigation param lists ────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ElderTabParamList = {
  ElderHome: undefined;
  Vitals: undefined;
  Medications: undefined;
  Alerts: undefined;
  ElderProfile: undefined;
};

export type GuardianTabParamList = {
  GuardianHome: undefined;
  Elders: undefined;
  GuardianAlerts: undefined;
  GuardianProfile: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Relationships: undefined;
  RequestConnection: undefined;
  // Elder screens
  ElderTabs: undefined;
  AddVital: undefined;
  VitalHistory: { vitalType?: VitalType };
  AddMedication: { medication?: MedicationResponse };
  AddLabReport: undefined;
  // Guardian screens
  GuardianTabs: undefined;
  ElderDetail: { elderId: string; elderName: string };
  ElderVitalHistory: { elderId: string; elderName: string; vitalType?: VitalType };
};
