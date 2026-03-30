'use client'

import { useState, useEffect } from 'react'
import { createManualInput, getManualInputs, deleteManualInput, getSaldoAwal } from '@/lib/api'
import { ManualInput as ManualInputType } from '@/lib/types'

type InputType = 'SALDO_AWAL' | 'CF_OUT'

export default function ManualInputForm() {
  const [inputType, setInputType] = useState<InputType>('SALDO_AWAL')
  const [subFund, setSubFund] = useState<'OPEX' | 'CAPEX'>('OPEX')
  const [managementType, setManagementType] = useState<'SYARIAH' | 'KONVENSIONAL'>('SYARIAH')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [manualInputs, setManualInputs] = useState<ManualInputType[]>([])
  const [saldoAwal, setSaldoAwal] = useState<ManualInputType[]>([])

  const fetchManualInputs = async () => {
    setLoading(true)
    try {
      const data = await getManualInputs()
      setManualInputs(data)
      
      const saldoData = await getSaldoAwal()
      setSaldoAwal(saldoData)
    } catch (err: any) {
      console.error('Failed to fetch manual inputs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchManualInputs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      await createManualInput({
        input_type: inputType,
        sub_fund: subFund,
        management_type: managementType,
        transaction_date: transactionDate,
        amount: parseFloat(amount) || 0,
        description: description || undefined,
      })

      setMessage({ type: 'success', text: 'Manual input created successfully!' })
      
      // Reset form
      setAmount('')
      setDescription('')
      
      // Refresh data
      fetchManualInputs()
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to create manual input' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      await deleteManualInput(id)
      setMessage({ type: 'success', text: 'Entry deleted successfully!' })
      fetchManualInputs()
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to delete entry' 
      })
    }
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Manual Input Form</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setInputType('SALDO_AWAL')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    inputType === 'SALDO_AWAL'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏦 Opening Balance (Saldo Awal)
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('CF_OUT')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    inputType === 'CF_OUT'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💸 Cash Flow Out
                </button>
              </div>
            </div>

            {/* Sub Fund */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Fund</label>
              <select
                value={subFund}
                onChange={(e) => setSubFund(e.target.value as 'OPEX' | 'CAPEX')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="OPEX">OPEX</option>
                <option value="CAPEX">CAPEX</option>
              </select>
            </div>

            {/* Management Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Management Type</label>
              <select
                value={managementType}
                onChange={(e) => setManagementType(e.target.value as 'SYARIAH' | 'KONVENSIONAL')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="SYARIAH">Syariah</option>
                <option value="KONVENSIONAL">Conventional</option>
              </select>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputType === 'CF_OUT' ? 'Description' : 'Description (Optional)'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            {message && (
              <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Current Saldo Awal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Opening Balances (Saldo Awal)</h3>
        
        {saldoAwal.length === 0 ? (
          <p className="text-gray-500 text-sm">No opening balance records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {saldoAwal.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.transaction_date}</td>
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-primary-600">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Manual Inputs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Manual Inputs</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : manualInputs.length === 0 ? (
          <p className="text-gray-500 text-sm">No manual input records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualInputs.slice(0, 20).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.input_type === 'SALDO_AWAL' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.input_type === 'SALDO_AWAL' ? 'Saldo Awal' : 'CF Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.transaction_date}</td>
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
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{item.description || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
