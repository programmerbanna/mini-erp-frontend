import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { DashboardStats } from './types';

async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiSuccessResponse<DashboardStats>>('/dashboard/stats');
  return data.data;
}

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
}
