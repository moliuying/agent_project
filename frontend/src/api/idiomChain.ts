import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000
})

export interface IdiomInfo {
  word: string
  pinyin: string
  meaning: string
  example?: string
}

export interface ChainMessage {
  id: number
  role: 'user' | 'ai'
  word: string
  pinyin?: string
  meaning?: string
  timestamp: number
}

export type ErrorType = 'invalid_idiom' | 'already_used' | 'wrong_tail' | null

export interface GameState {
  chain: ChainMessage[]
  currentTail: string
  gameOver: boolean
  winner?: 'user' | 'ai' | 'draw'
  message?: string
  usedWords: string[]
  round: number
  errorType?: ErrorType
  errorDetail?: string
}

export interface SubmitRequest {
  userWord: string
  currentState: GameState
}

export const idiomChainApi = {
  newGame: () => api.get<GameState>('/idiom-chain/new-game'),
  submit: (data: SubmitRequest) => api.post<GameState>('/idiom-chain/submit', data),
  validate: (word: string) => api.get<{ valid: boolean; info?: IdiomInfo }>('/idiom-chain/validate', { params: { word } }),
  getHint: (tail: string, used: string[]) =>
    api.get<{ hint?: IdiomInfo; message?: string }>('/idiom-chain/hint', {
      params: { tail, used: used.join(',') }
    }),
  getAllIdioms: () => api.get<IdiomInfo[]>('/idiom-chain/idioms')
}
