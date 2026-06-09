import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface WorldRecord {
  id: string
  category: string
  title: string
  question: string
  answer: string
  background: string
  funFacts: string[]
  relatedRecords: string[]
  keywords: string[]
}

export interface WorldRecordAnswer {
  found: boolean
  record?: WorldRecord
  suggestions?: WorldRecord[]
  category?: string
  message?: string
}

export interface CategoryInfo {
  id: string
  name: string
  icon: string
  count: number
  description: string
}

export const worldRecordApi = {
  getCategories: () => api.get<CategoryInfo[]>('/world-record/categories'),
  getAllRecords: () => api.get<WorldRecord[]>('/world-record/all'),
  getRandomRecords: (count?: number) =>
    api.get<WorldRecord[]>('/world-record/random', {
      params: count ? { count } : {}
    }),
  getRecordsByCategory: (category: string) =>
    api.get<WorldRecord[]>(`/world-record/category/${encodeURIComponent(category)}`),
  getRecordById: (id: string) =>
    api.get<WorldRecord | { message: string }>(`/world-record/id/${id}`),
  ask: (question: string) =>
    api.post<WorldRecordAnswer>('/world-record/ask', { question })
}
