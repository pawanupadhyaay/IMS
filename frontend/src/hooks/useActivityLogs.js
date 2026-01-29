import { useQuery } from '@tanstack/react-query'
import { getActivityLogs, getAdmins } from '../services/activityLogService'

// Query keys for cache management
export const activityLogKeys = {
  all: ['activityLogs'],
  lists: () => [...activityLogKeys.all, 'list'],
  list: (filters) => [...activityLogKeys.lists(), filters],
  admins: () => [...activityLogKeys.all, 'admins'],
}

// Hook to fetch activity logs with filters
export const useActivityLogs = (filters = {}) => {
  return useQuery({
    queryKey: activityLogKeys.list(filters),
    queryFn: () => getActivityLogs(filters),
    keepPreviousData: true,
  })
}

// Hook to fetch admins for filter dropdown
export const useActivityLogAdmins = () => {
  return useQuery({
    queryKey: activityLogKeys.admins(),
    queryFn: () => getAdmins(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

