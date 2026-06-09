<template>
  <div class="number-divination">
    <el-card class="quick-card" v-if="!isRevealing && !result">
      <template #header>
        <div class="card-header quick-header">
          <el-icon :size="20" color="#eb2f96">
            <Lightning />
          </el-icon>
          <span>快速体验</span>
          <el-tag size="small" type="danger" effect="light" class="header-tag">
            点一下，直接出结果
          </el-tag>
        </div>
      </template>

      <div class="quick-grid">
        <div class="quick-item quick-today" @click="quickDivine('today')">
          <div class="quick-badge">每日更新</div>
          <div class="quick-icon">📅</div>
          <div class="quick-title">今日灵数</div>
          <div class="quick-number">{{ todayNumber }}</div>
          <div class="quick-action">点我直接占卜 →</div>
        </div>

        <div class="quick-item quick-random" @click="quickDivine('random')">
          <div class="quick-badge">零思考</div>
          <div class="quick-icon">🎲</div>
          <div class="quick-title">随便给我一个</div>
          <div class="quick-number">?</div>
          <div class="quick-action">听天由命 →</div>
        </div>

        <div class="quick-item quick-mood" @click="scrollToMood">
          <div class="quick-badge">最懂你</div>
          <div class="quick-icon">💭</div>
          <div class="quick-title">按心情选</div>
          <div class="quick-number">8种</div>
          <div class="quick-action">选择心情 ↓</div>
        </div>
      </div>

      <el-divider content-position="center">
        <span class="divider-text">或选一个幸运数字</span>
      </el-divider>

      <div class="quick-numbers">
        <div
          v-for="num in popularNumbers"
          :key="num.value"
          class="quick-num-btn"
          :class="num.type"
          @click="quickDivine(num.value)"
        >
          <span class="q-num">{{ num.value }}</span>
          <span class="q-label">{{ num.label }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="picker-card" v-if="!isRevealing && !result">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <MagicStick />
          </el-icon>
          <span>更多选号方式</span>
          <span class="picker-subtitle">想认真选一个？这里有 6 种方式</span>
        </div>
      </template>

      <el-tabs v-model="activePickerTab" class="picker-tabs">
        <el-tab-pane name="mood">
          <template #label>
            <span class="tab-label">
              <el-icon><ChatDotRound /></el-icon>
              按心情选
            </span>
          </template>
          <div class="mood-section">
            <p class="section-tip">点击最符合你此刻心情的卡片，<strong>立即开始占卜</strong></p>
            <div class="mood-grid">
              <div
                v-for="mood in moodOptions"
                :key="mood.key"
                class="mood-card"
                @click="pickByMood(mood)"
              >
                <div class="mood-emoji">{{ mood.emoji }}</div>
                <div class="mood-label">{{ mood.label }}</div>
                <div class="mood-number">#{{ mood.number }}</div>
                <div class="mood-hint">点我占卜</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="today">
          <template #label>
            <span class="tab-label">
              <el-icon><Calendar /></el-icon>
              今日灵数
            </span>
          </template>
          <div class="today-section">
            <div class="today-card">
              <div class="today-date">{{ todayDateStr }}</div>
              <div class="today-number">{{ todayNumber }}</div>
              <div class="today-label">今日专属灵数</div>
              <div class="today-desc">根据今日日期计算，代表这一天的宇宙能量</div>
              <el-button type="primary" size="large" :icon="MagicStick" @click="quickDivine('today')">
                ✨ 用这个数，立即占卜
              </el-button>
            </div>
            <div class="today-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>今日灵数每天都不同，同一件事改天再占，可能会有不同的启发</span>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="birthday">
          <template #label>
            <span class="tab-label">
              <el-icon><Cake /></el-icon>
              生日灵数
            </span>
          </template>
          <div class="birthday-section">
            <p class="section-tip">输入你的出生日期，计算你的生命灵数，<strong>一键占卜</strong></p>
            <el-form :inline="true" class="birthday-form">
              <el-form-item label="出生日期">
                <el-date-picker
                  v-model="birthday"
                  type="date"
                  placeholder="选择你的生日"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :clearable="false"
                  style="width: 220px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="MagicStick" @click="pickByBirthdayAndDivine" :disabled="!birthday">
                  计算生命灵数并占卜
                </el-button>
              </el-form-item>
            </el-form>
            <div v-if="birthdayNumber" class="birthday-result">
              <div class="birthday-number">{{ birthdayNumber }}</div>
              <div class="birthday-label">你的生命灵数</div>
              <div class="birthday-meaning">{{ birthdayMeaning }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="special">
          <template #label>
            <span class="tab-label">
              <el-icon><Star /></el-icon>
              特殊灵数
            </span>
          </template>
          <div class="special-section">
            <p class="section-tip">这些数字在文化中有特殊含义，<strong>点击任意卡片直接占卜</strong></p>
            <div class="special-grid">
              <div
                v-for="num in specialNumberOptions"
                :key="num.value"
                class="special-card"
                :class="num.type"
                @click="quickDivine(num.value)"
              >
                <div class="special-number">{{ num.value }}</div>
                <div class="special-label">{{ num.label }}</div>
                <div class="special-desc">{{ num.desc }}</div>
                <div class="special-action">点击占卜 →</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="random">
          <template #label>
            <span class="tab-label">
              <el-icon><Dice /></el-icon>
              随机选号
            </span>
          </template>
          <div class="random-section">
            <div class="random-card">
              <div class="random-emoji">🎲</div>
              <div class="random-title">把选择交给宇宙</div>
              <div class="random-desc">
                如果你实在不知道选什么，就让命运帮你决定。<br />
                随机也是一种缘分，每一个数字都值得认真对待。
              </div>
              <div class="random-actions">
                <el-button size="large" type="primary" :icon="Dice" @click="quickDivine('random')">
                  ✨ 随机一个，直接占卜
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="manual">
          <template #label>
            <span class="tab-label">
              <el-icon><Edit /></el-icon>
              自由输入
            </span>
          </template>
          <div class="manual-section">
            <p class="section-tip">输入你心中的数字（1-1314之间），可以是纪念日、幸运数字，或任何你想到的数</p>
            <div class="manual-input-wrapper">
              <el-input-number
                v-model="inputNumber"
                :min="1"
                :max="1314"
                size="large"
                :controls="false"
                placeholder="输入 1-1314 之间的数字"
                class="manual-input"
                @keyup.enter="startDivination"
              />
              <div class="manual-action">
                <el-button
                  size="large"
                  type="primary"
                  :icon="MagicStick"
                  :disabled="!inputNumber"
                  @click="startDivination"
                >
                  开始占卜
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card class="guide-card" v-if="!isRevealing && !result">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <InfoFilled />
          </el-icon>
          <span>关于数字占卜</span>
        </div>
      </template>
      <el-steps :active="0" finish-status="wait" simple class="guide-steps">
        <el-step title="1. 静心" description="深呼吸三次，让心情平静下来" />
        <el-step title="2. 默念" description="在心中默念你的问题或困惑" />
        <el-step title="3. 选号" description="凭直觉点一个数字（随便选也准）" />
        <el-step title="4. 启示" description="接收属于你的答案" />
      </el-steps>
      <el-alert type="info" :closable="false" class="philosophy-alert" show-icon>
        <template #title>
          <strong>不必纠结选对选错</strong>
        </template>
        <p class="philosophy-text">
          1-1314 之间的每一个数字都有独特的能量。<strong>凭直觉选的那个数字，就是此刻与你心灵共振的答案</strong>。
          无论是生日、纪念日、幸运数字，还是随手点的数字，都是宇宙与你对话的方式。
        </p>
      </el-alert>
    </el-card>

    <el-card class="result-card" v-if="isRevealing || result">
      <template #header v-if="!isRevealing && result">
        <div class="card-header result-header">
          <el-icon :size="20" color="#eb2f96">
            <MagicStick />
          </el-icon>
          <span>占卜结果</span>
          <el-button size="small" type="primary" plain :icon="Refresh" @click="resetDivination" style="margin-left: auto">
            再占一次
          </el-button>
        </div>
      </template>

      <div class="reveal-container">
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

    <el-card class="history-card" v-if="history.length > 0 && !isRevealing && !result">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Clock />
          </el-icon>
          <span>占卜记录</span>
          <el-tag size="small" type="info" effect="light" style="margin-left: 12px">
            共 {{ history.length }} 条
          </el-tag>
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
          <div class="history-emoji">{{ item.emoji }}</div>
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
  Sparkles,
  InfoFilled,
  ChatDotRound,
  Calendar,
  Cake,
  Edit,
  Lightning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getDivinationByNumber,
  getNumberProperties,
  categoryLabels,
  toneLabels,
  specialNumbers,
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

interface MoodOption {
  key: string
  emoji: string
  label: string
  number: number
}

interface SpecialOption {
  value: number
  label: string
  desc: string
  type: 'love' | 'fortune' | 'mystery' | 'life'
}

interface PopularNumber {
  value: number
  label: string
  type: 'love' | 'fortune' | 'mystery' | 'life'
}

const STORAGE_KEY = 'number_divination_history'

const inputNumber = ref<number | null>(null)
const isRevealing = ref(false)
const result = ref<{ isSpecial: boolean; answer: DivinationAnswer | SpecialNumber } | null>(null)
const numberProps = ref<ReturnType<typeof getNumberProperties> | null>(null)
const history = ref<HistoryItem[]>([])
const activePickerTab = ref('mood')

const selectedMood = ref<string | null>(null)
const birthday = ref('')
const birthdayNumber = ref<number | null>(null)

const moodOptions: MoodOption[] = [
  { key: 'happy', emoji: '😊', label: '开心', number: 168 },
  { key: 'love', emoji: '🥰', label: '想恋爱', number: 520 },
  { key: 'confused', emoji: '🤔', label: '迷茫纠结', number: 7 },
  { key: 'sad', emoji: '😔', label: '难过失落', number: 131 },
  { key: 'anxious', emoji: '😰', label: '焦虑不安', number: 23 },
  { key: 'tired', emoji: '😮‍💨', label: '身心疲惫', number: 365 },
  { key: 'hopeful', emoji: '🌟', label: '充满期待', number: 999 },
  { key: 'grateful', emoji: '🙏', label: '感恩平静', number: 88 }
]

const popularNumbers: PopularNumber[] = [
  { value: 520, label: '我爱你', type: 'love' },
  { value: 1314, label: '一生一世', type: 'love' },
  { value: 666, label: '顺风顺水', type: 'fortune' },
  { value: 888, label: '财源广进', type: 'fortune' },
  { value: 7, label: '神秘之数', type: 'mystery' },
  { value: 999, label: '天长地久', type: 'life' }
]

const specialNumberOptions: SpecialOption[] = specialNumbers.map(s => {
  let type: SpecialOption['type'] = 'mystery'
  if ([52, 520, 521, 334, 131, 1314].includes(s.number)) type = 'love'
  else if ([8, 888, 666, 100].includes(s.number)) type = 'fortune'
  else if ([1, 365, 9, 999].includes(s.number)) type = 'life'
  return {
    value: s.number,
    label: s.title,
    desc: s.origin,
    type
  }
})

const tagTypeMap: Record<DivinationAnswer['category'], '' | 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
  love: 'danger',
  career: 'primary',
  decision: 'warning',
  comfort: 'success',
  growth: 'info',
  wisdom: ''
}

const todayDateStr = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
})

const todayNumber = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  let sum = y + m + d
  while (sum > 1314) sum = Math.floor(sum / 7) + (sum % 7)
  return Math.max(1, sum % 1314 || 1)
})

const birthdayMeaning = computed(() => {
  if (!birthdayNumber.value) return ''
  const root = getNumberProperties(birthdayNumber.value).digitalRoot
  const meanings: Record<number, string> = {
    1: '开创者·独立领导力，天生的行动派',
    2: '协调者·温柔敏感，善于合作',
    3: '表达者·创造力强，乐观开朗',
    4: '建设者·踏实可靠，追求稳定',
    5: '自由者·热爱冒险，适应力强',
    6: '关爱者·有责任感，重视家庭',
    7: '探索者·深刻智慧，追求真理',
    8: '成就者·目标明确，天生领袖',
    9: '奉献者·博爱慈悲，理想主义'
  }
  return meanings[root] || '独一无二的生命轨迹'
})

const displayHistory = computed(() => {
  return history.value.slice().reverse().slice(0, 10)
})

const quickDivine = (source: number | 'today' | 'random') => {
  if (source === 'today') {
    inputNumber.value = todayNumber.value
  } else if (source === 'random') {
    inputNumber.value = Math.floor(Math.random() * 1314) + 1
    ElMessage.success(`宇宙为你选择了数字 ${inputNumber.value} ✨`)
  } else {
    inputNumber.value = source
    const found = specialNumbers.find(s => s.number === source)
    if (found) {
      ElMessage.success(`灵数 ${source}：${found.title}`)
    }
  }
  setTimeout(() => startDivination(), 100)
}

const scrollToMood = () => {
  activePickerTab.value = 'mood'
  ElMessage.info('请在下方选择你此刻的心情')
}

const pickByMood = (mood: MoodOption) => {
  selectedMood.value = mood.key
  inputNumber.value = mood.number
  ElMessage.success(`心情「${mood.label}」对应 #${mood.number}，正在占卜...`)
  setTimeout(() => startDivination(), 150)
}

const pickByBirthdayAndDivine = () => {
  if (!birthday.value) return
  const parts = birthday.value.split('-').map(p => parseInt(p, 10))
  let sum = parts.reduce((a, b) => a + b, 0)
  while (sum > 1314) sum = Math.floor(sum / 9) + (sum % 9)
  birthdayNumber.value = Math.max(1, sum % 1314 || 1)
  inputNumber.value = birthdayNumber.value
  ElMessage.success(`你的生命灵数是 ${birthdayNumber.value}，正在占卜...`)
  setTimeout(() => startDivination(), 300)
}

const clearSelection = () => {
  inputNumber.value = null
  selectedMood.value = null
  birthdayNumber.value = null
}

const startDivination = () => {
  if (!inputNumber.value || inputNumber.value < 1 || inputNumber.value > 1314) {
    ElMessage.warning('请选择 1 到 1314 之间的数字')
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
      ElMessage.success('🌟 你抽到了特殊灵数！这是一份特别的启示')
    }
  }, 2000)
}

const resetDivination = () => {
  result.value = null
  numberProps.value = null
  isRevealing.value = false
  inputNumber.value = null
  birthdayNumber.value = null
  selectedMood.value = null
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
  max-width: 900px;
  margin: 0 auto;
}

.quick-card,
.guide-card,
.picker-card,
.result-card,
.history-card {
  margin-bottom: 24px;
}

.quick-header {
  color: #eb2f96;
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

.picker-subtitle {
  margin-left: auto;
  font-size: 13px;
  font-weight: normal;
  color: #909399;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.quick-item {
  position: relative;
  padding: 24px 16px;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.quick-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.quick-item:active {
  transform: translateY(-1px) scale(0.98);
}

.quick-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.85);
}

.quick-today {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}
.quick-today .quick-badge { color: #0369a1; }
.quick-today:hover { box-shadow: 0 10px 30px rgba(14, 165, 233, 0.35); }

.quick-random {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}
.quick-random .quick-badge { color: #5b21b6; }
.quick-random:hover { box-shadow: 0 10px 30px rgba(139, 92, 246, 0.35); }

.quick-mood {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  color: white;
}
.quick-mood .quick-badge { color: #9d174d; }
.quick-mood:hover { box-shadow: 0 10px 30px rgba(236, 72, 153, 0.35); }

.quick-icon {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 8px;
}

.quick-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 4px;
}

.quick-number {
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 8px;
  opacity: 0.95;
  font-family: 'Georgia', serif;
}

.quick-action {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
}

.divider-text {
  color: #909399;
  font-size: 13px;
  padding: 0 8px;
}

.quick-numbers {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.quick-num-btn {
  padding: 14px 8px;
  text-align: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.quick-num-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.quick-num-btn.love {
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  border-color: #fecdd3;
}
.quick-num-btn.love:hover { border-color: #fb7185; }

.quick-num-btn.fortune {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fde68a;
}
.quick-num-btn.fortune:hover { border-color: #f59e0b; }

.quick-num-btn.mystery {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #ddd6fe;
}
.quick-num-btn.mystery:hover { border-color: #8b5cf6; }

.quick-num-btn.life {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #a7f3d0;
}
.quick-num-btn.life:hover { border-color: #10b981; }

.q-num {
  display: block;
  font-size: 26px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
  color: #1f2937;
}

.q-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.guide-steps {
  padding: 10px 0 20px 0;
}

.philosophy-alert {
  margin-top: 8px;
}

.philosophy-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.picker-tabs {
  margin-bottom: 8px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.section-tip {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.mood-card {
  padding: 18px 12px;
  text-align: center;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.mood-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #e9d5ff;
  background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);
}

.mood-card:active {
  transform: translateY(-1px) scale(0.97);
}

.mood-emoji {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 6px;
}

.mood-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.mood-number {
  font-size: 18px;
  font-weight: bold;
  color: #722ed1;
  margin-bottom: 6px;
  opacity: 0.7;
}

.mood-hint {
  font-size: 11px;
  color: #eb2f96;
  font-weight: 600;
  opacity: 0.85;
}

.today-section {
  padding: 10px 0;
}

.today-card {
  max-width: 380px;
  margin: 0 auto;
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  border: 1px solid #bae6fd;
}

.today-date {
  font-size: 14px;
  color: #0369a1;
  margin-bottom: 12px;
  font-weight: 500;
}

.today-number {
  font-size: 72px;
  font-weight: bold;
  line-height: 1;
  color: #0284c7;
  margin-bottom: 12px;
  text-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
}

.today-label {
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 8px;
}

.today-desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.6;
}

.today-tip {
  margin-top: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.birthday-section {
  padding: 10px 0;
}

.birthday-form {
  justify-content: center;
}

.birthday-result {
  max-width: 380px;
  margin: 24px auto 0;
  text-align: center;
  padding: 28px 24px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  border: 1px solid #fcd34d;
  animation: fadeInUp 0.4s ease-out;
}

.birthday-number {
  font-size: 64px;
  font-weight: bold;
  line-height: 1;
  color: #b45309;
  margin-bottom: 10px;
  text-shadow: 0 4px 12px rgba(180, 83, 9, 0.2);
}

.birthday-label {
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 10px;
}

.birthday-meaning {
  font-size: 14px;
  color: #78350f;
  margin-bottom: 16px;
  line-height: 1.7;
}

.special-section {
  padding: 10px 0;
}

.special-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.special-card {
  padding: 18px 14px;
  text-align: center;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.special-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.special-card.love {
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  border-color: #fecdd3;
}
.special-card.love:hover {
  border-color: #fb7185;
  box-shadow: 0 6px 20px rgba(251, 113, 133, 0.2);
}

.special-card.fortune {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fde68a;
}
.special-card.fortune:hover {
  border-color: #f59e0b;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.2);
}

.special-card.mystery {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #ddd6fe;
}
.special-card.mystery:hover {
  border-color: #8b5cf6;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.2);
}

.special-card.life {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #a7f3d0;
}
.special-card.life:hover {
  border-color: #10b981;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
}

.special-number {
  font-size: 30px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 6px;
  color: #1f2937;
}

.special-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.special-desc {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 6px;
}

.special-action {
  font-size: 11px;
  color: #eb2f96;
  font-weight: 600;
}

.random-section {
  padding: 10px 0;
}

.random-card {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 36px 28px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: 16px;
  border: 1px solid #ddd6fe;
}

.random-emoji {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 16px;
}

.random-title {
  font-size: 22px;
  font-weight: bold;
  color: #5b21b6;
  margin-bottom: 12px;
}

.random-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 24px;
}

.manual-section {
  padding: 10px 0;
}

.manual-input-wrapper {
  text-align: center;
}

.manual-input {
  max-width: 280px;
}

.manual-input :deep(.el-input__inner) {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  height: 60px;
  color: #722ed1;
}

.manual-action {
  margin-top: 16px;
}

.reveal-container {
  margin-top: 8px;
}

.reveal-animation {
  display: flex;
  justify-content: center;
}

.result-header {
  width: 100%;
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
  padding: 14px 16px;
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

.history-emoji {
  font-size: 28px;
  width: 36px;
  text-align: center;
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
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
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
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

@media (max-width: 640px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
  .quick-numbers {
    grid-template-columns: repeat(3, 1fr);
  }
  .mood-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .special-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
