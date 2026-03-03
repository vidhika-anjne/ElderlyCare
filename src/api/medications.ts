import apiClient from './client';
import { MedicationRequest, MedicationResponse, Page } from '../types';

/** POST /api/medications — create new medication */
export const createMedication = (
  data: MedicationRequest,
): Promise<MedicationResponse> =>
  apiClient
    .post<MedicationResponse>('/api/medications', data)
    .then(r => r.data);

/** PUT /api/medications/:id — update medication */
export const updateMedication = (
  id: string,
  data: MedicationRequest,
): Promise<MedicationResponse> =>
  apiClient
    .put<MedicationResponse>(`/api/medications/${id}`, data)
    .then(r => r.data);

/** PATCH /api/medications/:id/toggle — toggle active flag */
export const toggleMedication = (
  id: string,
): Promise<MedicationResponse> =>
  apiClient
    .patch<MedicationResponse>(`/api/medications/${id}/toggle`)
    .then(r => r.data);

/** GET /api/medications/elder/:elderId — paginated medications */
export const getMedications = (
  elderId: string,
  page = 0,
  size = 20,
): Promise<Page<MedicationResponse>> =>
  apiClient
    .get<Page<MedicationResponse>>(`/api/medications/elder/${elderId}`, {
      params: { page, size },
    })
    .then(r => r.data);

/** GET /api/medications/elder/:elderId/active — active medications only */
export const getActiveMedications = (
  elderId: string,
): Promise<MedicationResponse[]> =>
  apiClient
    .get<MedicationResponse[]>(`/api/medications/elder/${elderId}/active`)
    .then(r => r.data);

/** DELETE /api/medications/:id */
export const deleteMedication = (id: string): Promise<void> =>
  apiClient.delete(`/api/medications/${id}`);
