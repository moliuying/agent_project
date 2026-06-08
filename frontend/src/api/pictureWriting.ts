import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export interface PictureWritingRequest {
  imageBase64: string
  userDescription?: string
  gradeLevel?: string
  wordCount?: string
  writingStyle?: string
  customRequirements?: string
  variantSeed?: number
}

export interface PictureSceneAnalysis {
  scene: string
  characters: string[]
  actions: string[]
  emotions: string[]
  time: string
  location: string
  details: string[]
}

export interface PictureWritingResponse {
  analysis: PictureSceneAnalysis
  content: string
  title: string
  gradeLevel: string
  wordCount: number
  keyWords: string[]
  writingTips: string[]
}

export const pictureWritingApi = {
  generate: (data: PictureWritingRequest) =>
    api.post<PictureWritingResponse>('/picture-writing/generate', data)
}
