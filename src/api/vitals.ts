import apiClient from './client';
import {
  VitalRecordRequest,
  VitalRecordResponse,
  VitalType,
  Page,
} from '../types';

/** POST /api/vitals — record a new vital reading */
export const recordVital = (data: VitalRecordRequest): Promise<VitalRecordResponse> =>
  apiClient.post<VitalRecordResponse>('/api/vitals', data).then(r => r.data);

/** GET /api/vitals/elder/:id — paginated history for an elder */
export const getVitalsByElder = (
  elderId: string,
  page = 0,
  size = 20,
): Promise<Page<VitalRecordResponse>> =>
  apiClient
    .get<Page<VitalRecordResponse>>(`/api/vitals/elder/${elderId}`, {
      params: { page, size },
    })
    .then(r => r.data);

/** GET /api/vitals/elder/:id/type/:type — filtered by vital type */
export const getVitalsByType = (
  elderId: string,
  vitalType: VitalType,
  page = 0,
  size = 20,
): Promise<Page<VitalRecordResponse>> =>
  apiClient
    .get<Page<VitalRecordResponse>>(
      `/api/vitals/elder/${elderId}/type/${vitalType}`,
      { params: { page, size } },
    )
    .then(r => r.data);

/** GET /api/vitals/elder/:id/latest — latest reading per vital type */
export const getLatestVitals = (
  elderId: string,
): Promise<VitalRecordResponse[]> =>
  apiClient
    .get<VitalRecordResponse[]>(`/api/vitals/elder/${elderId}/latest`)
    .then(r => r.data);

/** GET /api/vitals/elder/:id/trend — date-range trend */
export const getVitalTrend = (
  elderId: string,
  vitalType: VitalType,
  from: string,
  to: string,
): Promise<VitalRecordResponse[]> =>
  apiClient
    .get<VitalRecordResponse[]>(`/api/vitals/elder/${elderId}/trend`, {
      params: { vitalType, from, to },
    })
    .then(r => r.data);
