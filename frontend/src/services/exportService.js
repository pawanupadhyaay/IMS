import api from './api'

export const exportToCSV = async (params = {}) => {
  const response = await api.get('/export/csv', {
    params,
    responseType: 'blob',
  })
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `inventory-export-${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

