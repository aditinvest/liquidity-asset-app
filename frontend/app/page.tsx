'use client'

import { useState } from 'react'
import Link from 'next/link'
import UploadSection from '@/components/UploadSection'
import ProjectionReport from '@/components/ProjectionReport'
import RealizationReport from '@/components/RealizationReport'
import ManualInputForm from '@/components/ManualInputForm'
import RealizationManualInput from '@/components/RealizationManualInput'
import MaturityProfile from '@/components/MaturityProfile'

type Tab = 'upload' | 'projections' | 'realizations' | 'realization-manual-input' | 'manual-input' | 'maturity'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Liquidity and ALM Asset BP</h1>
          <p className="mt-2 text-sm text-gray-600">
            Cash Flow Projection and Realization Management
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'upload', label: 'Data Import', icon: '📤' },
              { id: 'projections', label: 'Cash Flow Projections', icon: '📊' },
              { id: 'realizations', label: 'Cash Flow Realization', icon: '💰' },
              { id: 'maturity', label: 'Maturity Profile', icon: '📈' },
              { id: 'realization-manual-input', label: 'Manual Input (Realization)', icon: '✏️' },
              { id: 'manual-input', label: 'Manual Input (Projection)', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'projections' && <ProjectionReport />}
        {activeTab === 'realizations' && <RealizationReport />}
        {activeTab === 'maturity' && <MaturityProfile />}
        {activeTab === 'realization-manual-input' && <RealizationManualInput />}
        {activeTab === 'manual-input' && <ManualInputForm />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 Liquidity and ALM unit copyright
          </p>
        </div>
      </footer>
    </div>
  )
}
