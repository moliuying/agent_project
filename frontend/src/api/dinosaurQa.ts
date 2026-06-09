import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export type KnowledgeConfidence = 'consensus' | 'mainstream' | 'controversial' | 'hypothesis'

export const CONFIDENCE_LABEL: Record<KnowledgeConfidence, string> = {
  consensus: '学术共识',
  mainstream: '主流观点',
  controversial: '存在争议',
  hypothesis: '研究假说',
}

export const CONFIDENCE_COLOR: Record<KnowledgeConfidence, string> = {
  consensus: '#67c23a',
  mainstream: '#165DFF',
  controversial: '#e6a23c',
  hypothesis: '#f56c6c',
}

export const CONFIDENCE_DESCRIPTION: Record<KnowledgeConfidence, string> = {
  consensus: '已被绝大多数古生物学家认可的确定性结论',
  mainstream: '多数研究者支持，但仍存在少量不同意见',
  controversial: '学界存在明显分歧，尚无定论',
  hypothesis: '基于有限证据提出的研究假说，有待进一步验证',
}

export interface ResearchCitation {
  year: string
  researcher?: string
  institution?: string
  study?: string
  note?: string
}

export interface CredibilityInfo {
  confidence: KnowledgeConfidence
  lastUpdated: string
  citations: ResearchCitation[]
  caveats?: string[]
}

export interface DinosaurFact {
  title: string
  content: string
  category: string
  confidence?: KnowledgeConfidence
}

export interface DinosaurInfo {
  name: string
  nameEn: string
  pronunciation?: string
  period: string
  diet: '肉食' | '植食' | '杂食'
  length: string
  weight: string
  height?: string
  location: string
  taxonomy: string
  description: string
  features: string[]
  funFacts: string[]
  imageHint?: string
  confidence: KnowledgeConfidence
  lastUpdated: string
  citations: ResearchCitation[]
}

export interface AskResponse {
  answer: string
  relatedDinosaurs: DinosaurInfo[]
  relatedFacts: DinosaurFact[]
  credibility?: CredibilityInfo
}

export interface QaMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: number
  relatedDinosaurs?: DinosaurInfo[]
  relatedFacts?: DinosaurFact[]
  credibility?: CredibilityInfo
}

export const dinosaurQaApi = {
  ask: (question: string) =>
    api.post<AskResponse>('/dinosaur-qa/ask', { question }),
  getSuggestedQuestions: () =>
    api.get<string[]>('/dinosaur-qa/suggested-questions'),
  getAllDinosaurs: () =>
    api.get<DinosaurInfo[]>('/dinosaur-qa/dinosaurs'),
}
