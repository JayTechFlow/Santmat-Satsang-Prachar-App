import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { ServiceResponse } from '../types';

/**
 * Admin dashboard stats via the `adminApi-getDashboardStats` callable.
 * The backend returns `{ status: "success", data: {} }` today; the response is
 * surfaced honestly so the admin module never fabricates metrics.
 */
export interface DashboardStatsPayload {
  status: string;
  data: Record<string, unknown>;
}

export class AdminService {
  async getDashboardStats(): Promise<ServiceResponse<DashboardStatsPayload>> {
    try {
      const getStatsFn = httpsCallable<Record<string, never>, DashboardStatsPayload>(
        functions,
        'adminApi-getDashboardStats'
      );
      const response = await getStatsFn({});
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Dashboard stats unavailable' };
    }
  }
}

export const adminService = new AdminService();
