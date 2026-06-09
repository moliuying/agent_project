<template>
  <div class="literature-qa">
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="22" color="#eb2f96"><Reading /></el-icon>
          <span>文学作品问答与讨论</span>
          <el-tag type="danger" size="small" effect="dark" class="header-tag">
            <el-icon style="margin-right: 4px;"><ChatDotRound /></el-icon>
            AI 文学阅读伙伴
          </el-tag>
        </div>
      </template>
      <div class="intro-content">
        <div class="intro-icon">📚</div>
        <h2>与热爱文学的伙伴一起畅聊</h2>
        <p>输入关于文学作品的问题，AI 以热爱文学的阅读伙伴身份给出有情感温度的解读。回答风格会根据作品基调自动适配——聊《活着》时会沉静下来，聊《挪威的森林》会温柔起来，聊《三体》会带上宇宙的宏大感。</p>
        <el-row :gutter="16" class="feature-row">
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">💬</div>
              <h4>深度解读</h4>
              <p>多角度分析作品主题与人物</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🎨</div>
              <h4>风格适配</h4>
              <p>回答风格匹配作品气质</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">📝</div>
              <h4>笔记整理</h4>
              <p>帮助梳理阅读心得与感悟</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🌱</div>
              <h4>入门引导</h4>
              <p>文学欣赏零基础友好</p>
            </div>
          </el-col>
        </el-row>

        <div class="scene-intro">
          <div class="si-title">
            <el-icon color="#eb2f96"><MagicStick /></el-icon>
            <span>八种风格 · 与作品气质同步</span>
          </div>
          <div class="si-tags">
            <el-tag v-for="(cfg, key) in STYLE_VISUAL_CONFIGS" :key="key" effect="dark" :color="cfg.primaryColor" class="style-preview-tag">
              {{ cfg.label }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="chat-card" v-loading="loading">
      <template #header>
        <div class="chat-header">
          <div class="chat-title">
            <el-icon :size="20" color="#eb2f96"><ChatDotRound /></el-icon>
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
          <span>试试这些问题（感受不同风格）：</span>
        </div>
        <div class="suggested-buttons">
          <el-tag
            v-for="q in suggestedQuestions"
            :key="q"
            class="suggested-tag"
            effect="plain"
            type="danger"
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
            <el-avatar :size="40" :class="msg.role" :style="getAvatarStyle(msg)">
              <el-icon v-if="msg.role === 'ai'" :size="22">
                <component :is="getAiIcon(msg.style)" />
              </el-icon>
              <el-icon v-else :size="22"><User /></el-icon>
            </el-avatar>
          </div>
          <div class="bubble-wrapper">
            <div v-if="msg.role === 'ai' && msg.style" class="style-indicator">
              <span class="style-dot" :style="{ background: getStyleCfg(msg.style).primaryColor }"></span>
              <span class="style-label" :style="{ color: getStyleCfg(msg.style).primaryColor }">
                {{ getStyleCfg(msg.style).label }}模式
              </span>
            </div>
            <div class="bubble" :style="getBubbleStyle(msg)">
              <div class="bubble-content" v-html="formatAnswer(msg.content, msg.style)"></div>
            </div>

            <div class="related-section" v-if="msg.relatedBooks && msg.relatedBooks.length > 0">
              <div class="related-title" :style="{ color: getStyleCfg(msg.style).sectionAccent }">
                <el-icon><Collection /></el-icon>
                <span>相关作品</span>
              </div>
              <div class="related-list">
                <el-card
                  v-for="book in msg.relatedBooks"
                  :key="book.title"
                  class="related-book-card"
                  shadow="hover"
                  @click="askQuestion(`介绍一下《${book.title}》`)"
                  :style="getBookCardHoverStyle(book.discourseStyle)"
                >
                  <div class="book-card-header">
                    <span class="book-name">《{{ book.title }}》</span>
                    <el-tag size="small" :type="getDifficultyTagType(book.difficulty)" effect="dark">
                      {{ book.difficulty }}
                    </el-tag>
                  </div>
                  <div class="book-author">{{ book.author }} · {{ book.year }}</div>
                  <div class="book-genre">
                    <el-tag
                      v-for="g in book.genre.slice(0, 2)"
                      :key="g"
                      size="small"
                      effect="plain"
                      type="info"
                      class="genre-tag"
                    >
                      {{ g }}
                    </el-tag>
                  </div>
                  <div class="book-tone" :style="{ color: getStyleCfg(book.discourseStyle).primaryColor }">
                    <el-icon><MagicStick /></el-icon>
                    <span>{{ book.emotionalTone.slice(0, 25) }}...</span>
                  </div>
                </el-card>
              </div>
            </div>

            <div class="discussion-section" v-if="msg.discussionPoints && msg.discussionPoints.length > 0" :style="{ background: getStyleCfg(msg.style).sectionBg }">
              <div class="discussion-title" :style="{ color: getStyleCfg(msg.style).sectionAccent }">
                <el-icon><ChatLineSquare /></el-icon>
                <span>讨论话题</span>
              </div>
              <div class="discussion-list">
                <div
                  v-for="(point, idx) in msg.discussionPoints"
                  :key="idx"
                  class="discussion-item"
                  @click="askQuestion(point)"
                  :style="getDiscussionItemStyle(msg.style)"
                >
                  <span class="discussion-bullet" :style="{ background: `linear-gradient(135deg, ${getStyleCfg(msg.style).gradientStart} 0%, ${getStyleCfg(msg.style).gradientEnd} 100%)` }">{{ idx + 1 }}</span>
                  <span>{{ point }}</span>
                </div>
              </div>
            </div>

            <div class="recommend-section" v-if="msg.recommendedBooks && msg.recommendedBooks.length > 0" :style="{ background: getStyleCfg(msg.style).sectionBg, borderLeft: `3px solid ${getStyleCfg(msg.style).sectionAccent}` }">
              <div class="recommend-title" :style="{ color: getStyleCfg(msg.style).sectionAccent }">
                <el-icon><Star /></el-icon>
                <span>延伸推荐</span>
              </div>
              <div class="recommend-list">
                <div
                  v-for="(rec, idx) in msg.recommendedBooks"
                  :key="idx"
                  class="recommend-item"
                  @click="askQuestion(`介绍一下《${rec.title}》`)"
                >
                  <div class="rec-main">
                    <span class="rec-title" :style="{ color: getStyleCfg(msg.style).sectionAccent }">《{{ rec.title }}》</span>
                    <span class="rec-author">{{ rec.author }}</span>
                  </div>
                  <div class="rec-reason">{{ rec.reason }}</div>
                </div>
              </div>
            </div>

            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="thinking" class="chat-item ai">
          <div class="avatar">
            <el-avatar :size="40" class="ai" :style="{ background: 'linear-gradient(135deg, #eb2f96 0%, #722ed1 100%)' }">
              <el-icon :size="22"><Reading /></el-icon>
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
          placeholder="输入关于文学作品的问题，不同作品会触发不同回答风格～"
          maxlength="300"
          show-word-limit
          resize="none"
          @keydown.enter.exact.prevent="submitQuestion"
        />
        <el-button type="danger" size="large" @click="submitQuestion" :disabled="submitDisabled">
          <el-icon><Promotion /></el-icon>
          发送
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, type CSSProperties } from 'vue'
import {
  Reading,
  ChatDotRound,
  Delete,
  Bulb,
  User,
  Promotion,
  Collection,
  Star,
  MagicStick,
  ChatLineSquare,
  Moon,
  Cpu,
  Document,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  literatureQaApi,
  type QaMessage,
  type BookDifficulty,
  type DiscourseStyle,
  STYLE_VISUAL_CONFIGS,
} from '@/api/literatureQa'

const loading = ref(false)
const thinking = ref(false)
const userInput = ref('')
const messages = ref<QaMessage[]>([])
const suggestedQuestions = ref<string[]>([])
const chatContainerRef = ref<HTMLElement | null>(null)

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

const getStyleCfg = (style?: DiscourseStyle) => {
  const key: DiscourseStyle = style || 'gentle'
  return STYLE_VISUAL_CONFIGS[key]
}

const getAiIcon = (style?: DiscourseStyle) => {
  const cfg = getStyleCfg(style)
  switch (cfg.avatarIcon) {
    case 'Moon': return Moon
    case 'Cpu': return Cpu
    case 'Document': return Document
    case 'Star': return Star
    default: return Reading
  }
}

const getAvatarStyle = (msg: QaMessage): CSSProperties => {
  if (msg.role === 'user') {
    return { background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }
  }
  const cfg = getStyleCfg(msg.style)
  return {
    background: `linear-gradient(135deg, ${cfg.gradientStart} 0%, ${cfg.gradientEnd} 100%)`,
  }
}

const getBubbleStyle = (msg: QaMessage): CSSProperties => {
  if (msg.role === 'user') {
    return { background: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)', color: '#fff' }
  }
  const cfg = getStyleCfg(msg.style)
  return {
    background: cfg.bubbleBg,
    border: `1px solid ${cfg.bubbleBorder}`,
  }
}

const getDiscussionItemStyle = (style?: DiscourseStyle): CSSProperties => {
  const cfg = getStyleCfg(style)
  return {
    color: cfg.sectionAccent,
  }
}

const getBookCardHoverStyle = (style: DiscourseStyle): CSSProperties => {
  const cfg = getStyleCfg(style)
  return {}
}

const formatAnswer = (text: string, style?: DiscourseStyle) => {
  const cfg = getStyleCfg(style)
  let result = text
  result = result.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${cfg.strongColor};font-weight:700;">$1</strong>`)
  result = result.replace(/\n/g, '<br>')
  result = result.replace(/• /g, '&nbsp;&nbsp;• ')
  result = result.replace(/> (.+?)(<br>|$)/g, `<blockquote style="margin:8px 0;padding:8px 14px;border-left:3px solid ${cfg.primaryColor};background:${cfg.bgGradient};color:${cfg.primaryColor};border-radius:0 6px 6px 0;">$1</blockquote>`)
  return result
}

const getDifficultyTagType = (difficulty: BookDifficulty): 'success' | 'warning' | 'danger' => {
  switch (difficulty) {
    case '入门': return 'success'
    case '进阶': return 'warning'
    case '挑战': return 'danger'
    default: return 'info' as any
  }
}

const loadSuggestedQuestions = async () => {
  try {
    const res = await literatureQaApi.getSuggestedQuestions()
    suggestedQuestions.value = res.data
  } catch (e) {
    suggestedQuestions.value = [
      '《百年孤独》为什么这么难读？',
      '《活着》想表达什么？',
      '推荐几本像《挪威的森林》这种风格的书',
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
    const res = await literatureQaApi.ask(question)
    const aiMsg: QaMessage = {
      id: Date.now() + 1,
      role: 'ai',
      content: res.data.answer,
      timestamp: Date.now(),
      relatedBooks: res.data.relatedBooks,
      discussionPoints: res.data.discussionPoints,
      recommendedBooks: res.data.recommendedBooks,
      style: res.data.style,
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
.literature-qa {
  max-width: 1000px;
  margin: 0 auto;
}

.intro-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fef2f8 0%, #f5f0ff 50%, #f0f5ff 100%);
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
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
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
  max-width: 650px;
  margin: 0 auto 24px;
  line-height: 1.7;
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
  box-shadow: 0 8px 24px rgba(235, 47, 150, 0.1);
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
  background: linear-gradient(135deg, #fef2f8 0%, #faf5ff 100%);
  border-radius: 10px;
}

.suggested-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #861c4d;
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
  background: #eb2f96;
  color: #fff;
  border-color: #eb2f96;
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

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 78%;
  flex: 1;
}

.style-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 4px;
  margin-bottom: 2px;
}

.style-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.style-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.bubble {
  padding: 14px 18px;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  line-height: 1.7;
}

.bubble-content {
  font-size: 14px;
  color: #303133;
  white-space: normal;
  word-break: break-word;
}

.chat-item.user .bubble-content {
  color: #fff;
}

.chat-item.user .bubble-content strong {
  color: #ffe066;
}

.related-section,
.discussion-section,
.recommend-section {
  width: 100%;
  border-radius: 10px;
  padding: 12px 16px;
}

.related-title,
.discussion-title,
.recommend-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 4px;
}

.related-title {
  color: #606266;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.related-book-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
}

.related-book-card:hover {
  transform: translateY(-2px);
}

.related-book-card :deep(.el-card__body) {
  padding: 12px;
}

.book-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.book-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.book-author {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.book-genre {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.genre-tag {
  margin-right: 4px;
}

.book-tone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.discussion-section {
  background: linear-gradient(135deg, #fef2f8 0%, #fff5f7 100%);
}

.discussion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.discussion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  line-height: 1.6;
}

.discussion-item:hover {
  transform: translateX(4px);
}

.discussion-bullet {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}

.recommend-section {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border-left: 3px solid #67c23a;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommend-item {
  padding: 10px 14px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recommend-item:hover {
  transform: translateX(4px);
}

.rec-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.rec-title {
  font-size: 14px;
  font-weight: 600;
}

.rec-author {
  font-size: 12px;
  color: #909399;
}

.rec-reason {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
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

.scene-intro {
  margin-top: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  text-align: left;
  border: 1px solid #fce4f1;
}

.si-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
}

.si-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-preview-tag {
  cursor: default;
  font-size: 12px;
  padding: 4px 12px;
}
</style>
