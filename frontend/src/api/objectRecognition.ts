import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface ImageQualityHints {
  sharpness: number
  brightness: number
  brightnessStatus: 'normal' | 'dark' | 'overexposed'
  contrast: number
  isScreenshot?: boolean
  multiPanelDetected?: boolean
  textDensity?: number
  hasUiElements?: boolean
  resolutionScore?: number
}

export type ObjectCategory =
  | 'plant'
  | 'animal'
  | 'food'
  | 'artifact'
  | 'architecture'
  | 'vehicle'
  | 'landmark'
  | 'instrument'
  | 'furniture'
  | 'other'

export type SafetyLevel = 'safe' | 'caution' | 'danger' | 'unknown'

export type ConfidenceLevel = 'very_high' | 'high' | 'medium' | 'low' | 'very_low'

export interface ConfidenceBreakdown {
  visualMatch: number
  featureMatch: number
  contextMatch: number
  overall: number
}

export interface ConfidenceExplanation {
  level: ConfidenceLevel
  levelLabel: string
  score: number
  breakdown: ConfidenceBreakdown
  reasons: string[]
  recommendation: string
}

export interface SafetyInfo {
  level: SafetyLevel
  levelLabel: string
  edibility: 'edible' | 'toxic' | 'medicinal' | 'unknown' | 'not_applicable'
  edibilityLabel: string
  warnings: string[]
  precautions: string[]
  emergencyAdvice?: string
}

export interface ConfusableSpecies {
  id: string
  name: string
  englishName: string
  similarity: number
  similarityLabel: string
  isToxic: boolean
  keyDifference: string
  dangerLevel?: SafetyLevel
  dangerDescription?: string
}

export interface ObjectRecognitionRequest {
  imageBase64: string
  extraNote?: string
  qualityHints?: ImageQualityHints
}

export interface RecognizedObject {
  id: string
  name: string
  englishName: string
  category: ObjectCategory
  categoryLabel: string
  confidence: number
  confidenceExplanation: ConfidenceExplanation
  description: string
  backgroundKnowledge: string
  taxonomy: {
    kingdom?: string
    phylum?: string
    class?: string
    order?: string
    family?: string
    genus?: string
    species?: string
  }
  keyFeatures: string[]
  distinguishingFeatures: string[]
  funFacts: string[]
  relatedObjects: {
    id: string
    name: string
    categoryLabel: string
    relation: string
  }[]
  tags: string[]
  safetyInfo: SafetyInfo
  confusableSpecies: ConfusableSpecies[]
}

export interface ObjectRecognitionResponse {
  primaryObject: RecognizedObject
  secondaryObjects: RecognizedObject[]
  sceneDescription: string
  overallConfidence: number
  qualityWarnings: string[]
  recognitionTimestamp: string
  safetyDisclaimer: string
  hasSafetyRisk: boolean
  highRiskWarning?: string
}

export const objectRecognitionApi = {
  recognize: (data: ObjectRecognitionRequest) =>
    api.post<ObjectRecognitionResponse>('/object-recognition/recognize', data)
}
