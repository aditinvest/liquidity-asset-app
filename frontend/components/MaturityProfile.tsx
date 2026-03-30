'use client'

import { useState, useEffect } from 'react'
import { getMaturityProfile, getMaturityCalendar, getPortfolioSummary, exportMaturityProfileToExcel, exportMaturityCalendarToExcel } from '@/lib/api'
import { MaturityProfileSummary, MaturityCalendarItem, PortfolioSummary, NUMBER_SCALES } from '@/lib/types'

type ViewMode = 'profile' | 'calendar'

export default function MaturityProfile() {
  const [viewMode, setViewMode] = useState<ViewMode>('profile')
  const [subFund, setSubFund] = useState<string>('')
  const [managementType, setManagementType] = useState<string>('')
  const [assetType, setAssetType] = useState<string>('')
  const [year, setYear] = useState<number | 'all'>('all')
  const [month, setMonth] = useState<number | 'all'>('all')
  const [numberScale, setNumberScale] = useState(1000000)

  const [profileData, setProfileData] = useState<MaturityProfileSummary | null>(null)
  const [calendarData, setCalendarData] = useState<MaturityCalendarItem[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [clearPrevious, setClearPrevious] = useState(false)

  useEffect(() => {
    fetchPortfolioSummary()
  }, [])

  useEffect(() => {
    if (viewMode === 'profile') {
      fetchProfile()
    } else {
      fetchCalendar()
    }
  }, [viewMode, subFund, managementType, assetType, year, month])

  const fetchPortfolioSummary = async () => {
    try {
      const data = await getPortfolioSummary()
      setPortfolioSummary(data)
    } catch (err: any) {
      console.error('Failed to fetch portfolio summary:', err)
    }
  }

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use the profile endpoint directly with proper filters
      const data = await getMaturityProfile(
        subFund || undefined,
        managementType || undefined,
        assetType || undefined,
        'month' // Always group by month
      )
      console.log('Profile data:', data)

      // Filter by year and month if selected
      let profileData = data
      if (year !== 'all' && data.data) {
        const yearStr = year.toString()
        profileData = {
          ...data,
          data: data.data.filter(item => {
            const matchesYear = item.period.startsWith(yearStr)
            if (month === 'all') return matchesYear
            // Filter by specific month (YYYY-MM format)
            const monthStr = month.toString().padStart(2, '0')
            return matchesYear && item.period.endsWith(`-${monthStr}`)
          })
        }
      } else if (month !== 'all' && data.data) {
        // If only month is selected (no year), filter by month across all years
        const monthStr = month.toString().padStart(2, '0')
        profileData = {
          ...data,
          data: data.data.filter(item => item.period.endsWith(`-${monthStr}`))
        }
      }

      setProfileData(profileData)
    } catch (err: any) {
      console.error('Profile error:', err)
      setError(err.response?.data?.detail || 'Failed to fetch maturity profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendar = async () => {
    setLoading(true)
    setError(null)
    try {
      // Apply year and month filter
      let startDate = year === 'all' ? undefined : `${year}-01-01`
      let endDate = year === 'all' ? undefined : `${year}-12-31`

      // If specific month is selected, adjust the date range
      if (year !== 'all' && month !== 'all') {
        const monthStr = month.toString().padStart(2, '0')
        startDate = `${year}-${monthStr}-01`
        // Get last day of the month
        const lastDay = new Date(year, month, 0).getDate()
        endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
      } else if (year === 'all' && month !== 'all') {
        // If only month is selected (no year), we can't filter by date range
        // So we'll fetch all and filter client-side
        startDate = undefined
        endDate = undefined
      }

      const data = await getMaturityCalendar(
        startDate,
        endDate,
        subFund || undefined,
        managementType || undefined,
        assetType || undefined
      )
      console.log('Calendar data:', data)

      // Client-side filtering for month when year is 'all'
      let calendarData = data.data || []
      if (year === 'all' && month !== 'all') {
        const monthStr = month.toString().padStart(2, '0')
        calendarData = calendarData.filter(item => 
          item.maturity_date.endsWith(`-${monthStr}`) || 
          item.maturity_date.split('-')[1] === monthStr
        )
      }

      setCalendarData(calendarData)
    } catch (err: any) {
      console.error('Calendar error:', err)
      setError(err.response?.data?.detail || 'Failed to fetch maturity calendar')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (clearPrevious && !window.confirm('Are you sure you want to clear all previous portfolio data? This action cannot be undone.')) {
      event.target.value = ''
      return
    }

    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`/api/portfolio/upload?clear_previous=${clearPrevious}`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload portfolio')
      }
      
      fetchPortfolioSummary()
      fetchProfile()
      alert('Portfolio uploaded successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to upload portfolio')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDownloadProfile = async () => {
    try {
      await exportMaturityProfileToExcel(
        subFund || undefined,
        managementType || undefined,
        assetType || undefined,
        'month'
      )
    } catch (err: any) {
      console.error('Download error:', err)
      alert('Failed to download profile data')
    }
  }

  const handleDownloadCalendar = async () => {
    try {
      // Calculate date range based on filters
      let startDate = undefined
      let endDate = undefined

      if (year !== 'all' && month !== 'all') {
        const monthStr = month.toString().padStart(2, '0')
        startDate = `${year}-${monthStr}-01`
        const lastDay = new Date(year, month, 0).getDate()
        endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`
      } else if (year !== 'all') {
        startDate = `${year}-01-01`
        endDate = `${year}-12-31`
      }

      await exportMaturityCalendarToExcel(
        startDate,
        endDate,
        subFund || undefined,
        managementType || undefined,
        assetType || undefined
      )
    } catch (err: any) {
      console.error('Download error:', err)
      alert('Failed to download calendar data')
    }
  }

  const formatNumber = (num: number) => {
    const scaled = num / numberScale
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(scaled)
  }

  const formatCurrency = (num: number) => {
    const scaled = num / numberScale
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(scaled)
  }

  // Format period to display month name (e.g., "2026-03" -> "Mar 2026")
  const formatPeriod = (period: string) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if (period.length === 7) {
      // Format: YYYY-MM
      const [year, month] = period.split('-')
      const monthIndex = parseInt(month, 10) - 1
      return `${monthNames[monthIndex]} ${year}`
    }
    // Format: YYYY (yearly)
    return period
  }

  // Format date for calendar view (e.g., "2026-03-15" -> "15 Mar 2026")
  const formatDate = (dateString: string) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const [year, month, day] = dateString.split('-')
    const monthIndex = parseInt(month, 10) - 1
    return `${day} ${monthNames[monthIndex]} ${year}`
  }

  // Simple bar chart component
  const BarChart = ({ data }: { data: MaturityProfileSummary }) => {
    if (!data.data || data.data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">📊</p>
          <p className="text-gray-600">No data available for the selected filters</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting the year, sub fund, or asset type filters</p>
        </div>
      )
    }

    const maxValue = Math.max(...data.data.map(d => Number(d.total_amount) || 0), 1)
    const chartHeight = 300

    return (
      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ height: chartHeight + 100 }}>
          <div className="flex items-end space-x-2" style={{ height: chartHeight }}>
            {data.data.map((item, index) => {
              const totalAmount = Number(item.total_amount) || 0
              const maturityAmount = Number(item.maturity_amount) || 0
              const couponAmount = Number(item.coupon_amount) || 0
              const barHeight = totalAmount > 0 ? (totalAmount / maxValue) * chartHeight : 0
              const maturityPercent = totalAmount > 0 ? (maturityAmount / totalAmount) * 100 : 0
              const couponPercent = totalAmount > 0 ? (couponAmount / totalAmount) * 100 : 0

              return (
                <div key={index} className="flex-1 flex flex-col items-center min-w-[50px]">
                  <div className="w-full relative flex flex-col justify-end" style={{ height: barHeight }}>
                    {/* Maturity Amount Bar */}
                    {maturityPercent > 0 && (
                      <div
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                        style={{
                          height: `${maturityPercent}%`,
                          minHeight: '4px'
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          Maturity: {formatCurrency(maturityAmount)}
                        </div>
                      </div>
                    )}
                    {/* Coupon Amount Bar */}
                    {couponPercent > 0 && (
                      <div
                        className="w-full bg-green-500 hover:bg-green-600 transition-colors relative group"
                        style={{
                          height: `${couponPercent}%`,
                          minHeight: '4px'
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          Coupon: {formatCurrency(couponAmount)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center whitespace-nowrap">
                    {formatPeriod(item.period)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Maturity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Coupon</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Assets</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(portfolioSummary.total_assets)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Instruments</p>
            <p className="text-2xl font-bold text-gray-900">{portfolioSummary.asset_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Deposito</p>
            <p className="text-2xl font-bold text-blue-600">{portfolioSummary.deposito_count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Bonds</p>
            <p className="text-2xl font-bold text-green-600">{portfolioSummary.bond_count}</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Portfolio Data</h2>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex items-center justify-center w-full px-4 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-gray-500">Excel file with Deposito and Bond sheets</p>
              </div>
            </div>
          </label>
        </div>
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="clearPrevious"
            checked={clearPrevious}
            onChange={(e) => setClearPrevious(e.target.checked)}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="clearPrevious" className="ml-2 block text-sm text-gray-700">
            Clear previous portfolio data before upload (to avoid duplicates)
          </label>
        </div>
        {clearPrevious && (
          <div className="mt-2 text-xs text-red-600">
            ⚠️ Warning: This will delete all existing portfolio data and replace it with the new upload.
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Maturity Profile & Calendar</h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value as number | 'all')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Years</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value as number | 'all')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Sub Fund */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Fund</label>
            <select
              value={subFund}
              onChange={(e) => setSubFund(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              <option value="OPEX">OPEX</option>
              <option value="CAPEX">CAPEX</option>
            </select>
          </div>

          {/* Management Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Management Type</label>
            <select
              value={managementType}
              onChange={(e) => setManagementType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              <option value="SYARIAH">Syariah</option>
              <option value="KONVENSIONAL">Conventional</option>
            </select>
          </div>

          {/* Asset Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              <option value="DEPOSITO">Deposito</option>
              <option value="BOND">Bond (Principal)</option>
              <option value="BOND_COUPON">Bond (Coupon)</option>
            </select>
          </div>

          {/* Number Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number Scale</label>
            <select
              value={numberScale}
              onChange={(e) => setNumberScale(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {NUMBER_SCALES.map((scale) => (
                <option key={scale.value} value={scale.divisor}>{scale.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('profile')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'profile'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Profile View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Calendar View
            </button>
          </div>
          <button
            onClick={viewMode === 'profile' ? handleDownloadProfile : handleDownloadCalendar}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {viewMode === 'profile' ? 'Profile' : 'Calendar'}
          </button>
        </div>
      </div>

      {/* Chart / Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'profile' ? 'Maturity Profile' : 'Maturity Calendar'}
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : viewMode === 'profile' && profileData ? (
          <div className="p-6">
            {profileData.data.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-6xl mb-4">📊</p>
                <p className="text-gray-600">No maturity data available</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-600">Total Principal</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(Number(profileData.total_principal) || 0)}
                  </p>
                </div>
                <BarChart data={profileData} />
                
                {/* Summary Table */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Summary by Period</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profileData.data.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {formatPeriod(item.period)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                              {formatNumber(Number(item.maturity_amount) || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                              {formatNumber(Number(item.coupon_amount) || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-primary-600">
                              {formatNumber(Number(item.total_amount) || 0)}
                            </td>
                          </tr>
                        ))}
                        {/* Total Row */}
                        <tr className="bg-gray-100 font-bold">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Total</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                            {formatNumber(profileData.data.reduce((sum, item) => sum + (Number(item.maturity_amount) || 0), 0))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                            {formatNumber(profileData.data.reduce((sum, item) => sum + (Number(item.coupon_amount) || 0), 0))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-primary-600">
                            {formatNumber(profileData.data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="overflow-x-auto">
            {calendarData.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-6xl mb-4">📅</p>
                <p className="text-gray-600">No maturity calendar data available</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calendarData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(item.maturity_date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.sub_fund === 'OPEX' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.sub_fund}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.management_type === 'SYARIAH' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.management_type === 'SYARIAH' ? 'Syariah' : 'Conventional'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.asset_type === 'DEPOSITO' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.asset_type === 'DEPOSITO' ? 'Deposito' : 'Bond'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={item.security_name}>
                        {item.security_name || item.security_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatNumber(Number(item.principal_amount) || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatNumber(Number(item.coupon_amount) || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-primary-600">
                        {formatNumber(Number(item.total_amount) || 0)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-100 font-bold">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Total</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm"></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm"></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm"></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm"></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatNumber(calendarData.reduce((sum, item) => sum + (Number(item.principal_amount) || 0), 0))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatNumber(calendarData.reduce((sum, item) => sum + (Number(item.coupon_amount) || 0), 0))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-primary-600">
                      {formatNumber(calendarData.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
