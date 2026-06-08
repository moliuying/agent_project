import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface FormulaRecognitionRequest {
  imageBase64: string
  outputFormat?: 'latex' | 'mathml' | 'asciimath' | 'all'
  subjectType?: 'math' | 'physics' | 'chemistry' | 'auto'
}

export interface FormulaItem {
  id: string
  latex: string
  mathml: string
  asciimath: string
  plainText: string
  confidence: number
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface FormulaRecognitionResponse {
  success: boolean
  formulas: FormulaItem[]
  fullText: string
  fullLatex: string
  processingTime: number
  imageAnalysis: {
    formulaCount: number
    hasText: boolean
    hasDiagram: boolean
    qualityScore: number
    suggestedSubject: string
  }
  suggestions: string[]
}

export const formulaOcrApi = {
  recognize: (data: FormulaRecognitionRequest) =>
    api.post<FormulaRecognitionResponse>('/formula-recognition/recognize', data)
}
