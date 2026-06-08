import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000
})

export interface GenerateRequest {
  topic: string
  researchDirection: string
  sectionType: string
  academicLevel: string
  wordCount: string
  citationStyle: string
  discipline: string
  paperType: string
  customRequirements?: string
}

export interface GenerateResponse {
  result: string
  sectionType: string
  academicLevel: string
  discipline: string
  paperType: string
  wordCount: number
  outline: string[]
}

export const thesisWriterApi = {
  generate: (data: GenerateRequest) => api.post<GenerateResponse>('/thesis-writer/generate', data)
}
