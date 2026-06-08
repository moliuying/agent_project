import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface ExpandRequest {
  text: string
  style: string
  length: string
  tone: string
  audience: string
}

export interface ExpandResponse {
  result: string
  style: string
  length: string
  wordCount: number
}

export const aiTextExpanderApi = {
  expand: (data: ExpandRequest) => api.post<ExpandResponse>('/ai-text-expander/expand', data)
}
