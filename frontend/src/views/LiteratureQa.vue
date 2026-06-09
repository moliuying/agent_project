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
        <p>输入关于文学作品的问题，AI 以热爱文学的阅读伙伴身份给出有情感温度的解读，帮助你深化阅读理解、发现新的解读视角。适用于读书会讨论、阅读笔记整理、文学欣赏入门等场景。</p>
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
              <div class="fi-icon">🎯</div>
              <h4>读书会</h4>
              <p>提供丰富的讨论话题引导</p>
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
            <span>典型使用场景</span>
          </div>
          <div class="si-tags">
            <el-tag type="danger" effect="plain">「《百年孤独》为什么这么难读」</el-tag>
            <el-tag type="danger" effect="plain">「《活着》想表达什么」</el-tag>
            <el-tag type="danger" effect="plain">「推荐类似《挪威的森林》的书」</el-tag>
            <el-tag type="danger" effect="plain">「《红楼梦》人物太多怎么记」</el-tag>
            <el-tag type="danger" effect="plain">「如何写好读书心得」</el-tag>
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
          <span>试试这些问题：</span>
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
            <el-avatar :size="40" :class="msg.role">
              <el-icon v-if="msg.role === 'ai'" :size="22"><Reading /></el-icon>
              <el-icon v-else :size="22"><User /></el-icon>
            </el-avatar>
          </div>
          <div class="bubble-wrapper">
            <div class="bubble">
              <div class="bubble-content" v-html="formatAnswer(msg.content)"></div>
            </div>

            <div class="related-section" v-if="msg.relatedBooks && msg.relatedBooks.length > 0">
              <div class="related-title">
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
                  <div class="book-tone">
                    <el-icon color="#eb2f96"><MagicStick /></el-icon>
                    <span>{{ book.emotionalTone.slice(0, 25) }}...</span>
                  </div>
                </el-card>
              </div>
            </div>

            <div class="discussion-section" v-if="msg.discussionPoints && msg.discussionPoints.length > 0">
              <div class="discussion-title">
                <el-icon color="#eb2f96"><ChatLineSquare /></el-icon>
                <span>讨论话题</span>
              </div>
              <div class="discussion-list">
                <div
                  v-for="(point, idx) in msg.discussionPoints"
                  :key="idx"
                  class="discussion-item"
                  @click="askQuestion(point)"
                >
                  <span class="discussion-bullet">{{ idx + 1 }}</span>
                  <span>{{ point }}</span>
                </div>
              </div>
            </div>

            <div class="recommend-section" v-if="msg.recommendedBooks && msg.recommendedBooks.length > 0">
              <div class="recommend-title">
                <el-icon color="#67c23a"><Star /></el-icon>
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
                    <span class="rec-title">《{{ rec.title }}》</span>
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
            <el-avatar :size="40" class="ai">
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
          placeholder="输入关于文学作品的问题，如：《百年孤独》为什么这么难读？"
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
import { ref, computed, nextTick, onMounted } from 'vue'
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
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  literatureQaApi,
  type QaMessage,
  type BookDifficulty,
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

const formatAnswer = (text: string) => {
  let result = text
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\n/g, '<br>')
  result = result.replace(/• /g, '&nbsp;&nbsp;• ')
  result = result.replace(/> (.+?)(<br>|$)/g, '<blockquote style="margin:8px 0;padding:8px 14px;border-left:3px solid #eb2f96;background:#fef2f8;color:#8c1d4d;border-radius:0 6px 6px 0;">$1</blockquote>')
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

.avatar .el-avatar.ai {
  background: linear-gradient(135deg, #eb2f96 0%, #722ed1 100%);
}

.avatar .el-avatar.user {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
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
  background: linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%);
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
  color: #eb2f96;
  font-weight: 700;
}

.chat-item.user .bubble-content strong {
  color: #ffe066;
}

.related-section,
.discussion-section,
.recommend-section {
  width: 100%;
}

.related-title,
.discussion-title,
.recommend-title {
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
  box-shadow: 0 6px 16px rgba(235, 47, 150, 0.15);
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
  color: #861c4d;
  line-height: 1.5;
}

.discussion-section {
  background: linear-gradient(135deg, #fef2f8 0%, #fff5f7 100%);
  border-radius: 10px;
  padding: 12px 16px;
}

.discussion-title {
  color: #861c4d;
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
  color: #601040;
  line-height: 1.6;
}

.discussion-item:hover {
  background: #fce4f1;
  transform: translateX(4px);
}

.discussion-bullet {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #eb2f96 0%, #722ed1 100%);
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}

.recommend-section {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border-radius: 10px;
  padding: 12px 16px;
}

.recommend-title {
  color: #388e3c;
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
  border-left: 3px solid #67c23a;
}

.recommend-item:hover {
  background: #e8f5e9;
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
  color: #2e7d32;
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
  gap: 10px;
}

.si-tags .el-tag {
  cursor: pointer;
}
</style>
