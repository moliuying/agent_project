<template>
  <div class="number-divination">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <MagicStick />
          </el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <div class="guide-content">
        <p>
          静下心来，在心中默念你的问题——可以是关于感情、事业、抉择，或者只是想听听宇宙的回答。然后选择一个
          <strong>1 到 1314</strong> 之间的数字，这个数字会成为你此刻心境的映射，为你带来一段专属的启示。
        </p>
        <el-divider content-position="left">灵数速选</el-divider>
        <div class="quick-numbers">
          <el-tag
            v-for="num in quickNumbers"
            :key="num.value"
            size="large"
            effect="light"
            class="quick-number-tag"
            :type="num.type"
            @click="selectQuickNumber(num.value)"
          >
            <span class="quick-number-value">{{ num.value }}</span>
            <span class="quick-number-label">{{ num.label }}</span>
          </el-tag>
        </div>
      </div>
    </el-card>

    <el-card class="input-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#eb2f96">
            <MagicStick />
          </el-icon>
          <span>数字占卜</span>
          <el-tag size="small" type="danger" effect="light" class="header-tag">
            倾听内心的声音
          </el-tag>
        </div>
      </template>

      <div class="input-section">
        <div class="input-wrapper">
          <el-input-number
            v-model="inputNumber"
            :min="1"
            :max="1314"
            size="large"
            :controls="false"
            placeholder="请输入 1-1314 之间的数字"
            class="number-input"
            @keyup.enter="startDivination"
          />
          <div class="number-range-hint">范围：1 ~ 1314</div>
        </div>

        <div class="random-row">
          <span class="random-label">或者：</span>
          <el-button type="primary" link :icon="Dice" @click="randomNumber">
            让宇宙帮你选一个数字
          </el-button>
        </div>

        <div class="action-buttons">
          <el-button
            type="primary"
            size="large"
            :icon="MagicStick"
            @click="startDivination"
            :loading="isRevealing"
            :disabled="!inputNumber"
            class="divine-button"
          >
            {{ isRevealing ? '启示降临中...' : '开始占卜' }}
          </el-button>
        </div>
      </div>

      <div class="reveal-container" v-if="isRevealing || result">
        <div class="reveal-animation" :class="{ revealing: isRevealing, revealed: !isRevealing && result }">
          <div class="reveal-circle" v-if="isRevealing">
            <span class="reveal-number">{{ inputNumber }}</span>
            <div class="reveal-spinner"></div>
          </div>
          <div class="reveal-result" v-else-if="result">
            <template v-if="result.isSpecial">
              <div class="special-badge">
                <el-icon :size="16"><Star /></el-icon>
                <span>特殊灵数</span>
              </div>
            </template>
            <div class="result-emoji">{{ result.answer.emoji }}</div>
            <div class="result-title">{{ result.answer.title }}</div>
            <template v-if="'category' in result.answer">
              <el-tag size="small" effect="light" :type="tagTypeMap[result.answer.category]">
                {{ categoryLabels[result.answer.category] }} · {{ toneLabels[result.answer.tone] }}
              </el-tag>
            </template>
            <template v-else>
              <el-tag size="small" effect="dark" type="danger">
                {{ (result.answer as any).origin }}
              </el-tag>
            </template>
            <div class="result-content">{{ result.answer.content }}</div>

            <div class="number-analysis" v-if="numberProps">
              <el-divider content-position="left">灵数解析</el-divider>
              <el-row :gutter="16">
                <el-col :span="8">
                  <div class="analysis-item">
                    <div class="analysis-label">选择数字</div>
                    <div class="analysis-value highlight">{{ inputNumber }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="analysis-item">
                    <div class="analysis-label">数字根</div>
                    <div class="analysis-value">{{ numberProps.digitalRoot }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="analysis-item">
                    <div class="analysis-label">奇偶性</div>
                    <div class="analysis-value">{{ numberProps.isEven ? '偶数' : '奇数' }}</div>
                  </div>
                </el-col>
              </el-row>
              <div class="analysis-meaning">
                <el-icon><Sparkles /></el-icon>
                <span>{{ numberProps.meaning }}</span>
              </div>
            </div>

            <div class="result-actions">
              <el-button size="small" :icon="CopyDocument" @click="copyResult">
                复制启示
              </el-button>
              <el-button size="small" type="primary" :icon="Refresh" @click="resetDivination">
                再占一次
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="history-card" v-if="history.length > 0">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Clock />
          </el-icon>
          <span>占卜记录</span>
          <el-button size="small" text type="danger" @click="clearHistory" style="margin-left: auto">
            清空记录
          </el-button>
        </div>
      </template>

      <div class="history-list">
        <div
          class="history-item"
          v-for="(item, index) in displayHistory"
          :key="index"
          @click="loadHistoryItem(item)"
        >
          <div class="history-number">
            <span class="history-num">{{ item.number }}</span>
            <span v-if="item.isSpecial" class="history-special">
              <el-icon :size="12"><Star /></el-icon>
            </span>
          </div>
          <div class="history-content">
            <div class="history-title">{{ item.title }}</div>
            <div class="history-preview">{{ item.content.slice(0, 50) }}{{ item.content.length > 50 ? '…' : '' }}</div>
          </div>
          <div class="history-meta">
            <span class="history-time">{{ formatTime(item.time) }}</span>
            <el-icon class="history-arrow"><Right /></el-icon>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagicStick,
  Dice,
  Star,
  CopyDocument,
  Refresh,
  Clock,
  Right,
  Sparkles
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getDivinationByNumber,
  getNumberProperties,
  categoryLabels,
  toneLabels,
  type DivinationAnswer,
  type SpecialNumber
} from '@/data/numberDivination'

interface HistoryItem {
  number: number
  title: string
  content: string
  emoji: string
  isSpecial: boolean
  time: string
}

const STORAGE_KEY = 'number_divination_history'

const inputNumber = ref<number | null>(null)
const isRevealing = ref(false)
const result = ref<{ isSpecial: boolean; answer: DivinationAnswer | SpecialNumber } | null>(null)
const numberProps = ref<ReturnType<typeof getNumberProperties> | null>(null)
const history = ref<HistoryItem[]>([])

const quickNumbers = [
  { value: 1, label: '万物之始', type: 'success' as const },
  { value: 7, label: '神秘之数', type: 'warning' as const },
  { value: 520, label: '我爱你', type: 'danger' as const },
  { value: 521, label: '我愿意', type: 'danger' as const },
  { value: 666, label: '顺风顺水', type: 'success' as const },
  { value: 888, label: '财源广进', type: 'warning' as const },
  { value: 1314, label: '一生一世', type: 'danger' as const }
]

const tagTypeMap: Record<DivinationAnswer['category'], '' | 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
  love: 'danger',
  career: 'primary',
  decision: 'warning',
  comfort: 'success',
  growth: 'info',
  wisdom: ''
}

const displayHistory = computed(() => {
  return history.value.slice().reverse().slice(0, 10)
})

const selectQuickNumber = (num: number) => {
  inputNumber.value = num
}

const randomNumber = () => {
  inputNumber.value = Math.floor(Math.random() * 1314) + 1
  ElMessage.success(`宇宙为你选择了数字 ${inputNumber.value}`)
}

const startDivination = () => {
  if (!inputNumber.value || inputNumber.value < 1 || inputNumber.value > 1314) {
    ElMessage.warning('请输入 1 到 1314 之间的数字')
    return
  }

  isRevealing.value = true
  result.value = null
  numberProps.value = null

  setTimeout(() => {
    const num = inputNumber.value!
    const divination = getDivinationByNumber(num)
    result.value = divination
    numberProps.value = getNumberProperties(num)
    isRevealing.value = false

    const historyItem: HistoryItem = {
      number: num,
      title: divination.answer.title,
      content: divination.answer.content,
      emoji: divination.answer.emoji,
      isSpecial: divination.isSpecial,
      time: new Date().toISOString()
    }
    history.value.push(historyItem)
    saveHistory()

    if (divination.isSpecial) {
      ElMessage.success('你抽到了特殊灵数！这是一份特别的启示')
    }
  }, 2000)
}

const resetDivination = () => {
  result.value = null
  numberProps.value = null
  isRevealing.value = false
}

const copyResult = async () => {
  if (!result.value) return
  const answer = result.value.answer
  const text = `【数字占卜 · ${inputNumber.value}】\n${answer.emoji} ${answer.title}\n\n${answer.content}`
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const loadHistoryItem = (item: HistoryItem) => {
  inputNumber.value = item.number
  const divination = getDivinationByNumber(item.number)
  result.value = divination
  numberProps.value = getNumberProperties(item.number)
  ElMessage.info(`已加载占卜记录 #${item.number}`)
}

const clearHistory = () => {
  history.value = []
  ElMessage.success('历史记录已清空')
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.number-divination {
  max-width: 800px;
  margin: 0 auto;
}

.guide-card,
.input-card,
.history-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.guide-content p {
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.quick-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.quick-number-tag {
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-number-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-number-value {
  font-weight: bold;
  font-size: 16px;
}

.quick-number-label {
  font-size: 13px;
  opacity: 0.85;
}

.input-section {
  padding: 20px 0;
}

.input-wrapper {
  text-align: center;
  margin-bottom: 20px;
}

.number-input {
  max-width: 320px;
}

.number-input :deep(.el-input__inner) {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  height: 60px;
  color: #722ed1;
}

.number-range-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.random-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.random-label {
  font-size: 14px;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.divine-button {
  width: 240px;
  height: 56px;
  font-size: 18px;
  background: linear-gradient(135deg, #eb2f96 0%, #722ed1 100%);
  border: none;
}

.divine-button:hover {
  background: linear-gradient(135deg, #f53f9f 0%, #853de1 100%);
}

.reveal-container {
  margin-top: 32px;
}

.reveal-animation {
  display: flex;
  justify-content: center;
}

.reveal-circle {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff5f7 0%, #faf5ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.reveal-number {
  font-size: 56px;
  font-weight: bold;
  color: #722ed1;
  animation: pulse 1s ease-in-out infinite;
}

.reveal-spinner {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #eb2f96;
  border-right-color: #722ed1;
  animation: spin 1s linear infinite;
}

.reveal-animation.revealing .reveal-circle {
  animation: revealPulse 2s ease-in-out;
}

.reveal-result {
  width: 100%;
  text-align: center;
  padding: 32px 20px;
  background: linear-gradient(135deg, #fff5f7 0%, #faf5ff 100%);
  border-radius: 16px;
  border: 1px solid #fce7f3;
  animation: fadeInUp 0.6s ease-out;
}

.special-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
  color: #8b4513;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.result-emoji {
  font-size: 72px;
  line-height: 1;
  margin-bottom: 16px;
  animation: bounceIn 0.8s ease-out;
}

.result-title {
  font-size: 28px;
  font-weight: bold;
  color: #831843;
  margin-bottom: 12px;
}

.result-content {
  font-size: 16px;
  line-height: 2;
  color: #4b5563;
  text-align: left;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border-left: 4px solid #eb2f96;
  margin-top: 20px;
}

.number-analysis {
  margin-top: 24px;
}

.analysis-item {
  text-align: center;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
}

.analysis-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.analysis-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.analysis-value.highlight {
  color: #eb2f96;
  font-size: 32px;
}

.analysis-meaning {
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 100%);
  border-radius: 8px;
  font-size: 14px;
  color: #722ed1;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.result-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: linear-gradient(135deg, #fff5f7 0%, #faf5ff 100%);
  transform: translateX(4px);
}

.history-item:last-child {
  border-bottom: none;
}

.history-number {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 70px;
}

.history-num {
  font-size: 24px;
  font-weight: bold;
  color: #722ed1;
}

.history-special {
  color: #f59e0b;
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.history-preview {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-time {
  font-size: 12px;
  color: #c0c4cc;
}

.history-arrow {
  color: #c0c4cc;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes revealPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(235, 47, 150, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(235, 47, 150, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(235, 47, 150, 0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
