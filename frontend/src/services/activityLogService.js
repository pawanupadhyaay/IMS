import api from './api'

export const getActivityLogs = async (params = {}) => {
  const response = await api.get('/activity-logs', { params })
  return response.data
}

export const getAdmins = async () => {
  const response = await api.get('/activity-logs/admins')
  return response.data
}

