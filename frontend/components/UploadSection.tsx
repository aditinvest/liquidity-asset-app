'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadProjection, uploadRealization } from '@/lib/api'

type UploadType = 'PROJECTION' | 'REALIZATION'

export default function UploadSection() {
  const [uploadType, setUploadType] = useState<UploadType>('PROJECTION')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [clearExistingProjection, setClearExistingProjection] = useState(false)
  const [clearExistingRealization, setClearExistingRealization] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setError(null)
    setUploadResult(null)

    try {
      const file = acceptedFiles[0]
      let result

      if (uploadType === 'PROJECTION') {
        result = await uploadProjection(file, 'admin', clearExistingProjection)
        if (clearExistingProjection) {
          setClearExistingProjection(false)
        }
      } else {
        result = await uploadRealization(file, 'admin', clearExistingRealization)
        if (clearExistingRealization) {
          setClearExistingRealization(false)
        }
      }

      setUploadResult(result)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }, [uploadType, clearExistingProjection, clearExistingRealization])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Import</h2>
        
        {/* Upload Type Selection */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setUploadType('PROJECTION')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              uploadType === 'PROJECTION'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Cash Flow Projection
          </button>
          <button
            onClick={() => setUploadType('REALIZATION')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              uploadType === 'REALIZATION'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 Cash Flow Realization
          </button>
        </div>

        {/* Clear Existing Data Checkbox (for Projection) */}
        {uploadType === 'PROJECTION' && (
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clearExistingProjection}
                onChange={(e) => setClearExistingProjection(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                ⚠️ Clear existing projection data before upload (this will delete all current projection records)
              </span>
            </label>
          </div>
        )}

        {/* Clear Existing Data Checkbox (for Realization) */}
        {uploadType === 'REALIZATION' && (
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clearExistingRealization}
                onChange={(e) => setClearExistingRealization(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                ⚠️ Clear existing realization data before upload (this will delete all current realization records)
              </span>
            </label>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600">Processing file...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-lg text-primary-600">Drop the Excel file here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-6xl">📁</p>
              <p className="text-lg text-gray-700">
                Drag & drop an Excel file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Only .xlsx files are supported
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            {uploadType === 'PROJECTION' 
              ? 'Projection File Requirements' 
              : 'Realization File Requirements'}
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {uploadType === 'PROJECTION' ? (
              <>
                <li>• Sheet "Deposito": FundID, CounterpartID, CounterpartName, Maturity Date, DepositAmount, Syariah</li>
                <li>• Sheet "Bond": FundID, SecuritiesID, SecuritiesName, NextCouponDate, NetCouponAmount, Maturity Date, Balance, Syariah</li>
              </>
            ) : (
              <>
                <li>• Sheets: "Depo", "Obligasi", or "Realisasi"</li>
                <li>• Required: FundID, transaction date, amount columns</li>
                <li>• JPOIP in FundID = OPEX, otherwise CAPEX</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Upload Successful</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700">File Name:</p>
              <p className="font-medium text-green-900">{uploadResult.file_name}</p>
            </div>
            <div>
              <p className="text-green-700">Batch ID:</p>
              <p className="font-medium text-green-900">{uploadResult.batch_id}</p>
            </div>
            <div>
              <p className="text-green-700">Records Created:</p>
              <p className="font-medium text-green-900">{uploadResult.records_created}</p>
            </div>
            {uploadResult.deposito_records !== undefined && (
              <>
                <div>
                  <p className="text-green-700">Deposito Records:</p>
                  <p className="font-medium text-green-900">{uploadResult.deposito_records}</p>
                </div>
                <div>
                  <p className="text-green-700">Bond Records:</p>
                  <p className="font-medium text-green-900">{uploadResult.bond_records}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Upload Failed</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
