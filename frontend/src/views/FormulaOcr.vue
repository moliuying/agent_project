<template>
  <div class="formula-ocr">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#165DFF">
            <Camera />
          </el-icon>
          <span>拍照识别公式</span>
          <el-tag size="small" type="primary" class="header-tag">手写/印刷 · 智能识别 · 多格式输出</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传/拍摄图片" description="支持拍照或从相册上传公式图片" />
          <el-step title="选择类型" description="选择手写/印刷 + 学科，提升准确率" />
          <el-step title="AI 识别 & 核对" description="标红可疑字符，候选答案快速修正" />
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
              <span>上传公式图片</span>
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
              <p class="upload-hint">支持 JPG、PNG、WebP 等常见图片格式（≤10MB）</p>
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
              <img :src="imagePreview" alt="公式图片预览" class="image-preview" />
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
            <el-form-item label="书写类型（强烈建议选择，可显著提升识别准确率）">
              <el-radio-group v-model="form.writingMode" size="default">
                <el-radio-button value="auto">
                  <el-icon><MagicStick /></el-icon>
                  自动检测
                </el-radio-button>
                <el-radio-button value="printed">
                  <el-icon><Document /></el-icon>
                  印刷体
                </el-radio-button>
                <el-radio-button value="handwritten">
                  <el-icon><EditPen /></el-icon>
                  手写体
                </el-radio-button>
              </el-radio-group>
              <div v-if="form.writingMode === 'handwritten'" class="writing-mode-tip">
                <el-alert
                  type="warning"
                  :closable="false"
                  show-icon
                  title="手写模式提示"
                  description="已启用手写识别增强，系统将针对手写字体的连笔、潦草、易混字符进行特殊处理。识别后请重点核对标红的低置信度字符。"
                />
              </div>
            </el-form-item>

            <el-form-item label="学科类型（选择学科可提升识别准确率）">
              <el-radio-group v-model="form.subjectType" size="default">
                <el-radio-button value="auto">
                  <el-icon><MagicStick /></el-icon>
                  自动识别
                </el-radio-button>
                <el-radio-button value="math">
                  <el-icon><Calculator /></el-icon>
                  数学
                </el-radio-button>
                <el-radio-button value="physics">
                  <el-icon><Cpu /></el-icon>
                  物理
                </el-radio-button>
                <el-radio-button value="chemistry">
                  <el-icon><Coin /></el-icon>
                  化学
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="输出格式">
              <el-checkbox-group v-model="form.outputFormats">
                <el-checkbox value="text">纯文本</el-checkbox>
                <el-checkbox value="latex">LaTeX 公式</el-checkbox>
                <el-checkbox value="asciimath">AsciiMath</el-checkbox>
                <el-checkbox value="mathml">MathML</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="辅助功能">
              <el-switch
                v-model="form.reviewMode"
                active-text="逐字核对模式"
                inactive-text="标准模式"
              />
              <div v-if="form.reviewMode" class="writing-mode-tip">
                <el-alert
                  type="info"
                  :closable="false"
                  show-icon
                  title="逐字核对模式"
                  description="识别完成后将逐个字符展示置信度和候选答案，方便逐项核对确认。"
                />
              </div>
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              class="recognize-btn"
              :loading="isRecognizing"
              :disabled="!imageBase64"
              @click="recognizeFormula"
            >
              <el-icon v-if="!isRecognizing"><Search /></el-icon>
              {{ isRecognizing ? 'AI 正在识别公式...' : '开始识别公式' }}
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="12">
        <el-card v-if="recognitionResult" class="result-card">
          <template #header>
            <div class="card-header small result-header">
              <div class="header-left">
                <el-icon :size="18" :color="recognitionResult.imageAnalysis.needsReviewCount > 0 ? '#e6a23c' : '#67c23a'">
                  <CircleCheckFilled v-if="recognitionResult.imageAnalysis.needsReviewCount === 0" />
                  <Warning v-else />
                </el-icon>
                <span>识别结果</span>
                <el-tag size="small" type="success">
                  {{ recognitionResult.formulas.length }} 个公式 · {{ recognitionResult.processingTime }}ms
                </el-tag>
                <el-tag v-if="recognitionResult.imageAnalysis.writingMode === 'handwritten'" size="small" type="warning">
                  <el-icon><EditPen /></el-icon>
                  手写体
                </el-tag>
                <el-tag v-else size="small" type="info">
                  <el-icon><Document /></el-icon>
                  印刷体
                </el-tag>
                <el-tag
                  v-if="recognitionResult.imageAnalysis.handwritingQuality"
                  :type="handwritingQualityType"
                  size="small"
                >
                  书写质量: {{ handwritingQualityLabel }}
                </el-tag>
              </div>
            </div>
          </template>

          <el-alert
            v-if="recognitionResult.imageAnalysis.needsReviewCount > 0"
            type="warning"
            :closable="false"
            show-icon
            class="review-alert"
            :title="`检测到 ${recognitionResult.imageAnalysis.needsReviewCount} 个公式需要核对，共 ${recognitionResult.imageAnalysis.totalLowConfidence} 个低置信度字符`"
            description="下方红色标记的字符识别置信度较低，请点击字符查看候选答案快速修正"
          />

          <div class="analysis-section">
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="analysis-label">建议学科</span>
                <el-tag type="primary" effect="light">
                  {{ recognitionResult.imageAnalysis.suggestedSubject }}
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
                <span class="analysis-label">公式数量</span>
                <span class="analysis-value">{{ recognitionResult.formulas.length }} 个</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">需核对</span>
                <span class="analysis-value" :class="{ 'text-warning': recognitionResult.imageAnalysis.needsReviewCount > 0 }">
                  {{ recognitionResult.imageAnalysis.needsReviewCount }} 个
                </span>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="formulas-section">
            <div class="section-header">
              <h4 class="section-title">
                <el-icon :size="16"><EditPen /></el-icon>
                识别到的公式
                <el-tag
                  v-if="recognitionResult.imageAnalysis.totalLowConfidence > 0"
                  type="danger"
                  size="small"
                >
                  {{ recognitionResult.imageAnalysis.totalLowConfidence }} 个低置信度字符
                </el-tag>
              </h4>
              <div class="section-actions">
                <el-button type="primary" size="small" @click="copyAllLatex">
                  <el-icon><DocumentCopy /></el-icon>
                  复制全部 LaTeX
                </el-button>
                <el-button type="success" size="small" @click="copyAllText">
                  <el-icon><DocumentCopy /></el-icon>
                  复制全部文本
                </el-button>
              </div>
            </div>

            <div class="formula-list">
              <div
                v-for="(formula, index) in recognitionResult.formulas"
                :key="formula.id"
                class="formula-item"
                :class="{ 'needs-review': formula.needsReview }"
              >
                <div class="formula-header">
                  <div class="formula-header-left">
                    <span class="formula-index">公式 {{ index + 1 }}</span>
                    <el-tag size="small" :type="getConfidenceType(formula.confidence)">
                      置信度 {{ (formula.confidence * 100).toFixed(0) }}%
                    </el-tag>
                    <el-tag
                      v-if="formula.lowConfidenceCount > 0"
                      type="danger"
                      size="small"
                    >
                      {{ formula.lowConfidenceCount }} 个可疑字符
                    </el-tag>
                  </div>
                  <el-checkbox
                    v-model="checkedFormulas[formula.id]"
                    label="已核对"
                  />
                </div>

                <el-alert
                  v-for="(w, wi) in formula.warnings"
                  :key="wi"
                  type="warning"
                  :closable="false"
                  show-icon
                  size="small"
                  class="formula-warning"
                  :title="w"
                />

                <div class="highlighted-preview" v-if="form.reviewMode">
                  <span class="preview-label">字符级预览（点击可疑字符可快速替换）：</span>
                  <div class="char-display">
                    <span
                      v-for="(seg, sIdx) in formula.segments"
                      :key="sIdx"
                      class="char-seg"
                      :class="{
                        'low-conf': seg.isLowConfidence,
                        'medium-conf': !seg.isLowConfidence && seg.confidence < 0.9,
                        'high-conf': seg.confidence >= 0.9
                      }"
                      @click="openCharCandidates(formula, sIdx)"
                    >
                      {{ seg.char }}
                      <span v-if="seg.isLowConfidence" class="conf-badge">
                        {{ (seg.confidence * 100).toFixed(0) }}%
                      </span>
                    </span>
                  </div>
                </div>

                <el-popover
                  ref="charPopoverRef"
                  placement="bottom-start"
                  trigger="manual"
                  :width="320"
                  v-model="charPopoverVisible"
                >
                  <template v-if="activeCharSegment">
                    <div class="char-candidates-panel">
                      <div class="candidates-title">
                        <span>候选字符 - 当前：<strong class="current-char">{{ activeCharSegment.char }}</strong>（{{ (activeCharSegment.confidence * 100).toFixed(0) }}%）</span>
                      </div>
                      <div class="candidates-list">
                        <el-button
                          v-for="(cand, ci) in activeCharSegment.candidates"
                          :key="ci"
                          size="small"
                          :type="cand.value === activeCharSegment.char ? 'primary' : 'default'"
                          @click="applyCandidate(formula, activeSegIdx, cand.value)"
                        >
                          <span class="cand-char">{{ cand.value }}</span>
                          <span class="cand-conf">{{ (cand.confidence * 100).toFixed(0) }}%</span>
                        </el-button>
                      </div>
                      <div class="candidates-input">
                        <el-input
                          v-model="customChar"
                          size="small"
                          placeholder="或手动输入字符..."
                          maxlength="5"
                          style="flex: 1"
                        />
                        <el-button size="small" type="primary" @click="applyCustomChar(formula, activeSegIdx)">
                          确定
                        </el-button>
                      </div>
                    </div>
                  </template>
                </el-popover>

                <div v-if="form.outputFormats.includes('text')" class="formula-row">
                  <div class="formula-format-label">
                    <el-icon><Document /></el-icon>
                    纯文本
                  </div>
                  <div class="formula-content">
                    <el-input
                      v-model="formula.plainText"
                      type="textarea"
                      :rows="1"
                      resize="none"
                      class="formula-textarea"
                    />
                    <el-button
                      :type="copyingState[formula.id + '_text'] ? 'success' : 'primary'"
                      size="small"
                      @click="copyFormula(formula, 'plainText', formula.id + '_text')"
                    >
                      <el-icon>
                        <CircleCheckFilled v-if="copyingState[formula.id + '_text']" />
                        <DocumentCopy v-else />
                      </el-icon>
                      {{ copyingState[formula.id + '_text'] ? '已复制' : '复制' }}
                    </el-button>
                  </div>
                </div>

                <div v-if="form.outputFormats.includes('latex')" class="formula-row">
                  <div class="formula-format-label">
                    <el-icon><DataLine /></el-icon>
                    LaTeX
                  </div>
                  <div class="formula-content">
                    <el-input
                      v-model="formula.latex"
                      type="textarea"
                      :rows="1"
                      resize="none"
                      class="formula-textarea latex-textarea"
                    />
                    <el-button
                      :type="copyingState[formula.id + '_latex'] ? 'success' : 'primary'"
                      size="small"
                      @click="copyFormula(formula, 'latex', formula.id + '_latex')"
                    >
                      <el-icon>
                        <CircleCheckFilled v-if="copyingState[formula.id + '_latex']" />
                        <DocumentCopy v-else />
                      </el-icon>
                      {{ copyingState[formula.id + '_latex'] ? '已复制' : '复制' }}
                    </el-button>
                  </div>
                </div>

                <div v-if="form.outputFormats.includes('asciimath')" class="formula-row">
                  <div class="formula-format-label">
                    <el-icon><Operation /></el-icon>
                    AsciiMath
                  </div>
                  <div class="formula-content">
                    <el-input
                      v-model="formula.asciimath"
                      type="textarea"
                      :rows="1"
                      resize="none"
                      class="formula-textarea"
                    />
                    <el-button
                      :type="copyingState[formula.id + '_ascii'] ? 'success' : 'primary'"
                      size="small"
                      @click="copyFormula(formula, 'asciimath', formula.id + '_ascii')"
                    >
                      <el-icon>
                        <CircleCheckFilled v-if="copyingState[formula.id + '_ascii']" />
                        <DocumentCopy v-else />
                      </el-icon>
                      {{ copyingState[formula.id + '_ascii'] ? '已复制' : '复制' }}
                    </el-button>
                  </div>
                </div>

                <div v-if="form.outputFormats.includes('mathml')" class="formula-row">
                  <div class="formula-format-label">
                    <el-icon><Files /></el-icon>
                    MathML
                  </div>
                  <div class="formula-content">
                    <el-input
                      v-model="formula.mathml"
                      type="textarea"
                      :rows="2"
                      resize="none"
                      class="formula-textarea mathml-textarea"
                    />
                    <el-button
                      :type="copyingState[formula.id + '_mathml'] ? 'success' : 'primary'"
                      size="small"
                      @click="copyFormula(formula, 'mathml', formula.id + '_mathml')"
                    >
                      <el-icon>
                        <CircleCheckFilled v-if="copyingState[formula.id + '_mathml']" />
                        <DocumentCopy v-else />
                      </el-icon>
                      {{ copyingState[formula.id + '_mathml'] ? '已复制' : '复制' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="suggestions-section">
            <h4 class="section-title">
              <el-icon :size="16" color="#e6a23c"><Warning /></el-icon>
              使用建议
            </h4>
            <el-alert
              v-for="(tip, idx) in recognitionResult.suggestions"
              :key="idx"
              type="info"
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
                <p class="history-desc">{{ h.subjectLabel }} · {{ h.formulaCount }}个公式</p>
                <p class="history-meta" :class="{ 'text-warning': h.needsReviewCount > 0 }">
                  {{ h.writingModeLabel }} · {{ h.needsReviewCount > 0 ? h.needsReviewCount + '个待核对' : '已核对' }}
                </p>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="!recognitionResult" class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><Picture /></el-icon>
            <p class="empty-text">上传包含公式的图片开始识别</p>
            <p class="empty-hint">支持手写/印刷公式，智能标红可疑字符，候选答案一键替换</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain">
                <el-icon><Camera /></el-icon>
                拍照或上传图片
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><EditPen /></el-icon>
                手写/印刷体切换
              </el-tag>
              <el-tag size="small" effect="plain" type="warning">
                <el-icon><Warning /></el-icon>
                可疑字符自动标红
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><List /></el-icon>
                候选答案快速修正
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><DocumentCopy /></el-icon>
                一键复制多种格式
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Edit /></el-icon>
                识别后可编辑修正
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import {
  Camera,
  CameraFilled,
  Picture,
  Upload,
  Delete,
  Refresh,
  Setting,
  MagicStick,
  Calculator,
  Cpu,
  Coin,
  Search,
  CircleCheckFilled,
  DocumentCopy,
  EditPen,
  Document,
  DataLine,
  Operation,
  Files,
  Warning,
  Clock,
  List
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { formulaOcrApi, type FormulaRecognitionResponse, type FormulaItem, type CharSegment } from '@/api/formulaOcr'

const HISTORY_KEY = 'formula_ocr_history'

interface HistoryItem {
  timestamp: number
  imagePreview: string
  subjectType: string
  subjectLabel: string
  writingMode: string
  writingModeLabel: string
  formulaCount: number
  avgConfidence: number
  needsReviewCount: number
  result: FormulaRecognitionResponse
}

const subjectLabelMap: Record<string, string> = {
  auto: '自动识别',
  math: '数学',
  physics: '物理',
  chemistry: '化学'
}

const writingModeLabelMap: Record<string, string> = {
  auto: '自动检测',
  printed: '印刷体',
  handwritten: '手写体'
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isRecognizing = ref(false)
const recognitionResult = ref<FormulaRecognitionResponse | null>(null)
const historyList = ref<HistoryItem[]>([])
const checkedFormulas = reactive<Record<string, boolean>>({})

const charPopoverRef = ref<any>(null)
const charPopoverVisible = ref(false)
const activeCharSegment = ref<CharSegment | null>(null)
const activeSegIdx = ref<number>(-1)
const customChar = ref('')

const copyingState = reactive<Record<string, boolean>>({})

const form = reactive({
  subjectType: 'auto' as 'math' | 'physics' | 'chemistry' | 'auto',
  writingMode: 'auto' as 'handwritten' | 'printed' | 'auto',
  outputFormats: ['text', 'latex'] as string[],
  reviewMode: true
})

const handwritingQualityLabel = computed(() => {
  if (!recognitionResult.value?.imageAnalysis.handwritingQuality) return ''
  const map: Record<string, string> = {
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return map[recognitionResult.value.imageAnalysis.handwritingQuality]
})

const handwritingQualityType = computed((): 'success' | 'warning' | 'danger' => {
  if (!recognitionResult.value?.imageAnalysis.handwritingQuality) return 'info'
  const map: Record<string, 'success' | 'warning' | 'danger'> = {
    good: 'success',
    fair: 'warning',
    poor: 'danger'
  }
  return map[recognitionResult.value.imageAnalysis.handwritingQuality]
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
  if (confidence >= 0.7) return 'warning'
  return 'danger'
}

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) {
      historyList.value = JSON.parse(stored).slice(0, 10)
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

const clearHistory = () => {
  historyList.value = []
  saveHistory()
  ElMessage.success('历史记录已清空')
}

const loadFromHistory = (h: HistoryItem) => {
  imagePreview.value = h.imagePreview
  imageBase64.value = h.imagePreview.split(',')[1] || h.imagePreview
  recognitionResult.value = h.result
  form.subjectType = h.subjectType as any
  Object.keys(checkedFormulas).forEach(k => delete checkedFormulas[k])
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
    Object.keys(checkedFormulas).forEach(k => delete checkedFormulas[k])
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  recognitionResult.value = null
  Object.keys(checkedFormulas).forEach(k => delete checkedFormulas[k])
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  if (cameraInputRef.value) {
    cameraInputRef.value.value = ''
  }
}

const recognizeFormula = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传公式图片')
    return
  }

  isRecognizing.value = true
  recognitionResult.value = null
  Object.keys(checkedFormulas).forEach(k => delete checkedFormulas[k])

  try {
    const response = await formulaOcrApi.recognize({
      imageBase64: imageBase64.value,
      subjectType: form.subjectType,
      writingMode: form.writingMode,
      outputFormat: 'all'
    })

    recognitionResult.value = response.data

    const avgConfidence = response.data.formulas.reduce((sum, f) => sum + f.confidence, 0) / response.data.formulas.length

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      subjectType: form.subjectType,
      subjectLabel: subjectLabelMap[form.subjectType],
      writingMode: form.writingMode,
      writingModeLabel: writingModeLabelMap[form.writingMode],
      formulaCount: response.data.formulas.length,
      avgConfidence,
      needsReviewCount: response.data.imageAnalysis.needsReviewCount,
      result: JSON.parse(JSON.stringify(response.data))
    })
    saveHistory()

    if (response.data.imageAnalysis.needsReviewCount > 0) {
      ElMessage.warning(`识别成功，共 ${response.data.formulas.length} 个公式，其中 ${response.data.imageAnalysis.needsReviewCount} 个需要核对`)
    } else {
      ElMessage.success(`成功识别 ${response.data.formulas.length} 个公式！`)
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '识别失败，请稍后重试')
  } finally {
    isRecognizing.value = false
  }
}

const openCharCandidates = (formula: FormulaItem, segIdx: number) => {
  activeCharSegment.value = formula.segments[segIdx]
  activeSegIdx.value = segIdx
  customChar.value = ''
  nextTick(() => {
    charPopoverVisible.value = true
  })
}

const applyCandidate = (formula: FormulaItem, segIdx: number, newChar: string) => {
  const seg = formula.segments[segIdx]
  const oldChar = seg.char

  seg.char = newChar
  seg.isLowConfidence = false
  seg.confidence = 1.0
  seg.candidates = [{ value: newChar, confidence: 1.0 }]

  const oldText = formula.plainText
  let newText = ''
  let charIdx = 0
  for (let i = 0; i < formula.segments.length; i++) {
    if (i === segIdx) {
      newText += newChar
      charIdx += oldChar.length
    } else {
      const s = formula.segments[i]
      newText += s.char
      charIdx += s.char.length
    }
  }
  formula.plainText = newText

  formula.lowConfidenceCount = formula.segments.filter(s => s.isLowConfidence).length
  if (formula.lowConfidenceCount === 0) {
    formula.needsReview = false
    formula.warnings = formula.warnings.filter(w => !w.includes('低置信度') && !w.includes('核对'))
  }

  charPopoverVisible.value = false
  ElMessage.success(`已将 "${oldChar}" 替换为 "${newChar}"`)
}

const applyCustomChar = (formula: FormulaItem, segIdx: number) => {
  if (!customChar.value.trim()) {
    ElMessage.warning('请输入字符')
    return
  }
  applyCandidate(formula, segIdx, customChar.value.trim())
}

const copyToClipboard = async (text: string, label: string, stateKey: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copyingState[stateKey] = true
    ElMessage.success(`${label}已复制到剪贴板`)
    setTimeout(() => {
      copyingState[stateKey] = false
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copyingState[stateKey] = true
    ElMessage.success(`${label}已复制到剪贴板`)
    setTimeout(() => {
      copyingState[stateKey] = false
    }, 2000)
  }
}

const copyFormula = (formula: FormulaItem, key: 'plainText' | 'latex' | 'asciimath' | 'mathml', stateKey: string) => {
  const labelMap: Record<string, string> = {
    plainText: '文本',
    latex: 'LaTeX',
    asciimath: 'AsciiMath',
    mathml: 'MathML'
  }
  copyToClipboard(formula[key], labelMap[key], stateKey)
}

const copyAllLatex = () => {
  if (!recognitionResult.value) return
  const latexStr = recognitionResult.value.formulas.map(f => f.latex).join('\n\n')
  copyToClipboard(latexStr, '全部 LaTeX', 'all_latex')
}

const copyAllText = () => {
  if (!recognitionResult.value) return
  const textStr = recognitionResult.value.formulas.map(f => f.plainText).join('\n\n')
  copyToClipboard(textStr, '全部文本', 'all_text')
}
</script>

<style scoped>
.formula-ocr {
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.card-header.small {
  font-size: 15px;
}

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.intro-section {
  margin-bottom: 10px;
}

.intro-steps {
  padding: 10px 0;
}

.upload-card,
.config-card,
.result-card,
.history-card,
.empty-result-card {
  margin-bottom: 20px;
}

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

.config-form {
  margin-top: 8px;
}

.writing-mode-tip {
  margin-top: 10px;
}

.recognize-btn {
  width: 100%;
  margin-top: 12px;
  min-height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.result-header {
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.review-alert {
  margin-bottom: 16px;
}

.analysis-section {
  margin-bottom: 8px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.analysis-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
}

.analysis-label {
  display: block;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 6px;
}

.analysis-value {
  display: block;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  margin-top: 4px;
  text-align: center;
}

.text-warning {
  color: #e6a23c !important;
}

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

.section-actions {
  display: flex;
  gap: 8px;
}

.formula-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.formula-item {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}

.formula-item.needs-review {
  border-color: #faad14;
  background: linear-gradient(180deg, #fffbe6 0%, #fafbfc 100%);
}

.formula-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.formula-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.formula-index {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.formula-warning {
  margin-bottom: 10px;
}

.formula-warning:last-child {
  margin-bottom: 12px;
}

.highlighted-preview {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.preview-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.char-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.char-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 16px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}

.char-seg:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.char-seg.high-conf {
  background: #f0f9eb;
  color: #529b2e;
}

.char-seg.medium-conf {
  background: #fdf6ec;
  color: #b88230;
}

.char-seg.low-conf {
  background: #fef0f0;
  color: #f56c6c;
  font-weight: 600;
  animation: lowConfidencePulse 2s ease-in-out infinite;
}

@keyframes lowConfidencePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(245, 108, 108, 0); }
}

.conf-badge {
  font-size: 10px;
  background: rgba(245, 108, 108, 0.15);
  padding: 0 4px;
  border-radius: 3px;
  margin-left: 2px;
}

.char-candidates-panel {
  padding: 4px;
}

.candidates-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
}

.current-char {
  color: #165DFF;
  font-size: 14px;
}

.candidates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.candidates-list .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cand-char {
  font-size: 16px;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.cand-conf {
  font-size: 10px;
  opacity: 0.75;
}

.candidates-input {
  display: flex;
  gap: 6px;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.formula-row {
  margin-bottom: 10px;
}

.formula-row:last-child {
  margin-bottom: 0;
}

.formula-format-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 6px;
}

.formula-content {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.formula-textarea {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}

.latex-textarea {
  color: #165DFF;
}

.mathml-textarea {
  color: #67c23a;
  font-size: 11px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 16px 0 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: #c0c4cc;
  margin: 0 0 20px 0;
}

.feature-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature-hints .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.suggestions-section {
  margin-top: 8px;
}

.tip-alert {
  margin-bottom: 8px;
}

.tip-alert:last-child {
  margin-bottom: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.history-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.history-time {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  margin: 0;
}

.history-desc {
  font-size: 12px;
  color: #606266;
  margin: 0;
}

.history-meta {
  font-size: 12px;
  color: #909399;
  margin: 0;
}
</style>
