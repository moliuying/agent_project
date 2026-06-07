import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface DataSourceInfo {
  id: string
  name: string
  description: string
  baseReliability: number
  coverage: string
  updateFrequency: string
  pros: string[]
  cons: string[]
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
}

export interface FieldConsensus {
  field: string
  label: string
  agreed: boolean
  values: { source: string; value: string }[]
  mostCommon: string
  confidence: ConfidenceLevel
}

export interface IpLookupResult {
  ip: string
  isLocal: boolean
  isError?: boolean
  errorMessage?: string
  consensus: IpLookupData
  overallConfidence: ConfidenceLevel
  overallConfidenceScore: number
  fieldConsensus: FieldConsensus[]
  sources: SingleSourceResult[]
  explanation: {
    differences: string[]
    recommendations: string[]
    notes: string[]
  }
}

export const ipLookupApi = {
  getSources: () => api.get<DataSourceInfo[]>('/ip-lookup/sources'),
  lookup: (ip: string) => api.get<IpLookupResult>(`/ip-lookup/${encodeURIComponent(ip)}`),
  batchLookup: (ips: string[]) => api.post<IpLookupResult[]>('/ip-lookup/batch', { ips })
}
