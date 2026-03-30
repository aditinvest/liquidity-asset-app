export interface ProjectionReportItem {
  date: string
  sub_fund: 'OPEX' | 'CAPEX'
  management_type: 'SYARIAH' | 'KONVENSIONAL'
  deposito_in: number
  bond_coupon_in: number
  bond_maturity_in: number
  cf_out: number
  total_in: number
  net_cashflow: number
  opening_balance: number
  ending_balance: number
}

export interface ProjectionReportSummary {
  month: number
  year: number
  sub_fund?: string
  management_type?: string
  total_opening_balance: number
  total_cf_in: number
  total_cf_out: number
  total_ending_balance: number
  data: ProjectionReportItem[]
}

export interface RealizationReportItem {
  date: string
  sub_fund: 'OPEX' | 'CAPEX'
  management_type: 'SYARIAH' | 'KONVENSIONAL'
  transaction_category: string
  instrument_name: string
  proceed_amount: number
}

export interface RealizationReportSummary {
  sub_fund?: string
  management_type?: string
  total_amount: number
  data: RealizationReportItem[]
}

export interface ManualInput {
  id: number
  input_type: 'SALDO_AWAL' | 'CF_OUT'
  sub_fund: 'OPEX' | 'CAPEX'
  management_type: 'SYARIAH' | 'KONVENSIONAL'
  transaction_date: string
  amount: number
  description?: string
  created_at: string
}

export interface Instrument {
  instrument_code: string
  instrument_name: string
  instrument_type: string
  sub_fund: string
  management_type: string
}

export type SubFund = 'OPEX' | 'CAPEX'
export type ManagementType = 'SYARIAH' | 'KONVENSIONAL'
export type InstrumentType = 'DEPOSITO' | 'BOND_COUPON' | 'BOND_MATURITY'

export interface NumberScale {
  label: string
  value: number
  divisor: number
}

export const NUMBER_SCALES: NumberScale[] = [
  { label: 'Full Amount', value: 1, divisor: 1 },
  { label: 'Thousands', value: 1000, divisor: 1000 },
  { label: 'Millions', value: 1000000, divisor: 1000000 },
  { label: 'Billions', value: 1000000000, divisor: 1000000000 },
]

// Portfolio & Maturity Types
export interface PortfolioSummary {
  total_assets: number
  asset_count: number
  deposito_count: number
  bond_count: number
  last_updated: string | null
}

export interface MaturityProfileItem {
  period: string
  maturity_amount: number
  coupon_amount: number
  total_amount: number
  asset_count: number
}

export interface MaturityProfileSummary {
  sub_fund?: string
  management_type?: string
  asset_type?: string
  total_principal: number
  data: MaturityProfileItem[]
}

export interface MaturityCalendarItem {
  maturity_date: string
  sub_fund: 'OPEX' | 'CAPEX'
  management_type: 'SYARIAH' | 'KONVENSIONAL'
  asset_type: 'DEPOSITO' | 'BOND' | 'BOND_COUPON'
  security_id: string
  security_name: string
  principal_amount: number
  coupon_amount: number
  total_amount: number
}

export interface MaturityCalendarSummary {
  sub_fund?: string
  management_type?: string
  total_amount: number
  data: MaturityCalendarItem[]
}
