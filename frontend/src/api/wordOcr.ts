import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface WordExample {
  en: string
  zh: string
}

export interface AlternateDefinition {
  meaning: string
  partOfSpeech: string
  context: string
}

export interface WordCandidate {
  word: string
  definition: string
  confidence: number
  reason: string
}

export type WordType = 'common' | 'brand' | 'technical' | 'proper' | 'compound' | 'ambiguous' | 'place'

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
  wordType: WordType
  wordTypeLabel: string
  field?: string
  contextHint?: string
  alternateDefinitions?: AlternateDefinition[]
  possibleMisspelling?: WordCandidate[]
  compoundComponents?: string[]
  relatedTerms?: string[]
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
  sceneType?: 'auto' | 'book' | 'sign' | 'product' | 'document'
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
    sceneLabel: string
    totalLowConfidence: number
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
    brandCount: number
    technicalTermCount: number
    properNounCount: number
    ambiguousCount: number
  }
  suggestions: string[]
}

export const wordOcrApi = {
  recognize: (data: WordOcrRequest) =>
    api.post<WordOcrResponse>('/word-ocr/recognize', data)
}
