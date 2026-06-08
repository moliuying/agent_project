import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type ExcelVersion = 'all' | '2010+' | '2016+' | '2019+' | '365+' | '2021+'

export interface VersionInfo {
  id: ExcelVersion
  label: string
  tip: string
  level: 'common' | 'low' | 'high' | 'newest'
}

export interface FormulaExample {
  description: string
  formula: string
  result?: string
  scenario: string
}

export interface ExcelFormula {
  id: string
  name: string
  category: string
  version: ExcelVersion
  syntax: string
  description: string
  arguments: { name: string; description: string; required: boolean }[]
  examples: FormulaExample[]
  keywords: string[]
  relatedFormulas: string[]
  tips: string[]
  compatibility?: string
}

export interface FormulaCategory {
  id: string
  label: string
  icon: string
  description: string
  count: number
}

export interface RecommendationResult {
  formulas: ExcelFormula[]
  explanation: string
  steps: string[]
}

export const excelFormulaApi = {
  getCategories: () => api.get<FormulaCategory[]>('/excel-formula/categories'),
  getVersions: () => api.get<VersionInfo[]>('/excel-formula/versions'),
  getAll: () => api.get<ExcelFormula[]>('/excel-formula'),
  getByCategory: (category: string) => api.get<ExcelFormula[]>(`/excel-formula/category/${category}`),
  search: (query: string) => api.get<ExcelFormula[]>('/excel-formula/search', { params: { q: query } }),
  recommend: (scenario: string) => api.get<RecommendationResult>('/excel-formula/recommend', { params: { scenario } }),
  getById: (id: string) => api.get<ExcelFormula>(`/excel-formula/id/${id}`)
}
