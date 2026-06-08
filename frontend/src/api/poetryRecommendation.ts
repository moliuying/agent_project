import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface Poem {
  id: number
  title: string
  author: string
  dynasty: string
  content: string
  translation?: string
  appreciation?: string
  tags: string[]
  category: 'song' | 'poem' | 'ci' | 'fu'
}

export interface ScoredPoem extends Poem {
  score: number
  matchReasons: string[]
}

export interface QuickTag {
  label: string
  keywords: string[]
}

export const poetryApi = {
  recommend: (query: string, limit?: number) =>
    api.get<ScoredPoem[]>('/poetry-recommendation/recommend', {
      params: { query, limit }
    }),

  getQuickTags: () =>
    api.get<QuickTag[]>('/poetry-recommendation/quick-tags'),

  getAllTags: () =>
    api.get<string[]>('/poetry-recommendation/tags'),

  getDynasties: () =>
    api.get<string[]>('/poetry-recommendation/dynasties'),

  getCategories: () =>
    api.get<Record<string, string>>('/poetry-recommendation/categories'),

  getById: (id: number) =>
    api.get<Poem>(`/poetry-recommendation/poem/${id}`),

  search: (keyword: string, limit?: number) =>
    api.get<Poem[]>('/poetry-recommendation/search', {
      params: { keyword, limit }
    }),

  getAll: (params?: { tag?: string; dynasty?: string; author?: string; category?: string }) =>
    api.get<Poem[]>('/poetry-recommendation', { params })
}
