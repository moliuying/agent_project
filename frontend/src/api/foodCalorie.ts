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

export interface FoodCalorieRequest {
  imageBase64: string
  dietGoal?: 'lose' | 'gain' | 'maintain' | 'diabetes' | 'fitness'
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  extraNote?: string
  qualityHints?: ImageQualityHints
}

export interface FoodItem {
  id: string
  name: string
  category: string
  portion: string
  portionGrams: number
  confidence: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  giIndex?: number
  tags: string[]
}

export interface NutritionSummary {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  totalSugar: number
  proteinRatio: number
  carbsRatio: number
  fatRatio: number
}

export interface DietAdvice {
  id: string
  title: string
  description: string
  type: 'warning' | 'suggestion' | 'praise'
}

export interface FoodCalorieResponse {
  foodItems: FoodItem[]
  nutritionSummary: NutritionSummary
  mealAssessment: {
    score: number
    level: 'excellent' | 'good' | 'fair' | 'poor'
    description: string
  }
  dietAdvice: DietAdvice[]
  alternativeSuggestions: {
    id: string
    originalFood: string
    alternativeFood: string
    calorieDiff: number
    reason: string
  }[]
  overallConfidence: number
  qualityWarnings: string[]
}

export const foodCalorieApi = {
  recognize: (data: FoodCalorieRequest) =>
    api.post<FoodCalorieResponse>('/food-calorie/recognize', data)
}
