import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type PrecisionLevel = 'country' | 'province' | 'city' | 'district' | 'street'

export interface PrecisionLevelInfo {
  level: PrecisionLevel
  label: string
  score: number
  description: string
}

export interface DataSourceInfo {
  id: string
  name: string
  description: string
  baseReliability: number
  coverage: string
  updateFrequency: string
  pros: string[]
  cons: string[]
  nominalPrecision: PrecisionLevel
  precisionDescription: string
  typicalAccuracyKm: string
  suitableScenarios: string[]
}

export interface IpLookupData {
  ip: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  org: string
  as: string
  district?: string
}

export interface SingleSourceResult {
  source: DataSourceInfo
  success: boolean
  data?: IpLookupData
  error?: string
  responseTime: number
  confidence: ConfidenceLevel
  confidenceScore: number
  confidenceReasons: string[]
  actualPrecision: PrecisionLevel
  actualPrecisionLabel: string
  precisionScore: number
}

export interface FieldConsensus {
  field: string
  label: string
  agreed: boolean
  values: { source: string; value: string }[]
  mostCommon: string
  confidence: ConfidenceLevel
  precisionLevel: PrecisionLevel
  precisionLabel: string
}

export interface PrecisionComparison {
  sourceName: string
  precision: PrecisionLevel
  precisionLabel: string
  score: number
  typicalAccuracy: string
}

export interface IpLookupResult {
  ip: string
  isLocal: boolean
  isError?: boolean
  errorMessage?: string
  highPrecisionMode: boolean
  consensus: IpLookupData
  overallConfidence: ConfidenceLevel
  overallConfidenceScore: number
  overallPrecision: PrecisionLevel
  overallPrecisionLabel: string
  overallPrecisionScore: number
  fieldConsensus: FieldConsensus[]
  sources: SingleSourceResult[]
  precisionComparison: PrecisionComparison[]
  explanation: {
    differences: string[]
    recommendations: string[]
    notes: string[]
    precisionExplanation: string[]
    scenarioAdvice: { scenario: string; advice: string; recommendedPrecision: string }[]
  }
}

export const ipLookupApi = {
  getSources: () => api.get<DataSourceInfo[]>('/ip-lookup/sources'),
  getPrecisionLevels: () => api.get<PrecisionLevelInfo[]>('/ip-lookup/precision-levels'),
  lookup: (ip: string, highPrecision?: boolean) =>
    api.get<IpLookupResult>(`/ip-lookup/${encodeURIComponent(ip)}`, {
      params: highPrecision ? { highPrecision: 'true' } : {}
    }),
  batchLookup: (ips: string[], highPrecision?: boolean) =>
    api.post<IpLookupResult[]>('/ip-lookup/batch', { ips, highPrecision })
}
