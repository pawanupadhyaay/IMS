import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../services/dashboardService'

export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
}

// Hook to fetch dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats update in background
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}


