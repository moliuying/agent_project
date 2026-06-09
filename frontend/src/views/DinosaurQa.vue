<template>
  <div class="dinosaur-qa">
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="22" color="#13c2c2"><Reading /></el-icon>
          <span>恐龙知识问答</span>
          <el-tag type="success" size="small" effect="dark" class="header-tag">
            <el-icon style="margin-right: 4px;"><Cpu /></el-icon>
            AI 古生物专家
          </el-tag>
        </div>
      </template>
      <div class="intro-content">
        <div class="intro-icon">🦕</div>
        <h2>探索史前世界的奥秘</h2>
        <p>输入关于恐龙的问题，AI 古生物专家将为你提供专业准确且通俗易懂的解答。适用于科普学习、亲子教育、知识竞赛准备等场景。</p>
        <el-row :gutter="16" class="feature-row">
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🔬</div>
              <h4>专业知识</h4>
              <p>基于古生物学研究成果</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">📖</div>
              <h4>通俗易懂</h4>
              <p>适合各年龄段阅读</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">👨‍👩‍👧</div>
              <h4>亲子教育</h4>
              <p>激发孩子探索兴趣</p>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="feature-item">
              <div class="fi-icon">🏆</div>
              <h4>知识竞赛</h4>
              <p>快速积累恐龙知识</p>
            </div>
          </el-col>
        </el-row>

        <div class="credibility-intro">
          <div class="ci-title">
            <el-icon color="#409eff"><DataAnalysis /></el-icon>
            <span>知识可信度分级体系</span>
          </div>
          <div class="ci-tags">
            <el-tooltip content="已被绝大多数古生物学家认可的确定性结论" placement="top">
              <el-tag type="success" effect="dark" size="small">学术共识</el-tag>
            </el-tooltip>
            <el-tooltip content="多数研究者支持，但仍存在少量不同意见" placement="top">
              <el-tag type="primary" effect="dark" size="small">主流观点</el-tag>
            </el-tooltip>
            <el-tooltip content="学界存在明显分歧，尚无定论" placement="top">
              <el-tag type="warning" effect="dark" size="small">存在争议</el-tag>
            </el-tooltip>
            <el-tooltip content="基于有限证据提出的研究假说，有待进一步验证" placement="top">
              <el-tag type="danger" effect="dark" size="small">研究假说</el-tag>
            </el-tooltip>
          </div>
          <div class="ci-note">
            <el-icon color="#e6a23c"><Warning /></el-icon>
            <span>古生物学领域持续发展，每条知识均标注最后更新日期、研究来源引用与注意事项，供您参考甄别。</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="chat-card" v-loading="loading">
      <template #header>
        <div class="chat-header">
          <div class="chat-title">
            <el-icon :size="20" color="#165DFF"><ChatDotRound /></el-icon>
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
            type="info"
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
            <div class="related-section" v-if="msg.relatedDinosaurs && msg.relatedDinosaurs.length > 0">
              <div class="related-title">
                <el-icon><Link /></el-icon>
                <span>相关恐龙</span>
              </div>
              <div class="related-list">
                <el-card
                  v-for="dino in msg.relatedDinosaurs"
                  :key="dino.name"
                  class="related-dino-card"
                  shadow="hover"
                  @click="askQuestion(`介绍一下${dino.name}`)"
                >
                  <div class="dino-card-header">
                    <span class="dino-name">{{ dino.name }}</span>
                    <div class="dino-tags">
                      <el-tag size="small" :type="getDietTagType(dino.diet)">
                        {{ dino.diet }}
                      </el-tag>
                      <el-tooltip :content="getConfidenceDescription(dino.confidence)" placement="top">
                        <el-tag
                          size="small"
                          effect="plain"
                          :type="getConfidenceTagType(dino.confidence)"
                          class="dino-confidence-tag"
                        >
                          {{ getConfidenceLabel(dino.confidence) }}
                        </el-tag>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="dino-name-en">{{ dino.nameEn }}</div>
                  <div class="dino-meta">
                    <span>🕐 {{ dino.period.split('（')[0] }}</span>
                    <span>📍 {{ dino.location.split('（')[0] }}</span>
                  </div>
                  <div class="dino-size">
                    <el-tooltip content="体型数据为基于现有化石的估算值，可能随新化石发现而更新，竞赛/考试使用前请核实最新资料" placement="top">
                      <span class="dino-size-item">📏 {{ dino.length }} <span class="estimate-badge">估算</span></span>
                    </el-tooltip>
                    <el-tooltip content="体型数据为基于现有化石的估算值，可能随新化石发现而更新，竞赛/考试使用前请核实最新资料" placement="top">
                      <span class="dino-size-item">⚖️ {{ dino.weight }} <span class="estimate-badge">估算</span></span>
                    </el-tooltip>
                  </div>
                  <div v-if="dino.height" class="dino-size">
                    <el-tooltip content="体型数据为基于现有化石的估算值，可能随新化石发现而更新，竞赛/考试使用前请核实最新资料" placement="top">
                      <span class="dino-size-item">📐 {{ dino.height }} <span class="estimate-badge">估算</span></span>
                    </el-tooltip>
                  </div>
                </el-card>
              </div>
            </div>
            <div class="related-facts" v-if="msg.relatedFacts && msg.relatedFacts.length > 0">
              <div class="facts-title">
                <el-icon><Star /></el-icon>
                <span>趣味知识</span>
              </div>
              <div class="facts-list">
                <div v-for="(fact, idx) in msg.relatedFacts" :key="idx" class="fact-item">
                  <el-icon color="#f59e0b"><Collection /></el-icon>
                  <span>{{ fact.content }}</span>
                </div>
              </div>
            </div>
            <div class="credibility-section" v-if="msg.credibility && msg.role === 'ai'">
              <div class="credibility-header">
                <div class="credibility-title">
                  <el-icon color="#409eff"><DataAnalysis /></el-icon>
                  <span>知识可信度说明</span>
                </div>
                <el-tooltip :content="getConfidenceDescription(msg.credibility.confidence)" placement="top">
                  <el-tag
                    size="small"
                    effect="dark"
                    :type="getConfidenceTagType(msg.credibility.confidence)"
                    class="confidence-tag"
                  >
                    <el-icon style="margin-right: 3px;"><DataAnalysis /></el-icon>
                    {{ getConfidenceLabel(msg.credibility.confidence) }}
                  </el-tag>
                </el-tooltip>
              </div>

              <div class="competition-warning">
                <el-icon color="#ef4444" :size="16"><Warning /></el-icon>
                <div class="cw-content">
                  <strong>竞赛/考试使用特别提示：</strong>
                  本工具提供的恐龙数据（尤其是体型数据）基于现有化石的估算值，古生物学领域持续有新发现，数据可能随时更新。<strong>竞赛、考试中请以教材、组委会指定资料或最新学术文献为准，切勿直接引用本系统数据。</strong>
                </div>
              </div>

              <div class="credibility-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  最后更新：{{ msg.credibility.lastUpdated }}
                </span>
              </div>

              <div v-if="msg.credibility.citations && msg.credibility.citations.length > 0" class="citations-section">
                <div class="citations-title">
                  <el-icon><Document /></el-icon>
                  <span>研究来源引用</span>
                </div>
                <div class="citations-list">
                  <div v-for="(cite, idx) in msg.credibility.citations" :key="idx" class="citation-item">
                    <span class="citation-year">[{{ cite.year }}]</span>
                    <span v-if="cite.researcher" class="citation-researcher">{{ cite.researcher }}</span>
                    <span v-if="cite.institution" class="citation-institution">（{{ cite.institution }}）</span>
                    <span v-if="cite.study" class="citation-study">：{{ cite.study }}</span>
                    <span v-if="cite.note" class="citation-note"> · {{ cite.note }}</span>
                  </div>
                </div>
              </div>

              <div v-if="msg.credibility.caveats && msg.credibility.caveats.length > 0" class="caveats-section">
                <div class="caveats-title">
                  <el-icon color="#e6a23c"><Warning /></el-icon>
                  <span>注意事项</span>
                </div>
                <div class="caveats-list">
                  <div v-for="(caveat, idx) in msg.credibility.caveats" :key="idx" class="caveat-item">
                    <el-icon color="#e6a23c"><Warning /></el-icon>
                    <span>{{ caveat }}</span>
                  </div>
                </div>
              </div>

              <div class="disclaimer">
                <el-icon color="#909399"><InfoFilled /></el-icon>
                <span>古生物学领域知识持续更新，以上内容仅供参考，引用前请核实最新研究成果。</span>
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
          placeholder="输入你想问的恐龙问题，如：霸王龙真的视力很差吗？"
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
  Link,
  Star,
  Collection,
  DataAnalysis,
  Document,
  Warning,
  Clock,
  InfoFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElTooltip } from 'element-plus'
import {
  dinosaurQaApi,
  type QaMessage,
  type DinosaurInfo,
  type KnowledgeConfidence,
  CONFIDENCE_LABEL,
  CONFIDENCE_COLOR,
  CONFIDENCE_DESCRIPTION,
} from '@/api/dinosaurQa'

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
  return result
}

const getDietTagType = (diet: string): 'success' | 'warning' | 'info' => {
  switch (diet) {
    case '肉食': return 'danger' as any
    case '植食': return 'success'
    case '杂食': return 'warning'
    default: return 'info'
  }
}

const getConfidenceTagType = (confidence: KnowledgeConfidence): 'success' | 'primary' | 'warning' | 'danger' => {
  switch (confidence) {
    case 'consensus': return 'success'
    case 'mainstream': return 'primary'
    case 'controversial': return 'warning'
    case 'hypothesis': return 'danger'
    default: return 'info' as any
  }
}

const getConfidenceLabel = (c?: KnowledgeConfidence) => {
  return c ? CONFIDENCE_LABEL[c] : ''
}

const getConfidenceColor = (c?: KnowledgeConfidence) => {
  return c ? CONFIDENCE_COLOR[c] : '#909399'
}

const getConfidenceDescription = (c?: KnowledgeConfidence) => {
  return c ? CONFIDENCE_DESCRIPTION[c] : ''
}

const loadSuggestedQuestions = async () => {
  try {
    const res = await dinosaurQaApi.getSuggestedQuestions()
    suggestedQuestions.value = res.data
  } catch (e) {
    suggestedQuestions.value = [
      '霸王龙真的视力很差吗？',
      '翼龙算恐龙吗？',
      '恐龙为什么灭绝了？',
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
    const res = await dinosaurQaApi.ask(question)
    const aiMsg: QaMessage = {
      id: Date.now() + 1,
      role: 'ai',
      content: res.data.answer,
      timestamp: Date.now(),
      relatedDinosaurs: res.data.relatedDinosaurs,
      relatedFacts: res.data.relatedFacts,
      credibility: res.data.credibility,
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
.dinosaur-qa {
  max-width: 1000px;
  margin: 0 auto;
}

.intro-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #e6fffb 0%, #e6f7ff 50%, #f0f5ff 100%);
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f7fa 100%);
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
  background: #165DFF;
  color: #fff;
  border-color: #165DFF;
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
  background: linear-gradient(135deg, #13c2c2 0%, #165DFF 100%);
}

.avatar .el-avatar.user {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
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
  color: #165DFF;
  font-weight: 700;
}

.chat-item.user .bubble-content strong {
  color: #ffe066;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.related-dino-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
}

.related-dino-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 93, 255, 0.15);
}

.related-dino-card :deep(.el-card__body) {
  padding: 12px;
}

.dino-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.dino-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.dino-name-en {
  font-size: 12px;
  color: #909399;
  font-style: italic;
  margin-bottom: 8px;
}

.dino-meta,
.dino-size {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}

.related-facts {
  width: 100%;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
  border-radius: 10px;
  padding: 12px 16px;
}

.facts-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #b88230;
  margin-bottom: 8px;
}

.facts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fact-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #8c6d1f;
  line-height: 1.6;
}

.fact-item .el-icon {
  margin-top: 3px;
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

.credibility-intro {
  margin-top: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  text-align: left;
  border: 1px solid #e4e7ed;
}

.ci-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
}

.ci-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.ci-tags .el-tag {
  cursor: help;
}

.ci-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #8c6d1f;
  line-height: 1.6;
  background: #fffbe6;
  padding: 10px 14px;
  border-radius: 8px;
}

.credibility-section {
  width: 100%;
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #d9ecff;
}

.credibility-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.credibility-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.confidence-tag {
  cursor: help;
}

.credibility-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #c6e2ff;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.citations-section {
  margin-bottom: 12px;
}

.citations-title,
.caveats-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.citations-list,
.caveats-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.citation-item {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  padding-left: 4px;
}

.citation-year {
  color: #409eff;
  font-weight: 600;
  margin-right: 4px;
}

.citation-researcher {
  color: #303133;
  font-weight: 500;
}

.citation-institution {
  color: #909399;
  font-size: 11px;
}

.citation-study {
  color: #606266;
}

.citation-note {
  color: #e6a23c;
  font-style: italic;
}

.caveats-section {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #fffbe6;
  border-radius: 6px;
}

.caveat-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #8c6d1f;
  line-height: 1.6;
}

.caveat-item .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: #909399;
  line-height: 1.6;
  padding-top: 10px;
  border-top: 1px dashed #c6e2ff;
}

.disclaimer .el-icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.dino-tags {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dino-confidence-tag {
  cursor: help;
}

.dino-size {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}

.dino-size-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
  cursor: help;
}

.estimate-badge {
  display: inline-block;
  font-size: 10px;
  padding: 0 4px;
  background: #fdf6ec;
  color: #e6a23c;
  border-radius: 3px;
  line-height: 1.4;
  border: 1px solid #f5dab1;
  font-weight: 500;
}

.competition-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 12px;
}

.competition-warning .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.cw-content {
  font-size: 12px;
  color: #7f1d1d;
  line-height: 1.7;
}

.cw-content strong {
  color: #b91c1c;
  font-weight: 700;
}
</style>
