import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import { getLatestVitals } from '../api/vitals';
import { getActiveAlerts } from '../api/alerts';
import { getActiveMedications } from '../api/medications';
import {
  VitalRecordResponse,
  HealthAlertResponse,
  MedicationResponse,
} from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MedicalState {
  latestVitals: VitalRecordResponse[];
  activeAlerts: HealthAlertResponse[];
  activeMedications: MedicationResponse[];
  isRefreshing: boolean;
}

interface MedicalContextValue extends MedicalState {
  refreshAll: () => Promise<void>;
  refreshForElder: (elderId: string) => Promise<{
    vitals: VitalRecordResponse[];
    alerts: HealthAlertResponse[];
    medications: MedicationResponse[];
  }>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const MedicalContext = createContext<MedicalContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function MedicalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [latestVitals, setLatestVitals] = useState<VitalRecordResponse[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<HealthAlertResponse[]>([]);
  const [activeMedications, setActiveMedications] = useState<MedicationResponse[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Refresh the logged-in elder's own medical data.
   * (For guardians, use refreshForElder with a specific elderId.)
   */
  const refreshAll = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const [v, a, m] = await Promise.all([
        getLatestVitals(user.id),
        getActiveAlerts(user.id),
        getActiveMedications(user.id),
      ]);
      setLatestVitals(v);
      setActiveAlerts(a);
      setActiveMedications(m);
    } catch {
      // Silently fail — individual screens handle their own errors
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  /**
   * Fetch medical data for a specific elder (used by guardians).
   * Returns the data directly without storing in context state.
   */
  const refreshForElder = useCallback(
    async (elderId: string) => {
      const [vitals, alerts, medications] = await Promise.all([
        getLatestVitals(elderId),
        getActiveAlerts(elderId),
        getActiveMedications(elderId),
      ]);
      return { vitals, alerts, medications };
    },
    [],
  );

  const value = useMemo<MedicalContextValue>(
    () => ({
      latestVitals,
      activeAlerts,
      activeMedications,
      isRefreshing,
      refreshAll,
      refreshForElder,
    }),
    [latestVitals, activeAlerts, activeMedications, isRefreshing, refreshAll, refreshForElder],
  );

  return (
    <MedicalContext.Provider value={value}>{children}</MedicalContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMedical(): MedicalContextValue {
  const ctx = useContext(MedicalContext);
  if (!ctx) {
    throw new Error('useMedical must be used inside <MedicalProvider>');
  }
  return ctx;
}
