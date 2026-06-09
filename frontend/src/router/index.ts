import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: '/menu',
        name: 'Menu',
        component: () => import('@/views/Menu.vue')
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/Menu.vue')
      },
      {
        path: '/loan-calculator',
        name: 'LoanCalculator',
        component: () => import('@/views/LoanCalculator.vue')
      },
      {
        path: '/random-picker',
        name: 'RandomPicker',
        component: () => import('@/views/RandomPicker.vue')
      },
      {
        path: '/holiday-calendar',
        name: 'HolidayCalendar',
        component: () => import('@/views/HolidayCalendar.vue')
      },
      {
        path: '/word-counter',
        name: 'WordCounter',
        component: () => import('@/views/WordCounter.vue')
      },
      {
        path: '/audio-clipper',
        name: 'AudioClipper',
        component: () => import('@/views/AudioClipper.vue')
      },
      {
        path: '/ip-lookup',
        name: 'IpLookup',
        component: () => import('@/views/IpLookup.vue')
      },
      {
        path: '/code-deobfuscator',
        name: 'CodeDeobfuscator',
        component: () => import('@/views/CodeDeobfuscator.vue')
      },
      {
        path: '/grid-paper',
        name: 'GridPaper',
        component: () => import('@/views/GridPaper.vue')
      },
      {
        path: '/websocket-debugger',
        name: 'WebSocketDebugger',
        component: () => import('@/views/WebSocketDebugger.vue')
      },
      {
        path: '/ai-art-prompts',
        name: 'AiArtPrompts',
        component: () => import('@/views/AiArtPrompts.vue')
      },
      {
        path: '/ai-text-expander',
        name: 'AiTextExpander',
        component: () => import('@/views/AiTextExpander.vue')
      },
      {
        path: '/python-code-samples',
        name: 'PythonCodeSamples',
        component: () => import('@/views/PythonCodeSamples.vue')
      },
      {
        path: '/thesis-writer',
        name: 'ThesisWriter',
        component: () => import('@/views/ThesisWriter.vue')
      },
      {
        path: '/excel-formula',
        name: 'ExcelFormula',
        component: () => import('@/views/ExcelFormula.vue')
      },
      {
        path: '/image-to-prompt',
        name: 'ImageToPrompt',
        component: () => import('@/views/ImageToPrompt.vue')
      },
      {
        path: '/idiom-chain',
        name: 'IdiomChain',
        component: () => import('@/views/IdiomChain.vue')
      },
      {
        path: '/formula-ocr',
        name: 'FormulaOcr',
        component: () => import('@/views/FormulaOcr.vue')
      },
      {
        path: '/picture-writing',
        name: 'PictureWriting',
        component: () => import('@/views/PictureWriting.vue')
      },
      {
        path: '/word-ocr',
        name: 'WordOcr',
        component: () => import('@/views/WordOcr.vue')
      },
      {
        path: '/english-conversation',
        name: 'EnglishConversation',
        component: () => import('@/views/EnglishConversation.vue')
      },
      {
        path: '/poetry-recommendation',
        name: 'PoetryRecommendation',
        component: () => import('@/views/PoetryRecommendation.vue')
      },
      {
        path: '/scene-english',
        name: 'SceneEnglish',
        component: () => import('@/views/SceneEnglish.vue')
      },
      {
        path: '/outfit-recognition',
        name: 'OutfitRecognition',
        component: () => import('@/views/OutfitRecognition.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
