<template>
  <div class="cooking-qa">
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="22" color="#e6a23c"><Reading /></el-icon>
          <span>烹饪问题解答</span>
          <el-tag type="warning" size="small" effect="dark" class="header-tag">
            <el-icon style="margin-right: 4px;"><Cpu /></el-icon>
            AI 专业厨师
          </el-tag>
        </div>
      </template>
      <div class="intro-content">
        <div class="intro-icon">👨‍🍳</div>
        <h2>解决做菜中的所有难题</h2>
        <p>输入做菜过程中遇到的具体问题，AI 以专业厨师身份给出针对性的解决方案和操作要点，帮助你快速排查问题、掌握烹饪技巧。适用于日常做菜、新手学厨、菜品改良等场景。</p>
        <el-row :gutter="16" class="feature-row">
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🍳</div>
              <h4>煎制技巧</h4>
              <p>不粘锅、鱼皮完整</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🥗</div>
              <h4>炒制要领</h4>
              <p>不出水、有锅气</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🥩</div>
              <h4>肉类处理</h4>
              <p>鲜嫩不柴、多汁入味</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🎂</div>
              <h4>烘焙解惑</h4>
              <p>不塌陷、口感完美</p>
            </div>
          </el-col>
        </el-row>

        <div class="techniques-intro">
          <div class="ti-title">
            <el-icon color="#409eff"><DataAnalysis /></el-icon>
            <span>核心烹饪技术要点</span>
          </div>
          <div class="ti-tags">
            <el-tag v-for="tech in coreTechniques" :key="tech" effect="plain" type="primary" size="small" class="tech-tag">
              {{ tech }}
            </el-tag>
          </div>
          <div class="ti-note">
            <el-icon color="#67c23a"><Star /></el-icon>
            <span>每个问题都会附上相关烹饪技巧卡片，包含详细步骤、关键要点和常见误区，照着做成功率更高！</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="chat-card" v-loading="loading">
      <template #header>
        <div class="chat-header">
          <div class="chat-title">
            <el-icon :size="20" color="#e6a23c"><ChatDotRound /></el-icon>
            <span>对话区</span>
            <el-tag size="small" type="info">第 {{ messages.length > 0 ? Math.ceil(messages.length / 2) : 0 }} 轮</el-tag>
          </div>
          <div class="chat-actions">
            <el-button size="small" @click="clearChat">
              <el-icon><Delete /></el-icon>
              清空对话
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="suggestedQuestions.length > 0 && messages.length === 0" class="suggested-section">
        <div class="suggested-title">
          <el-icon><Bulb /></el-icon>
          <span>试试这些常见问题：</span>
        </div>
        <div class="suggested-buttons">
          <el-tag
            v-for="q in suggestedQuestions"
            :key="q"
            class="suggested-tag"
            effect="plain"
            type="warning"
            @click="askQuestion(q)"
          >
            {{ q }}
          </el-tag>
        </div>
      </div>

      <div class="chat-container" ref="chatContainerRef">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-item"
          :class="msg.role"
        >
          <div class="avatar">
            <el-avatar :size="40" :class="msg.role">
              <el-icon v-if="msg.role === 'ai'" :size="22"><Cpu /></el-icon>
              <el-icon v-else :size="22"><User /></el-icon>
            </el-avatar>
          </div>
          <div class="bubble-wrapper">
            <div class="bubble">
              <div class="bubble-content" v-html="formatAnswer(msg.content)"></div>
            </div>
            <div class="techniques-section" v-if="msg.relatedTechniques && msg.relatedTechniques.length > 0 && msg.role === 'ai'">
              <div class="techniques-title">
                <el-icon color="#409eff"><MagicStick /></el-icon>
                <span>相关技术要点</span>
              </div>
              <div class="techniques-list">
                <el-tag v-for="tech in msg.relatedTechniques" :key="tech" effect="dark" type="primary" size="small" class="technique-tag">
                  {{ tech }}
                </el-tag>
              </div>
            </div>
            <div class="related-section" v-if="msg.relatedTips && msg.relatedTips.length > 0">
              <div class="related-title">
                <el-icon><Collection /></el-icon>
                <span>烹饪技巧详解</span>
              </div>
              <div class="related-list">
                <el-card
                  v-for="tip in msg.relatedTips"
                  :key="tip.id"
                  class="related-tip-card"
                  shadow="hover"
                >
                  <div class="tip-card-header">
                    <span class="tip-title">{{ tip.title }}</span>
                    <div class="tip-tags">
                      <el-tag size="small" effect="plain" type="info">
                        {{ tip.category }}
                      </el-tag>
                      <el-tag size="small" :type="getDifficultyTagType(tip.difficulty)" effect="dark" class="difficulty-tag">
                        {{ tip.difficulty }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="tip-summary">{{ tip.summary }}</div>
                  
                  <el-collapse class="tip-collapse">
                    <el-collapse-item title="详细步骤" name="steps">
                      <ol class="steps-list">
                        <li v-for="(step, idx) in tip.steps" :key="idx">
                          <span class="step-num">{{ idx + 1 }}</span>
                          <span class="step-text">{{ step }}</span>
                        </li>
                      </ol>
                    </el-collapse-item>
                    <el-collapse-item title="关键要点" name="keypoints">
                      <div class="keypoints-list">
                        <div v-for="(point, idx) in tip.keyPoints" :key="idx" class="keypoint-item">
                          <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
                          <span>{{ point }}</span>
                        </div>
                      </div>
                    </el-collapse-item>
                    <el-collapse-item title="常见误区" name="mistakes">
                      <div class="mistakes-list">
                        <div v-for="(mistake, idx) in tip.commonMistakes" :key="idx" class="mistake-item">
                          <el-icon color="#f56c6c"><WarningFilled /></el-icon>
                          <span>{{ mistake }}</span>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </el-card>
              </div>
            </div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="thinking" class="chat-item ai">
          <div class="avatar">
            <el-avatar :size="40" class="ai">
              <el-icon :size="22"><Cpu /></el-icon>
            </el-avatar>
          </div>
          <div class="bubble-wrapper">
            <div class="bubble">
              <div class="thinking-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="input-section">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="2"
          placeholder="输入你遇到的烹饪问题，如：鱼怎么煎不粘锅？"
          maxlength="200"
          show-word-limit
          resize="none"
          @keydown.enter.exact.prevent="submitQuestion"
        />
        <el-button type="primary" size="large" @click="submitQuestion" :disabled="submitDisabled">
          <el-icon><Promotion /></el-icon>
          发送
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import {
  Reading,
  Cpu,
  ChatDotRound,
  Delete,
  Bulb,
  User,
  Promotion,
  Collection,
  DataAnalysis,
  Star,
  MagicStick,
  CircleCheckFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  cookingQaApi,
  type QaMessage,
  type DifficultyLevel,
} from '@/api/cookingQa'

const loading = ref(false)
const thinking = ref(false)
const userInput = ref('')
const messages = ref<QaMessage[]>([])
const suggestedQuestions = ref<string[]>([])
const chatContainerRef = ref<HTMLElement | null>(null)

const coreTechniques = [
  '温度控制', '食材预处理', '操作时机', '调味技巧',
  '刀工基础', '火候掌握', '油温判断', '出锅时机'
]

const submitDisabled = computed(() => {
  return thinking.value || !userInput.value.trim()
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatAnswer = (text: string) => {
  let result = text
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\n/g, '<br>')
  result = result.replace(/• /g, '&nbsp;&nbsp;• ')
  return result
}

const getDifficultyTagType = (difficulty: DifficultyLevel): 'success' | 'warning' | 'danger' => {
  switch (difficulty) {
    case '新手': return 'success'
    case '进阶': return 'warning'
    case '专业': return 'danger'
    default: return 'success'
  }
}

const loadSuggestedQuestions = async () => {
  try {
    const res = await cookingQaApi.getSuggestedQuestions()
    suggestedQuestions.value = res.data
  } catch (e) {
    suggestedQuestions.value = [
      '鱼怎么煎不粘锅？',
      '炒菜总是出水怎么办？',
      '蛋糕为什么塌了？',
      '牛肉怎么炒才嫩？',
    ]
  }
}

const askQuestion = async (question: string) => {
  userInput.value = question
  await nextTick()
  submitQuestion()
}

const submitQuestion = async () => {
  const question = userInput.value.trim()
  if (!question) {
    ElMessage.warning('请输入问题')
    return
  }

  const userMsg: QaMessage = {
    id: Date.now(),
    role: 'user',
    content: question,
    timestamp: Date.now(),
  }
  messages.value.push(userMsg)
  userInput.value = ''
  thinking.value = true
  await scrollToBottom()

  try {
    const res = await cookingQaApi.ask(question)
    const aiMsg: QaMessage = {
      id: Date.now() + 1,
      role: 'ai',
      content: res.data.answer,
      timestamp: Date.now(),
      relatedTips: res.data.relatedTips,
      relatedTechniques: res.data.relatedTechniques,
    }
    messages.value.push(aiMsg)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '获取回答失败，请重试')
  } finally {
    thinking.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
}

onMounted(() => {
  loadSuggestedQuestions()
})
</script>

<style scoped>
.cooking-qa {
  max-width: 1000px;
  margin: 0 auto;
}

.intro-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff1f0 50%, #fdf2ff 100%);
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.header-tag {
  margin-left: 10px;
}

.intro-content {
  text-align: center;
  padding: 10px 0;
}

.intro-icon {
  font-size: 56px;
  margin-bottom: 12px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.intro-content h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #303133;
}

.intro-content > p {
  color: #606266;
  font-size: 14px;
  max-width: 600px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.feature-row {
  margin-top: 20px;
}

.feature-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(230, 162, 60, 0.12);
}

.fi-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.feature-item h4 {
  font-size: 15px;
  margin-bottom: 4px;
  color: #303133;
}

.feature-item p {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.chat-card {
  margin-bottom: 24px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.chat-title .el-tag {
  margin-left: 6px;
  font-weight: normal;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.suggested-section {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
  border-radius: 10px;
}

.suggested-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
  font-size: 14px;
}

.suggested-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  cursor: pointer;
  padding: 6px 14px;
  transition: all 0.2s ease;
  font-size: 13px;
}

.suggested-tag:hover {
  background: #e6a23c;
  color: #fff;
  border-color: #e6a23c;
  transform: translateY(-1px);
}

.chat-container {
  max-height: 550px;
  overflow-y: auto;
  padding: 16px;
  background: #fafbfc;
  border-radius: 10px;
  margin-bottom: 20px;
  min-height: 200px;
}

.chat-item {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  gap: 12px;
}

.chat-item:last-child {
  margin-bottom: 0;
}

.chat-item.ai {
  flex-direction: row;
}

.chat-item.user {
  flex-direction: row-reverse;
}

.chat-item.user .bubble-wrapper {
  align-items: flex-end;
}

.avatar .el-avatar {
  flex-shrink: 0;
}

.avatar .el-avatar.ai {
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
}

.avatar .el-avatar.user {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 78%;
  flex: 1;
}

.bubble {
  padding: 14px 18px;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  line-height: 1.7;
}

.chat-item.ai .bubble {
  background: #fff;
  border: 1px solid #ebeef5;
}

.chat-item.user .bubble {
  background: linear-gradient(135deg, #e6a23c 0%, #f09353 100%);
  color: #fff;
}

.chat-item.user .bubble-content {
  color: #fff;
}

.bubble-content {
  font-size: 14px;
  color: #303133;
  white-space: normal;
  word-break: break-word;
}

.bubble-content strong {
  color: #e6a23c;
  font-weight: 700;
}

.chat-item.user .bubble-content strong {
  color: #fffbe6;
}

.techniques-section {
  width: 100%;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  border-radius: 10px;
  padding: 10px 14px;
}

.techniques-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.techniques-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.technique-tag {
  font-size: 12px;
}

.related-section {
  width: 100%;
}

.related-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 10px;
  padding-left: 4px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.related-tip-card {
  transition: all 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0e6d2;
  background: linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%);
}

.related-tip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(230, 162, 60, 0.15);
}

.related-tip-card :deep(.el-card__body) {
  padding: 14px;
}

.tip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
  flex-wrap: wrap;
}

.tip-title {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
}

.tip-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.difficulty-tag {
  font-weight: 500;
}

.tip-summary {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e4e7ed;
}

.tip-collapse {
  --el-collapse-border-color: transparent;
}

.tip-collapse :deep(.el-collapse-item__header) {
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
  border-bottom: none;
  height: auto;
  line-height: 1.5;
}

.tip-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.tip-collapse :deep(.el-collapse-item__content) {
  padding: 8px 0 12px;
}

.steps-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.steps-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #303133;
}

.steps-list li:last-child {
  margin-bottom: 0;
}

.step-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #e6a23c 0%, #f09353 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.step-text {
  flex: 1;
}

.keypoints-list,
.mistakes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keypoint-item,
.mistake-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.keypoint-item .el-icon,
.mistake-item .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
  padding: 0 4px;
}

.thinking-dots {
  display: flex;
  gap: 6px;
  padding: 6px 4px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: thinking 1.4s ease-in-out infinite both;
}

.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-section {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-section :deep(.el-textarea__inner) {
  font-size: 14px;
  line-height: 1.6;
}

.techniques-intro {
  margin-top: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  text-align: left;
  border: 1px solid #fde2c2;
}

.ti-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
}

.ti-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.tech-tag {
  font-size: 12px;
}

.ti-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #67c23a;
  line-height: 1.6;
  background: #f0f9eb;
  padding: 10px 14px;
  border-radius: 8px;
}
</style>
