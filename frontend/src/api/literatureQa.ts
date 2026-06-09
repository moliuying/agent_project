import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type BookDifficulty = '入门' | '进阶' | '挑战'

export interface BookInfo {
  title: string
  author: string
  authorNationality?: string
  year?: string
  genre: string[]
  originalLanguage?: string
  summary: string
  themes: string[]
  iconicQuotes: { quote: string; character?: string; chapter?: string }[]
  readingTips: string[]
  similarBooks: { title: string; author: string; reason: string }[]
  tags: string[]
  difficulty: BookDifficulty
  emotionalTone: string
}

export interface AskResponse {
  answer: string
  relatedBooks: BookInfo[]
  discussionPoints: string[]
  recommendedBooks: { title: string; author: string; reason: string }[]
}

export interface QaMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: number
  relatedBooks?: BookInfo[]
  discussionPoints?: string[]
  recommendedBooks?: { title: string; author: string; reason: string }[]
}

export const literatureQaApi = {
  ask: (question: string) =>
    api.post<AskResponse>('/literature-qa/ask', { question }),
  getSuggestedQuestions: () =>
    api.get<string[]>('/literature-qa/suggested-questions'),
  getAllBooks: () =>
    api.get<BookInfo[]>('/literature-qa/books'),
}
