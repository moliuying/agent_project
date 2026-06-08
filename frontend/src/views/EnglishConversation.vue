<template>
  <div class="english-conversation">
    <el-card v-if="!conversationState" class="scene-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="26" color="#722ed1">
            <Microphone />
          </el-icon>
          <span>英语口语对话练习</span>
          <el-tag type="success" size="small" effect="dark" style="margin-left: 10px;">
            <el-icon style="margin-right: 4px;"><Microphone /></el-icon>
            支持语音对话
          </el-tag>
        </div>
      </template>

      <div class="voice-features-intro">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <div class="feature-box">
              <div class="feature-icon voice">
                <el-icon :size="32"><Microphone /></el-icon>
              </div>
              <h4>语音输入</h4>
              <p>直接说英语，自动识别为文字，练习真实口语表达</p>
            </div>
          </el-col>
          <el-col :xs="24" :sm="8">
            <div class="feature-box">
              <div class="feature-icon speak">
                <el-icon :size="32"><VideoPlay /></el-icon>
              </div>
              <h4>AI 朗读</h4>
              <p>AI 回复自动朗读，地道发音，提升听力水平</p>
            </div>
          </el-col>
          <el-col :xs="24" :sm="8">
            <div class="feature-box">
              <div class="feature-icon practice">
                <el-icon :size="32"><Reading /></el-icon>
              </div>
              <h4>跟读练习</h4>
              <p>AI 示范后跟读，逐句练习标准发音</p>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-alert
        title="选择对话场景开始练习"
        type="info"
        :closable="false"
        show-icon
        class="intro-alert"
      >
        <template #default>
          <p>🎤 推荐使用 Chrome/Edge 浏览器获得最佳语音体验。允许麦克风权限后，直接开口说英语即可！</p>
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
              <div class="scene-tags">
                <el-tag
                  class="difficulty-tag" size="small" :type="getDifficultyType(scene.difficulty)">
                  {{ getDifficultyLabel(scene.difficulty) }}
                </el-tag>
              </div>
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
              <el-switch
                v-model="voiceSettings.autoSpeak"
                active-text="自动朗读"
                inactive-text=""
                size="small"
                style="margin-right: 12px;"
              />
              <el-switch
                v-model="voiceSettings.continuousMode"
                active-text="语音对话"
                inactive-text=""
                size="small"
                style="margin-right: 12px;"
              />
              <el-button size="small" @click="showVoiceSettings = true">
                <el-icon><Setting /></el-icon>
                语音设置
              </el-button>
              <el-button size="small" @click="showVocabularyDrawer = true">
                <el-icon><Collection /></el-icon>
                词汇
              </el-button>
              <el-button size="small" @click="changeScene">
                <el-icon><Refresh /></el-icon>
                切换
              </el-button>
            </div>
          </div>
        </template>

        <div class="stats-bar" v-if="conversationState">
          <div class="stat-item">
            <el-icon size="16" color="#165DFF"><ChatDotRound /></el-icon>
            <span class="stat-value primary">{{ conversationState.round }}</span>
            <span class="stat-label">对话轮数</span>
          </div>
          <div class="stat-item">
            <el-icon size="16" color="#67c23a"><Star /></el-icon>
            <span class="stat-value success">{{ conversationState.learnedPhrases?.length || 0 }}</span>
            <span class="stat-label">词汇积累</span>
          </div>
          <div class="stat-item">
            <el-icon size="16" color="#e6a23c"><Edit /></el-icon>
            <span class="stat-value warning">{{ conversationState.totalWords || 0 }}</span>
            <span class="stat-label">单词数量</span>
          </div>
          <div class="stat-item" v-if="speechSupported">
            <el-icon size="16" :color="isListening ? '#f56c6c' : '#909399'">
              <Microphone />
            </el-icon>
            <span class="stat-value" :class="isListening ? 'danger' : ''">{{ isListening ? '聆听中' : '待机' }}</span>
            <span class="stat-label">语音状态</span>
          </div>
        </div>

        <div v-if="isListening" class="voice-recording-bar">
          <div class="recording-indicator">
            <div class="pulse-ring"></div>
            <div class="mic-icon">
              <el-icon :size="20"><Microphone /></el-icon>
            </div>
          </div>
          <div class="recording-content">
            <div class="recording-label">正在聆听...请说英语</div>
            <div v-if="interimTranscript" class="interim-text">{{ interimTranscript }}</div>
            <div v-else class="hint-text">说出你的回答...</div>
            <div class="wave-container">
              <div
                v-for="i in 20"
                :key="i"
                class="wave-bar"
                :style="{ animationDelay: (i * 0.05) + 's' }"
              ></div>
            </div>
          </div>
          <el-button size="small" type="danger" @click="stopVoiceInput">
            完成 ✓
          </el-button>
        </div>

        <div v-if="followingMode" class="follow-practice-bar">
          <div class="follow-header">
            <el-icon :size="18" color="#67c23a"><Reading /></el-icon>
            <span class="follow-title">跟读练习模式</span>
            <el-tag size="small" type="success">跟我读</el-tag>
          </div>
          <div class="follow-text" @click="speakText(followSentence)" :class="{ speaking: currentlySpeakingId === 'follow' }">
            <span>"{{ followSentence }}"</span>
            <el-icon size="14" color="#165DFF"><VideoPlay /></el-icon>
          </div>
          <div class="follow-hint" v-if="!isListening">
            点击上方句子听示范，然后点击麦克风跟读
          </div>
          <div class="follow-actions">
            <el-button
              :type="isListening ? 'danger' : 'success'"
              size="large"
              @click="toggleVoiceInput"
              class="mic-btn-large"
            >
              <el-icon :size="20"><Microphone /></el-icon>
              {{ isListening ? '录音中...点击完成' : '🎙 点击开始跟读' }}
            </el-button>
            <el-button size="small" @click="exitFollowMode">退出练习</el-button>
          </div>
        </div>

        <div v-if="wordPracticeMode" class="word-practice-bar">
          <div class="practice-header">
            <el-icon :size="18" color="#e6a23c"><Microphone /></el-icon>
            <span class="practice-title">逐词跟读练习</span>
            <el-tag size="small" type="warning">
              {{ wordPracticeIndex + 1 }} / {{ wordPracticeWords.length }}
            </el-tag>
          </div>
          <div class="practice-progress">
            <div
              v-for="(w, i) in wordPracticeWords"
              :key="i"
              class="progress-dot"
              :class="{ active: i === wordPracticeIndex, done: i < wordPracticeIndex }"
            ></div>
          </div>
          <div
            class="current-word-display"
            @click="speakWord(currentPracticeWord)"
            :class="{ speaking: currentlySpeakingId === 'practice-word' }"
          >
            <span class="big-word">{{ currentPracticeWord }}</span>
            <el-icon size="16" color="#e6a23c"><VideoPlay /></el-icon>
          </div>
          <div class="word-phonetic-display" v-if="currentPracticeWordPhonetic">
            {{ currentPracticeWordPhonetic }}
          </div>
          <div class="word-tip-display" v-if="currentPracticeWordTip">
            💡 {{ currentPracticeWordTip }}
          </div>
          <div class="practice-actions">
            <el-button
              size="small"
              @click="prevPracticeWord"
              :disabled="wordPracticeIndex === 0"
            >
              上一个
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="speakWord(currentPracticeWord)"
            >
              <el-icon><VideoPlay /></el-icon>
              听标准发音
            </el-button>
            <el-button
              :type="isListening ? 'danger' : 'warning'"
              size="large"
              @click="toggleVoiceInput"
            >
              <el-icon><Microphone /></el-icon>
              {{ isListening ? '录音中...' : '我来跟读' }}
            </el-button>
            <el-button
              size="small"
              @click="nextPracticeWord"
              :disabled="wordPracticeIndex >= wordPracticeWords.length - 1"
            >
              下一个
            </el-button>
          </div>
          <div class="practice-exit">
            <el-button size="small" text @click="exitWordPractice">退出逐词练习</el-button>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainerRef">
          <div
            v-for="msg in conversationState.messages"
            :key="msg.id"
            class="message-item"
            :class="[msg.role, { speaking: currentlySpeakingId === msg.id }]"
          >
            <div class="avatar">
              <el-avatar :size="40" :class="msg.role">
                <el-icon v-if="msg.role === 'ai'"><Cpu /></el-icon>
                <el-icon v-else><User /></el-icon>
              </el-avatar>
            </div>
            <div class="message-wrapper">
              <div class="bubble" @click="msg.role === 'ai' && speakMessage(msg)">
                <div class="message-content">
                  {{ msg.content }}
                  <el-tooltip
                    v-if="msg.role === 'ai'"
                    content="点击朗读这句话"
                    placement="top"
                  >
                    <el-icon
                      class="speak-icon"
                      :class="{ active: currentlySpeakingId === msg.id }"
                    >
                      <VideoPlay />
                    </el-icon>
                  </el-tooltip>
                </div>
              </div>

              <div class="message-extra">
                <div v-if="msg.translation" class="translation">
                  <el-icon :size="12"><Document /></el-icon>
                  <span>{{ msg.translation }}</span>
                </div>
                <div v-if="msg.role === 'user' && msg.pronunciation" class="pronunciation-feedback">
                  <div class="pronunciation-header">
                    <div class="pronunciation-score" :class="msg.pronunciation.level">
                      <el-icon size="14"><Microphone /></el-icon>
                      <span class="score-value">{{ msg.pronunciation.overallScore }}</span>
                      <span class="score-label">分</span>
                    </div>
                    <el-tag
                      size="small"
                      :type="msg.pronunciation.level === 'excellent' ? 'success' : msg.pronunciation.level === 'good' ? 'warning' : 'info'"
                      effect="light"
                    >
                      {{ msg.pronunciation.level === 'excellent' ? '优秀' : msg.pronunciation.level === 'good' ? '良好' : '需练习' }}
                    </el-tag>
                    <span class="pronunciation-msg">{{ msg.pronunciation.encouragingMessage }}</span>
                  </div>
                </div>
                <div v-if="msg.role === 'user' && msg.pronunciation?.words && msg.pronunciation.words.length > 0" class="word-by-word">
                  <span
                    v-for="(word, idx) in msg.pronunciation.words"
                    :key="idx"
                    class="word-item"
                    :class="[word.difficulty, { 'common-mistake': word.isCommonMistake }]"
                    @click="speakWord(word.word)"
                  >
                    <span class="word-text">{{ word.word }}</span>
                    <span v-if="word.phonetic" class="word-phonetic">{{ word.phonetic }}</span>
                    <el-icon class="word-speak-icon" size="10"><VideoPlay /></el-icon>
                    <el-tooltip
                      v-if="word.tips || word.commonMistake"
                      placement="top"
                      :content="word.commonMistake || word.tips"
                      :show-after="200"
                    >
                      <el-icon class="word-tip-icon" size="10"><Warning /></el-icon>
                    </el-tooltip>
                  </span>
                </div>
                <div v-if="msg.role === 'user' && msg.pronunciation?.practiceWords && msg.pronunciation.practiceWords.length > 0" class="practice-words">
                  <el-icon size="12" color="#e6a23c"><Warning /></el-icon>
                  <span class="practice-label">重点练习：</span>
                  <span
                    v-for="(word, idx) in msg.pronunciation.practiceWords"
                    :key="idx"
                    class="practice-word"
                    @click="speakWord(word)"
                  >
                    {{ word }}
                    <el-icon size="10"><VideoPlay /></el-icon>
                  </span>
                </div>
                <div v-if="msg.role === 'user' && msg.correction" class="correction">
                  <el-icon :size="12" color="#e6a23c"><EditPen /></el-icon>
                  <div class="correction-content">
                    <span class="correction-label">语法更正：</span>
                    <span class="correction-text" @click="speakText(msg.correction!)">
                      {{ msg.correction }}
                      <el-icon size="11"><VideoPlay /></el-icon>
                    </span>
                  </div>
                </div>
                <div v-if="msg.usefulPhrases && msg.usefulPhrases.length > 0" class="useful-phrases">
                  <el-icon :size="12" color="#67c23a"><Star /></el-icon>
                  <div class="phrases-list">
                    <span
                      v-for="(p, idx) in msg.usefulPhrases"
                      :key="idx"
                      class="phrase-item"
                      @click="speakText(p.phrase)"
                    >
                      <span class="phrase-word">{{ p.phrase }}</span>
                      <el-icon size="10"><VideoPlay /></el-icon>
                      <span class="phrase-meaning">{{ p.meaning }}</span>
                    </span>
                  </div>
                </div>
                <div class="message-actions" v-if="msg.role === 'ai'">
                  <el-button
                    size="small"
                    type="success"
                    plain
                    @click.stop="startFollowMode(msg.content)"
                  >
                    <el-icon><Reading /></el-icon>
                    跟读这句话
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="speakMessage(msg)"
                  >
                    <el-icon><VideoPlay /></el-icon>
                    再听一遍
                  </el-button>
                  <el-button
                    size="small"
                    type="warning"
                    plain
                    @click.stop="startWordByWordPractice(msg.content)"
                  >
                    <el-icon><Microphone /></el-icon>
                    逐词跟读
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isTyping" class="message-item ai typing-indicator">
            <div class="avatar">
              <el-avatar :size="40" class="ai"><el-icon><Cpu /></el-icon></el-avatar>
            </div>
            <div class="typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div class="input-section" :class="{ 'voice-mode': voiceSettings.continuousMode }">
          <div v-if="!voiceSettings.continuousMode" class="text-input-wrapper">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="2"
              placeholder="输入英文消息，或点击右侧麦克风说英语..."
              @keydown.enter.exact.prevent="sendMessage"
              resize="none"
              :disabled="isTyping || submitting"
              maxlength="500"
              show-word-limit
            />
          </div>

          <div v-else class="voice-input-wrapper">
            <div v-if="isListening" class="voice-active-display">
              <div class="voice-text-display">
                <span class="voice-label">你说的是：</span>
                <span class="voice-content">{{ interimTranscript || userInput || '正在聆听...' }}</span>
              </div>
            </div>
            <div v-else class="voice-idle-display" @click="toggleVoiceInput">
              <el-icon :size="20" color="#722ed1"><Microphone /></el-icon>
              <span>点击麦克风开始说英语，或直接输入文字</span>
            </div>
          </div>

          <div class="input-actions">
            <el-tooltip :content="isListening ? '停止录音并发送' : '语音输入 - 说英语'">
              <el-button
                :type="isListening ? 'danger' : 'primary'"
                :size="voiceSettings.continuousMode ? 'large' : 'default'"
                class="voice-input-btn"
                :class="{ listening: isListening }"
                @click="toggleVoiceInput"
                :disabled="!speechSupported || isTyping || submitting"
              >
                <div class="btn-content">
                  <div class="mic-pulse" v-if="isListening">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <el-icon :size="voiceSettings.continuousMode ? 22 : 16" v-else>
                    <Microphone />
                  </el-icon>
                  <span v-if="voiceSettings.continuousMode">{{ isListening ? '录音中' : '按住说话' }}</span>
                </div>
              </el-button>
            </el-tooltip>

            <template v-if="!voiceSettings.continuousMode">
              <el-button
                type="primary"
                size="large"
                @click="sendMessage"
                :disabled="!userInput.trim() || isTyping || submitting"
              >
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
            </template>
          </div>
        </div>

        <div class="quick-suggestions" v-if="quickSuggestions.length > 0 && !isListening">
          <span class="suggestions-label">
            <el-icon :size="12"><Lightbulb /></el-icon>
            试试这样说：
          </span>
          <el-tag
            v-for="(s, idx) in quickSuggestions"
            :key="idx"
            class="quick-tag"
            effect="plain"
            @click="useSuggestion(s)"
          >
            <span>{{ s }}</span>
            <el-icon size="10"><VideoPlay /></el-icon>
          </el-tag>
        </div>
      </el-card>

      <el-drawer
        v-model="showVocabularyDrawer"
        title="📚 词汇与短语"
        direction="rtl"
        size="420px"
      >
        <div v-if="currentScene" class="vocabulary-container">
          <div class="vocab-header">
            <h3>{{ currentScene.name }}</h3>
            <el-button size="small" type="primary" @click="speakAllVocab">
              <el-icon><VideoPlay /></el-icon>
              全部朗读
            </el-button>
          </div>
          <p class="scene-desc-full">{{ currentScene.description }}</p>
          <el-divider />
          <h4 class="vocab-section-title">🎯 场景核心词汇</h4>
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
          <h4 v-if="conversationState.learnedPhrases && conversationState.learnedPhrases.length > 0" class="vocab-section-title">
            ✨ 本次对话学到的表达
          </h4>
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

      <el-dialog
        v-model="showVoiceSettings"
        title="🎙️ 语音设置"
        width="400px"
      >
        <div class="voice-settings-content">
          <div class="setting-item">
            <div class="setting-label">
              <span>AI 朗读语速</span>
              <el-tag size="small">{{ voiceSettings.speakRate.toFixed(1) }}x</el-tag>
            </div>
            <el-slider
              v-model="voiceSettings.speakRate"
              :min="0.5"
              :max="1.5"
              :step="0.1"
              show-stops
            />
            <div class="slider-labels">
              <span>慢</span>
              <span>正常</span>
              <span>快</span>
            </div>
          </div>

          <el-divider />

          <div class="setting-item">
            <div class="setting-label">
              <span>语音识别灵敏度</span>
            </div>
            <el-radio-group v-model="voiceSettings.sensitivity">
              <el-radio-button label="low">安静环境</el-radio-button>
              <el-radio-button label="normal">一般</el-radio-button>
              <el-radio-button label="high">嘈杂环境</el-radio-button>
            </el-radio-group>
          </div>

          <el-divider />

          <div class="setting-item">
            <div class="setting-label">
              <span>AI 回复语言</span>
            </div>
            <el-radio-group v-model="voiceSettings.responseLang">
              <el-radio-button label="en">仅英文</el-radio-button>
              <el-radio-button label="en_zh">英文+中文翻译</el-radio-button>
            </el-radio-group>
          </div>

          <el-divider />

          <div class="setting-item switches">
            <div class="switch-item">
              <span>AI 回复后自动朗读</span>
              <el-switch v-model="voiceSettings.autoSpeak" />
            </div>
            <div class="switch-item">
              <span>语音连续对话模式</span>
              <el-switch v-model="voiceSettings.continuousMode" />
            </div>
            <div class="switch-item">
              <span>自动发送识别结果</span>
              <el-switch v-model="voiceSettings.autoSend" />
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="speakText('Hello, this is a test of the voice settings.')">
            <el-icon><VideoPlay /></el-icon>
            试听效果
          </el-button>
          <el-button type="primary" @click="showVoiceSettings = false">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted, reactive } from 'vue'
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
  Setting,
  Reading,
  Edit,
  Lightbulb,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  englishConversationApi,
  type ConversationScene,
  type ConversationState,
  type ConversationMessage,
  type WordPronunciation,
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
const interimTranscript = ref('')
const currentlySpeakingId = ref<number | string | null>(null)
const showVoiceSettings = ref(false)
const followingMode = ref(false)
const followSentence = ref('')
const wordPracticeMode = ref(false)
const wordPracticeWords = ref<string[]>([])
const wordPracticeIndex = ref(0)
const wordPracticeData = ref<Record<string, WordPronunciation>>({})

let speechRecognition: any = null
let recognitionFinalTranscript = ''
let silenceTimer: ReturnType<typeof setTimeout> | null = null

const voiceSettings = reactive({
  speakRate: 0.9,
  sensitivity: 'normal',
  responseLang: 'en_zh',
  autoSpeak: true,
  continuousMode: true,
  autoSend: true,
})

const speechSupported = computed(() => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
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
    case 'beginner': return '初级入门'
    case 'intermediate': return '中级进阶'
    case 'advanced': return '高级挑战'
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
  followingMode.value = false
  try {
    const res = await englishConversationApi.newConversation(scene.id)
    conversationState.value = res.data
    quickSuggestions.value = []
    await scrollToBottom()

    await nextTick()
    if (voiceSettings.autoSpeak && conversationState.value) {
      const firstAiMsg = conversationState.value.messages.find(m => m.role === 'ai')
      if (firstAiMsg) {
        setTimeout(() => speakMessage(firstAiMsg), 500)
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '开始对话失败')
    currentScene.value = null
  } finally {
    loading.value = false
  }
}

const startFollowMode = (sentence: string) => {
  followSentence.value = sentence
  followingMode.value = true
  setTimeout(() => {
    speakText(sentence)
  }, 300)
}

const exitFollowMode = () => {
  followingMode.value = false
  followSentence.value = ''
  if (isListening.value) {
    stopVoiceInput()
  }
}

const currentPracticeWord = computed(() => wordPracticeWords.value[wordPracticeIndex.value] || '')

const currentPracticeWordPhonetic = computed(() => {
  const word = currentPracticeWord.value.toLowerCase()
  return wordPracticeData.value[word]?.phonetic || ''
})

const currentPracticeWordTip = computed(() => {
  const word = currentPracticeWord.value.toLowerCase()
  const data = wordPracticeData.value[word]
  return data?.commonMistake || data?.tips || ''
})

const speakWord = (word: string) => {
  speakText(word, 'practice-word')
}

const startWordByWordPractice = (sentence: string) => {
  const words = sentence
    .replace(/[.,!?;:'"]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0)

  if (words.length === 0) {
    ElMessage.warning('没有可练习的单词')
    return
  }

  wordPracticeWords.value = words
  wordPracticeIndex.value = 0
  wordPracticeMode.value = true

  if (conversationState.value) {
    const allWords: WordPronunciation[] = []
    conversationState.value.messages.forEach(m => {
      if (m.pronunciation?.words) {
        m.pronunciation.words.forEach(w => {
          allWords.push(w)
        })
      }
    })
    allWords.forEach(w => {
      wordPracticeData.value[w.word.toLowerCase()] = w
    })
  }

  setTimeout(() => {
    speakWord(currentPracticeWord.value)
  }, 300)
}

const exitWordPractice = () => {
  wordPracticeMode.value = false
  wordPracticeWords.value = []
  wordPracticeIndex.value = 0
  if (isListening.value) {
    stopVoiceInput()
  }
}

const prevPracticeWord = () => {
  if (wordPracticeIndex.value > 0) {
    wordPracticeIndex.value--
    setTimeout(() => speakWord(currentPracticeWord.value), 200)
  }
}

const nextPracticeWord = () => {
  if (wordPracticeIndex.value < wordPracticeWords.value - 1) {
    wordPracticeIndex.value++
    setTimeout(() => speakWord(currentPracticeWord.value), 200)
  }
}

const changeScene = () => {
  conversationState.value = null
  currentScene.value = null
  userInput.value = ''
  quickSuggestions.value = []
  followingMode.value = false
  wordPracticeMode.value = false
  stopVoiceInput()
  window.speechSynthesis?.cancel()
}

const useSuggestion = (text: string) => {
  userInput.value = text
  speakText(text)
  nextTick(() => {
    setTimeout(() => sendMessage(), 1500)
  })
}

const sendMessage = async (overrideText?: string) => {
  const message = (overrideText || userInput.value).trim()
  if (!message) {
    if (!overrideText) ElMessage.warning('请输入或说点什么')
    return
  }
  if (!conversationState.value) {
    ElMessage.warning('请先选择场景')
    return
  }

  submitting.value = true
  isTyping.value = true
  quickSuggestions.value = []
  window.speechSynthesis?.cancel()

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
    interimTranscript.value = ''
    recognitionFinalTranscript = ''
    await scrollToBottom()

    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600))

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

    const newAiMsg = res.data.messages[res.data.messages.length - 1]
    if (newAiMsg && newAiMsg.role === 'ai' && voiceSettings.autoSpeak) {
      setTimeout(() => speakMessage(newAiMsg), 500)
    }
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
    speechRecognition.continuous = true
    speechRecognition.interimResults = true
    speechRecognition.maxAlternatives = 1

    speechRecognition.onstart = () => {
      isListening.value = true
      interimTranscript.value = ''
      recognitionFinalTranscript = ''
    }

    speechRecognition.onresult = (event: any) => {
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        silenceTimer = null
      }

      let interim = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += transcript + ' '
        } else {
          interim += transcript
        }
      }

      recognitionFinalTranscript += finalText
      interimTranscript.value = recognitionFinalTranscript + interim
      userInput.value = recognitionFinalTranscript + interim

      silenceTimer = setTimeout(() => {
        if (voiceSettings.autoSend && userInput.value.trim()) {
          stopVoiceInput()
          setTimeout(() => sendMessage(), 300)
        }
      }, 1500)
    }

    speechRecognition.onerror = (event: any) => {
      isListening.value = false
      if (event.error === 'no-speech') {
        ElMessage.info('没有检测到语音，请再试一次')
      } else if (event.error === 'audio-capture') {
        ElMessage.error('未检测到麦克风，请检查设备')
      } else if (event.error === 'not-allowed') {
        ElMessage.error('请允许麦克风权限以使用语音功能')
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        silenceTimer = null
      }
    }

    speechRecognition.onend = () => {
      isListening.value = false
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        silenceTimer = null
      }
    }
  }
}

const toggleVoiceInput = () => {
  if (!speechRecognition) {
    ElMessage.warning('您的浏览器不支持语音识别，推荐使用 Chrome 或 Edge 浏览器')
    return
  }

  if (isListening.value) {
    stopVoiceInput()
  } else {
    try {
      speechRecognition.start()
      isListening.value = true
    } catch (e) {
      ElMessage.warning('启动语音识别失败，请重试')
    }
  }
}

const stopVoiceInput = () => {
  if (speechRecognition) {
    try {
      speechRecognition.stop()
    } catch (e) {
      // ignore
    }
  }
  isListening.value = false
}

const speakText = (text: string, msgId?: number | string) => {
  if (!('speechSynthesis' in window)) {
    ElMessage.warning('您的浏览器不支持语音合成')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = voiceSettings.speakRate
  utterance.pitch = 1
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
    || voices.find(v => v.lang.startsWith('en-US'))
    || voices.find(v => v.lang.startsWith('en'))
  if (englishVoice) {
    utterance.voice = englishVoice
  }

  utterance.onstart = () => {
    currentlySpeakingId.value = msgId || 'temp'
  }

  utterance.onend = () => {
    currentlySpeakingId.value = null

    if (voiceSettings.continuousMode && !followingMode.value && msgId && conversationState.value) {
      const lastMsg = conversationState.value.messages[conversationState.value.messages.length - 1]
      if (lastMsg && lastMsg.id === msgId && lastMsg.role === 'ai' && !isTyping.value) {
        setTimeout(() => {
          if (voiceSettings.continuousMode && !isListening.value && !submitting.value) {
            toggleVoiceInput()
          }
        }, 400)
      }
    }
  }

  window.speechSynthesis.speak(utterance)
}

const speakMessage = (msg: ConversationMessage) => {
  speakText(msg.content, msg.id)
}

const speakAllVocab = () => {
  if (!currentScene.value) return
  window.speechSynthesis.cancel()

  const words = currentScene.value.vocabulary.map(v => v.word)
  let index = 0

  const speakNext = () => {
    if (index < words.length) {
      speakText(words[index])
      index++
      setTimeout(speakNext, 2000)
    }
  }
  speakNext()
}

watch(() => conversationState, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  loadScenes()
  initSpeechRecognition()

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
})

onUnmounted(() => {
  if (speechRecognition) {
    speechRecognition.abort()
  }
  window.speechSynthesis?.cancel()
})
</script>

<style scoped>
.english-conversation {
  max-width: 1100px;
  margin: 0 auto;
}

.scene-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
}

.voice-features-intro {
  margin-bottom: 20px;
}

.feature-box {
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(135deg, #fafbff 0%, #f5f7fa 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: #fff;
}

.feature-icon.voice {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

.feature-icon.speak {
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
}

.feature-icon.practice {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.feature-box h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.feature-box p {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
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
  border-color: #722ed1;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(114, 46, 209, 0.15);
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

.scene-tags {
  margin-bottom: 8px;
}

.difficulty-tag {
  margin-bottom: 0;
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
  flex-wrap: wrap;
  gap: 8px;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  flex-wrap: wrap;
}

.chat-title .el-tag {
  margin-left: 4px;
  font-weight: normal;
}

.chat-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.stats-bar {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fafbff 0%, #f5f7fa 100%);
  border-radius: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 120px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
}

.stat-value.primary { color: #165DFF; }
.stat-value.success { color: #67c23a; }
.stat-value.warning { color: #e6a23c; }
.stat-value.danger { color: #f56c6c; }

.voice-recording-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff1f0 0%, #fff 100%);
  border: 2px solid #ffa39e;
  border-radius: 12px;
  margin-bottom: 14px;
}

.recording-indicator {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f56c6c;
  opacity: 0.4;
  animation: pulse 1.2s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.4); opacity: 0; }
}

.mic-icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c 0%, #ff7875 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recording-content {
  flex: 1;
}

.recording-label {
  font-size: 13px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 4px;
}

.interim-text {
  font-size: 15px;
  color: #303133;
  font-style: italic;
  margin-bottom: 8px;
}

.hint-text {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.wave-container {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
}

.wave-bar {
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #f56c6c 0%, #ffa39e 100%);
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

.follow-practice-bar {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9eb 0%, #fff 100%);
  border: 2px solid #b7eb8f;
  border-radius: 12px;
  margin-bottom: 14px;
}

.follow-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.follow-title {
  font-size: 15px;
  font-weight: 600;
  color: #52c41a;
}

.follow-text {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  padding: 14px 18px;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #b7eb8f;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
}

.follow-text:hover {
  background: #f6ffed;
}

.follow-text.speaking {
  background: #f6ffed;
  border-color: #52c41a;
}

.follow-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.follow-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.mic-btn-large {
  padding: 10px 24px !important;
  font-weight: 600;
}

.messages-container {
  max-height: 450px;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: 10px;
  margin-bottom: 14px;
}

.message-item {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s;
}

.message-item:last-child {
  margin-bottom: 0;
}

.message-item.speaking .bubble {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
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
  max-width: 78%;
}

.bubble {
  padding: 14px 20px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: default;
  transition: all 0.2s;
  position: relative;
}

.message-item.ai .bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid #ebeef5;
  cursor: pointer;
}

.message-item.ai .bubble:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.message-item.user .bubble {
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
}

.message-item.user .message-content {
  color: #fff;
}

.message-content {
  font-size: 16px;
  line-height: 1.6;
  position: relative;
  padding-right: 24px;
}

.message-item.ai .message-content {
  color: #303133;
}

.speak-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #c0c4cc;
  opacity: 0;
  transition: all 0.2s;
}

.message-item.ai .bubble:hover .speak-icon {
  opacity: 1;
  color: #667eea;
}

.speak-icon.active {
  opacity: 1 !important;
  color: #667eea !important;
  animation: speakPulse 0.8s ease-in-out infinite;
}

@keyframes speakPulse {
  0%, 100% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.2); }
}

.message-extra {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
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
  gap: 6px;
  font-size: 12px;
  background: #fdf6ec;
  padding: 8px 12px;
  border-radius: 8px;
}

.correction-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.correction-label {
  color: #e6a23c;
  font-weight: 600;
  font-size: 11px;
}

.correction-text {
  color: #303133;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.correction-text:hover {
  color: #165DFF;
}

.useful-phrases {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  background: #f0f9eb;
  padding: 8px 12px;
  border-radius: 8px;
}

.phrases-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.phrase-item {
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s;
}

.phrase-item:hover {
  color: #165DFF;
}

.phrase-word {
  color: #165DFF;
  font-weight: 600;
}

.phrase-meaning {
  color: #606266;
  font-size: 11px;
}

.message-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.typing-indicator .typing-bubble {
  display: flex;
  gap: 5px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border: 1px solid #ebeef5;
  border-radius: 18px;
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
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.input-section {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-section.voice-mode .text-input-wrapper {
  display: none;
}

.input-section.voice-mode .voice-input-wrapper {
  display: block;
}

.text-input-wrapper {
  flex: 1;
}

.voice-input-wrapper {
  flex: 1;
  display: none;
}

.voice-idle-display {
  padding: 14px 20px;
  background: #fafafa;
  border: 2px dashed #dcdfe6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #909399;
  font-size: 14px;
}

.voice-idle-display:hover {
  border-color: #722ed1;
  color: #722ed1;
  background: #faf5ff;
}

.voice-active-display {
  padding: 14px 20px;
  background: #fff1f0;
  border: 2px solid #ffa39e;
  border-radius: 10px;
}

.voice-text-display {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.voice-label {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 600;
  flex-shrink: 0;
}

.voice-content {
  font-size: 15px;
  color: #303133;
  font-style: italic;
}

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voice-input-btn {
  min-width: 80px;
  position: relative;
  overflow: hidden;
}

.voice-input-btn.listening {
  animation: listeningPulse 1.5s ease-in-out infinite;
}

@keyframes listeningPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(245, 108, 108, 0); }
}

.voice-input-btn .btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.mic-pulse {
  display: flex;
  gap: 2px;
  align-items: center;
}

.mic-pulse span {
  width: 4px;
  height: 16px;
  background: #fff;
  border-radius: 2px;
  animation: micPulse 0.8s ease-in-out infinite;
}

.mic-pulse span:nth-child(2) { animation-delay: 0.15s; }
.mic-pulse span:nth-child(3) { animation-delay: 0.3s; }

@keyframes micPulse {
  0%, 100% { height: 8px; }
  50% { height: 18px; }
}

.quick-suggestions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafbfc;
  border-radius: 8px;
}

.suggestions-label {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px 12px !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.quick-tag:hover {
  transform: translateY(-1px);
  background: #ecf5ff;
  border-color: #165DFF;
  color: #165DFF;
}

.vocabulary-container h3 {
  margin: 0;
  font-size: 17px;
}

.vocab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vocab-section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
}

.scene-desc-full {
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
  margin: 8px 0 0 0;
}

.vocab-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vocab-item {
  padding: 14px;
  background: #fafbfc;
  border-radius: 10px;
  border-left: 4px solid #165DFF;
  transition: all 0.2s;
}

.vocab-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.vocab-item.learned {
  border-left-color: #67c23a;
}

.vocab-item.learned:hover {
  background: #f0f9eb;
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
  line-height: 1.5;
}

.voice-settings-content {
  padding: 8px 0;
}

.setting-item {
  margin-bottom: 8px;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

.setting-item.switches {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.pronunciation-feedback {
  background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
  border: 1px solid #bae7ff;
  border-radius: 8px;
  padding: 10px 12px;
}

.pronunciation-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pronunciation-score {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 700;
}

.pronunciation-score.excellent {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  color: #52c41a;
}

.pronunciation-score.good {
  background: linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%);
  color: #faad14;
}

.pronunciation-score.needs_practice {
  background: linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%);
  color: #fa8c16;
}

.score-value {
  font-size: 16px;
}

.score-label {
  font-size: 11px;
  font-weight: normal;
}

.pronunciation-msg {
  font-size: 12px;
  color: #606266;
  margin-left: 4px;
}

.word-by-word {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.word-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.word-item:hover {
  transform: translateY(-1px);
  border-color: #165DFF;
  background: #ecf5ff;
}

.word-item.easy {
  border-left: 3px solid #67c23a;
}

.word-item.medium {
  border-left: 3px solid #e6a23c;
}

.word-item.hard {
  border-left: 3px solid #f56c6c;
}

.word-item.common-mistake {
  background: linear-gradient(135deg, #fff7e6 0%, #fff 100%);
  border-color: #ffd591;
}

.word-text {
  font-weight: 500;
  color: #303133;
}

.word-phonetic {
  font-size: 11px;
  color: #909399;
  font-style: italic;
}

.word-speak-icon {
  color: #c0c4cc;
  margin-left: 2px;
}

.word-item:hover .word-speak-icon {
  color: #165DFF;
}

.word-tip-icon {
  color: #e6a23c;
  margin-left: 2px;
}

.practice-words {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff 100%);
  border-radius: 8px;
  border: 1px solid #ffd591;
}

.practice-label {
  font-size: 12px;
  color: #d48806;
  font-weight: 500;
}

.practice-word {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #ffd591;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #d46b08;
  font-weight: 500;
}

.practice-word:hover {
  background: #fffbe6;
  transform: translateY(-1px);
}

.word-practice-bar {
  padding: 20px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
  border: 2px solid #ffe58f;
  border-radius: 12px;
  margin-bottom: 14px;
}

.practice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.practice-title {
  font-size: 15px;
  font-weight: 600;
  color: #d48806;
  flex: 1;
}

.practice-progress {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
}

.progress-dot {
  width: 100%;
  height: 4px;
  background: #ffe58f;
  border-radius: 2px;
  flex: 1;
  transition: all 0.3s;
}

.progress-dot.active {
  background: #faad14;
  height: 6px;
}

.progress-dot.done {
  background: #52c41a;
}

.current-word-display {
  text-align: center;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  border: 2px dashed #ffd591;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
}

.current-word-display:hover {
  background: #fffbe6;
  border-color: #faad14;
}

.current-word-display.speaking {
  background: #fffbe6;
  border-color: #faad14;
  box-shadow: 0 0 0 4px rgba(250, 173, 20, 0.1);
}

.big-word {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-right: 10px;
  letter-spacing: 1px;
}

.word-phonetic-display {
  text-align: center;
  font-size: 16px;
  color: #909399;
  font-style: italic;
  margin-bottom: 8px;
}

.word-tip-display {
  text-align: center;
  font-size: 13px;
  color: #d46b08;
  background: #fffbe6;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.practice-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.practice-exit {
  text-align: center;
}

@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chat-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .message-wrapper {
    max-width: 85%;
  }

  .input-section {
    flex-direction: column;
    align-items: stretch;
  }

  .input-actions {
    flex-direction: row;
  }

  .voice-input-btn {
    width: 100%;
  }
}
</style>
