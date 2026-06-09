import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface ScenePhrase {
  english: string
  chinese: string
  context?: string
  whenToUse?: string
  speaker?: string
}

export interface ScenePhraseGroup {
  stage: string
  stageEn: string
  description: string
  phrases: ScenePhrase[]
}

export interface ScenePattern {
  pattern: string
  example: string
  translation: string
  explanation: string
  whenToUse?: string
}

export interface SceneTip {
  title: string
  content: string
}

export interface SceneCandidate {
  id: string
  name: string
  nameEn: string
  icon: string
  description: string
  matchScore: number
  matchReasons: string[]
}

export interface SceneEnglishResponse {
  sceneName: string
  sceneNameEn: string
  briefIntroduction: string
  matchedScore: number
  isAmbiguous: boolean
  candidateScenes?: SceneCandidate[]
  clarificationHint?: string
  keyPhrases: ScenePhrase[]
  keyPhrasesGrouped?: ScenePhraseGroup[]
  commonPatterns: ScenePattern[]
  tips: SceneTip[]
  sampleDialogue: { role: 'A' | 'B'; english: string; chinese: string; context?: string }[]
}

export interface SceneInfo {
  id: string
  name: string
  nameEn: string
  icon: string
  category: string
  description: string
  keywords: string[]
  stages?: { stage: string; stageEn: string }[]
}

export const sceneEnglishApi = {
  getAllScenes: () => api.get<SceneInfo[]>('/scene-english/scenes'),
  searchScenes: (keyword: string) => api.get<SceneInfo[]>('/scene-english/scenes/search', { params: { keyword } }),
  getSceneById: (id: string) => api.get<SceneEnglishResponse>(`/scene-english/scenes/${id}`),
  query: (description: string) => api.post<SceneEnglishResponse>('/scene-english/query', { description }),
}
