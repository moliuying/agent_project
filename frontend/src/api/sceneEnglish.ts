import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface ScenePhrase {
  english: string
  chinese: string
  context?: string
}

export interface ScenePattern {
  pattern: string
  example: string
  translation: string
  explanation: string
}

export interface SceneTip {
  title: string
  content: string
}

export interface SceneEnglishResponse {
  sceneName: string
  sceneNameEn: string
  briefIntroduction: string
  keyPhrases: ScenePhrase[]
  commonPatterns: ScenePattern[]
  tips: SceneTip[]
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string }[]
}

export interface SceneInfo {
  id: string
  name: string
  nameEn: string
  icon: string
  category: string
  description: string
  keywords: string[]
}

export const sceneEnglishApi = {
  getAllScenes: () => api.get<SceneInfo[]>('/scene-english/scenes'),
  searchScenes: (keyword: string) => api.get<SceneInfo[]>('/scene-english/scenes/search', { params: { keyword } }),
  getSceneById: (id: string) => api.get<SceneEnglishResponse>(`/scene-english/scenes/${id}`),
  query: (description: string) => api.post<SceneEnglishResponse>('/scene-english/query', { description }),
}
