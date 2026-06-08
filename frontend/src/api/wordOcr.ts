import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface WordExample {
  en: string
  zh: string
}

export interface WordItem {
  id: string
  word: string
  phonetic: string
  phoneticUk?: string
  phoneticUs?: string
  partOfSpeech: string
  definition: string
  definitionEn?: string
  examples: WordExample[]
  synonyms?: string[]
  antonyms?: string[]
  confidence: number
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface WordOcrRequest {
  imageBase64: string
  language?: 'en' | 'zh-en'
  includeExamples?: boolean
  includePhonetic?: boolean
}

export interface WordOcrResponse {
  success: boolean
  words: WordItem[]
  fullText: string
  processingTime: number
  imageAnalysis: {
    wordCount: number
    uniqueWordCount: number
    hasChinese: boolean
    qualityScore: number
    sceneType: 'book' | 'sign' | 'product' | 'document' | 'other'
    totalLowConfidence: number
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  }
  suggestions: string[]
}

export const wordOcrApi = {
  recognize: (data: WordOcrRequest) =>
    api.post<WordOcrResponse>('/word-ocr/recognize', data)
}
