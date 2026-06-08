<template>
  <div class="english-conversation">
    <el-card v-if="!conversationState" class="scene-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="22" color="#722ed1">
            <ChatDotRound />
          </el-icon>
          <span>英语口语对话练习</span>
        </div>
      </template>

      <el-alert
        title="选择对话场景开始练习"
        type="info"
        :closable="false"
        show-icon
        class="intro-alert"
      >
        <template #default>
          <p>选择一个感兴趣的场景，与 AI 进行英语对话练习。适合备考英语口试、出国留学准备、日常口语提升！</p>
        </template>
      </el-alert>

      <el-row :gutter="16" class="scene-grid">
        <el-col
          v-for="scene in scenes"
          :key="scene.id"
          :xs="24"
          :sm="12"
          :md="8"
          class="scene-col"
        >
          <div class="scene-item" @click="selectScene(scene)">
            <div class="scene-icon-wrapper" :class="scene.difficulty">
              <el-icon :size="28">
                <component :is="getIconComponent(scene.icon)" />
              </el-icon>
            </div>
            <div class="scene-info">
              <div class="scene-name">{{ scene.name }}</div>
              <div class="scene-name-en">{{ scene.nameEn }}</div>
              <el-tag
                class="difficulty-tag" size="small" :type="getDifficultyType(scene.difficulty)">
                {{ getDifficultyLabel(scene.difficulty) }}
              </el-tag>
              <p class="scene-desc">{{ scene.description }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div v-else class="chat-container">
      <el-card class="chat-card" v-loading="loading">
        <template #header>
          <div class="chat-header">
            <div class="chat-title">
              <el-icon :size="22" color="#722ed1">
                <component :is="getIconComponent(currentScene?.icon || 'ChatDotRound')" />
              </el-icon>
              <span>{{ conversationState.sceneName }}</span>
              <el-tag size="small" type="primary">第 {{ conversationState.round }} 轮</el-tag>
              <el-tag size="small" :type="getDifficultyType(conversationState.difficulty)">
                {{ getDifficultyLabel(conversationState.difficulty) }}
              </el-tag>
            </div>
            <div class="chat-actions">
              <el-button size="small" @click="showVocabularyDrawer = true">
                <el-icon><Collection /></el-icon>
                常用词汇
              </el-button>
              <el-button size="small" @click="changeScene">
                <el-icon><Refresh /></el-icon>
                切换场景
              </el-button>
              <el-button size="small" type="primary" @click="startNewConversation">
                <el-icon><RefreshRight /></el-icon>
                重新开始
              </el-button>
            </div>
          </div>
        </template>

        <div class="stats-bar" v-if="conversationState">
          <div class="stat-item">
            <span class="stat-label">对话轮数</span>
            <span class="stat-value primary">{{ conversationState.round }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">词汇积累</span>
            <span class="stat-value success">{{ conversationState.learnedPhrases?.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">单词数量</span>
            <span class="stat-value warning">{{ conversationState.totalWords || 0 }}</span>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainerRef">
          <div
            v-for="msg in conversationState.messages"
            :key="msg.id"
            class="message-item"
            :class="msg.role"
          >
            <div class="avatar">
              <el-avatar :size="40" :class="msg.role">
                <el-icon v-if="msg.role === 'ai'"><Cpu /></el-icon>
                <el-icon v-else><User /></el-icon>
              </el-avatar>
            </div>
            <div class="message-wrapper">
              <div class="bubble">
                <div class="message-content">{{ msg.content }}</div>
              </div>

              <div class="message-extra">
                <div v-if="msg.translation" class="translation">
                  <el-icon :size="12"><Document /></el-icon>
                  <span>{{ msg.translation }}</span>
                </div>
                <div v-if="msg.role === 'user' && msg.correction" class="correction">
                  <el-icon :size="12" color="#e6a23c"><EditPen /></el-icon>
                  <div class="correction-content">
                    <span class="correction-label">更正：</span>
                    <span class="correction-text">{{ msg.correction }}</span>
                  </div>
                </div>
                <div v-if="msg.usefulPhrases && msg.usefulPhrases.length > 0" class="useful-phrases">
                  <el-icon :size="12" color="#67c23a"><Star /></el-icon>
                  <div class="phrases-list">
                    <span
                      v-for="(p, idx) in msg.usefulPhrases"
                      :key="idx"
                      class="phrase-item"
                    >
                      <span class="phrase-word">{{ p.phrase }}</span>
                      <span class="phrase-meaning">{{ p.meaning }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isTyping" class="message-item ai typing-indicator">
            <div class="avatar">
              <el-avatar :size="40" class="ai"><el-icon><Cpu /></el-icon>
            </div>
            <div class="typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div class="input-section">
          <div class="input-wrapper">
            <el-input
            v-model="userInput"
            type="textarea"
            :rows="2"
            placeholder="输入英文消息..."
            @keydown.enter.exact.prevent="sendMessage"
            resize="none"
            :disabled="isTyping || submitting"
            maxlength="500"
            show-word-limit
          />
          </div>
          <div class="input-actions">
            <el-tooltip content="语音输入">
              <el-button
                :type="isListening ? 'danger' : 'default'"
                circle
                @click="toggleVoiceInput"
                :disabled="!speechSupported"
              >
                <el-icon>
                  <Microphone v-if="isListening" />
                  <Microphone v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="听听发音">
              <el-button
                circle
                @click="speakLastAiMessage"
                :disabled="!hasLastAiMessage"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
            </el-tooltip>
            <el-button
              type="primary"
              @click="sendMessage"
              :disabled="!userInput.trim() || isTyping || submitting"
            >
              <el-icon><Promotion /></el-icon>
              发送
            </el-button>
          </div>
        </div>

        <div class="quick-suggestions" v-if="quickSuggestions.length > 0">
          <span class="suggestions-label">快速回复：</span>
          <el-tag
            v-for="(s, idx) in quickSuggestions"
            :key="idx"
            class="quick-tag"
            effect="plain"
            @click="applySuggestion(s)"
          >
            {{ s }}
          </el-tag>
        </div>
      </el-card>

      <el-drawer
        v-model="showVocabularyDrawer"
        title="场景词汇"
        direction="rtl"
        size="400px"
      >
        <div v-if="currentScene" class="vocabulary-container">
          <h3>{{ currentScene.name }} - 常用词汇</h3>
          <p class="scene-desc-full">{{ currentScene.description }}</p>
          <el-divider />
          <div class="vocab-list">
            <div
              v-for="(item, idx) in currentScene.vocabulary"
              :key="idx"
              class="vocab-item"
            >
              <div class="vocab-word" @click="speakText(item.word)">
                <el-icon :size="14" color="#165DFF"><VideoPlay /></el-icon>
                <span>{{ item.word }}</span>
              </div>
              <div class="vocab-meaning">{{ item.meaning }}</div>
            </div>
          </div>

          <el-divider v-if="conversationState.learnedPhrases && conversationState.learnedPhrases.length > 0" />
          <h3 v-if="conversationState.learnedPhrases && conversationState.learnedPhrases.length > 0">
            本次对话学到的表达</h3>
          <div class="vocab-list" v-if="conversationState.learnedPhrases && conversationState.learnedPhrases.length > 0">
            <div
              v-for="(item, idx) in conversationState.learnedPhrases"
              :key="'l' + idx"
              class="vocab-item learned">
              <div class="vocab-word" @click="speakText(item.phrase)">
                <el-icon :size="14" color="#67c23a"><VideoPlay /></el-icon>
                <span>{{ item.phrase }}</span>
              </div>
              <div class="vocab-meaning">{{ item.meaning }}</div>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import {
  ChatDotRound,
  Refresh,
  RefreshRight,
  Cpu,
  User,
  Collection,
  EditPen,
  Star,
  Document,
  Promotion,
  Microphone,
  VideoPlay,
  KnifeFork,
  Airplane,
  Briefcase,
  ShoppingBag,
  Location,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  englishConversationApi,
  type ConversationScene,
  type ConversationState,
  type ConversationMessage,
} from '@/api/englishConversation'

const loading = ref(false)
const submitting = ref(false)
const userInput = ref('')
const scenes = ref<ConversationScene[]>([])
const conversationState = ref<ConversationState | null>(null)
const currentScene = ref<ConversationScene | null>(null)
const messagesContainerRef = ref<HTMLElement | null>(null)
const showVocabularyDrawer = ref(false)
const isTyping = ref(false)
const isListening = ref(false)
const quickSuggestions = ref<string[]>([])

let speechRecognition: any = null

const speechSupported = computed(() => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
})

const hasLastAiMessage = computed(() => {
  if (!conversationState.value) return false
  const msgs = conversationState.value.messages
  const aiMsgs = msgs.filter(m => m.role === 'ai')
  return aiMsgs.length > 0
})

const iconComponents: Record<string, any> = {
  ChatDotRound,
  KnifeFork,
  Airplane,
  Briefcase,
  ShoppingBag,
  Location,
}

const getIconComponent = (iconName: string) => {
  return iconComponents[iconName] || ChatDotRound
}

const getDifficultyType = (difficulty: string): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  switch (difficulty) {
    case 'beginner': return 'success'
    case 'intermediate': return 'warning'
    case 'advanced': return 'danger'
    default: return 'info'
  }
}

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '初级'
    case 'intermediate': return '中级'
    case 'advanced': return '高级'
    default: return '初级'
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

const loadScenes = async () => {
  loading.value = true
  try {
    const res = await englishConversationApi.getScenes()
    scenes.value = res.data
  } catch (e) {
    ElMessage.error('加载场景失败')
  } finally {
    loading.value = false
  }
}

const selectScene = async (scene: ConversationScene) => {
  currentScene.value = scene
  loading.value = true
  try {
    const res = await englishConversationApi.newConversation(scene.id)
    conversationState.value = res.data
    quickSuggestions.value = []
    await scrollToBottom()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '开始对话失败')
    currentScene.value = null
  } finally {
    loading.value = false
  }
}

const startNewConversation = async () => {
  if (!currentScene.value) return
  selectScene(currentScene.value)
}

const changeScene = () => {
  conversationState.value = null
  currentScene.value = null
  userInput.value = ''
  quickSuggestions.value = []
}

const applySuggestion = (text: string) => {
  userInput.value = text
  nextTick(() => sendMessage())
}

const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message) {
    ElMessage.warning('请输入消息')
    return
  }
  if (!conversationState.value) {
    ElMessage.warning('请先选择场景')
    return
  }

  submitting.value = true
  isTyping.value = true
  quickSuggestions.value = []

  try {
    const lastUserMsg: ConversationMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }

    const tempState: ConversationState = {
      ...conversationState.value,
      messages: [...conversationState.value.messages, lastUserMsg],
    }
    conversationState.value = tempState
    userInput.value = ''
    await scrollToBottom()

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700))

    const res = await englishConversationApi.chat({
      userMessage: message,
      currentState: conversationState.value!,
    })

    const userMsgIndex = res.data.messages.length - 2
    if (userMsgIndex >= 0) {
      const userMsg = res.data.messages[userMsgIndex]
      if (userMsg.suggestions) {
        quickSuggestions.value = userMsg.suggestions
      }
    }

    conversationState.value = res.data
    await scrollToBottom()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '发送消息失败')
  } finally {
    submitting.value = false
    isTyping.value = false
  }
}

const initSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (SpeechRecognition) {
    speechRecognition = new SpeechRecognition()
    speechRecognition.lang = 'en-US'
    speechRecognition.continuous = false
    speechRecognition.interimResults = false

    speechRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      userInput.value += (userInput.value ? ' ' : '') + transcript
    }

    speechRecognition.onerror = () => {
      isListening.value = false
      ElMessage.warning('语音识别出错，请重试')
    }

    speechRecognition.onend = () => {
      isListening.value = false
    }
  }
}

const toggleVoiceInput = () => {
  if (!speechRecognition) {
    ElMessage.warning('您的浏览器不支持语音识别')
    return
  }

  if (isListening.value) {
    speechRecognition.stop()
    isListening.value = false
  } else {
    speechRecognition.start()
    isListening.value = true
    ElMessage.info('正在聆听，请说英语...')
  }
}

const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  } else {
    ElMessage.warning('您的浏览器不支持语音合成')
  }
}

const speakLastAiMessage = () => {
  if (!conversationState.value) return
  const aiMsgs = conversationState.value.messages.filter(m => m.role === 'ai')
  if (aiMsgs.length > 0) {
    speakText(aiMsgs[aiMsgs.length - 1].content)
  }
}

watch(() => conversationState, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  loadScenes()
  initSpeechRecognition()
})

onUnmounted(() => {
  if (speechRecognition) {
    speechRecognition.abort()
  }
})
</script>

<style scoped>
.english-conversation {
  max-width: 1000px;
  margin: 0 auto;
}

.scene-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.intro-alert {
  margin-bottom: 20px;
}

.scene-grid {
  margin-top: 16px;
}

.scene-col {
  margin-bottom: 16px 0;
}

.scene-item {
  border: 2px solid #ebeef5;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  height: 100%;
}

.scene-item:hover {
  border-color: #165DFF;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.15);
}

.scene-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 12px;
}

.scene-icon-wrapper.beginner {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.scene-icon-wrapper.intermediate {
  background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
}

.scene-icon-wrapper.advanced {
  background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
}

.scene-info {
  flex: 1;
}

.scene-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.scene-name-en {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.difficulty-tag {
  margin-bottom: 8px;
}

.scene-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.chat-container {
  margin-bottom: 24px;
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
  font-size: 18px;
  font-weight: bold;
}

.chat-title .el-tag {
  margin-left: 8px;
  font-weight: normal;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.stats-bar {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-value.primary { color: #165DFF; }
.stat-value.success { color: #67c23a; }
.stat-value.warning { color: #e6a23c; }

.messages-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message-item {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  gap: 12px;
}

.message-item:last-child {
  margin-bottom: 0;
}

.message-item.ai {
  flex-direction: row;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.user .message-wrapper {
  align-items: flex-end;
}

.avatar .el-avatar {
  flex-shrink: 0;
}

.avatar .el-avatar.ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar .el-avatar.user {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 75%;
}

.bubble {
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-item.ai .bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid #ebeef5;
}

.message-item.user .bubble {
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
}

.message-item.user .message-content {
  color: #fff;
}

.message-content {
  font-size: 15px;
  line-height: 1.6;
}

.message-item.ai .message-content {
  color: #303133;
}

.message-extra {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.translation {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.correction {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 12px;
  background: #fdf6ec;
  padding: 6px 10px;
  border-radius: 6px;
}

.correction-content {
  display: flex;
  flex-direction: column;
}

.correction-label {
  color: #e6a23c;
  font-weight: 500;
}

.correction-text {
  color: #606266;
}

.useful-phrases {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  background: #f0f9eb;
  padding: 6px 10px;
  border-radius: 6px;
}

.phrases-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phrase-item {
  display: flex;
  gap: 6px;
  align-items: center;
}

.phrase-word {
  color: #165DFF;
  font-weight: 500;
}

.phrase-meaning {
  color: #606266;
}

.typing-indicator .typing-bubble {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid #ebeef5;
  border-radius: 16px;
}

.typing-bubble span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

.input-section {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
}

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-suggestions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.suggestions-label {
  font-size: 12px;
  color: #909399;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-tag:hover {
  transform: translateY(-1px);
}

.vocabulary-container h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.scene-desc-full {
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.vocab-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vocab-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 3px solid #165DFF;
}

.vocab-item.learned {
  border-left-color: #67c23a;
}

.vocab-word {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 15px;
  color: #165DFF;
  cursor: pointer;
  margin-bottom: 4px;
}

.vocab-item.learned .vocab-word {
  color: #67c23a;
}

.vocab-meaning {
  font-size: 13px;
  color: #606266;
  padding-left: 20px;
}
</style>
