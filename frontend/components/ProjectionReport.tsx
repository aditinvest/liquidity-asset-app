'use client'

import { useState, useEffect } from 'react'
import { getProjectionReport } from '@/lib/api'
import { ProjectionReportSummary, NUMBER_SCALES } from '@/lib/types'
import ProjectionPivot from './ProjectionPivot'

type Tab = 'upload' | 'projections' | 'realizations' | 'manual-input'
type ViewMode = 'table' | 'pivot'

export default function ProjectionReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [subFund, setSubFund] = useState<string>('')
  const [managementType, setManagementType] = useState<string>('')
  const [numberScale, setNumberScale] = useState(1000000) // Default to Millions
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ProjectionReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProjectionReport(
        month,
        year,
        subFund || undefined,
        managementType || undefined
      )
      setReport(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch projection report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [month, year, subFund, managementType])

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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cash Flow Projections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh Report'}
          </button>
          <button
            onClick={() => {
              const params = new URLSearchParams({
                month: month.toString(),
                year: year.toString(),
              });
              if (subFund) params.append('sub_fund', subFund);
              if (managementType) params.append('management_type', managementType);
              window.open(`${process.env.NEXT_PUBLIC_API_URL}/projections/export?${params.toString()}`, '_blank');
            }}
            disabled={loading || !report || report.data.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Excel
          </button>
          <div className="ml-auto flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('pivot')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                viewMode === 'pivot'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pivot View
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Opening Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.total_opening_balance)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total CF In</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(report.total_cf_in)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total CF Out</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(report.total_cf_out)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Ending Balance</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(report.total_ending_balance)}</p>
          </div>
        </div>
      )}

      {/* Report Table */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Daily Projection Details - {months[month - 1]} {year}
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading report data...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          ) : report && report.data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-6xl mb-4">📊</p>
              <p className="text-gray-600">No projection data available for this period</p>
            </div>
          ) : report ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Bal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">Deposito In</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">Bond Coupon</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">Bond Maturity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total In</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">CF Out</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net CF</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ending Bal</th>
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
                        {item.management_type === 'ALL' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                            All
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.management_type === 'SYARIAH' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.management_type === 'SYARIAH' ? 'Syariah' : 'Conventional'}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${Number(item.opening_balance) < 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>{formatNumber(item.opening_balance)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatNumber(item.deposito_in)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatNumber(item.bond_coupon_in)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatNumber(item.bond_maturity_in)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${Number(item.total_in) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatNumber(item.total_in)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">{formatNumber(item.cf_out)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${Number(item.net_cashflow) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatNumber(item.net_cashflow)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${Number(item.ending_balance) < 0 ? 'text-red-600' : 'text-primary-600'}`}>{formatNumber(item.ending_balance)}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900" colSpan={3}>TOTAL</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">-</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatNumber(report.data.reduce((sum, item) => sum + Number(item.deposito_in), 0))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatNumber(report.data.reduce((sum, item) => sum + Number(item.bond_coupon_in), 0))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatNumber(report.data.reduce((sum, item) => sum + Number(item.bond_maturity_in), 0))}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${report.data.reduce((sum, item) => sum + Number(item.total_in), 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatNumber(report.data.reduce((sum, item) => sum + Number(item.total_in), 0))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">{formatNumber(report.data.reduce((sum, item) => sum + Number(item.cf_out), 0))}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${report.data.reduce((sum, item) => sum + Number(item.net_cashflow), 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatNumber(report.data.reduce((sum, item) => sum + Number(item.net_cashflow), 0))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : (
        <ProjectionPivot
          month={month}
          year={year}
          subFund={subFund}
          managementType={managementType}
          numberScale={numberScale}
        />
      )}
    </div>
  )
}
