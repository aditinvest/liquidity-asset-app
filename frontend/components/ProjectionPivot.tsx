'use client'

import { useState, useEffect } from 'react'
import { getProjectionPivot } from '@/lib/api'

interface PivotData {
  date: string
  sub_fund: string
  management_type: string
  deposito_in: number
  bond_coupon: number
  bond_maturity: number
  total_in: number
  cf_out: number
  net_cf: number
  opening_balance: number
  ending_balance: number
}

interface PivotTableProps {
  month: number
  year: number
  subFund: string
  managementType: string
  numberScale: number
}

export default function ProjectionPivot({ month, year, subFund, managementType, numberScale }: PivotTableProps) {
  const [loading, setLoading] = useState(false)
  const [pivotData, setPivotData] = useState<PivotData[]>([])
  const [error, setError] = useState<string | null>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const fetchPivotData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProjectionPivot(
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
    fetchPivotData()
  }, [month, year, subFund, managementType])

  const formatNumber = (num: number) => {
    const scaled = num / numberScale
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(scaled)
  }

  // Get unique dates for columns
  const uniqueDates = Array.from(new Set(pivotData.map(d => d.date))).sort()

  // Aggregate data by instrument type and date
  const pivotByInstrument = {
    'Deposito In': uniqueDates.map(date => {
      const row = pivotData.find(d => d.date === date)
      return row ? row.deposito_in : 0
    }),
    'Bond Coupon': uniqueDates.map(date => {
      const row = pivotData.find(d => d.date === date)
      return row ? row.bond_coupon : 0
    }),
    'Bond Maturity': uniqueDates.map(date => {
      const row = pivotData.find(d => d.date === date)
      return row ? row.bond_maturity : 0
    }),
    'Total In': uniqueDates.map(date => {
      const row = pivotData.find(d => d.date === date)
      return row ? row.total_in : 0
    }),
    'CF Out': uniqueDates.map(date => {
      const row = pivotData.find(d => d.date === date)
      return row ? row.cf_out : 0
    }),
    'Net CF': uniqueDates.map(date => {
      const row = pivotData.find(d => d.date === date)
      return row ? row.net_cf : 0
    }),
  }

  // Calculate totals
  const totals = {
    'Deposito In': pivotByInstrument['Deposito In'].reduce((a, b) => a + b, 0),
    'Bond Coupon': pivotByInstrument['Bond Coupon'].reduce((a, b) => a + b, 0),
    'Bond Maturity': pivotByInstrument['Bond Maturity'].reduce((a, b) => a + b, 0),
    'Total In': pivotByInstrument['Total In'].reduce((a, b) => a + b, 0),
    'CF Out': pivotByInstrument['CF Out'].reduce((a, b) => a + b, 0),
    'Net CF': pivotByInstrument['Net CF'].reduce((a, b) => a + b, 0),
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Pivot View - {months[month - 1]} {year}
        </h3>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pivot data...</p>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : pivotData.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-6xl mb-4">📊</p>
          <p className="text-gray-600">No pivot data available for this period</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">Instrument</th>
                {uniqueDates.map(date => (
                  <th key={date} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    {new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(pivotByInstrument).map(([instrument, values], idx) => (
                <tr key={instrument} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit">
                    {instrument}
                  </td>
                  {values.map((value, dateIdx) => (
                    <td key={dateIdx} className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                      instrument === 'CF Out' ? 'text-red-600' : 
                      instrument === 'Net CF' && value < 0 ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {formatNumber(value)}
                    </td>
                  ))}
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${
                    instrument === 'CF Out' ? 'text-red-600' : 
                    instrument === 'Net CF' && totals[instrument as keyof typeof totals] < 0 ? 'text-red-600' :
                    'text-gray-900'
                  }`}>
                    {formatNumber(totals[instrument as keyof typeof totals])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
