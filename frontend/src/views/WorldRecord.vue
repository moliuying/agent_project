<template>
  <div class="world-record">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <InfoFilled />
          </el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <el-steps :active="0" finish-status="wait" simple class="guide-steps">
        <el-step title="输入问题" description="提问如&quot;世界上最深的海沟是哪里&quot;&quot;世界上最大的动物是什么&quot;" />
        <el-step title="获取答案" description="AI 给出准确答案并附上背景知识" />
        <el-step title="趣味延伸" description="查看有趣的冷知识和相关世界之最" />
      </el-steps>
    </el-card>

    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <Grid />
          </el-icon>
          <span>知识分类浏览</span>
          <el-tag size="small" type="info" class="header-tag">共 {{ totalRecords }} 条世界之最知识</el-tag>
          <el-button size="small" text type="primary" @click="loadRandomRecords" class="refresh-btn">
            <el-icon><Refresh /></el-icon>
            随机探索
          </el-button>
        </div>
      </template>
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          :class="{ active: selectedCategory === cat.id }"
          @click="toggleCategory(cat.id)"
        >
          <div class="category-icon">{{ cat.icon }}</div>
          <div class="category-info">
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-count">{{ cat.count }} 条</div>
          </div>
          <div class="category-desc">{{ cat.description }}</div>
        </div>
      </div>
    </el-card>

    <el-card v-if="selectedCategory" class="category-records-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF"><Collection /></el-icon>
          <span>{{ selectedCategory }} - 全部知识</span>
          <el-button size="small" text @click="selectedCategory = null">
            <el-icon><Close /></el-icon>
            收起
          </el-button>
        </div>
      </template>
      <div class="record-list">
        <div
          v-for="record in categoryRecords"
          :key="record.id"
          class="record-item"
          @click="selectRecord(record)"
        >
          <div class="record-title">{{ record.title }}</div>
          <div class="record-answer">{{ record.answer }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="qa-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <ChatDotRound />
          </el-icon>
          <span>世界之最知识问答</span>
          <el-tag size="small" type="success" class="header-tag">AI 智能检索</el-tag>
        </div>
      </template>

      <div class="input-section">
        <div class="input-header">
          <span class="input-label">请输入您的问题</span>
        </div>
        <div class="input-row">
          <el-input
            v-model="questionInput"
            placeholder="例如：世界上最深的海沟是哪里？世界上最大的动物是什么？"
            class="input-field"
            clearable
            @keyup.enter="handleAsk"
          >
            <template #prefix>
              <el-icon><QuestionFilled /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" :loading="loading" @click="handleAsk">
            <el-icon><Search /></el-icon>
            <span>提问</span>
          </el-button>
          <el-button @click="loadRandomQuestion">
            <el-icon><MagicStick /></el-icon>
            <span>随机问题</span>
          </el-button>
        </div>
        <div class="quick-examples">
          <span class="example-label">试试这些：</span>
          <el-tag
            v-for="example in quickExamples"
            :key="example"
            size="small"
            class="example-tag"
            effect="plain"
            @click="questionInput = example"
          >
            {{ example }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <el-card v-if="currentAnswer || currentMessage" class="answer-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" :color="currentAnswer?.found ? '#67c23a' : '#e6a23c'">
            <Reading />
          </el-icon>
          <span>
            {{ currentAnswer?.found ? '找到答案' : '搜索结果' }}
          </span>
          <el-tag
            v-if="currentAnswer?.category"
            size="small"
            type="primary"
            effect="plain"
            class="header-tag"
          >
            {{ currentAnswer.category }}
          </el-tag>
          <el-button size="small" text class="copy-btn" @click="copyAnswer">
            <el-icon><CopyDocument /></el-icon>
            <span>复制内容</span>
          </el-button>
        </div>
      </template>

      <div v-if="currentMessage" class="message-section">
        <el-alert
          :title="currentMessage"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>

      <div v-if="currentAnswer?.record" class="answer-content">
        <div class="answer-title">{{ currentAnswer.record.title }}</div>

        <div class="answer-block answer-block-primary">
          <div class="block-icon">
            <el-icon color="#165DFF"><Trophy /></el-icon>
          </div>
          <div class="block-content">
            <div class="block-label">准确答案</div>
            <div class="block-text primary-text">{{ currentAnswer.record.answer }}</div>
          </div>
        </div>

        <div class="answer-block">
          <div class="block-icon">
            <el-icon color="#722ed1"><Reading /></el-icon>
          </div>
          <div class="block-content">
            <div class="block-label">背景知识</div>
            <div class="block-text">{{ currentAnswer.record.background }}</div>
          </div>
        </div>

        <div class="answer-block">
          <div class="block-icon">
            <el-icon color="#e6a23c"><Star /></el-icon>
          </div>
          <div class="block-content">
            <div class="block-label">有趣延伸</div>
            <ul class="fun-facts">
              <li v-for="(fact, idx) in currentAnswer.record.funFacts" :key="idx">
                <span class="fact-bullet">💡</span>
                {{ fact }}
              </li>
            </ul>
          </div>
        </div>

        <div v-if="currentAnswer.record.relatedRecords && currentAnswer.record.relatedRecords.length > 0" class="related-section">
          <div class="related-label">
            <el-icon color="#13c2c2"><Connection /></el-icon>
            相关世界之最
          </div>
          <div class="related-tags">
            <el-tag
              v-for="relId in currentAnswer.record.relatedRecords"
              :key="relId"
              size="small"
              type="info"
              effect="plain"
              class="related-tag"
              @click="viewRelated(relId)"
            >
              {{ getRelatedTitle(relId) }}
            </el-tag>
          </div>
        </div>

        <div class="source-section">
          <div class="source-item">
            <el-icon color="#909399"><Document /></el-icon>
            <span class="source-label">数据来源：</span>
            <span class="source-text">{{ currentAnswer.record.source }}</span>
          </div>
          <div class="source-item">
            <el-icon color="#909399"><Clock /></el-icon>
            <span class="source-label">更新时间：</span>
            <span class="source-text">{{ currentAnswer.record.updatedAt }}</span>
            <el-tooltip content="部分世界之最数据会随时间变化，请注意核对最新信息" placement="top">
              <el-icon class="warning-icon" color="#e6a23c"><WarningFilled /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>

      <div v-if="currentAnswer?.suggestions && currentAnswer.suggestions.length > 0" class="suggestions-section">
        <div class="suggestions-label">
          <el-icon color="#e6a23c"><Compass /></el-icon>
          您可能感兴趣
        </div>
        <div class="suggestion-list">
          <div
            v-for="suggestion in currentAnswer.suggestions"
            :key="suggestion.id"
            class="suggestion-item"
            @click="selectRecord(suggestion)"
          >
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-answer">{{ suggestion.answer }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-if="randomRecords.length > 0 && !currentAnswer" class="random-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#13c2c2">
            <MagicStick />
          </el-icon>
          <span>随机探索 · 发现更多世界之最</span>
          <el-button size="small" text type="primary" @click="loadRandomRecords">
            <el-icon><Refresh /></el-icon>
            换一批
          </el-button>
        </div>
      </template>
      <div class="random-list">
        <div
          v-for="record in randomRecords"
          :key="record.id"
          class="random-item"
          @click="selectRecord(record)"
        >
          <div class="random-tag">{{ record.category }}</div>
          <div class="random-title">{{ record.title }}</div>
          <div class="random-answer">{{ record.answer }}</div>
        </div>
      </div>
    </el-card>

    <el-card v-if="history.length > 0" class="history-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Clock />
          </el-icon>
          <span>查询历史</span>
          <el-button size="small" text type="danger" @click="clearHistory">
            清空记录
          </el-button>
        </div>
      </template>
      <div class="history-list">
        <div
          v-for="(item, index) in displayHistory"
          :key="index"
          class="history-item"
          @click="loadHistoryItem(item)"
        >
          <div class="history-main">
            <el-icon color="#909399" class="history-icon"><ChatDotRound /></el-icon>
            <span class="history-question">{{ item.question }}</span>
            <el-tag
              v-if="item.answer?.found && item.answer?.category"
              size="small"
              type="primary"
              effect="plain"
            >
              {{ item.answer.category }}
            </el-tag>
            <el-tag
              v-else
              size="small"
              type="info"
              effect="plain"
            >
              未匹配
            </el-tag>
          </div>
          <div class="history-meta">
            <span class="history-time">{{ formatTime(item.time) }}</span>
          </div>
        </div>
      </div>
      <div class="history-footer" v-if="history.length > 20">
        <el-button text size="small" @click="showAllHistory = !showAllHistory">
          {{ showAllHistory ? '收起' : `查看全部 ${history.length} 条记录` }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  InfoFilled,
  Search,
  QuestionFilled,
  Reading,
  Clock,
  Refresh,
  CopyDocument,
  MagicStick,
  Grid,
  Collection,
  Close,
  Trophy,
  Star,
  Connection,
  Compass,
  ChatDotRound,
  Document,
  WarningFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  worldRecordApi,
  type WorldRecord,
  type WorldRecordAnswer,
  type CategoryInfo
} from '@/api/worldRecord'

interface HistoryItem {
  question: string
  answer: WorldRecordAnswer
  time: string
}

const STORAGE_KEY = 'world_record_history'

const loading = ref(false)
const questionInput = ref('')
const currentAnswer = ref<WorldRecordAnswer | null>(null)
const currentMessage = ref('')
const categories = ref<CategoryInfo[]>([])
const randomRecords = ref<WorldRecord[]>([])
const allRecords = ref<WorldRecord[]>([])
const selectedCategory = ref<string | null>(null)
const categoryRecords = ref<WorldRecord[]>([])
const history = ref<HistoryItem[]>([])
const showAllHistory = ref(false)

const totalRecords = computed(() => categories.value.reduce((sum, c) => sum + c.count, 0))

const quickExamples = [
  '世界上最深的海沟是哪里',
  '世界上最大的动物是什么',
  '世界上最高的山峰',
  '世界上最小的国家',
  '世界上最长的河流',
  '世界上最快的动物'
]

const displayHistory = computed(() => {
  const reversed = history.value.slice().reverse()
  if (showAllHistory.value) return reversed
  return reversed.slice(0, 10)
})

const loadCategories = async () => {
  try {
    const { data } = await worldRecordApi.getCategories()
    categories.value = data
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const loadAllRecords = async () => {
  try {
    const { data } = await worldRecordApi.getAllRecords()
    allRecords.value = data
  } catch (e) {
    console.error('Failed to load records:', e)
  }
}

const loadRandomRecords = async () => {
  try {
    const { data } = await worldRecordApi.getRandomRecords(6)
    randomRecords.value = data
  } catch (e) {
    console.error('Failed to load random records:', e)
  }
}

const loadRandomQuestion = async () => {
  try {
    const { data } = await worldRecordApi.getRandomRecords(1)
    if (data.length > 0) {
      questionInput.value = data[0].question
    }
  } catch (e) {
    console.error('Failed to load random question:', e)
  }
}

const toggleCategory = async (categoryId: string) => {
  if (selectedCategory.value === categoryId) {
    selectedCategory.value = null
    categoryRecords.value = []
    return
  }
  selectedCategory.value = categoryId
  try {
    const { data } = await worldRecordApi.getRecordsByCategory(categoryId)
    categoryRecords.value = data
  } catch (e) {
    console.error('Failed to load category records:', e)
  }
}

const handleAsk = async () => {
  if (!questionInput.value.trim()) {
    ElMessage.warning('请输入您的问题')
    return
  }

  loading.value = true
  currentAnswer.value = null
  currentMessage.value = ''

  try {
    const { data } = await worldRecordApi.ask(questionInput.value.trim())
    currentAnswer.value = data
    currentMessage.value = data.found ? '' : (data.message || '')
    addToHistory(questionInput.value.trim(), data)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const selectRecord = (record: WorldRecord) => {
  currentAnswer.value = {
    found: true,
    record,
    category: record.category
  }
  currentMessage.value = ''
  questionInput.value = record.question
}

const viewRelated = (relId: string) => {
  const related = allRecords.value.find(r => r.id === relId)
  if (related) {
    selectRecord(related)
  }
}

const getRelatedTitle = (id: string): string => {
  const record = allRecords.value.find(r => r.id === id)
  return record ? record.title : id
}

const loadHistoryFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

const addToHistory = (question: string, answer: WorldRecordAnswer) => {
  history.value = history.value.filter(h => h.question !== question)
  history.value.push({
    question,
    answer,
    time: new Date().toISOString()
  })
  if (history.value.length > 100) {
    history.value = history.value.slice(-100)
  }
  saveHistory()
}

const loadHistoryItem = (item: HistoryItem) => {
  questionInput.value = item.question
  currentAnswer.value = item.answer
  currentMessage.value = item.answer.found ? '' : (item.answer.message || '')
  ElMessage.success('已载入历史记录')
}

const clearHistory = () => {
  history.value = []
  saveHistory()
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

const copyAnswer = () => {
  const lines: string[] = []
  if (currentAnswer.value?.record) {
    const r = currentAnswer.value.record
    lines.push(`【${r.title}】`)
    lines.push('')
    lines.push(`📌 答案：${r.answer}`)
    lines.push('')
    lines.push('📚 背景知识：')
    lines.push(r.background)
    lines.push('')
    lines.push('💡 有趣延伸：')
    r.funFacts.forEach((f, i) => {
      lines.push(`${i + 1}. ${f}`)
    })
    lines.push('')
    lines.push(`分类：${r.category}`)
    lines.push('')
    lines.push(`📄 数据来源：${r.source}`)
    lines.push(`🕒 更新时间：${r.updatedAt}`)
    lines.push('⚠️ 注：部分世界之最数据会随时间变化，引用时请核对最新信息')
  } else if (currentMessage.value) {
    lines.push(currentMessage.value)
    if (currentAnswer.value?.suggestions && currentAnswer.value.suggestions.length > 0) {
      lines.push('')
      lines.push('相关推荐：')
      currentAnswer.value.suggestions.forEach(s => {
        lines.push(`- ${s.title}：${s.answer}`)
      })
    }
  }

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

onMounted(() => {
  loadHistoryFromStorage()
  loadCategories()
  loadAllRecords()
  loadRandomRecords()
})
</script>

<style scoped>
.world-record {
  max-width: 1100px;
  margin: 0 auto;
}

.guide-card,
.category-card,
.category-records-card,
.qa-card,
.answer-card,
.random-card,
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

.refresh-btn {
  margin-left: auto;
}

.copy-btn {
  margin-left: auto;
}

.guide-steps {
  padding: 10px 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.category-item {
  padding: 16px;
  background: #fafafa;
  border: 2px solid #ebeef5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 8px 12px;
  align-items: center;
}

.category-item:hover {
  border-color: #165DFF;
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.category-item.active {
  border-color: #165DFF;
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
}

.category-icon {
  grid-row: span 2;
  font-size: 40px;
  line-height: 1;
}

.category-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-count {
  font-size: 13px;
  color: #165DFF;
  font-weight: 600;
}

.category-desc {
  grid-column: 2;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.record-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.record-item {
  padding: 14px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.record-item:hover {
  border-color: #165DFF;
  background: #f0f7ff;
}

.record-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.record-answer {
  font-size: 13px;
  color: #165DFF;
  line-height: 1.5;
}

.input-section {
  margin-bottom: 8px;
}

.input-header {
  margin-bottom: 12px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-field {
  flex: 1;
}

.quick-examples {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 13px;
  color: #909399;
}

.example-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.example-tag:hover {
  color: #165DFF;
  border-color: #165DFF;
}

.message-section {
  margin-bottom: 16px;
}

.answer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  padding-bottom: 12px;
  border-bottom: 2px solid #ebeef5;
}

.answer-block {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
}

.answer-block-primary {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border: 1px solid #b3d8ff;
}

.block-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.block-content {
  flex: 1;
  min-width: 0;
}

.block-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
}

.block-text {
  font-size: 15px;
  color: #303133;
  line-height: 1.8;
}

.primary-text {
  font-size: 18px;
  font-weight: 600;
  color: #165DFF;
}

.fun-facts {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fun-facts li {
  font-size: 14px;
  color: #303133;
  line-height: 1.8;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.fact-bullet {
  flex-shrink: 0;
  line-height: 1.8;
}

.related-section {
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6fffb 100%);
  border-radius: 10px;
  border: 1px solid #b5ecf5;
}

.related-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #13c2c2;
  margin-bottom: 10px;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.related-tag:hover {
  color: #13c2c2;
  border-color: #13c2c2;
}

.source-section {
  padding: 14px 16px;
  background: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  flex-wrap: wrap;
}

.source-label {
  font-weight: 600;
  color: #909399;
}

.source-text {
  color: #606266;
}

.warning-icon {
  margin-left: 4px;
  cursor: help;
}

.suggestions-section {
  margin-top: 16px;
}

.suggestions-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #e6a23c;
  margin-bottom: 12px;
}

.suggestion-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.suggestion-item {
  padding: 12px 14px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  border-color: #e6a23c;
  background: #fff7cc;
  transform: translateY(-1px);
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.suggestion-answer {
  font-size: 13px;
  color: #e6a23c;
  line-height: 1.5;
}

.random-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.random-item {
  padding: 14px;
  background: linear-gradient(135deg, #f9f0ff 0%, #fff 100%);
  border: 1px solid #d3adf7;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.random-item:hover {
  border-color: #722ed1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
}

.random-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f9f0ff;
  color: #722ed1;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: 500;
}

.random-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.random-answer {
  font-size: 13px;
  color: #722ed1;
  line-height: 1.5;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.history-item:hover {
  border-color: #165DFF;
  background: #f0f7ff;
}

.history-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.history-icon {
  flex-shrink: 0;
}

.history-question {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  flex-shrink: 0;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-footer {
  margin-top: 12px;
  text-align: center;
}
</style>
