import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface WordPronunciation {
  word: string
  phonetic?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tips?: string
  isCommonMistake?: boolean
  commonMistake?: string
}

export interface PronunciationFeedback {
  overallScore: number
  level: 'excellent' | 'good' | 'needs_practice'
  words: WordPronunciation[]
  practiceWords: string[]
  encouragingMessage: string
}

export interface ConversationMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  translation?: string
  correction?: string
  suggestions?: string[]
  usefulPhrases?: { phrase: string; meaning: string }[]
  pronunciation?: PronunciationFeedback
  timestamp: number
}

export interface ConversationScene {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  systemPrompt: string
  openingLines: string[]
  vocabulary: { word: string; meaning: string }[]
}

export interface ConversationState {
  sceneId: string
  sceneName: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  messages: ConversationMessage[]
  round: number
  score?: number
  totalWords?: number
  learnedPhrases?: { phrase: string; meaning: string }[]
}

export interface ChatRequest {
  userMessage: string
  currentState: ConversationState
}

export const englishConversationApi = {
  getScenes: () => api.get<ConversationScene[]>('/english-conversation/scenes'),
  getSceneById: (id: string) => api.get<ConversationScene>(`/english-conversation/scenes/${id}`),
  newConversation: (sceneId: string) =>
    api.post<ConversationState>('/english-conversation/new-conversation', { sceneId }),
  chat: (data: ChatRequest) => api.post<ConversationState>('/english-conversation/chat', data),
}
