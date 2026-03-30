import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Upload endpoints
export const uploadProjection = async (file: File, uploadedBy?: string, clearExisting?: boolean) => {
  const formData = new FormData()
  formData.append('file', file)
  if (uploadedBy) formData.append('uploaded_by', uploadedBy)

  const response = await api.post(`/upload/projection?clear_existing=${clearExisting || false}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const uploadRealization = async (file: File, uploadedBy?: string, clearExisting?: boolean) => {
  const formData = new FormData()
  formData.append('file', file)
  if (uploadedBy) formData.append('uploaded_by', uploadedBy)

  const response = await api.post(`/upload/realization?clear_existing=${clearExisting || false}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Projection endpoints
export const getProjectionReport = async (
  month: number,
  year: number,
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
  })
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/projections/report?${params}`)
  return response.data
}

export const getProjectionSummary = async (
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams()
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/projections/summary?${params}`)
  return response.data
}

export const getInstruments = async (
  instrumentType?: string,
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams()
  if (instrumentType) params.append('instrument_type', instrumentType)
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/projections/instruments?${params}`)
  return response.data
}

export const getProjectionPivot = async (
  month: number,
  year: number,
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams({
    month: month.toString(),
    year: year.toString(),
  })
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/projections/pivot?${params}`)
  return response.data
}

// Realization endpoints
export const getRealizationReport = async (
  month?: number,
  year?: number,
  subFund?: string,
  managementType?: string,
  transactionCategory?: string
) => {
  const params = new URLSearchParams()
  if (month) params.append('month', month.toString())
  if (year) params.append('year', year.toString())
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)
  if (transactionCategory) params.append('transaction_category', transactionCategory)

  const response = await api.get(`/realizations/report?${params}`)
  return response.data
}

export const getRealizationSummary = async (
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams()
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/realizations/summary?${params}`)
  return response.data
}

export const getRealizationPivot = async (
  month?: number,
  year?: number,
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams()
  if (month) params.append('month', month.toString())
  if (year) params.append('year', year.toString())
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/realizations/pivot?${params}`)
  return response.data
}

export const exportRealizationToExcel = async (
  month?: number,
  year?: number,
  subFund?: string,
  managementType?: string,
  isPivot: boolean = false
) => {
  const params = new URLSearchParams()
  if (month) params.append('month', month.toString())
  if (year) params.append('year', year.toString())
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const endpoint = isPivot ? '/realization/export-pivot' : '/realization/export'
  const url = `/api/projections${endpoint}?${params.toString()}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download Excel file')
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    
    // Generate filename
    const mgmtLabel = managementType || 'All'
    const subfundLabel = subFund || 'All'
    const pivotSuffix = isPivot ? '_Pivot' : ''
    const filename = `CF_Realization${pivotSuffix}_${year}_${String(month || '01').padStart(2, '0')}_${subfundLabel}_${mgmtLabel}.xlsx`
    
    // Create download link
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading Excel:', error)
    throw error
  }
}

// Manual Input endpoints
export const createManualInput = async (input: {
  input_type: string
  sub_fund: string
  management_type: string
  transaction_date: string
  amount: number
  description?: string
}) => {
  const response = await api.post('/manual-inputs/', input)
  return response.data
}

export const createBulkManualInputs = async (inputs: Array<{
  input_type: string
  sub_fund: string
  management_type: string
  transaction_date: string
  amount: number
  description?: string
}>) => {
  const response = await api.post('/manual-inputs/bulk', inputs)
  return response.data
}

export const getManualInputs = async (
  inputType?: string,
  subFund?: string,
  managementType?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams()
  if (inputType) params.append('input_type', inputType)
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await api.get(`/manual-inputs/?${params}`)
  return response.data
}

export const getSaldoAwal = async (
  subFund?: string,
  managementType?: string
) => {
  const params = new URLSearchParams()
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)

  const response = await api.get(`/manual-inputs/saldo-awal?${params}`)
  return response.data
}

export const updateManualInput = async (
  id: number,
  input: {
    input_type: string
    sub_fund: string
    management_type: string
    transaction_date: string
    amount: number
    description?: string
  }
) => {
  const response = await api.put(`/manual-inputs/${id}`, input)
  return response.data
}

export const deleteManualInput = async (id: number) => {
  const response = await api.delete(`/manual-inputs/${id}`)
  return response.data
}

// Portfolio endpoints
export const uploadPortfolio = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/portfolio/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getPortfolioSummary = async () => {
  const response = await api.get('/portfolio/summary')
  return response.data
}

export const getMaturityProfile = async (
  subFund?: string,
  managementType?: string,
  assetType?: string,
  groupBy: 'month' | 'year' = 'month'
) => {
  const params = new URLSearchParams()
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)
  if (assetType) params.append('asset_type', assetType)
  params.append('group_by', groupBy)

  const response = await api.get(`/portfolio/profile?${params}`)
  return response.data
}

export const getMaturityCalendar = async (
  startDate?: string,
  endDate?: string,
  subFund?: string,
  managementType?: string,
  assetType?: string
) => {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)
  if (assetType) params.append('asset_type', assetType)

  const response = await api.get(`/portfolio/calendar?${params}`)
  return response.data
}

export const exportMaturityCalendarToExcel = async (
  startDate?: string,
  endDate?: string,
  subFund?: string,
  managementType?: string,
  assetType?: string
) => {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)
  if (assetType) params.append('asset_type', assetType)

  const url = `/api/portfolio/calendar/export?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download Excel file')
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)

    // Generate filename
    const mgmtLabel = managementType || 'All'
    const subfundLabel = subFund || 'All'
    const assetLabel = assetType || 'All'
    const dateLabel = (startDate && endDate) ? `${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}` : 'All'
    const filename = `Maturity_Calendar_${dateLabel}_${subfundLabel}_${mgmtLabel}_${assetLabel}.xlsx`

    // Create download link
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading Excel:', error)
    throw error
  }
}

export const exportMaturityProfileToExcel = async (
  subFund?: string,
  managementType?: string,
  assetType?: string,
  groupBy: 'month' | 'year' = 'month'
) => {
  const params = new URLSearchParams()
  if (subFund) params.append('sub_fund', subFund)
  if (managementType) params.append('management_type', managementType)
  if (assetType) params.append('asset_type', assetType)
  params.append('group_by', groupBy)

  const url = `/api/portfolio/profile/export?${params.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download Excel file')
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)

    // Generate filename
    const mgmtLabel = managementType || 'All'
    const subfundLabel = subFund || 'All'
    const assetLabel = assetType || 'All'
    const groupLabel = groupBy === 'year' ? 'Yearly' : 'Monthly'
    const filename = `Maturity_Profile_${groupLabel}_${subfundLabel}_${mgmtLabel}_${assetLabel}.xlsx`

    // Create download link
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading Excel:', error)
    throw error
  }
}
