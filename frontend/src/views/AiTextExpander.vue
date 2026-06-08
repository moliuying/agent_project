<template>
  <div class="ai-text-expander">
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
        <el-step title="输入内容" description="输入一句话或简短的核心描述" />
        <el-step title="选择风格" description="根据使用场景选择合适的写作风格" />
        <el-step title="生成扩文" description="点击按钮，AI自动扩展为丰富长文" />
        <el-step title="复制使用" description="复制结果，直接用于写作、发帖、邮件等" />
      </el-steps>
    </el-card>

    <el-card class="scenes-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <MagicStick />
          </el-icon>
          <span>适用场景</span>
        </div>
      </template>
      <div class="scenes-grid">
        <div class="scene-item" v-for="scene in scenes" :key="scene.key">
          <div class="scene-icon" :style="{ background: scene.bgColor, color: scene.color }">
            <el-icon :size="22"><component :is="getSceneIcon(scene.icon)" /></el-icon>
          </div>
          <div class="scene-info">
            <div class="scene-name">{{ scene.name }}</div>
            <div class="scene-desc">{{ scene.desc }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="expander-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Edit />
          </el-icon>
          <span>AI 智能扩文</span>
          <el-tag size="small" type="success" class="header-tag">一键生成丰富内容</el-tag>
        </div>
      </template>

      <div class="input-section">
        <div class="input-header">
          <span class="input-label">原始内容</span>
          <div class="input-actions">
            <el-tag size="small" type="info">
              {{ inputText.length }} 字
            </el-tag>
            <el-tooltip content="建议输入 1-50 字的简短描述" placement="top">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="4"
          placeholder="请输入一句话或简短描述，例如：今天天气很好，我想出去走走..."
          resize="vertical"
          class="text-input"
        />
        <div class="example-row">
          <span class="example-label">快速示例：</span>
          <div class="example-tags">
            <el-tag
              v-for="(example, idx) in quickExamples"
              :key="idx"
              size="small"
              effect="plain"
              type="primary"
              class="example-tag"
              @click="inputText = example"
            >
              {{ example }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="options-section">
        <div class="section-title">
          <el-icon :size="16" color="#165DFF"><Setting /></el-icon>
          <span>扩文配置</span>
        </div>
        <el-row :gutter="16" class="options-grid">
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>写作风格</span>
                <el-tooltip content="不同风格适用于不同场景" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-select v-model="selectedStyle" placeholder="请选择风格" class="option-select">
                <el-option
                  v-for="style in writingStyles"
                  :key="style.key"
                  :label="style.name"
                  :value="style.key"
                >
                  <div class="style-option">
                    <span class="style-name">{{ style.name }}</span>
                    <el-tag size="small" :type="style.tagType">{{ style.tag }}</el-tag>
                  </div>
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>目标长度</span>
                <el-tooltip content="生成内容的大致字数范围" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-radio-group v-model="targetLength" class="length-group">
                <el-radio-button value="short">简短 (150-250字)</el-radio-button>
                <el-radio-button value="medium">中等 (300-500字)</el-radio-button>
                <el-radio-button value="long">详细 (600-1000字)</el-radio-button>
              </el-radio-group>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="options-grid">
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>语气语调</span>
              </div>
              <el-select v-model="tone" placeholder="选择语气" class="option-select">
                <el-option label="正式专业" value="formal" />
                <el-option label="轻松活泼" value="casual" />
                <el-option label="温暖亲切" value="warm" />
                <el-option label="幽默风趣" value="humorous" />
                <el-option label="客观中立" value="neutral" />
                <el-option label="激励鼓舞" value="inspiring" />
              </el-select>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>目标读者</span>
              </div>
              <el-select v-model="audience" placeholder="选择读者群体" class="option-select">
                <el-option label="普通大众" value="general" />
                <el-option label="职场人士" value="professional" />
                <el-option label="学生群体" value="student" />
                <el-option label="文艺青年" value="literary" />
                <el-option label="科技爱好者" value="tech" />
                <el-option label="商务客户" value="business" />
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider />

      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          :loading="isGenerating"
          :disabled="!inputText.trim()"
          @click="generateText"
          class="generate-btn"
        >
          <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
          <Loading v-else />
          {{ isGenerating ? 'AI 正在创作中...' : '开始扩文' }}
        </el-button>
        <el-button
          size="large"
          :disabled="!inputText.trim() && !outputText"
          @click="clearAll"
        >
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>

      <el-divider v-if="outputText" />

      <div v-if="outputText" class="output-section">
        <div class="output-header">
          <div class="output-title-row">
            <el-icon :size="18" color="#67c23a"><Document /></el-icon>
            <span>扩文结果</span>
            <el-tag size="small" type="success">{{ outputText.length }} 字</el-tag>
          </div>
          <div class="output-actions">
            <el-button size="small" @click="regenerate">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
            <el-button size="small" type="primary" @click="copyOutput">
              <el-icon><DocumentCopy /></el-icon>
              复制全文
            </el-button>
          </div>
        </div>
        <div class="output-content">
          <p v-for="(para, idx) in outputParagraphs" :key="idx" class="output-paragraph">
            {{ para }}
          </p>
        </div>
        <div class="output-stats">
          <div class="stat-item">
            <span class="stat-label">段落数</span>
            <span class="stat-value">{{ outputParagraphs.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预估阅读时间</span>
            <span class="stat-value">{{ Math.max(1, Math.ceil(outputText.length / 300)) }} 分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">使用风格</span>
            <span class="stat-value">{{ getStyleName(selectedStyle) }}</span>
          </div>
        </div>
      </div>

      <el-empty
        v-else-if="!isGenerating"
        description="输入内容后点击「开始扩文」，AI 将为您生成丰富内容"
        class="empty-state"
      >
        <template #image>
          <el-icon :size="64" color="#c0c4cc"><EditPen /></el-icon>
        </template>
      </el-empty>
    </el-card>

    <el-card v-if="history.length > 0" class="history-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Clock />
          </el-icon>
          <span>历史记录</span>
          <el-button size="small" text type="danger" @click="clearHistory">
            清空记录
          </el-button>
        </div>
      </template>

      <div class="history-list">
        <div class="history-item" v-for="(item, index) in displayHistory" :key="index">
          <div class="history-main">
            <div class="history-input">
              <el-tag size="small" type="info">原文</el-tag>
              <span class="history-text">{{ item.input }}</span>
            </div>
            <div class="history-output">
              <el-tag size="small" type="success">扩文</el-tag>
              <span class="history-text">{{ item.outputPreview }}</span>
            </div>
          </div>
          <div class="history-meta">
            <el-tag size="small">{{ item.styleName }}</el-tag>
            <span class="history-time">{{ formatTime(item.time) }}</span>
          </div>
          <div class="history-actions">
            <el-button size="small" text @click="loadHistoryItem(item)">
              <el-icon><Refresh /></el-icon>
              载入
            </el-button>
            <el-button size="small" text type="primary" @click="copyHistoryOutput(item)">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
        </div>
      </div>
      <div class="history-footer" v-if="history.length > 10">
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
  Document,
  InfoFilled,
  Edit,
  EditPen,
  MagicStick,
  Setting,
  QuestionFilled,
  Delete,
  Refresh,
  DocumentCopy,
  Clock,
  Loading,
  ChatDotRound,
  DataLine,
  OfficeBuilding,
  Goods,
  User,
  Collection,
  Promotion
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { aiTextExpanderApi } from '@/api/aiTextExpander'

interface HistoryItem {
  input: string
  output: string
  outputPreview: string
  style: string
  styleName: string
  length: string
  tone: string
  audience: string
  time: string
}

const STORAGE_KEY = 'ai_text_expander_history'

const inputText = ref('')
const outputText = ref('')
const selectedStyle = ref('article')
const targetLength = ref('medium')
const tone = ref('casual')
const audience = ref('general')
const isGenerating = ref(false)
const history = ref<HistoryItem[]>([])
const showAllHistory = ref(false)

const scenes = [
  { key: 'wechat', name: '公众号文章', desc: '适合公众号推文、自媒体创作', icon: 'ChatDotRound', color: '#07c160', bgColor: '#e8f8ef' },
  { key: 'social', name: '社交媒体', desc: '适合微博、朋友圈、小红书发帖', icon: 'Promotion', color: '#e6162d', bgColor: '#fef0f0' },
  { key: 'email', name: '邮件正文', desc: '适合商务邮件、工作沟通邮件', icon: 'OfficeBuilding', color: '#165DFF', bgColor: '#e6f0ff' },
  { key: 'writing', name: '写作助手', desc: '适合作文、稿件、文案创作', icon: 'EditPen', color: '#722ed1', bgColor: '#f3e8ff' },
  { key: 'product', name: '产品描述', desc: '适合商品介绍、产品文案', icon: 'Goods', color: '#e6a23c', bgColor: '#fff7e6' },
  { key: 'report', name: '报告总结', desc: '适合工作总结、项目报告', icon: 'DataLine', color: '#13c2c2', bgColor: '#e6fffb' }
]

const writingStyles = [
  { key: 'article', name: '公众号文章', tag: '推荐', tagType: 'success' },
  { key: 'social', name: '社交媒体', tag: '热门', tagType: 'danger' },
  { key: 'email', name: '商务邮件', tag: '专业', tagType: 'primary' },
  { key: 'essay', name: '散文随笔', tag: '文艺', tagType: 'warning' },
  { key: 'report', name: '工作报告', tag: '正式', tagType: 'info' },
  { key: 'story', name: '故事叙述', tag: '创意', tagType: 'success' },
  { key: 'product', name: '产品文案', tag: '营销', tagType: 'warning' },
  { key: 'academic', name: '学术风格', tag: '严谨', tagType: 'info' }
]

const quickExamples = [
  '今天天气很好，适合出门',
  '我最近在读一本很有趣的书',
  '人工智能正在改变我们的生活',
  '周末和朋友去爬山了',
  '公司今天发布了新产品'
]

const sceneIconMap: Record<string, any> = {
  ChatDotRound,
  Promotion,
  OfficeBuilding,
  EditPen,
  Goods,
  DataLine,
  User,
  Collection
}

const getSceneIcon = (iconName: string) => {
  return sceneIconMap[iconName] || EditPen
}

const getStyleName = (key: string) => {
  const style = writingStyles.find(s => s.key === key)
  return style ? style.name : key
}

const outputParagraphs = computed(() => {
  if (!outputText.value) return []
  return outputText.value.split('\n\n').filter(p => p.trim())
})

const displayHistory = computed(() => {
  const reversed = history.value.slice().reverse()
  if (showAllHistory.value) return reversed
  return reversed.slice(0, 10)
})

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

const addToHistory = () => {
  if (!inputText.value.trim() || !outputText.value) return

  const outputPreview = outputText.value.substring(0, 80) + (outputText.value.length > 80 ? '...' : '')

  history.value.push({
    input: inputText.value,
    output: outputText.value,
    outputPreview,
    style: selectedStyle.value,
    styleName: getStyleName(selectedStyle.value),
    length: targetLength.value,
    tone: tone.value,
    audience: audience.value,
    time: new Date().toISOString()
  })

  if (history.value.length > 100) {
    history.value = history.value.slice(-100)
  }

  saveHistory()
}

const generateText = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入需要扩写的内容')
    return
  }

  isGenerating.value = true
  try {
    const { data } = await aiTextExpanderApi.expand({
      text: inputText.value,
      style: selectedStyle.value,
      length: targetLength.value,
      tone: tone.value,
      audience: audience.value
    })
    outputText.value = data.result
    addToHistory()
    ElMessage.success('扩文生成成功！')
  } catch (error) {
    console.error('Generation error:', error)
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

const regenerate = () => {
  generateText()
}

const copyOutput = () => {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = outputText.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制到剪贴板')
  })
}

const copyHistoryOutput = (item: HistoryItem) => {
  navigator.clipboard.writeText(item.output).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
  ElMessage.success('已清空')
}

const loadHistoryItem = (item: HistoryItem) => {
  inputText.value = item.input
  outputText.value = item.output
  selectedStyle.value = item.style
  targetLength.value = item.length
  tone.value = item.tone
  audience.value = item.audience
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

onMounted(() => {
  loadHistoryFromStorage()
})
</script>

<style scoped>
.ai-text-expander {
  max-width: 900px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
}

.scenes-card {
  margin-bottom: 24px;
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.scene-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.scene-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.scene-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.scene-info {
  flex: 1;
  min-width: 0;
}

.scene-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.scene-desc {
  font-size: 12px;
  color: #909399;
}

.expander-card {
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

.input-section {
  margin-bottom: 16px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-icon {
  color: #909399;
  cursor: help;
  font-size: 16px;
}

.text-input :deep(.el-textarea__inner) {
  font-size: 15px;
  line-height: 1.8;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.example-row {
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
  padding-top: 3px;
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.example-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-tag:hover {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.options-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.options-grid {
  margin-bottom: 12px;
}

.option-item {
  margin-bottom: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.option-select {
  width: 100%;
}

.style-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.style-name {
  font-size: 14px;
}

.length-group {
  display: flex;
  flex-wrap: wrap;
}

.action-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 8px 0;
}

.generate-btn {
  min-width: 200px;
}

.output-section {
  margin-top: 8px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.output-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.output-actions {
  display: flex;
  gap: 8px;
}

.output-content {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 10%);
  border-radius: 12px;
  padding: 20px 24px;
  border-left: 4px solid #67c23a;
  margin-bottom: 16px;
}

.output-paragraph {
  font-size: 15px;
  line-height: 2;
  color: #303133;
  text-indent: 2em;
  margin: 0 0 12px 0;
}

.output-paragraph:last-child {
  margin-bottom: 0;
}

.output-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #165DFF;
}

.empty-state {
  padding: 40px 0;
}

.history-card {
  margin-bottom: 24px;
}

.history-card .card-header {
  justify-content: space-between;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  gap: 16px;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
}

.history-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-input,
.history-output {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.history-text {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  line-height: 1.5;
  padding-top: 2px;
}

.history-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.history-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .scenes-grid {
    grid-template-columns: 1fr 1fr;
  }

  .generate-btn {
    min-width: 160px;
  }

  .output-content {
    padding: 16px;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .history-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }

  .history-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
