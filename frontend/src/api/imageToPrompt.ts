import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface ImageToPromptRequest {
  imageBase64: string
  userDescription?: string
  targetStyle?: string
  detailLevel?: string
  includeNegative?: boolean
  outputLanguage?: string
}

export interface ImageAnalysis {
  mainSubject: string
  style: string[]
  composition: string[]
  colorPalette: string[]
  lighting: string[]
  mood: string[]
  details: string[]
  qualityTags: string[]
}

export interface ImageToPromptResponse {
  analysis: ImageAnalysis
  positivePrompt: string
  negativePrompt: string
  promptCn: string
  negativePromptCn: string
  suggestions: string[]
}

export const imageToPromptApi = {
  generate: (data: ImageToPromptRequest) =>
    api.post<ImageToPromptResponse>('/image-to-prompt/generate', data)
}
