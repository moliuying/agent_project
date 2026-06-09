<template>
  <div class="scene-english">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="26" color="#165DFF">
            <ChatLineRound />
          </el-icon>
          <span>场景化英语表达查询</span>
          <el-tag type="primary" size="small" effect="dark" style="margin-left: 10px;">
            <el-icon style="margin-right: 4px;"><Search /></el-icon>
            智能匹配场景
          </el-tag>
        </div>
      </template>

      <el-alert
        title="越具体的场景描述，得到的表达越精准"
        type="info"
        :closable="false"
        show-icon
        class="intro-alert"
      >
        <template #default>
          <p>💡 <strong>模糊描述</strong>："我要出国" → 可能返回通用表达；<strong>具体描述</strong>："在洛杉矶机场值机，有两件行李要托运，想选靠窗座位" → 精准命中机场值机并定位到对应环节</p>
          <p style="margin-top:6px;">推荐直接点击下方场景卡片，或输入如："和外国同事开会，我需要做汇报"、"在纽约餐厅点牛排，五分熟"</p>
        </template>
      </el-alert>

      <div class="search-section">
        <el-input
          v-model="sceneDescription"
          placeholder="请具体描述：地点 + 你的角色 + 想做什么（如：在国外餐厅想点一份三分熟牛排）"
          size="large"
          clearable
          @keydown.enter="handleQuery"
        >
          <template #prefix>
            <el-icon><Edit /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleQuery"
          :disabled="!sceneDescription.trim()"
        >
          <el-icon><Search /></el-icon>
          <span>查询表达</span>
        </el-button>
      </div>

      <div class="quick-scenes">
        <div class="quick-label">
          <el-icon :size="14"><Lightning /></el-icon>
          <span>快速选择场景：</span>
        </div>
        <div class="quick-tags">
          <el-tag
            v-for="scene in allScenes"
            :key="scene.id"
            class="scene-tag"
            effect="plain"
            :type="tagTypeMap[scene.category] || 'info'"
            @click="selectScene(scene)"
          >
            <el-icon class="tag-icon">
              <component :is="getIconComponent(scene.icon)" />
            </el-icon>
            <span>{{ scene.name }}</span>
          </el-tag>
        </div>
      </div>
    </el-card>

    <div v-if="result" class="result-section">
      <el-card v-if="result.isAmbiguous" class="ambiguous-card">
        <el-result icon="question" title="场景描述不够具体" sub-title="为了给你更精准的表达，请选择你实际所在的场景，或补充更多细节">
          <template #extra>
            <div v-if="result.candidateScenes && result.candidateScenes.length > 0" class="candidate-section">
              <div class="candidate-title">
                <el-icon><Compass /></el-icon>
                <span>根据你输入的关键词，可能是以下场景：</span>
              </div>
              <div class="candidate-grid">
                <div
                  v-for="candidate in result.candidateScenes"
                  :key="candidate.id"
                  class="candidate-card"
                  @click="selectCandidate(candidate)"
                >
                  <div class="candidate-header">
                    <el-icon :size="22" :color="tagColorMap[getCategory(candidate.id)] || '#165DFF'">
                      <component :is="getIconComponent(candidate.icon)" />
                    </el-icon>
                    <div class="candidate-name">{{ candidate.name }}</div>
                  </div>
                  <div class="candidate-desc">{{ candidate.description }}</div>
                  <div class="candidate-reasons">
                    <el-tag v-for="reason in candidate.matchReasons" :key="reason" size="small" type="warning" effect="light">
                      匹配: {{ reason }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div class="clarification-hint">
              <el-alert :title="result.clarificationHint || '补充更多细节以获得更精准的匹配'" type="warning" :closable="false" show-icon />
            </div>
          </template>
        </el-result>
      </el-card>

      <el-card class="result-card" v-loading="loading">
        <template #header>
          <div class="result-header">
            <div class="result-title">
              <el-icon :size="22" color="#165DFF">
                <Collection />
              </el-icon>
              <span>{{ result.sceneName }}</span>
              <el-tag size="small" type="success" effect="light">
                {{ result.sceneNameEn }}
              </el-tag>
              <el-tag v-if="!result.isAmbiguous" size="small" type="primary" effect="dark" style="margin-left:8px;">
                <el-icon><CircleCheck /></el-icon>
                <span style="margin-left:2px;">精准匹配</span>
              </el-tag>
              <el-tag v-else size="small" type="warning" effect="light" style="margin-left:8px;">
                <el-icon><Warning /></el-icon>
                <span style="margin-left:2px;">通用表达</span>
              </el-tag>
            </div>
            <div class="result-actions">
              <el-button size="small" @click="speakAllPhrases">
                <el-icon><VideoPlay /></el-icon>
                朗读所有表达
              </el-button>
              <el-button size="small" @click="resetSearch">
                <el-icon><Refresh /></el-icon>
                重新查询
              </el-button>
            </div>
          </div>
        </template>

        <div class="brief-intro">
          <el-icon size="16" color="#165DFF"><InfoFilled /></el-icon>
          <span>{{ result.briefIntroduction }}</span>
        </div>

        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane label="🎯 关键表达" name="phrases">
            <template v-if="result.keyPhrasesGrouped && result.keyPhrasesGrouped.length > 0">
              <div v-for="(group, gIdx) in result.keyPhrasesGrouped" :key="gIdx" class="phrase-group">
                <div class="group-header">
                  <el-icon :size="18" color="#165DFF"><Aim /></el-icon>
                  <span class="group-stage">{{ group.stage }}</span>
                  <span class="group-stage-en">{{ group.stageEn }}</span>
                </div>
                <div class="group-desc">{{ group.description }}</div>
                <div class="phrases-grid">
                  <div
                    v-for="(phrase, idx) in group.phrases"
                    :key="gIdx + '-' + idx"
                    class="phrase-card"
                    :class="{ speaking: currentlySpeakingId === 'phrase-' + gIdx + '-' + idx }"
                    @click="speakText(phrase.english, 'phrase-' + gIdx + '-' + idx)"
                  >
                    <div class="phrase-header">
                      <span class="phrase-number">{{ idx + 1 }}</span>
                      <el-tag v-if="phrase.speaker" size="small" type="success" effect="plain">
                        {{ phrase.speaker }}说
                      </el-tag>
                    </div>
                    <div class="phrase-english">
                      "{{ phrase.english }}"
                      <el-icon class="speak-icon" size="14" color="#165DFF"><VideoPlay /></el-icon>
                    </div>
                    <div class="phrase-chinese">
                      {{ phrase.chinese }}
                    </div>
                    <div v-if="phrase.whenToUse" class="phrase-when">
                      <el-icon size="12" color="#e6a23c"><Clock /></el-icon>
                      <span>什么时候说：{{ phrase.whenToUse }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="phrases-grid">
                <div
                  v-for="(phrase, idx) in result.keyPhrases"
                  :key="idx"
                  class="phrase-card"
                  :class="{ speaking: currentlySpeakingId === 'phrase-' + idx }"
                  @click="speakText(phrase.english, 'phrase-' + idx)"
                >
                  <div class="phrase-header">
                    <span class="phrase-number">{{ idx + 1 }}</span>
                    <el-tag v-if="phrase.speaker" size="small" type="success" effect="plain">
                      {{ phrase.speaker }}说
                    </el-tag>
                  </div>
                  <div class="phrase-english">
                    "{{ phrase.english }}"
                    <el-icon class="speak-icon" size="14" color="#165DFF"><VideoPlay /></el-icon>
                  </div>
                  <div class="phrase-chinese">
                    {{ phrase.chinese }}
                  </div>
                  <div v-if="phrase.whenToUse" class="phrase-when">
                    <el-icon size="12" color="#e6a23c"><Clock /></el-icon>
                    <span>什么时候说：{{ phrase.whenToUse }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-tab-pane>

          <el-tab-pane label="📝 常见句式" name="patterns">
            <div class="patterns-list">
              <div
                v-for="(pattern, idx) in result.commonPatterns"
                :key="idx"
                class="pattern-card"
              >
                <div class="pattern-header">
                  <el-icon :size="18" color="#722ed1"><EditPen /></el-icon>
                  <span class="pattern-title">句式 {{ idx + 1 }}</span>
                  <el-tag v-if="pattern.whenToUse" size="small" type="warning" effect="plain" style="margin-left:auto;">
                    <el-icon><Clock /></el-icon>
                    <span style="margin-left:2px;">{{ pattern.whenToUse }}</span>
                  </el-tag>
                </div>
                <div class="pattern-body">
                  <div class="pattern-row">
                    <span class="pattern-label">句型：</span>
                    <code class="pattern-code">{{ pattern.pattern }}</code>
                  </div>
                  <div class="pattern-row">
                    <span class="pattern-label">例句：</span>
                    <span
                      class="pattern-example"
                      :class="{ speaking: currentlySpeakingId === 'pattern-' + idx }"
                      @click="speakText(pattern.example, 'pattern-' + idx)"
                    >
                      {{ pattern.example }}
                      <el-icon class="speak-icon" size="12" color="#165DFF"><VideoPlay /></el-icon>
                    </span>
                  </div>
                  <div class="pattern-row">
                    <span class="pattern-label">翻译：</span>
                    <span class="pattern-translation">{{ pattern.translation }}</span>
                  </div>
                  <div class="pattern-explanation">
                    <el-icon size="13" color="#e6a23c"><Warning /></el-icon>
                    <span>{{ pattern.explanation }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="💡 注意事项" name="tips">
            <div class="tips-list">
              <div
                v-for="(tip, idx) in result.tips"
                :key="idx"
                class="tip-card"
              >
                <div class="tip-icon">
                  <el-icon :size="20"><Star /></el-icon>
                </div>
                <div class="tip-content">
                  <div class="tip-title">{{ tip.title }}</div>
                  <div class="tip-text">{{ tip.content }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="💬 示例对话" name="dialogue">
            <div class="dialogue-container">
              <div
                v-for="(line, idx) in result.sampleDialogue"
                :key="idx"
                class="dialogue-item"
                :class="line.role"
              >
                <div class="dialogue-avatar">
                  <el-avatar :size="36" :class="line.role">
                    <el-icon>
                      <User v-if="line.role === 'A'" />
                      <Cpu v-else />
                    </el-icon>
                  </el-avatar>
                </div>
                <div class="dialogue-bubble-wrapper">
                  <div v-if="line.context" class="dialogue-context">
                    <el-icon size="12"><InfoFilled /></el-icon>
                    <span>{{ line.context }}</span>
                  </div>
                  <div
                    class="dialogue-bubble"
                    :class="{ speaking: currentlySpeakingId === 'dialogue-' + idx }"
                    @click="speakText(line.english, 'dialogue-' + idx)"
                  >
                    <div class="dialogue-english">
                      {{ line.english }}
                      <el-icon class="speak-icon" size="12" color="#165DFF"><VideoPlay /></el-icon>
                    </div>
                    <div class="dialogue-chinese">{{ line.chinese }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ChatLineRound,
  Search,
  Edit,
  Lightning,
  Collection,
  Refresh,
  VideoPlay,
  InfoFilled,
  EditPen,
  Warning,
  Star,
  User,
  Cpu,
  Briefcase,
  Airplane,
  KnifeFork,
  ShoppingBag,
  VideoPlay as VideoPlayIcon,
  Compass,
  CircleCheck,
  Aim,
  Clock,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  sceneEnglishApi,
  type SceneInfo,
  type SceneEnglishResponse,
  type SceneCandidate,
} from '@/api/sceneEnglish'

const loading = ref(false)
const sceneDescription = ref('')
const allScenes = ref<SceneInfo[]>([])
const result = ref<SceneEnglishResponse | null>(null)
const activeTab = ref('phrases')
const currentlySpeakingId = ref<string | number | null>(null)

const tagTypeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
  '职场': 'primary',
  '旅行': 'success',
  '娱乐': 'warning',
  '生活': 'info',
}

const tagColorMap: Record<string, string> = {
  '职场': '#165DFF',
  '旅行': '#67c23a',
  '娱乐': '#e6a23c',
  '生活': '#13c2c2',
}

const sceneCategoryMap: Record<string, string> = {}

const iconComponents: Record<string, any> = {
  Briefcase,
  Airplane,
  KnifeFork,
  ShoppingBag,
  User,
  VideoPlay: VideoPlayIcon,
  ChatLineRound,
  Compass,
  CircleCheck,
  Aim,
  Clock,
}

const getIconComponent = (iconName: string) => {
  return iconComponents[iconName] || ChatLineRound
}

const getCategory = (sceneId: string) => {
  return sceneCategoryMap[sceneId] || '生活'
}

const loadScenes = async () => {
  try {
    const res = await sceneEnglishApi.getAllScenes()
    allScenes.value = res.data
    for (const scene of res.data) {
      sceneCategoryMap[scene.id] = scene.category
    }
  } catch (e) {
    console.error('加载场景列表失败', e)
  }
}

const handleQuery = async () => {
  const description = sceneDescription.value.trim()
  if (!description) {
    ElMessage.warning('请先描述你所处的场景')
    return
  }

  loading.value = true
  try {
    const res = await sceneEnglishApi.query(description)
    result.value = res.data
    activeTab.value = 'phrases'
    if (res.data.isAmbiguous) {
      ElMessage.warning('场景描述不够具体，请选择或补充更多细节')
    } else {
      ElMessage.success(`已精准匹配「${res.data.sceneName}」场景`)
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '查询失败，请重试')
  } finally {
    loading.value = false
  }
}

const selectScene = async (scene: SceneInfo) => {
  sceneDescription.value = scene.name
  loading.value = true
  try {
    const res = await sceneEnglishApi.getSceneById(scene.id)
    result.value = res.data
    activeTab.value = 'phrases'
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '加载场景失败')
  } finally {
    loading.value = false
  }
}

const selectCandidate = async (candidate: SceneCandidate) => {
  sceneDescription.value = candidate.name
  loading.value = true
  try {
    const res = await sceneEnglishApi.getSceneById(candidate.id)
    result.value = res.data
    activeTab.value = 'phrases'
    ElMessage.success(`已切换到「${candidate.name}」场景`)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '加载场景失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  result.value = null
  sceneDescription.value = ''
  window.speechSynthesis?.cancel()
  currentlySpeakingId.value = null
}

const speakText = (text: string, id?: string | number) => {
  if (!('speechSynthesis' in window)) {
    ElMessage.warning('您的浏览器不支持语音合成')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
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
    currentlySpeakingId.value = id || 'temp'
  }

  utterance.onend = () => {
    currentlySpeakingId.value = null
  }

  window.speechSynthesis.speak(utterance)
}

const speakAllPhrases = () => {
  if (!result.value) return
  window.speechSynthesis.cancel()

  let allPhrases: string[] = []
  if (result.value.keyPhrasesGrouped && result.value.keyPhrasesGrouped.length > 0) {
    for (const group of result.value.keyPhrasesGrouped) {
      allPhrases = allPhrases.concat(group.phrases.map(p => p.english))
    }
  } else {
    allPhrases = result.value.keyPhrases.map(p => p.english)
  }

  let index = 0

  const speakNext = () => {
    if (index < allPhrases.length) {
      speakText(allPhrases[index])
      index++
      setTimeout(speakNext, 2500)
    }
  }
  speakNext()
}

onMounted(() => {
  loadScenes()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
})

onUnmounted(() => {
  window.speechSynthesis?.cancel()
})
</script>

<style scoped>
.scene-english {
  max-width: 1100px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
}

.intro-alert {
  margin-bottom: 20px;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-section .el-input {
  flex: 1;
}

.quick-scenes {
  background: linear-gradient(135deg, #f5f7fa 0%, #fafbff 100%);
  padding: 16px 20px;
  border-radius: 10px;
}

.quick-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 12px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.scene-tag {
  cursor: pointer;
  padding: 6px 14px;
  font-size: 13px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.scene-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tag-icon {
  font-size: 14px;
}

.result-card {
  margin-bottom: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.brief-intro {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #ecf5ff 0%, #f5f7fa 100%);
  border-radius: 10px;
  color: #303133;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 20px;
}

.result-tabs {
  margin-top: 10px;
}

.phrases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.phrase-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.25s;
}

.phrase-card:hover {
  border-color: #165DFF;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(22, 93, 255, 0.12);
}

.phrase-card.speaking {
  border-color: #165DFF;
  background: #ecf5ff;
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.15);
}

.phrase-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.phrase-number {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.phrase-english {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.speak-icon {
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.phrase-card:hover .speak-icon,
.pattern-example:hover .speak-icon,
.dialogue-bubble:hover .speak-icon {
  opacity: 1;
}

.phrase-chinese {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pattern-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #faf5ff 0%, #f5f0ff 100%);
  border-bottom: 1px solid #ebeef5;
}

.pattern-title {
  font-size: 15px;
  font-weight: 600;
  color: #722ed1;
}

.pattern-body {
  padding: 14px 18px;
}

.pattern-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
  line-height: 1.7;
}

.pattern-label {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
  min-width: 50px;
}

.pattern-code {
  background: #f0f2f5;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  color: #722ed1;
  font-weight: 500;
}

.pattern-example {
  font-size: 14px;
  color: #165DFF;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.pattern-example:hover {
  background: #ecf5ff;
}

.pattern-example.speaking {
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

.pattern-translation {
  font-size: 13px;
  color: #303133;
}

.pattern-explanation {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tip-card {
  display: flex;
  gap: 14px;
  padding: 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fdf6ec 0%, #fff7e6 100%);
  border: 1px solid #faecd8;
}

.tip-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.tip-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.dialogue-container {
  padding: 20px;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: 10px;
}

.dialogue-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  gap: 12px;
}

.dialogue-item:last-child {
  margin-bottom: 0;
}

.dialogue-item.B {
  flex-direction: row-reverse;
}

.dialogue-avatar .el-avatar {
  flex-shrink: 0;
}

.dialogue-avatar .el-avatar.A {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.dialogue-avatar .el-avatar.B {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dialogue-bubble-wrapper {
  max-width: 75%;
}

.dialogue-bubble {
  padding: 14px 18px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  border: 1px solid #ebeef5;
}

.dialogue-item.A .dialogue-bubble {
  border-top-left-radius: 4px;
}

.dialogue-item.B .dialogue-bubble {
  border-top-right-radius: 4px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

.dialogue-bubble:hover {
  border-color: #165DFF;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.dialogue-bubble.speaking {
  border-color: #165DFF;
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.15);
}

.dialogue-english {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  line-height: 1.7;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.dialogue-chinese {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

.dialogue-context {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #165DFF;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.ambiguous-card {
  margin-bottom: 20px;
}

.ambiguous-card :deep(.el-result) {
  padding: 20px 20px 10px;
}

.ambiguous-card :deep(.el-result__title) {
  font-size: 20px;
  font-weight: 600;
}

.candidate-section {
  margin-top: 16px;
}

.candidate-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 14px;
  text-align: left;
}

.candidate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.candidate-card {
  border: 2px solid #ebeef5;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s;
  background: #fff;
  text-align: left;
}

.candidate-card:hover {
  border-color: #165DFF;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(22, 93, 255, 0.12);
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.candidate-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.candidate-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.5;
}

.candidate-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.clarification-hint {
  margin-top: 16px;
}

.phrase-group {
  margin-bottom: 28px;
}

.phrase-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.group-stage {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.group-stage-en {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.group-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 14px;
  padding-left: 26px;
  line-height: 1.6;
}

.phrase-when {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
  font-size: 12px;
  color: #e6a23c;
  line-height: 1.6;
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #faf5ff 0%, #f5f0ff 100%);
  border-bottom: 1px solid #ebeef5;
}

.pattern-title {
  font-size: 15px;
  font-weight: 600;
  color: #722ed1;
}
</style>
