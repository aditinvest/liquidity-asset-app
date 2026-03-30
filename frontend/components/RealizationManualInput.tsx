'use client'

import { useState, useEffect } from 'react'
import { createManualInput, getManualInputs, deleteManualInput } from '@/lib/api'
import { ManualInput as ManualInputType } from '@/lib/types'

type InputType = 'SALDO_AWAL_REALISASI' | 'CF_OUT_REALISASI'

export default function RealizationManualInput() {
  const [inputType, setInputType] = useState<InputType>('SALDO_AWAL_REALISASI')
  const [subFund, setSubFund] = useState<'OPEX' | 'CAPEX'>('OPEX')
  const [managementType, setManagementType] = useState<'SYARIAH' | 'KONVENSIONAL'>('SYARIAH')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [manualInputs, setManualInputs] = useState<ManualInputType[]>([])

  const fetchManualInputs = async () => {
    setLoading(true)
    try {
      const data = await getManualInputs()
      // Filter for realization manual inputs
      const realizationInputs = data.filter((item: ManualInputType) => 
        item.input_type === 'SALDO_AWAL_REALISASI' || item.input_type === 'CF_OUT_REALISASI'
      )
      setManualInputs(realizationInputs)
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

      setMessage({ type: 'success', text: 'Beginning balance created successfully!' })

      // Reset form
      setAmount('')
      setDescription('')

      // Refresh data
      fetchManualInputs()
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to create beginning balance'
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Beginning Balance Input (Saldo Awal Realisasi)</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as InputType)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="SALDO_AWAL_REALISASI">Beginning Balance (Saldo Awal)</option>
                <option value="CF_OUT_REALISASI">Cash Flow Out</option>
              </select>
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
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !amount}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        )}
      </div>

      {/* Current Beginning Balances */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Beginning Balances (Saldo Awal Realisasi)</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : manualInputs.filter(i => i.input_type === 'SALDO_AWAL_REALISASI').length === 0 ? (
          <p className="text-gray-500 text-center py-8">No beginning balance entries yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualInputs
                  .filter(i => i.input_type === 'SALDO_AWAL_REALISASI')
                  .map((input) => (
                    <tr key={input.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{input.transaction_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          input.sub_fund === 'OPEX' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {input.sub_fund}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          input.management_type === 'SYARIAH' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {input.management_type === 'SYARIAH' ? 'Syariah' : 'Conventional'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                        {formatCurrency(input.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{input.description || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDelete(input.id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Recent CF Out Realization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Cash Flow Out (Realisasi)</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : manualInputs.filter(i => i.input_type === 'CF_OUT_REALISASI').length === 0 ? (
          <p className="text-gray-500 text-center py-8">No cash flow out entries yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Fund</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mgmt Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualInputs
                  .filter(i => i.input_type === 'CF_OUT_REALISASI')
                  .map((input) => (
                    <tr key={input.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{input.transaction_date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          input.sub_fund === 'OPEX' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {input.sub_fund}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          input.management_type === 'SYARIAH' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {input.management_type === 'SYARIAH' ? 'Syariah' : 'Conventional'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600">
                        {formatCurrency(input.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{input.description || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDelete(input.id)}
                          className="text-red-600 hover:text-red-900"
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
