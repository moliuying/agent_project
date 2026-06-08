import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface FormulaRecognitionRequest {
  imageBase64: string
  outputFormat?: 'latex' | 'mathml' | 'asciimath' | 'all'
  subjectType?: 'math' | 'physics' | 'chemistry' | 'auto'
  writingMode?: 'handwritten' | 'printed' | 'auto'
}

export interface CharCandidate {
  value: string
  confidence: number
}

export interface CharSegment {
  char: string
  latex?: string
  confidence: number
  candidates: CharCandidate[]
  isLowConfidence: boolean
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface AutoCorrection {
  from: string
  to: string
  reason: string
  segmentIndex: number
}

export interface CorrectionSuggestion {
  id: string
  current: string
  suggested: string
  reason: string
  confidence: number
  segmentIndex?: number
}

export interface FormulaItem {
  id: string
  latex: string
  mathml: string
  asciimath: string
  plainText: string
  confidence: number
  lowConfidenceCount: number
  totalChars: number
  segments: CharSegment[]
  needsReview: boolean
  warnings: string[]
  autoCorrections: AutoCorrection[]
  correctionSuggestions: CorrectionSuggestion[]
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
    writingMode: 'handwritten' | 'printed' | 'mixed'
    handwritingQuality?: 'good' | 'fair' | 'poor'
    totalLowConfidence: number
    needsReviewCount: number
    totalAutoCorrections: number
    totalSuggestions: number
  }
  suggestions: string[]
}

export const formulaOcrApi = {
  recognize: (data: FormulaRecognitionRequest) =>
    api.post<FormulaRecognitionResponse>('/formula-recognition/recognize', data)
}
