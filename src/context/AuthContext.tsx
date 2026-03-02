import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthAPI from '../api/auth';
import * as UsersAPI from '../api/users';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isLoading: boolean;          // true while rehydrating from storage on app start
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from AsyncStorage on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_token');
        if (stored) {
          setToken(stored);
          const me = await UsersAPI.getMe();
          setUser(me);
        }
      } catch {
        // Token expired or invalid — clear it so user goes to Login
        await AsyncStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const applyAuth = useCallback(async (res: AuthResponse) => {
    await AsyncStorage.setItem('auth_token', res.token);
    setToken(res.token);
    // Fetch full profile (AuthResponse doesn't include phone / dateOfBirth)
    const me = await UsersAPI.getMe();
    setUser(me);
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────────
  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await AuthAPI.login(data);
      await applyAuth(res);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await AuthAPI.register(data);
      await applyAuth(res);
    },
    [applyAuth],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await UsersAPI.getMe();
    setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, isLoading, login, register, logout, refreshUser }),
    [token, user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
