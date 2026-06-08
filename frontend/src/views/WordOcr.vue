<template>
  <div class="word-ocr">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#165DFF">
            <Camera />
          </el-icon>
          <span>拍照识别单词</span>
          <el-tag size="small" type="primary" class="header-tag">OCR · 音标 · 例句 · 品牌/术语识别</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传/拍摄图片" description="支持拍照或相册上传英文教材、路标、商品包装等" />
          <el-step title="AI 智能识别" description="自动识别品牌名、专业术语、复合词，区分多义项" />
          <el-step title="学习 & 收藏" description="查看场景释义、跟读发音、一键加入生词本" />
        </el-steps>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="24" :lg="12">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#165DFF">
                <Picture />
              </el-icon>
              <span>上传包含英文单词的图片</span>
            </div>
          </template>

          <div
            class="upload-area"
            :class="{ 'upload-area-active': isDragging, 'has-image': imagePreview }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <input
              ref="cameraInputRef"
              type="file"
              accept="image/*"
              capture="environment"
              style="display: none"
              @change="handleFileChange"
            />
            <div v-if="!imagePreview" class="upload-placeholder">
              <el-icon :size="64" color="#c0c4cc"><CameraFilled /></el-icon>
              <p class="upload-text">点击上传或拖拽图片到此处</p>
              <p class="upload-hint">支持教材页面、英文读物、路标、商品包装、产品说明等（≤10MB）</p>
              <div class="upload-btns">
                <el-button type="primary" size="default" @click.stop="triggerFileInput">
                  <el-icon><Upload /></el-icon>
                  上传图片
                </el-button>
                <el-button type="success" size="default" @click.stop="triggerCamera">
                  <el-icon><Camera /></el-icon>
                  拍照识别
                </el-button>
              </div>
            </div>
            <div v-else class="image-preview-container">
              <img :src="imagePreview" alt="单词图片预览" class="image-preview" />
              <div class="image-actions">
                <el-button type="danger" size="small" @click.stop="removeImage">
                  <el-icon><Delete /></el-icon>
                  移除
                </el-button>
                <el-button size="small" @click.stop="triggerFileInput">
                  <el-icon><Refresh /></el-icon>
                  更换
                </el-button>
                <el-button type="success" size="small" @click.stop="triggerCamera">
                  <el-icon><Camera /></el-icon>
                  重拍
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#e6a23c">
                <Setting />
              </el-icon>
              <span>识别设置</span>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="场景类型（选择场景可提升专业词、品牌名识别准确率）">
              <el-radio-group v-model="form.sceneType" size="default">
                <el-radio-button value="auto">
                  <el-icon><MagicStick /></el-icon>
                  自动检测
                </el-radio-button>
                <el-radio-button value="book">
                  <el-icon><Reading /></el-icon>
                  教材/读物
                </el-radio-button>
                <el-radio-button value="sign">
                  <el-icon><Guide /></el-icon>
                  路标/标识
                </el-radio-button>
                <el-radio-button value="product">
                  <el-icon><Goods /></el-icon>
                  商品包装
                </el-radio-button>
                <el-radio-button value="document">
                  <el-icon><Document /></el-icon>
                  文档/文件
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="输出选项">
              <el-checkbox-group v-model="form.outputOptions">
                <el-checkbox value="phonetic">显示音标（英式/美式）</el-checkbox>
                <el-checkbox value="examples">显示例句</el-checkbox>
                <el-checkbox value="synonyms">显示同义词/反义词</el-checkbox>
                <el-checkbox value="definitionEn">显示英文释义</el-checkbox>
                <el-checkbox value="relatedTerms">显示相关词汇</el-checkbox>
                <el-checkbox value="contextHint">显示场景/语境提示</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              class="recognize-btn"
              :loading="isRecognizing"
              :disabled="!imageBase64"
              @click="recognizeWords"
            >
              <el-icon v-if="!isRecognizing"><Search /></el-icon>
              {{ isRecognizing ? 'AI 正在识别单词...' : '开始识别单词' }}
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="12">
        <el-card v-if="recognitionResult" class="result-card">
          <template #header>
            <div class="card-header small result-header">
              <div class="header-left">
                <el-icon :size="18" :color="recognitionResult.imageAnalysis.totalLowConfidence > 0 ? '#e6a23c' : '#67c23a'">
                  <CircleCheckFilled v-if="recognitionResult.imageAnalysis.totalLowConfidence === 0" />
                  <Warning v-else />
                </el-icon>
                <span>识别结果</span>
                <el-tag size="small" type="success">
                  {{ recognitionResult.words.length }} 词 · {{ recognitionResult.processingTime }}ms
                </el-tag>
                <el-tag size="small" type="info">
                  {{ recognitionResult.imageAnalysis.sceneLabel }}
                </el-tag>
                <el-tag :type="difficultyType" size="small">
                  {{ difficultyLabel }}
                </el-tag>
              </div>
              <div class="header-right">
                <el-button size="small" @click="copyAllWords">
                  <el-icon><DocumentCopy /></el-icon>
                  复制全部
                </el-button>
                <el-button size="small" type="primary" @click="exportToVocab">
                  <el-icon><Collection /></el-icon>
                  导出生词本
                </el-button>
              </div>
            </div>
          </template>

          <el-alert
            v-if="recognitionResult.imageAnalysis.totalLowConfidence > 0"
            type="warning"
            :closable="false"
            show-icon
            class="review-alert"
            :title="`检测到 ${recognitionResult.imageAnalysis.totalLowConfidence} 个单词识别置信度较低，建议核对`"
            description="下方黄色标记的单词置信度较低，特别注意品牌名和专业术语"
          />

          <div class="analysis-section">
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="analysis-label">识别场景</span>
                <el-tag type="primary" effect="light">
                  {{ recognitionResult.imageAnalysis.sceneLabel }}
                </el-tag>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">图片质量</span>
                <el-progress
                  :percentage="recognitionResult.imageAnalysis.qualityScore"
                  :color="qualityProgressColor"
                  :show-text="true"
                  :stroke-width="10"
                />
              </div>
              <div class="analysis-item">
                <span class="analysis-label">单词数量</span>
                <span class="analysis-value">{{ recognitionResult.words.length }} 个</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">不重复单词</span>
                <span class="analysis-value">{{ recognitionResult.imageAnalysis.uniqueWordCount }} 个</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">难度等级</span>
                <el-tag :type="difficultyType" effect="light">{{ difficultyLabel }}</el-tag>
              </div>
              <div class="analysis-item" v-if="recognitionResult.imageAnalysis.brandCount > 0">
                <span class="analysis-label">品牌名称</span>
                <span class="analysis-value text-brand">{{ recognitionResult.imageAnalysis.brandCount }} 个</span>
              </div>
              <div class="analysis-item" v-if="recognitionResult.imageAnalysis.technicalTermCount > 0">
                <span class="analysis-label">专业术语</span>
                <span class="analysis-value text-technical">{{ recognitionResult.imageAnalysis.technicalTermCount }} 个</span>
              </div>
              <div class="analysis-item" v-if="recognitionResult.imageAnalysis.ambiguousCount > 0">
                <span class="analysis-label">多义词</span>
                <span class="analysis-value text-ambiguous">{{ recognitionResult.imageAnalysis.ambiguousCount }} 个</span>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="words-section">
            <div class="section-header">
              <h4 class="section-title">
                <el-icon :size="16"><Collection /></el-icon>
                识别到的单词
                <el-tag v-if="collectedCount > 0" type="success" size="small">已收藏 {{ collectedCount }}</el-tag>
              </h4>
              <div class="section-legend">
                <el-tag size="small" effect="dark" type="warning" class="legend-tag">品牌</el-tag>
                <el-tag size="small" effect="dark" type="danger" class="legend-tag">术语</el-tag>
                <el-tag size="small" effect="dark" type="info" class="legend-tag">复合词</el-tag>
                <el-tag size="small" effect="dark" type="primary" class="legend-tag">地名</el-tag>
                <el-tag size="small" effect="plain" type="warning" class="legend-tag">多义</el-tag>
              </div>
            </div>

            <div class="word-list">
              <div
                v-for="(word, index) in recognitionResult.words"
                :key="word.id"
                class="word-card"
                :class="[
                  `word-type-${word.wordType}`,
                  { 'low-confidence': word.confidence < 0.85, 'collected': collectedWords[word.id] }
                ]"
              >
                <div class="word-header">
                  <div class="word-header-left">
                    <span class="word-index">{{ index + 1 }}</span>
                    <h3 class="word-text">{{ word.word }}</h3>
                    <el-tag size="small" :type="getWordTypeColor(word.wordType)" effect="dark" class="word-type-tag">
                      {{ word.wordTypeLabel }}
                    </el-tag>
                    <el-tag v-if="word.field" size="small" type="info" effect="plain" class="field-tag">
                      <el-icon :size="12"><Aim /></el-icon>
                      {{ word.field }}
                    </el-tag>
                    <el-button link type="primary" size="small" class="speak-btn" @click="speakWord(word.word)">
                      <el-icon><VideoPlay /></el-icon>
                      发音
                    </el-button>
                  </div>
                  <div class="word-header-right">
                    <el-tag size="small" :type="getConfidenceType(word.confidence)">
                      {{ (word.confidence * 100).toFixed(0) }}%
                    </el-tag>
                    <el-button
                      size="small"
                      :type="collectedWords[word.id] ? 'success' : 'default'"
                      @click="toggleCollect(word)"
                    >
                      <el-icon>
                        <StarFilled v-if="collectedWords[word.id]" />
                        <Star v-else />
                      </el-icon>
                      {{ collectedWords[word.id] ? '已收藏' : '收藏' }}
                    </el-button>
                  </div>
                </div>

                <el-alert
                  v-if="word.wordType === 'brand' && word.compoundComponents && word.compoundComponents.length > 0"
                  type="error"
                  :closable="false"
                  show-icon
                  class="brand-split-warning"
                  title="⚠️ 品牌名特别提示：请勿按字面拆分理解！"
                >
                  <template #default>
                    <p class="brand-warning-text">
                      这是一个由普通单词组合而成的<strong>品牌名称</strong>，不要拆分为字面含义理解：
                    </p>
                    <div class="brand-components-demo">
                      <span
                        v-for="(comp, cIdx) in word.compoundComponents"
                        :key="cIdx"
                        class="comp-tag"
                      >{{ comp }} ≠ 字面意思</span>
                      <span class="comp-arrow">→</span>
                      <span class="comp-brand">{{ word.word }} 是品牌名整体</span>
                    </div>
                  </template>
                </el-alert>

                <div v-if="form.outputOptions.includes('contextHint') && word.contextHint" class="context-hint">
                  <el-icon color="#e6a23c" :size="14"><InfoFilled /></el-icon>
                  <span>场景提示：{{ word.contextHint }}</span>
                </div>

                <div v-if="form.outputOptions.includes('phonetic') && word.phonetic" class="phonetic-row">
                  <span v-if="word.phoneticUk" class="phonetic-item">
                    <el-tag size="small" effect="plain">UK</el-tag>{{ word.phoneticUk }}
                  </span>
                  <span v-if="word.phoneticUs" class="phonetic-item">
                    <el-tag size="small" effect="plain">US</el-tag>{{ word.phoneticUs }}
                  </span>
                </div>

                <div class="pos-row">
                  <el-tag size="small" type="info">{{ word.partOfSpeech }}</el-tag>
                </div>

                <div class="definition-row">
                  <p class="definition-zh">
                    <el-icon color="#165DFF"><ChatDotRound /></el-icon>
                    {{ word.definition }}
                  </p>
                  <p v-if="form.outputOptions.includes('definitionEn') && word.definitionEn" class="definition-en">
                    {{ word.definitionEn }}
                  </p>
                </div>

                <div v-if="word.alternateDefinitions && word.alternateDefinitions.length > 0" class="alternate-section">
                  <h5 class="alternate-title">
                    <el-icon :size="14" color="#e6a23c"><Warning /></el-icon>
                    其他可能释义（请根据图片语境判断）
                  </h5>
                  <div
                    v-for="(alt, altIdx) in word.alternateDefinitions"
                    :key="altIdx"
                    class="alternate-item"
                  >
                    <div class="alternate-header">
                      <el-tag size="small" type="warning" effect="plain">{{ alt.partOfSpeech }}</el-tag>
                      <span class="alternate-context">适用场景：{{ alt.context }}</span>
                    </div>
                    <p class="alternate-meaning">{{ alt.meaning }}</p>
                  </div>
                </div>

                <div v-if="form.outputOptions.includes('examples') && word.examples && word.examples.length > 0" class="examples-section">
                  <h5 class="examples-title">
                    <el-icon :size="14" color="#67c23a"><Notebook /></el-icon>
                    例句
                  </h5>
                  <div v-for="(ex, exIdx) in word.examples" :key="exIdx" class="example-item">
                    <p class="example-en">{{ ex.en }}</p>
                    <p class="example-zh">{{ ex.zh }}</p>
                  </div>
                </div>

                <div v-if="form.outputOptions.includes('synonyms') && (word.synonyms?.length || word.antonyms?.length)" class="synonyms-section">
                  <div v-if="word.synonyms?.length" class="synonym-group">
                    <span class="synonym-label">同义词：</span>
                    <el-tag v-for="(syn, sIdx) in word.synonyms" :key="sIdx" size="small" type="success" effect="plain" class="synonym-tag">
                      {{ syn }}
                    </el-tag>
                  </div>
                  <div v-if="word.antonyms?.length" class="synonym-group">
                    <span class="synonym-label">反义词：</span>
                    <el-tag v-for="(ant, aIdx) in word.antonyms" :key="aIdx" size="small" type="danger" effect="plain" class="synonym-tag">
                      {{ ant }}
                    </el-tag>
                  </div>
                </div>

                <div v-if="form.outputOptions.includes('relatedTerms') && word.relatedTerms && word.relatedTerms.length > 0" class="related-section">
                  <h5 class="related-title">
                    <el-icon :size="14" color="#722ed1"><Connection /></el-icon>
                    相关词汇
                  </h5>
                  <el-tag
                    v-for="(term, tIdx) in word.relatedTerms"
                    :key="tIdx"
                    size="small"
                    effect="plain"
                    class="related-tag"
                  >
                    {{ term }}
                  </el-tag>
                </div>

                <div v-if="word.possibleMisspelling && word.possibleMisspelling.length > 0" class="misspelling-section">
                  <el-alert
                    type="info"
                    :closable="false"
                    show-icon
                    class="misspelling-alert"
                    title="识别修正提示"
                  >
                    <template #default>
                      <p class="misspelling-intro">OCR 可能存在以下误识别，请结合图片实际内容判断：</p>
                      <div
                        v-for="(cand, cIdx) in word.possibleMisspelling"
                        :key="cIdx"
                        class="candidate-item"
                      >
                        <div class="candidate-row">
                          <span class="candidate-word">{{ cand.word }}</span>
                          <span class="candidate-def">— {{ cand.definition }}</span>
                        </div>
                        <p class="candidate-reason">{{ cand.reason }}</p>
                      </div>
                    </template>
                  </el-alert>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="suggestions-section">
            <h4 class="section-title">
              <el-icon :size="16" color="#e6a23c"><Warning /></el-icon>
              使用建议 · 重要提示优先展示
            </h4>
            <el-alert
              v-for="(tip, idx) in recognitionResult.suggestions"
              :key="idx"
              :type="getSuggestionType(tip)"
              :closable="false"
              show-icon
              :title="tip"
              class="tip-alert"
            />
          </div>
        </el-card>

        <el-card v-if="historyList.length > 0" class="history-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#909399"><Clock /></el-icon>
              <span>历史记录</span>
              <el-button link type="primary" size="small" @click="clearHistory">清空</el-button>
            </div>
          </template>
          <div class="history-list">
            <div
              v-for="(h, idx) in historyList"
              :key="idx"
              class="history-item"
              @click="loadFromHistory(h)"
            >
              <img :src="h.imagePreview" alt="历史图片" class="history-thumb" />
              <div class="history-info">
                <p class="history-time">{{ formatTime(h.timestamp) }}</p>
                <p class="history-desc">{{ h.sceneLabel }} · {{ h.wordCount }} 词</p>
                <p class="history-meta" :class="{ 'text-warning': h.lowConfidenceCount > 0 }">
                  {{ h.difficultyLabel }}
                  <template v-if="h.brandCount > 0"> · {{ h.brandCount }}品牌</template>
                  <template v-if="h.technicalCount > 0"> · {{ h.technicalCount }}术语</template>
                  <template v-if="h.lowConfidenceCount > 0"> · {{ h.lowConfidenceCount }}待核对</template>
                </p>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="!recognitionResult" class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><Picture /></el-icon>
            <p class="empty-text">上传包含英文单词的图片开始识别</p>
            <p class="empty-hint">自动识别品牌名、专业术语、复合词，区分多义项，标注所属领域，避免字面翻译错误</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain" type="warning">
                <el-icon><Goods /></el-icon>
                品牌名识别
              </el-tag>
              <el-tag size="small" effect="plain" type="danger">
                <el-icon><Aim /></el-icon>
                专业术语
              </el-tag>
              <el-tag size="small" effect="plain" type="info">
                <el-icon><Connection /></el-icon>
                复合词保护
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Microphone /></el-icon>
                英式/美式发音
              </el-tag>
              <el-tag size="small" effect="plain" type="warning">
                <el-icon><Warning /></el-icon>
                多义项消歧
              </el-tag>
              <el-tag size="small" effect="plain" type="success">
                <el-icon><Star /></el-icon>
                生词收藏
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Camera,
  CameraFilled,
  Picture,
  Upload,
  Delete,
  Refresh,
  Setting,
  MagicStick,
  Search,
  CircleCheckFilled,
  DocumentCopy,
  Warning,
  Clock,
  Reading,
  Guide,
  Goods,
  Document,
  Notebook,
  ChatDotRound,
  Collection,
  VideoPlay,
  Star,
  StarFilled,
  Microphone,
  Connection,
  Aim,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { wordOcrApi, type WordOcrResponse, type WordItem, type WordType } from '@/api/wordOcr'

const HISTORY_KEY = 'word_ocr_history'
const COLLECTED_KEY = 'word_ocr_collected'

interface HistoryItem {
  timestamp: number
  imagePreview: string
  sceneType: string
  sceneLabel: string
  wordCount: number
  difficultyLabel: string
  lowConfidenceCount: number
  brandCount: number
  technicalCount: number
  result: WordOcrResponse
}

const sceneLabelMap: Record<string, string> = {
  auto: '自动检测',
  book: '教材/读物',
  sign: '路标/标识',
  product: '商品包装',
  document: '文档/文件'
}

const difficultyLabelMap: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级'
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isRecognizing = ref(false)
const recognitionResult = ref<WordOcrResponse | null>(null)
const historyList = ref<HistoryItem[]>([])
const collectedWords = reactive<Record<string, boolean>>({})

const form = reactive({
  sceneType: 'auto' as 'auto' | 'book' | 'sign' | 'product' | 'document',
  outputOptions: ['phonetic', 'examples', 'synonyms', 'definitionEn', 'relatedTerms', 'contextHint'] as string[]
})

const collectedCount = computed(() => {
  if (!recognitionResult.value) return 0
  return recognitionResult.value.words.filter(w => collectedWords[w.id]).length
})

const difficultyLabel = computed(() => {
  if (!recognitionResult.value) return ''
  return difficultyLabelMap[recognitionResult.value.imageAnalysis.difficultyLevel] || '初级'
})

const difficultyType = computed((): 'success' | 'warning' | 'danger' => {
  if (!recognitionResult.value) return 'info'
  const map: Record<string, 'success' | 'warning' | 'danger'> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return map[recognitionResult.value.imageAnalysis.difficultyLevel] || 'info'
})

const qualityProgressColor = computed(() => {
  if (!recognitionResult.value) return '#c0c4cc'
  const q = recognitionResult.value.imageAnalysis.qualityScore
  if (q < 50) return '#f56c6c'
  if (q < 75) return '#e6a23c'
  return '#67c23a'
})

const getConfidenceType = (confidence: number): 'success' | 'warning' | 'danger' | 'info' => {
  if (confidence >= 0.9) return 'success'
  if (confidence >= 0.75) return 'warning'
  return 'danger'
}

const getWordTypeColor = (type: WordType): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const map: Record<WordType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    common: 'success',
    brand: 'warning',
    technical: 'danger',
    proper: 'primary',
    place: 'primary',
    compound: 'info',
    ambiguous: 'warning'
  }
  return map[type] || 'info'
}

const getSuggestionType = (tip: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (tip.includes('检测到连续出现') || tip.startsWith('⚠️')) return 'danger'
  if (tip.includes('品牌') || tip.includes('专业术语') || tip.includes('多义') || tip.includes('拆分')) return 'warning'
  if (tip.includes('置信度较低')) return 'warning'
  return 'info'
}

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) {
      historyList.value = JSON.parse(stored).slice(0, 10)
    }
    const collected = localStorage.getItem(COLLECTED_KEY)
    if (collected) {
      const list = JSON.parse(collected) as string[]
      list.forEach(id => { collectedWords[id] = true })
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList.value.slice(0, 10)))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

const saveCollected = () => {
  try {
    const ids = Object.keys(collectedWords).filter(id => collectedWords[id])
    localStorage.setItem(COLLECTED_KEY, JSON.stringify(ids))
  } catch (e) {
    console.error('Failed to save collected words:', e)
  }
}

const clearHistory = () => {
  historyList.value = []
  saveHistory()
  ElMessage.success('历史记录已清空')
}

const loadFromHistory = (h: HistoryItem) => {
  imagePreview.value = h.imagePreview
  imageBase64.value = h.imagePreview.split(',')[1] || h.imagePreview
  recognitionResult.value = h.result
  form.sceneType = h.sceneType as any
  ElMessage.success('已加载历史记录')
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  loadHistory()
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const triggerCamera = () => {
  cameraInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    imagePreview.value = dataUrl
    imageBase64.value = dataUrl.split(',')[1] || dataUrl
    recognitionResult.value = null
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  recognitionResult.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  if (cameraInputRef.value) {
    cameraInputRef.value.value = ''
  }
}

const recognizeWords = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传包含单词的图片')
    return
  }

  isRecognizing.value = true
  recognitionResult.value = null

  try {
    const response = await wordOcrApi.recognize({
      imageBase64: imageBase64.value,
      language: 'en',
      includeExamples: form.outputOptions.includes('examples'),
      includePhonetic: form.outputOptions.includes('phonetic'),
      sceneType: form.sceneType
    })

    recognitionResult.value = response.data

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      sceneType: form.sceneType,
      sceneLabel: sceneLabelMap[form.sceneType] || '自动检测',
      wordCount: response.data.words.length,
      difficultyLabel: difficultyLabelMap[response.data.imageAnalysis.difficultyLevel],
      lowConfidenceCount: response.data.imageAnalysis.totalLowConfidence,
      brandCount: response.data.imageAnalysis.brandCount,
      technicalCount: response.data.imageAnalysis.technicalTermCount,
      result: JSON.parse(JSON.stringify(response.data))
    })
    saveHistory()

    const specialCounts: string[] = []
    if (response.data.imageAnalysis.brandCount > 0) specialCounts.push(`${response.data.imageAnalysis.brandCount}个品牌名`)
    if (response.data.imageAnalysis.technicalTermCount > 0) specialCounts.push(`${response.data.imageAnalysis.technicalTermCount}个专业术语`)
    if (response.data.imageAnalysis.ambiguousCount > 0) specialCounts.push(`${response.data.imageAnalysis.ambiguousCount}个多义词`)

    let msg = `成功识别 ${response.data.words.length} 个单词！`
    if (specialCounts.length > 0) {
      msg += `（含 ${specialCounts.join('、')}）`
    }
    if (response.data.imageAnalysis.totalLowConfidence > 0) {
      ElMessage.warning(`${msg}，其中 ${response.data.imageAnalysis.totalLowConfidence} 个需要核对`)
    } else {
      ElMessage.success(msg)
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '识别失败，请稍后重试')
  } finally {
    isRecognizing.value = false
  }
}

const speakWord = (word: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  } else {
    ElMessage.warning('当前浏览器不支持语音合成功能')
  }
}

const toggleCollect = (word: WordItem) => {
  if (collectedWords[word.id]) {
    delete collectedWords[word.id]
    ElMessage.info(`已取消收藏「${word.word}」`)
  } else {
    collectedWords[word.id] = true
    ElMessage.success(`已收藏「${word.word}」`)
  }
  saveCollected()
}

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label}已复制到剪贴板`)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success(`${label}已复制到剪贴板`)
  }
}

const copyAllWords = () => {
  if (!recognitionResult.value) return
  const wordStr = recognitionResult.value.words.map(w => {
    const lines: string[] = []
    lines.push(`${w.word}  【${w.wordTypeLabel}${w.field ? ' · ' + w.field : ''}】`)
    if (w.phonetic) lines.push(`${w.phonetic}`)
    lines.push(`${w.partOfSpeech}  ${w.definition}`)
    if (w.alternateDefinitions && w.alternateDefinitions.length > 0) {
      lines.push('其他释义：')
      w.alternateDefinitions.forEach(alt => {
        lines.push(`  - [${alt.context}] ${alt.meaning}`)
      })
    }
    if (w.contextHint) lines.push(`提示：${w.contextHint}`)
    if (w.examples && w.examples.length > 0 && form.outputOptions.includes('examples')) {
      lines.push('例句：')
      w.examples.forEach(ex => {
        lines.push(`  ${ex.en}`)
        lines.push(`  ${ex.zh}`)
      })
    }
    return lines.join('\n')
  }).join('\n\n---\n\n')
  copyToClipboard(wordStr, '全部单词')
}

const exportToVocab = () => {
  if (!recognitionResult.value) return
  const words = recognitionResult.value.words
  const vocab = words.map(w => {
    const typeInfo = w.wordType !== 'common' ? `【${w.wordTypeLabel}】` : ''
    return `${w.word}\t${typeInfo}${w.definition}\t${w.phonetic || ''}`
  }).join('\n')
  const header = '单词\t释义\t音标\n'
  copyToClipboard(header + vocab, '生词本格式')
}
</script>

<style scoped>
.word-ocr {
  max-width: 1400px;
  margin: 0 auto;
}

.header-card { margin-bottom: 20px; }

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.card-header.small { font-size: 15px; }

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.intro-section { margin-bottom: 10px; }
.intro-steps { padding: 10px 0; }

.upload-card,
.config-card,
.result-card,
.history-card,
.empty-result-card { margin-bottom: 20px; }

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-area:hover,
.upload-area-active {
  border-color: #165DFF;
  background-color: #f0f7ff;
}

.upload-area.has-image {
  padding: 0;
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.upload-btns {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.image-preview-container {
  position: relative;
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.image-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 8px;
}

.config-form { margin-top: 8px; }

.recognize-btn {
  width: 100%;
  margin-top: 12px;
  min-height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.result-header { justify-content: space-between; }

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  gap: 8px;
}

.review-alert { margin-bottom: 16px; }

.analysis-section { margin-bottom: 8px; }

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.analysis-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 12px;
}

.analysis-label {
  display: block;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 4px;
}

.analysis-value {
  display: block;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  margin-top: 4px;
  text-align: center;
}

.text-warning { color: #e6a23c !important; }
.text-brand { color: #e6a23c !important; }
.text-technical { color: #f56c6c !important; }
.text-ambiguous { color: #722ed1 !important; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-legend {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.legend-tag { margin: 0; }

.word-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.word-card {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}

.word-card.low-confidence {
  border-color: #faad14;
  background: linear-gradient(180deg, #fffbe6 0%, #fafbfc 100%);
}

.word-card.collected { border-color: #67c23a; }

.word-card.word-type-brand {
  border-left: 4px solid #e6a23c;
}

.word-card.word-type-technical {
  border-left: 4px solid #f56c6c;
}

.word-card.word-type-compound {
  border-left: 4px solid #909399;
}

.word-card.word-type-place,
.word-card.word-type-proper {
  border-left: 4px solid #165DFF;
}

.word-card.word-type-ambiguous {
  border-left: 4px dashed #e6a23c;
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}

.word-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.word-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #165DFF;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.word-text {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.word-type-tag {
  margin: 0 2px;
}

.field-tag {
  margin: 0 2px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.speak-btn { font-size: 12px !important; }

.context-hint {
  background: #fff7e6;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #874d00;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.5;
}

.context-hint span { flex: 1; }

.brand-split-warning {
  margin-bottom: 10px !important;
  border-radius: 8px !important;
  border: 2px solid #f56c6c !important;
}
.brand-split-warning :deep(.el-alert__title) {
  font-weight: 700 !important;
  font-size: 14px !important;
  color: #c45656 !important;
}
.brand-warning-text {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}
.brand-warning-text strong {
  color: #f56c6c;
  font-weight: 700;
}
.brand-components-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.comp-tag {
  background: #fef0f0;
  color: #c45656;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid #fbc4c4;
}
.comp-arrow {
  color: #f56c6c;
  font-weight: 700;
  font-size: 14px;
}
.comp-brand {
  background: #f56c6c;
  color: #fff;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 700;
}

.phonetic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 6px;
}

.phonetic-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Lucida Sans Unicode', Arial, sans-serif;
  color: #606266;
  font-size: 14px;
}

.pos-row { margin-bottom: 4px; }

.definition-row { margin-bottom: 6px; }

.definition-zh {
  font-size: 15px;
  color: #303133;
  margin: 0 0 3px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.6;
}

.definition-en {
  font-size: 13px;
  color: #909399;
  margin: 0;
  padding-left: 22px;
  font-style: italic;
  line-height: 1.5;
}

.alternate-section {
  margin-top: 10px;
  padding: 12px;
  background: #fff7e6;
  border-radius: 8px;
  border: 1px dashed #ffd591;
}

.alternate-title {
  font-size: 13px;
  font-weight: 600;
  color: #ad6800;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.alternate-item {
  background: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 6px;
}

.alternate-item:last-child { margin-bottom: 0; }

.alternate-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.alternate-context {
  font-size: 12px;
  color: #909399;
}

.alternate-meaning {
  font-size: 14px;
  color: #303133;
  margin: 0;
  line-height: 1.5;
}

.examples-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.examples-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.example-item {
  background: #fff;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-left: 3px solid #67c23a;
}

.example-item:last-child { margin-bottom: 0; }

.example-en {
  font-size: 14px;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.6;
}

.example-zh {
  font-size: 13px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

.synonyms-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.synonym-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.synonym-group:last-child { margin-bottom: 0; }

.synonym-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.synonym-tag { margin: 2px 4px 2px 0; }

.related-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.related-title {
  font-size: 13px;
  font-weight: 600;
  color: #722ed1;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.related-tag {
  margin: 2px 6px 2px 0;
  background: #f9f0ff;
  border-color: #d3adf7;
  color: #531dab;
}

.misspelling-section {
  margin-top: 12px;
}

.misspelling-alert { padding: 12px; }

.misspelling-intro {
  font-size: 13px;
  color: #606266;
  margin: 0 0 8px 0;
}

.candidate-item {
  background: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 6px;
}

.candidate-item:last-child { margin-bottom: 0; }

.candidate-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 3px;
}

.candidate-word {
  font-weight: 600;
  color: #165DFF;
  font-size: 14px;
}

.candidate-def {
  font-size: 13px;
  color: #303133;
}

.candidate-reason {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.tip-alert { margin-bottom: 8px; }
.tip-alert:last-child { margin-bottom: 0; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover { background: #f5f7fa; }

.history-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.history-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.history-desc {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin: 0;
}

.history-meta {
  font-size: 12px;
  color: #67c23a;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin: 0;
  font-weight: 500;
}

.empty-hint {
  font-size: 13px;
  color: #909399;
  margin: 0;
  max-width: 420px;
  line-height: 1.6;
}

.feature-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}
</style>
