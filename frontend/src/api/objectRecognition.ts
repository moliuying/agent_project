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
  funFacts: string[]
  relatedObjects: {
    id: string
    name: string
    categoryLabel: string
    relation: string
  }[]
  tags: string[]
}

export interface ObjectRecognitionResponse {
  primaryObject: RecognizedObject
  secondaryObjects: RecognizedObject[]
  sceneDescription: string
  overallConfidence: number
  qualityWarnings: string[]
  recognitionTimestamp: string
}

export const objectRecognitionApi = {
  recognize: (data: ObjectRecognitionRequest) =>
    api.post<ObjectRecognitionResponse>('/object-recognition/recognize', data)
}
