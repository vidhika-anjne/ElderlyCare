import apiClient from './client';
import { HealthAlertResponse, Page } from '../types';

/** GET /api/health-alerts/elder/:id — paginated alerts for an elder */
export const getAlertsByElder = (
  elderId: string,
  page = 0,
  size = 20,
): Promise<Page<HealthAlertResponse>> =>
  apiClient
    .get<Page<HealthAlertResponse>>(`/api/health-alerts/elder/${elderId}`, {
      params: { page, size },
    })
    .then(r => r.data);

/** GET /api/health-alerts/elder/:id/active — only active alerts */
export const getActiveAlerts = (
  elderId: string,
): Promise<HealthAlertResponse[]> =>
  apiClient
    .get<HealthAlertResponse[]>(`/api/health-alerts/elder/${elderId}/active`)
    .then(r => r.data);

/** GET /api/health-alerts/elder/:id/count — count active alerts */
export const getActiveAlertCount = (
  elderId: string,
): Promise<number> =>
  apiClient
    .get<number>(`/api/health-alerts/elder/${elderId}/count`)
    .then(r => r.data);

/** PATCH /api/health-alerts/:id/acknowledge */
export const acknowledgeAlert = (
  id: string,
): Promise<HealthAlertResponse> =>
  apiClient
    .patch<HealthAlertResponse>(`/api/health-alerts/${id}/acknowledge`)
    .then(r => r.data);

/** PATCH /api/health-alerts/:id/resolve */
export const resolveAlert = (
  id: string,
): Promise<HealthAlertResponse> =>
  apiClient
    .patch<HealthAlertResponse>(`/api/health-alerts/${id}/resolve`)
    .then(r => r.data);
