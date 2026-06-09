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

export interface OutfitRecognitionRequest {
  imageBase64: string
  sceneType?: 'daily' | 'work' | 'date' | 'party' | 'travel' | 'sport'
  userGender?: 'male' | 'female' | 'unisex'
  extraNote?: string
  qualityHints?: ImageQualityHints
}

export interface ClothingItem {
  id: string
  category: string
  subCategory: string
  color: string
  colorHex: string
  style: string[]
  material: string
  season: string[]
  confidence: number
  position: 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory'
}

export interface OutfitSuggestion {
  id: string
  title: string
  description: string
  items: string[]
  occasion: string
  style: string[]
  colorScheme: string
  vibe: string
}

export interface SimilarStyle {
  id: string
  name: string
  brand: string
  priceRange: string
  description: string
  matchScore: number
  tags: string[]
}

export interface OutfitRecognitionResponse {
  clothingItems: ClothingItem[]
  overallStyle: {
    mainStyle: string
    subStyles: string[]
    colorPalette: { color: string; hex: string; ratio: number }[]
    seasonTag: string
    formalityLevel: string
  }
  suggestions: OutfitSuggestion[]
  similarStyles: SimilarStyle[]
  stylingTips: string[]
  shoppingTips: string[]
  overallConfidence: number
  qualityWarnings: string[]
}

export const outfitRecognitionApi = {
  recognize: (data: OutfitRecognitionRequest) =>
    api.post<OutfitRecognitionResponse>('/outfit-recognition/recognize', data)
}
