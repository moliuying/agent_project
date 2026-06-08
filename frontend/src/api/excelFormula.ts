import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

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
  syntax: string
  description: string
  arguments: { name: string; description: string; required: boolean }[]
  examples: FormulaExample[]
  keywords: string[]
  relatedFormulas: string[]
  tips: string[]
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
  getAll: () => api.get<ExcelFormula[]>('/excel-formula'),
  getByCategory: (category: string) => api.get<ExcelFormula[]>(`/excel-formula/category/${category}`),
  search: (query: string) => api.get<ExcelFormula[]>('/excel-formula/search', { params: { q: query } }),
  recommend: (scenario: string) => api.get<RecommendationResult>('/excel-formula/recommend', { params: { scenario } }),
  getById: (id: string) => api.get<ExcelFormula>(`/excel-formula/id/${id}`)
}
