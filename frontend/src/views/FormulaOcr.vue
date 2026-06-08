<template>
  <div class="formula-ocr">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#165DFF">
            <Camera />
          </el-icon>
          <span>拍照识别公式</span>
          <el-tag size="small" type="primary" class="header-tag">拍照上传 · 智能识别 · 多格式输出</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传/拍摄图片" description="支持拍照或从相册上传公式图片" />
          <el-step title="选择学科类型" description="数学、物理、化学，提升识别准确率" />
          <el-step title="AI 识别公式" description="自动转换为 LaTeX、文本等格式" />
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
                <el-checkbox value="latex">LaTeX 公式</el-checkbox>
                <el-checkbox value="text">纯文本</el-checkbox>
                <el-checkbox value="asciimath">AsciiMath</el-checkbox>
                <el-checkbox value="mathml">MathML</el-checkbox>
              </el-checkbox-group>
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
                <el-icon :size="18" color="#67c23a">
                  <CircleCheckFilled />
                </el-icon>
                <span>识别结果</span>
                <el-tag size="small" type="success">
                  识别到 {{ recognitionResult.formulas.length }} 个公式 · {{ recognitionResult.processingTime }}ms
                </el-tag>
              </div>
            </div>
          </template>

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
                <span class="analysis-value">{{ recognitionResult.imageAnalysis.formulaCount }} 个</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">包含内容</span>
                <div class="content-tags">
                  <el-tag size="small" effect="plain" v-if="recognitionResult.imageAnalysis.hasText">含文字</el-tag>
                  <el-tag size="small" effect="plain" type="warning" v-if="recognitionResult.imageAnalysis.hasDiagram">含图表</el-tag>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="formulas-section">
            <div class="section-header">
              <h4 class="section-title">
                <el-icon :size="16"><EditPen /></el-icon>
                识别到的公式
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
              >
                <div class="formula-header">
                  <span class="formula-index">公式 {{ index + 1 }}</span>
                  <el-tag size="small" :type="getConfidenceType(formula.confidence)">
                    置信度 {{ (formula.confidence * 100).toFixed(0) }}%
                  </el-tag>
                </div>

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
                <p class="history-meta">置信度 {{ (h.avgConfidence * 100).toFixed(0) }}%</p>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="!recognitionResult" class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><Picture /></el-icon>
            <p class="empty-text">上传包含公式的图片开始识别</p>
            <p class="empty-hint">支持数学、物理、化学公式，可输出 LaTeX、文本等多种格式</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain">
                <el-icon><Camera /></el-icon>
                拍照或上传图片
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><MagicStick /></el-icon>
                多学科智能识别
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
  Clock
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { formulaOcrApi, type FormulaRecognitionResponse, type FormulaItem } from '@/api/formulaOcr'

const HISTORY_KEY = 'formula_ocr_history'

interface HistoryItem {
  timestamp: number
  imagePreview: string
  subjectType: string
  subjectLabel: string
  formulaCount: number
  avgConfidence: number
  result: FormulaRecognitionResponse
}

const subjectLabelMap: Record<string, string> = {
  auto: '自动识别',
  math: '数学',
  physics: '物理',
  chemistry: '化学'
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const cameraInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isRecognizing = ref(false)
const recognitionResult = ref<FormulaRecognitionResponse | null>(null)
const historyList = ref<HistoryItem[]>([])

const copyingState = reactive<Record<string, boolean>>({})

const form = reactive({
  subjectType: 'auto' as 'math' | 'physics' | 'chemistry' | 'auto',
  outputFormats: ['latex', 'text'] as string[]
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

const recognizeFormula = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传公式图片')
    return
  }

  isRecognizing.value = true
  recognitionResult.value = null

  try {
    const response = await formulaOcrApi.recognize({
      imageBase64: imageBase64.value,
      subjectType: form.subjectType,
      outputFormat: 'all'
    })

    recognitionResult.value = response.data

    const avgConfidence = response.data.formulas.reduce((sum, f) => sum + f.confidence, 0) / response.data.formulas.length

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      subjectType: form.subjectType,
      subjectLabel: subjectLabelMap[form.subjectType],
      formulaCount: response.data.formulas.length,
      avgConfidence,
      result: JSON.parse(JSON.stringify(response.data))
    })
    saveHistory()

    ElMessage.success(`成功识别 ${response.data.formulas.length} 个公式！`)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '识别失败，请稍后重试')
  } finally {
    isRecognizing.value = false
  }
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

.content-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
}

.formula-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.formula-index {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
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
