import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type BookDifficulty = '入门' | '进阶' | '挑战'

export type DiscourseStyle =
  | 'solemn'
  | 'magical'
  | 'gentle'
  | 'profound'
  | 'classical'
  | 'grand'
  | 'scholarly'
  | 'melancholic'
  | 'playful'
  | 'light'

export interface StyleVisualConfig {
  label: string
  primaryColor: string
  gradientStart: string
  gradientEnd: string
  bgGradient: string
  bubbleBg: string
  bubbleBorder: string
  strongColor: string
  avatarIcon: string
  sectionBg: string
  sectionAccent: string
}

export const STYLE_VISUAL_CONFIGS: Record<DiscourseStyle, StyleVisualConfig> = {
  solemn: {
    label: '严肃沉郁',
    primaryColor: '#7f1d1d',
    gradientStart: '#991b1b',
    gradientEnd: '#451a03',
    bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#fecaca',
    strongColor: '#991b1b',
    avatarIcon: 'Reading',
    sectionBg: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
    sectionAccent: '#991b1b',
  },
  magical: {
    label: '魔幻诗意',
    primaryColor: '#7c3aed',
    gradientStart: '#7c3aed',
    gradientEnd: '#4f46e5',
    bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#ddd6fe',
    strongColor: '#6d28d9',
    avatarIcon: 'Moon',
    sectionBg: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
    sectionAccent: '#7c3aed',
  },
  gentle: {
    label: '温柔细腻',
    primaryColor: '#db2777',
    gradientStart: '#ec4899',
    gradientEnd: '#db2777',
    bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#fbcfe8',
    strongColor: '#be185d',
    avatarIcon: 'Reading',
    sectionBg: 'linear-gradient(135deg, #fef2f8 0%, #fff5f7 100%)',
    sectionAccent: '#db2777',
  },
  profound: {
    label: '深邃哲思',
    primaryColor: '#1d4ed8',
    gradientStart: '#2563eb',
    gradientEnd: '#1e40af',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#bfdbfe',
    strongColor: '#1d4ed8',
    avatarIcon: 'Star',
    sectionBg: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
    sectionAccent: '#1d4ed8',
  },
  classical: {
    label: '典雅厚重',
    primaryColor: '#b45309',
    gradientStart: '#d97706',
    gradientEnd: '#92400e',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#fde68a',
    strongColor: '#b45309',
    avatarIcon: 'Reading',
    sectionBg: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)',
    sectionAccent: '#b45309',
  },
  grand: {
    label: '宏大冷峻',
    primaryColor: '#0e7490',
    gradientStart: '#0891b2',
    gradientEnd: '#155e75',
    bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #f0f9ff 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#a5f3fc',
    strongColor: '#0e7490',
    avatarIcon: 'Cpu',
    sectionBg: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)',
    sectionAccent: '#0e7490',
  },
  scholarly: {
    label: '平实严谨',
    primaryColor: '#374151',
    gradientStart: '#4b5563',
    gradientEnd: '#1f2937',
    bgGradient: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#d1d5db',
    strongColor: '#374151',
    avatarIcon: 'Document',
    sectionBg: 'linear-gradient(135deg, #f9fafb 0%, #f5f5f4 100%)',
    sectionAccent: '#374151',
  },
  melancholic: {
    label: '华丽忧伤',
    primaryColor: '#9333ea',
    gradientStart: '#a855f7',
    gradientEnd: '#7e22ce',
    bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#e9d5ff',
    strongColor: '#7e22ce',
    avatarIcon: 'MoonNight',
    sectionBg: 'linear-gradient(135deg, #faf5ff 0%, #fdf4ff 100%)',
    sectionAccent: '#9333ea',
  },
  playful: {
    label: '俏皮活泼',
    primaryColor: '#f59e0b',
    gradientStart: '#f97316',
    gradientEnd: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#fde68a',
    strongColor: '#d97706',
    avatarIcon: 'Cpu',
    sectionBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fef2f2 100%)',
    sectionAccent: '#f59e0b',
  },
  light: {
    label: '轻松愉快',
    primaryColor: '#10b981',
    gradientStart: '#10b981',
    gradientEnd: '#059669',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
    bubbleBg: '#fff',
    bubbleBorder: '#a7f3d0',
    strongColor: '#059669',
    avatarIcon: 'Star',
    sectionBg: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
    sectionAccent: '#10b981',
  },
}

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
  discourseStyle: DiscourseStyle
}

export interface AskResponse {
  answer: string
  relatedBooks: BookInfo[]
  discussionPoints: string[]
  recommendedBooks: { title: string; author: string; reason: string }[]
  style: DiscourseStyle
}

export interface QaMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: number
  relatedBooks?: BookInfo[]
  discussionPoints?: string[]
  recommendedBooks?: { title: string; author: string; reason: string }[]
  style?: DiscourseStyle
}

export const literatureQaApi = {
  ask: (question: string) =>
    api.post<AskResponse>('/literature-qa/ask', { question }),
  getSuggestedQuestions: () =>
    api.get<string[]>('/literature-qa/suggested-questions'),
  getAllBooks: () =>
    api.get<BookInfo[]>('/literature-qa/books'),
}
