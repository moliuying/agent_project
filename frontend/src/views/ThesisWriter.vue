<template>
  <div class="thesis-writer">
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
        <el-step title="输入题目" description="输入论文题目或核心研究主题" />
        <el-step title="设置参数" description="选择章节类型、学术水平和字数等" />
        <el-step title="一键生成" description="AI 按照学术规范自动生成内容" />
        <el-step title="编辑使用" description="复制、导出或进一步润色完善" />
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

    <el-card class="writer-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Edit />
          </el-icon>
          <span>论文内容辅助生成</span>
          <el-tag size="small" type="success" class="header-tag">学术写作规范</el-tag>
        </div>
      </template>

      <div class="input-section">
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <div class="input-item">
              <div class="input-header">
                <span class="input-label">
                  <el-icon color="#f56c6c"><Star /></el-icon>
                  论文题目
                </span>
                <el-tag size="small" type="info">
                  {{ topic.length }} / 100
                </el-tag>
              </div>
              <el-input
                v-model="topic"
                placeholder="请输入论文题目，例如：人工智能在教育领域的应用研究"
                maxlength="100"
                show-word-limit
                class="text-input"
              />
            </div>
          </el-col>
          <el-col :xs="24" :md="12">
            <div class="input-item">
              <div class="input-header">
                <span class="input-label">研究方向</span>
                <el-tag size="small" type="info">
                  {{ researchDirection.length }} / 100
                </el-tag>
              </div>
              <el-input
                v-model="researchDirection"
                placeholder="请输入研究方向或所属学科，例如：计算机科学与技术"
                maxlength="100"
                class="text-input"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="example-section">
        <span class="example-label">快速示例：</span>
        <div class="example-tags">
          <el-tag
            v-for="(example, idx) in quickExamples"
            :key="idx"
            size="small"
            effect="plain"
            type="primary"
            class="example-tag"
            @click="applyExample(example)"
          >
            {{ example.topic }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <div class="options-section">
        <div class="section-title">
          <el-icon :size="16" color="#165DFF"><Setting /></el-icon>
          <span>生成配置</span>
        </div>
        <el-row :gutter="16" class="options-grid">
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>章节类型</span>
                <el-tooltip content="选择需要生成的论文章节" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-select v-model="sectionType" placeholder="请选择章节" class="option-select">
                <el-option
                  v-for="section in sectionTypes"
                  :key="section.key"
                  :label="section.name"
                  :value="section.key"
                >
                  <div class="style-option">
                    <span class="style-name">{{ section.name }}</span>
                    <el-tag size="small" :type="section.tagType">{{ section.tag }}</el-tag>
                  </div>
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>学术水平</span>
                <el-tooltip content="根据学历或投稿要求选择" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <el-select v-model="academicLevel" placeholder="选择学术水平" class="option-select">
                <el-option label="本科论文" value="bachelor" />
                <el-option label="硕士论文" value="master" />
                <el-option label="博士论文" value="doctor" />
                <el-option label="期刊投稿" value="journal" />
                <el-option label="课程论文" value="course" />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16" class="options-grid">
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>目标字数</span>
              </div>
              <el-radio-group v-model="wordCount" class="length-group">
                <el-radio-button value="short">简短</el-radio-button>
                <el-radio-button value="medium">中等</el-radio-button>
                <el-radio-button value="long">详细</el-radio-button>
              </el-radio-group>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="option-item">
              <div class="option-label">
                <span>引用格式</span>
              </div>
              <el-select v-model="citationStyle" placeholder="选择引用格式" class="option-select">
                <el-option label="GB/T 7714 (国标)" value="gb7714" />
                <el-option label="APA" value="apa" />
                <el-option label="MLA" value="mla" />
                <el-option label="Chicago/Turabian" value="chicago" />
                <el-option label="IEEE" value="ieee" />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <div class="option-item">
          <div class="option-label">
            <span>特殊要求（可选）</span>
          </div>
          <el-input
            v-model="customRequirements"
            type="textarea"
            :rows="2"
            placeholder="可补充特殊要求，如：需要包含实证分析、注重案例研究、侧重理论探讨等（500字以内）"
            maxlength="500"
            show-word-limit
            resize="vertical"
            class="text-input"
          />
        </div>
      </div>

      <el-divider />

      <div class="outline-preview" v-if="currentOutline.length > 0">
        <div class="section-title">
          <el-icon :size="16" color="#67c23a"><Tickets /></el-icon>
          <span>内容大纲预览</span>
        </div>
        <div class="outline-tags">
          <el-tag
            v-for="(item, idx) in currentOutline"
            :key="idx"
            size="small"
            type="success"
            effect="plain"
          >
            {{ idx + 1 }}. {{ item }}
          </el-tag>
        </div>
      </div>

      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          :loading="isGenerating"
          :disabled="!topic.trim()"
          @click="generateContent"
          class="generate-btn"
        >
          <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
          <Loading v-else />
          {{ isGenerating ? 'AI 正在生成论文内容...' : '开始生成' }}
        </el-button>
        <el-button
          size="large"
          :disabled="!topic.trim() && !outputText"
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
            <span>生成结果</span>
            <el-tag size="small" type="success">{{ outputWordCount }} 字</el-tag>
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
            <el-button size="small" type="success" @click="downloadOutput">
              <el-icon><Download /></el-icon>
              下载为 TXT
            </el-button>
          </div>
        </div>
        <div class="output-meta">
          <el-tag size="small" type="info">{{ outputMeta.sectionType }}</el-tag>
          <el-tag size="small" type="warning">{{ outputMeta.academicLevel }}</el-tag>
        </div>
        <div class="output-content">
          <div v-for="(para, idx) in outputParagraphs" :key="idx" class="output-paragraph">
            <template v-for="(line, lineIdx) in para.split('\n')" :key="lineIdx">
              <p v-if="line.trim()" class="output-line">{{ line }}</p>
            </template>
          </div>
        </div>
        <div class="output-stats">
          <div class="stat-item">
            <span class="stat-label">段落数</span>
            <span class="stat-value">{{ outputParagraphs.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预估阅读时间</span>
            <span class="stat-value">{{ Math.max(1, Math.ceil(outputWordCount / 300)) }} 分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">章节类型</span>
            <span class="stat-value">{{ outputMeta.sectionType }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">学术水平</span>
            <span class="stat-value">{{ outputMeta.academicLevel }}</span>
          </div>
        </div>
      </div>

      <el-empty
        v-else-if="!isGenerating"
        description="输入论文题目和相关配置后，点击「开始生成」，AI 将为您生成符合学术规范的论文内容"
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
              <el-tag size="small" type="info">题目</el-tag>
              <span class="history-text">{{ item.topic }}</span>
            </div>
            <div class="history-output">
              <el-tag size="small" type="success">内容</el-tag>
              <span class="history-text">{{ item.outputPreview }}</span>
            </div>
          </div>
          <div class="history-meta">
            <el-tag size="small">{{ item.sectionType }}</el-tag>
            <el-tag size="small" type="warning">{{ item.academicLevel }}</el-tag>
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
import { ref, computed, onMounted, watch } from 'vue'
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
  Star,
  Tickets,
  Download,
  Reading,
  Medal,
  Notebook,
  Collection,
  DataLine
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { thesisWriterApi, type GenerateResponse } from '@/api/thesisWriter'

interface HistoryItem {
  topic: string
  researchDirection: string
  output: string
  outputPreview: string
  sectionType: string
  academicLevel: string
  wordCount: string
  citationStyle: string
  customRequirements: string
  time: string
}

const STORAGE_KEY = 'thesis_writer_history'

const topic = ref('')
const researchDirection = ref('')
const sectionType = ref('full')
const academicLevel = ref('bachelor')
const wordCount = ref('medium')
const citationStyle = ref('gb7714')
const customRequirements = ref('')
const outputText = ref('')
const outputMeta = ref<GenerateResponse | null>(null)
const isGenerating = ref(false)
const history = ref<HistoryItem[]>([])
const showAllHistory = ref(false)

const scenes = [
  { key: 'degree', name: '学位论文', desc: '本科/硕士/博士毕业论文写作', icon: 'Medal', color: '#f56c6c', bgColor: '#fef0f0' },
  { key: 'journal', name: '期刊投稿', desc: 'SCI/核心期刊论文发表', icon: 'Reading', color: '#165DFF', bgColor: '#e6f0ff' },
  { key: 'course', name: '课程论文', desc: '课程作业、结课报告', icon: 'Notebook', color: '#67c23a', bgColor: '#f0f9eb' },
  { key: 'outline', name: '论文大纲', desc: '快速搭建论文结构框架', icon: 'Collection', color: '#e6a23c', bgColor: '#fff7e6' },
  { key: 'literature', name: '文献综述', desc: '系统梳理相关研究进展', icon: 'DataLine', color: '#722ed1', bgColor: '#f3e8ff' },
  { key: 'proposal', name: '开题报告', desc: '研究计划与方案论证', icon: 'EditPen', color: '#13c2c2', bgColor: '#e6fffb' }
]

const sectionTypes = [
  { key: 'full', name: '完整论文', tag: '推荐', tagType: 'success' },
  { key: 'abstract', name: '摘要', tag: '简洁', tagType: 'info' },
  { key: 'introduction', name: '绪论', tag: '开篇', tagType: 'primary' },
  { key: 'literature', name: '文献综述', tag: '综述', tagType: 'warning' },
  { key: 'methodology', name: '研究方法', tag: '方法', tagType: 'info' },
  { key: 'analysis', name: '实证分析', tag: '分析', tagType: 'success' },
  { key: 'discussion', name: '讨论', tag: '讨论', tagType: 'warning' },
  { key: 'conclusion', name: '结论与展望', tag: '总结', tagType: 'danger' }
]

const sectionOutlineMap: Record<string, string[]> = {
  abstract: ['研究背景', '研究方法', '核心发现', '研究意义'],
  introduction: ['研究背景与意义', '国内外研究现状', '研究内容与方法', '研究创新点'],
  literature: ['相关概念界定', '理论基础梳理', '国内外研究综述', '研究现状评述'],
  methodology: ['研究思路', '研究方法', '样本与数据', '模型构建'],
  analysis: ['描述性统计', '回归分析', '稳健性检验', '异质性分析'],
  discussion: ['结果讨论', '理论贡献', '实践启示', '研究局限'],
  conclusion: ['主要研究结论', '理论与实践意义', '研究不足', '未来研究展望'],
  full: ['摘要', '绪论', '文献综述与理论基础', '研究设计', '实证分析', '讨论与建议', '结论与展望', '参考文献']
}

const quickExamples = [
  { topic: '人工智能在教育领域的应用研究', direction: '教育技术学' },
  { topic: '数字经济对产业结构升级的影响', direction: '产业经济学' },
  { topic: '社交媒体环境下用户信息行为研究', direction: '传播学' },
  { topic: '新能源汽车企业技术创新路径研究', direction: '企业管理' },
  { topic: '城市社区治理现代化路径探索', direction: '公共管理' }
]

const sceneIconMap: Record<string, any> = {
  Medal,
  Reading,
  Notebook,
  Collection,
  DataLine,
  EditPen
}

const currentOutline = computed(() => {
  return sectionOutlineMap[sectionType.value] || []
})

const getSceneIcon = (iconName: string) => {
  return sceneIconMap[iconName] || EditPen
}

const outputParagraphs = computed(() => {
  if (!outputText.value) return []
  return outputText.value.split('\n\n').filter(p => p.trim())
})

const outputWordCount = computed(() => {
  if (!outputText.value) return 0
  return outputText.value.replace(/\s/g, '').length
})

const displayHistory = computed(() => {
  const reversed = history.value.slice().reverse()
  if (showAllHistory.value) return reversed
  return reversed.slice(0, 10)
})

const applyExample = (example: { topic: string; direction: string }) => {
  topic.value = example.topic
  researchDirection.value = example.direction
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

const addToHistory = () => {
  if (!topic.value.trim() || !outputText.value) return

  const outputPreview = outputText.value.substring(0, 100) + (outputText.value.length > 100 ? '...' : '')
  const sectionName = sectionTypes.find(s => s.key === sectionType.value)?.name || sectionType.value

  history.value.push({
    topic: topic.value,
    researchDirection: researchDirection.value,
    output: outputText.value,
    outputPreview,
    sectionType: sectionName,
    academicLevel: academicLevel.value,
    wordCount: wordCount.value,
    citationStyle: citationStyle.value,
    customRequirements: customRequirements.value,
    time: new Date().toISOString()
  })

  if (history.value.length > 50) {
    history.value = history.value.slice(-50)
  }

  saveHistory()
}

const generateContent = async () => {
  if (!topic.value.trim()) {
    ElMessage.warning('请输入论文题目')
    return
  }

  isGenerating.value = true
  try {
    const { data } = await thesisWriterApi.generate({
      topic: topic.value,
      researchDirection: researchDirection.value,
      sectionType: sectionType.value,
      academicLevel: academicLevel.value,
      wordCount: wordCount.value,
      citationStyle: citationStyle.value,
      customRequirements: customRequirements.value
    })
    outputText.value = data.result
    outputMeta.value = data
    addToHistory()
    ElMessage.success('论文内容生成成功！')
  } catch (error) {
    console.error('Generation error:', error)
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

const regenerate = () => {
  generateContent()
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

const downloadOutput = () => {
  if (!outputText.value) return
  const filename = `${topic.value.substring(0, 20) || '论文内容'}.txt`
  const blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('下载成功')
}

const copyHistoryOutput = (item: HistoryItem) => {
  navigator.clipboard.writeText(item.output).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

const clearAll = () => {
  topic.value = ''
  researchDirection.value = ''
  customRequirements.value = ''
  outputText.value = ''
  outputMeta.value = null
  ElMessage.success('已清空')
}

const loadHistoryItem = (item: HistoryItem) => {
  topic.value = item.topic
  researchDirection.value = item.researchDirection
  outputText.value = item.output
  sectionType.value = sectionTypes.find(s => s.name === item.sectionType)?.key || 'full'
  academicLevel.value = item.academicLevel
  wordCount.value = item.wordCount
  citationStyle.value = item.citationStyle
  customRequirements.value = item.customRequirements
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
.thesis-writer {
  max-width: 1000px;
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

.writer-card {
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
  margin-bottom: 12px;
}

.input-item {
  margin-bottom: 12px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 4px;
}

.text-input :deep(.el-input__wrapper),
.text-input :deep(.el-textarea__inner) {
  font-size: 15px;
  line-height: 1.6;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.example-section {
  margin-top: 8px;
  margin-bottom: 16px;
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

.help-icon {
  color: #909399;
  cursor: help;
  font-size: 16px;
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

.outline-preview {
  margin-bottom: 16px;
  padding: 16px;
  background: #f0f9eb;
  border-radius: 8px;
  border: 1px dashed #67c23a;
}

.outline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.action-section {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 8px 0;
}

.generate-btn {
  min-width: 220px;
}

.output-section {
  margin-top: 8px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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

.output-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.output-content {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 10%);
  border-radius: 12px;
  padding: 24px 28px;
  border-left: 4px solid #67c23a;
  margin-bottom: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.output-paragraph {
  margin-bottom: 16px;
}

.output-paragraph:last-child {
  margin-bottom: 0;
}

.output-line {
  font-size: 15px;
  line-height: 2;
  color: #303133;
  text-indent: 2em;
  margin: 0;
  white-space: pre-wrap;
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
