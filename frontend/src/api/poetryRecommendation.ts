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
  inspiration?: string
  tags: string[]
  category: 'song' | 'poem' | 'ci' | 'fu'
  fameLevel: 1 | 2 | 3 | 4 | 5
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
  recommend: (query: string, limit?: number, minFame?: number, maxFame?: number) =>
    api.get<ScoredPoem[]>('/poetry-recommendation/recommend', {
      params: { query, limit, minFame, maxFame }
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

  search: (keyword: string, limit?: number, minFame?: number, maxFame?: number) =>
    api.get<Poem[]>('/poetry-recommendation/search', {
      params: { keyword, limit, minFame, maxFame }
    }),

  getAll: (params?: { tag?: string; dynasty?: string; author?: string; category?: string; minFame?: number; maxFame?: number }) =>
    api.get<Poem[]>('/poetry-recommendation', { params }),

  getInspiration: (count?: number) =>
    api.get<Poem[]>('/poetry-recommendation/inspiration', {
      params: { count }
    }),

  getRelatedByTheme: (id: number, limit?: number) =>
    api.get<Poem[]>(`/poetry-recommendation/related-theme/${id}`, {
      params: { limit }
    }),

  getRelatedByImagery: (imagery: string, limit?: number) =>
    api.get<Poem[]>('/poetry-recommendation/related-imagery', {
      params: { imagery, limit }
    })
}
