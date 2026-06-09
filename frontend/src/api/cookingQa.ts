import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type DifficultyLevel = '新手' | '进阶' | '专业'

export interface KitchenCondition {
  condition: string
  advice: string
}

export interface IngredientState {
  state: string
  advice: string
}

export interface TroubleshootingStep {
  step: string
  check: string
  solution: string
}

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
  kitchenConditions?: KitchenCondition[]
  ingredientStates?: IngredientState[]
  troubleshootingSteps?: TroubleshootingStep[]
}

export interface FollowUpQuestion {
  question: string
  options: string[]
}

export interface AskResponse {
  answer: string
  relatedTips: CookingTip[]
  relatedTechniques: string[]
  followUpQuestions?: FollowUpQuestion[]
}

export interface QaMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: number
  relatedTips?: CookingTip[]
  relatedTechniques?: string[]
  followUpQuestions?: FollowUpQuestion[]
}

export const cookingQaApi = {
  ask: (question: string) =>
    api.post<AskResponse>('/cooking-qa/ask', { question }),
  getSuggestedQuestions: () =>
    api.get<string[]>('/cooking-qa/suggested-questions'),
  getAllCookingTips: () =>
    api.get<CookingTip[]>('/cooking-qa/cooking-tips'),
}
