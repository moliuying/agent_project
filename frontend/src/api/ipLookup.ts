import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

export interface IpLookupResult {
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
  isLocal: boolean
}

export const ipLookupApi = {
  lookup: (ip: string) => api.get<IpLookupResult>(`/ip-lookup/${encodeURIComponent(ip)}`),
  batchLookup: (ips: string[]) => api.post<IpLookupResult[]>('/ip-lookup/batch', { ips })
}
