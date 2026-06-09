import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type DifficultyLevel = '新手' | '进阶' | '专业'

export interface CookingTip {
  id: string
  title: string
  category: string
  summary: string
  steps: string[]
  keyPoints: string[]
  commonMistakes: string[]
  difficulty: DifficultyLevel
  tags: string[]
}

export interface AskResponse {
  answer: string
  relatedTips: CookingTip[]
  relatedTechniques: string[]
}

export interface QaMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: number
  relatedTips?: CookingTip[]
  relatedTechniques?: string[]
}

export const cookingQaApi = {
  ask: (question: string) =>
    api.post<AskResponse>('/cooking-qa/ask', { question }),
  getSuggestedQuestions: () =>
    api.get<string[]>('/cooking-qa/suggested-questions'),
  getAllCookingTips: () =>
    api.get<CookingTip[]>('/cooking-qa/cooking-tips'),
}
