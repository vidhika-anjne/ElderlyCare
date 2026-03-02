// ── Domain enums ──────────────────────────────────────────────────────────────
export type Role = 'ELDER' | 'CHILD';
export type RelationshipStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

// ── Response DTOs (mirrors Java backend) ──────────────────────────────────────
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  dateOfBirth?: string;        // ISO date string: YYYY-MM-DD
  profilePictureUrl?: string;
  active: boolean;
  createdAt: string;           // ISO offset-date-time
}

export interface AuthResponse {
  token: string;
  tokenType: string;           // always "Bearer"
  userId: string;
  name: string;
  email: string;
  role: Role;
  expiresIn: number;           // ms — 86_400_000 = 24 h
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
  dateOfBirth?: string;        // YYYY-MM-DD
}

export interface RelationshipRequest {
  targetEmail: string;
}

// ── Navigation param lists ────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Relationships: undefined;
  RequestConnection: undefined;
};
