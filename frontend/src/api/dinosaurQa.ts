import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface DinosaurFact {
  title: string
  content: string
  category: string
}

export interface DinosaurInfo {
  name: string
  nameEn: string
  pronunciation?: string
  period: string
  diet: '肉食' | '植食' | '杂食'
  length: string
  weight: string
  height?: string
  location: string
  taxonomy: string
  description: string
  features: string[]
  funFacts: string[]
  imageHint?: string
}

export interface AskResponse {
  answer: string
  relatedDinosaurs: DinosaurInfo[]
  relatedFacts: DinosaurFact[]
}

export interface QaMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: number
  relatedDinosaurs?: DinosaurInfo[]
  relatedFacts?: DinosaurFact[]
}

export const dinosaurQaApi = {
  ask: (question: string) =>
    api.post<AskResponse>('/dinosaur-qa/ask', { question }),
  getSuggestedQuestions: () =>
    api.get<string[]>('/dinosaur-qa/suggested-questions'),
  getAllDinosaurs: () =>
    api.get<DinosaurInfo[]>('/dinosaur-qa/dinosaurs'),
}
