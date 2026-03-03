import apiClient from './client';
import { LabReportRequest, LabReportResponse, Page } from '../types';

/** POST /api/lab-reports — create a new lab report */
export const createLabReport = (
  data: LabReportRequest,
): Promise<LabReportResponse> =>
  apiClient
    .post<LabReportResponse>('/api/lab-reports', data)
    .then(r => r.data);

/** GET /api/lab-reports/elder/:elderId — paginated lab reports */
export const getLabReports = (
  elderId: string,
  page = 0,
  size = 20,
): Promise<Page<LabReportResponse>> =>
  apiClient
    .get<Page<LabReportResponse>>(`/api/lab-reports/elder/${elderId}`, {
      params: { page, size },
    })
    .then(r => r.data);

/** GET /api/lab-reports/elder/:elderId/search — search by test name */
export const searchLabReports = (
  elderId: string,
  testName: string,
  page = 0,
  size = 20,
): Promise<Page<LabReportResponse>> =>
  apiClient
    .get<Page<LabReportResponse>>(
      `/api/lab-reports/elder/${elderId}/search`,
      { params: { testName, page, size } },
    )
    .then(r => r.data);

/** GET /api/lab-reports/:id */
export const getLabReportById = (
  id: string,
): Promise<LabReportResponse> =>
  apiClient.get<LabReportResponse>(`/api/lab-reports/${id}`).then(r => r.data);

/** DELETE /api/lab-reports/:id */
export const deleteLabReport = (id: string): Promise<void> =>
  apiClient.delete(`/api/lab-reports/${id}`);
