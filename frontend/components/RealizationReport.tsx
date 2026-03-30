'use client'

import { useState, useEffect } from 'react'
import { getRealizationReport, getRealizationPivot, exportRealizationToExcel } from '@/lib/api'
import { RealizationReportSummary, NUMBER_SCALES } from '@/lib/types'

type ViewMode = 'table' | 'pivot'

export default function RealizationReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [subFund, setSubFund] = useState<string>('')
  const [managementType, setManagementType] = useState<string>('')
  const [numberScale, setNumberScale] = useState(1000000) // Default to Millions
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<RealizationReportSummary | null>(null)
  const [pivotData, setPivotData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRealizationReport(
        month,
        year,
        subFund || undefined,
        managementType || undefined
      )
      setReport(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch realization report')
    } finally {
      setLoading(false)
    }
  }

  const fetchPivot = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRealizationPivot(
        month,
        year,
        subFund || undefined,
        managementType || undefined
      )
      setPivotData(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch pivot data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (viewMode === 'table') {
      fetchReport()
    } else {
      fetchPivot()
    }
  }, [viewMode, month, year, subFund, managementType])

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cash Flow Realization</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
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

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="table">Table View</option>
              <option value="pivot">Pivot View</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={viewMode === 'table' ? fetchReport : fetchPivot}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh Report'}
          </button>
          <button
            onClick={() => exportRealizationToExcel(month, year, subFund || undefined, managementType || undefined, viewMode === 'pivot')}
            disabled={loading || (viewMode === 'table' && (!report || report.data.length === 0))}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Excel
          </button>
        </div>
      </div>

      {/* Summary */}
      {report && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Realization Amount</p>
              <p className="text-3xl font-bold text-primary-600">{formatCurrency(report.total_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{report.data.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'table' ? 'Transaction Details' : 'Pivot Table'}
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
        ) : viewMode === 'table' && report && report.data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-6xl mb-4">💰</p>
            <p className="text-gray-600">No realization data available</p>
          </div>
        ) : viewMode === 'table' && report ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instrument</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.transaction_category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.instrument_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatNumber(item.proceed_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : pivotData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">Category / Instrument</th>
                  {pivotData.dates.map((date: string, i: number) => (
                    <th key={i} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pivotData.rows.map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-white whitespace-nowrap">
                      <div className="font-medium">{row.transaction_category}</div>
                      <div className="text-xs text-gray-500">{row.instrument_name || '-'}</div>
                    </td>
                    {pivotData.dates.map((date: string, i: number) => (
                      <td key={i} className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">
                        {formatNumber(row.values[date])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
