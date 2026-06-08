<template>
  <div class="image-to-prompt">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#722ed1">
            <PictureFilled />
          </el-icon>
          <span>图片转 AI 绘画提示词</span>
          <el-tag size="small" type="success" class="header-tag">精准分析 · 多版本生成 · 可编辑微调</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传图片" description="系统自动分析色调、亮度、饱和度" />
          <el-step title="标注特征" description="手动勾选图片中的主体、风格、构图元素" />
          <el-step title="多版本生成" description="一次生成3个版本，选择最合适的再微调" />
        </el-steps>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="24" :lg="12">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#165DFF">
                <Upload />
              </el-icon>
              <span>上传参考图片</span>
              <el-tag v-if="imageFeaturesReady" size="small" type="success">已分析</el-tag>
            </div>
          </template>

          <div
            class="upload-area"
            :class="{ 'upload-area-active': isDragging, 'has-image': imagePreview }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <div v-if="!imagePreview" class="upload-placeholder">
              <el-icon :size="64" color="#c0c4cc"><UploadFilled /></el-icon>
              <p class="upload-text">点击或拖拽图片到此处上传</p>
              <p class="upload-hint">支持 JPG、PNG、WebP 等常见图片格式（≤10MB）</p>
            </div>
            <div v-else class="image-preview-container">
              <img :src="imagePreview" alt="preview" class="image-preview" />
              <div class="image-actions">
                <el-button type="danger" size="small" @click.stop="removeImage">
                  <el-icon><Delete /></el-icon>
                  移除
                </el-button>
                <el-button size="small" @click.stop="triggerFileInput">
                  <el-icon><Refresh /></el-icon>
                  更换
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="imageFeaturesReady && autoAnalysis" class="auto-analysis-section">
            <el-divider content-position="left">
              <span class="divider-label">
                <el-icon :size="14"><DataAnalysis /></el-icon>
                系统自动分析
              </span>
            </el-divider>
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="analysis-label">主色调</span>
                <div class="color-swatches">
                  <div
                    v-for="(c, idx) in autoAnalysis.dominantColors"
                    :key="idx"
                    class="color-swatch"
                    :style="{ background: c.hex }"
                    :title="`${c.hex} - ${c.name}`"
                  ></div>
                </div>
                <span class="analysis-value">{{ autoAnalysis.colorProfile }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">亮度</span>
                <el-progress
                  :percentage="autoAnalysis.brightness"
                  :color="brightnessProgressColor"
                  :show-text="false"
                  :stroke-width="8"
                />
                <span class="analysis-value">{{ autoAnalysis.brightnessLabel }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">饱和度</span>
                <el-progress
                  :percentage="autoAnalysis.saturation"
                  color="#e6a23c"
                  :show-text="false"
                  :stroke-width="8"
                />
                <span class="analysis-value">{{ autoAnalysis.saturationLabel }}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">对比度</span>
                <el-progress
                  :percentage="autoAnalysis.contrast"
                  color="#165DFF"
                  :show-text="false"
                  :stroke-width="8"
                />
                <span class="analysis-value">{{ autoAnalysis.contrastLabel }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#e6a23c">
                <List />
              </el-icon>
              <span>特征标注 & 参数设置</span>
              <el-tag size="small" type="warning">标注越详细，结果越精准</el-tag>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="图片主体描述（强烈建议填写）">
              <el-input
                v-model="form.userDescription"
                type="textarea"
                :rows="2"
                placeholder="请详细描述图片中的主体和场景，例如：一只毛茸茸的橘色布偶猫坐在木质窗台上，窗外是樱花树，午后阳光斜照进来"
                maxlength="300"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="主体类别（可多选）">
              <el-checkbox-group v-model="form.subjectTypes">
                <el-checkbox value="人物肖像">人物肖像</el-checkbox>
                <el-checkbox value="全身人像">全身人像</el-checkbox>
                <el-checkbox value="动物">动物</el-checkbox>
                <el-checkbox value="风景">风景</el-checkbox>
                <el-checkbox value="城市建筑">城市建筑</el-checkbox>
                <el-checkbox value="静物产品">静物产品</el-checkbox>
                <el-checkbox value="食物">食物</el-checkbox>
                <el-checkbox value="插画">插画</el-checkbox>
                <el-checkbox value="科幻场景">科幻场景</el-checkbox>
                <el-checkbox value="奇幻生物">奇幻生物</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="目标风格（可多选）">
              <el-checkbox-group v-model="form.styles">
                <el-checkbox value="photorealistic">写实</el-checkbox>
                <el-checkbox value="anime style">动漫</el-checkbox>
                <el-checkbox value="oil painting">油画</el-checkbox>
                <el-checkbox value="watercolor">水彩</el-checkbox>
                <el-checkbox value="digital art">数字艺术</el-checkbox>
                <el-checkbox value="cyberpunk">赛博朋克</el-checkbox>
                <el-checkbox value="steampunk">蒸汽朋克</el-checkbox>
                <el-checkbox value="fantasy art">奇幻</el-checkbox>
                <el-checkbox value="3D render">3D渲染</el-checkbox>
                <el-checkbox value="cinematic">电影感</el-checkbox>
                <el-checkbox value="vintage photography">复古</el-checkbox>
                <el-checkbox value="pixel art">像素</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="构图方式（可多选）">
              <el-checkbox-group v-model="form.compositions">
                <el-checkbox value="centered composition">居中构图</el-checkbox>
                <el-checkbox value="rule of thirds">三分法</el-checkbox>
                <el-checkbox value="close-up shot">特写</el-checkbox>
                <el-checkbox value="wide angle shot">广角</el-checkbox>
                <el-checkbox value="low angle shot">低角度</el-checkbox>
                <el-checkbox value="high angle shot">俯拍</el-checkbox>
                <el-checkbox value="depth of field">景深虚化</el-checkbox>
                <el-checkbox value="full body shot">全身构图</el-checkbox>
                <el-checkbox value="portrait composition">肖像构图</el-checkbox>
                <el-checkbox value="symmetrical composition">对称构图</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="光线氛围（可多选）">
              <el-checkbox-group v-model="form.lightings">
                <el-checkbox value="soft natural lighting">柔和自然光</el-checkbox>
                <el-checkbox value="golden hour lighting">黄金时刻</el-checkbox>
                <el-checkbox value="dramatic side lighting">戏剧性侧光</el-checkbox>
                <el-checkbox value="rim lighting">轮廓光</el-checkbox>
                <el-checkbox value="volumetric lighting">体积光</el-checkbox>
                <el-checkbox value="studio lighting">影棚布光</el-checkbox>
                <el-checkbox value="neon glow">霓虹灯光</el-checkbox>
                <el-checkbox value="moonlight">月光</el-checkbox>
                <el-checkbox value="backlighting">逆光</el-checkbox>
                <el-checkbox value="cinematic lighting">电影级打光</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="画面情绪（可多选）">
              <el-checkbox-group v-model="form.moods">
                <el-checkbox value="peaceful and serene">宁静祥和</el-checkbox>
                <el-checkbox value="mysterious and atmospheric">神秘氛围</el-checkbox>
                <el-checkbox value="epic and grand">史诗宏大</el-checkbox>
                <el-checkbox value="warm and cozy">温暖舒适</el-checkbox>
                <el-checkbox value="dark and moody">黑暗忧郁</el-checkbox>
                <el-checkbox value="vibrant and energetic">活力四射</el-checkbox>
                <el-checkbox value="dreamy and ethereal">梦幻飘渺</el-checkbox>
                <el-checkbox value="romantic and tender">浪漫温柔</el-checkbox>
                <el-checkbox value="nostalgic and melancholic">怀旧感伤</el-checkbox>
                <el-checkbox value="awe-inspiring">震撼惊叹</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="细节程度">
              <el-radio-group v-model="form.detailLevel">
                <el-radio-button value="simple">简洁</el-radio-button>
                <el-radio-button value="medium">标准</el-radio-button>
                <el-radio-button value="detailed">详细</el-radio-button>
                <el-radio-button value="extreme">极致</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="生成版本数量">
              <el-radio-group v-model="form.variantCount">
                <el-radio-button :value="1">1个</el-radio-button>
                <el-radio-button :value="3">3个</el-radio-button>
                <el-radio-button :value="5">5个</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-switch
                v-model="form.includeNegative"
                active-text="生成反向提示词"
              />
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              class="generate-btn"
              :loading="isGenerating"
              :disabled="!imageBase64"
              @click="generatePrompt"
            >
              <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
              {{ isGenerating ? 'AI 正在分析图片...' : `生成 ${form.variantCount} 个版本提示词` }}
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="12">
        <el-card v-if="generatedVariants.length > 0" class="result-card">
          <template #header>
            <div class="card-header small result-header">
              <div class="header-left">
                <el-icon :size="18" color="#67c23a">
                  <MagicStick />
                </el-icon>
                <span>生成结果</span>
                <el-tag size="small" type="success">共 {{ generatedVariants.length }} 个版本</el-tag>
              </div>
              <el-radio-group v-model="activeVariantIndex" size="small" class="variant-switcher">
                <el-radio-button
                  v-for="(v, idx) in generatedVariants"
                  :key="idx"
                  :value="idx"
                >
                  版本 {{ idx + 1 }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div v-if="activeResult" class="result-content">
            <div class="analysis-section">
              <h4 class="section-title">
                <el-icon :size="16"><View /></el-icon>
                图片特征分析
                <el-button
                  link
                  type="primary"
                  size="small"
                  class="regen-btn"
                  @click="regenerateVariant(activeVariantIndex)"
                >
                  <el-icon><Refresh /></el-icon>
                  重新生成此版本
                </el-button>
              </h4>
              <div class="analysis-tags">
                <div class="tag-group">
                  <span class="tag-label">主体:</span>
                  <el-tag type="primary" effect="light">{{ activeResult.analysis.mainSubject }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">风格:</span>
                  <el-tag
                    v-for="s in activeResult.analysis.style"
                    :key="s"
                    type="warning"
                    effect="light"
                    size="small"
                  >{{ s }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">构图:</span>
                  <el-tag
                    v-for="c in activeResult.analysis.composition"
                    :key="c"
                    type="success"
                    effect="light"
                    size="small"
                  >{{ c }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">色调:</span>
                  <el-tag
                    v-for="p in activeResult.analysis.colorPalette"
                    :key="p"
                    type="danger"
                    effect="light"
                    size="small"
                  >{{ p }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">光线:</span>
                  <el-tag
                    v-for="l in activeResult.analysis.lighting"
                    :key="l"
                    type="info"
                    effect="light"
                    size="small"
                  >{{ l }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">情绪:</span>
                  <el-tag
                    v-for="m in activeResult.analysis.mood"
                    :key="m"
                    effect="plain"
                    size="small"
                  >{{ m }}</el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="prompt-section">
              <div class="prompt-header">
                <h4 class="section-title">
                  <el-icon :size="16" color="#67c23a"><EditPen /></el-icon>
                  正向提示词
                </h4>
                <div class="prompt-actions">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="toggleEditMode('positive')"
                  >
                    <el-icon><Edit /></el-icon>
                    {{ editMode.positive ? '完成编辑' : '编辑' }}
                  </el-button>
                  <el-button
                    :type="copyingState.positive ? 'success' : 'primary'"
                    size="default"
                    @click="copyToClipboard(activeResult.positivePrompt, '正向提示词', 'positive')"
                  >
                    <el-icon>
                      <CircleCheckFilled v-if="copyingState.positive" />
                      <DocumentCopy v-else />
                    </el-icon>
                    {{ copyingState.positive ? '已复制' : '复制' }}
                  </el-button>
                </div>
              </div>
              <div v-if="editMode.positive">
                <el-input
                  v-model="activeResult.positivePrompt"
                  type="textarea"
                  :rows="5"
                  resize="vertical"
                  placeholder="在此编辑提示词..."
                />
              </div>
              <div
                v-else
                class="prompt-block positive clickable"
                :class="{ copying: copyingState.positive }"
                @click="copyToClipboard(activeResult.positivePrompt, '正向提示词', 'positive')"
              >
                <template v-if="copyingState.positive">
                  <el-icon :size="20" color="#67c23a"><CircleCheckFilled /></el-icon>
                  <span class="copied-text-large">已复制到剪贴板！</span>
                </template>
                <template v-else>
                  {{ activeResult.positivePrompt }}
                </template>
              </div>
            </div>

            <div v-if="activeResult.negativePrompt" class="prompt-section">
              <div class="prompt-header">
                <h4 class="section-title">
                  <el-icon :size="16" color="#f56c6c"><Close /></el-icon>
                  反向提示词
                </h4>
                <div class="prompt-actions">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="toggleEditMode('negative')"
                  >
                    <el-icon><Edit /></el-icon>
                    {{ editMode.negative ? '完成编辑' : '编辑' }}
                  </el-button>
                  <el-button
                    :type="copyingState.negative ? 'success' : 'danger'"
                    size="default"
                    @click="copyToClipboard(activeResult.negativePrompt, '反向提示词', 'negative')"
                  >
                    <el-icon>
                      <CircleCheckFilled v-if="copyingState.negative" />
                      <DocumentCopy v-else />
                    </el-icon>
                    {{ copyingState.negative ? '已复制' : '复制' }}
                  </el-button>
                </div>
              </div>
              <div v-if="editMode.negative">
                <el-input
                  v-model="activeResult.negativePrompt"
                  type="textarea"
                  :rows="4"
                  resize="vertical"
                  placeholder="在此编辑反向提示词..."
                />
              </div>
              <div
                v-else
                class="prompt-block negative clickable"
                :class="{ copying: copyingState.negative }"
                @click="copyToClipboard(activeResult.negativePrompt, '反向提示词', 'negative')"
              >
                <template v-if="copyingState.negative">
                  <el-icon :size="20" color="#f56c6c"><CircleCheckFilled /></el-icon>
                  <span class="copied-text-large">已复制到剪贴板！</span>
                </template>
                <template v-else>
                  {{ activeResult.negativePrompt }}
                </template>
              </div>
            </div>

            <el-divider />

            <div class="prompt-section">
              <div class="prompt-header">
                <h4 class="section-title">
                  <el-icon :size="16" color="#165DFF"><EditPen /></el-icon>
                  中文描述
                </h4>
                <div class="prompt-actions">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="toggleEditMode('cn')"
                  >
                    <el-icon><Edit /></el-icon>
                    {{ editMode.cn ? '完成编辑' : '编辑' }}
                  </el-button>
                  <el-button
                    :type="copyingState.cn ? 'success' : 'primary'"
                    size="default"
                    @click="copyToClipboard(activeResult.promptCn, '中文提示词', 'cn')"
                  >
                    <el-icon>
                      <CircleCheckFilled v-if="copyingState.cn" />
                      <DocumentCopy v-else />
                    </el-icon>
                    {{ copyingState.cn ? '已复制' : '复制' }}
                  </el-button>
                </div>
              </div>
              <div v-if="editMode.cn">
                <el-input
                  v-model="activeResult.promptCn"
                  type="textarea"
                  :rows="3"
                  resize="vertical"
                  placeholder="在此编辑中文描述..."
                />
              </div>
              <div
                v-else
                class="prompt-block cn clickable"
                :class="{ copying: copyingState.cn }"
                @click="copyToClipboard(activeResult.promptCn, '中文提示词', 'cn')"
              >
                <template v-if="copyingState.cn">
                  <el-icon :size="20" color="#165DFF"><CircleCheckFilled /></el-icon>
                  <span class="copied-text-large">已复制到剪贴板！</span>
                </template>
                <template v-else>
                  {{ activeResult.promptCn }}
                </template>
              </div>
            </div>

            <div class="copy-all-section">
              <el-button
                type="success"
                size="large"
                class="copy-all-btn"
                @click="copyAllPrompts"
              >
                <el-icon><DocumentCopy /></el-icon>
                复制此版本全部提示词
              </el-button>
            </div>

            <el-divider />

            <div class="suggestions-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#e6a23c"><Warning /></el-icon>
                优化建议
              </h4>
              <el-alert
                v-for="(tip, idx) in activeResult.suggestions"
                :key="idx"
                type="info"
                :closable="false"
                show-icon
                :title="tip"
                class="tip-alert"
              />
            </div>
          </div>
        </el-card>

        <el-card v-if="historyList.length > 0" class="history-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#909399"><Clock /></el-icon>
              <span>历史记录</span>
              <el-button link type="primary" size="small" @click="clearHistory">清空</el-button>
            </div>
          </template>
          <div class="history-list">
            <div
              v-for="(h, idx) in historyList"
              :key="idx"
              class="history-item"
              @click="loadFromHistory(h)"
            >
              <img :src="h.imagePreview" alt="历史图片" class="history-thumb" />
              <div class="history-info">
                <p class="history-time">{{ formatTime(h.timestamp) }}</p>
                <p class="history-desc">{{ h.userDescription || '无描述' }}</p>
                <p class="history-meta">{{ h.variantCount }}个版本 · {{ h.detailLevel }}</p>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-if="generatedVariants.length === 0" class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><Picture /></el-icon>
            <p class="empty-text">上传图片并标注特征后开始生成</p>
            <p class="empty-hint">系统支持自动分析色调，手动勾选特征可大幅提升精准度</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain">
                <el-icon><DataAnalysis /></el-icon>
                自动分析色调/亮度/饱和度
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><List /></el-icon>
                手动勾选主体/风格/构图
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><MagicStick /></el-icon>
                一次生成多个版本
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Edit /></el-icon>
                生成后可直接编辑
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  PictureFilled,
  Picture,
  Upload,
  UploadFilled,
  Delete,
  Refresh,
  List,
  MagicStick,
  View,
  EditPen,
  Close,
  DocumentCopy,
  CircleCheckFilled,
  Warning,
  DataAnalysis,
  Edit,
  Clock
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { imageToPromptApi, type ImageToPromptResponse } from '@/api/imageToPrompt'

const HISTORY_KEY = 'image_to_prompt_history'

interface AutoAnalysisResult {
  dominantColors: { hex: string; name: string; ratio: number }[]
  brightness: number
  brightnessLabel: string
  saturation: number
  saturationLabel: string
  contrast: number
  contrastLabel: string
  colorProfile: string
}

interface HistoryItem {
  timestamp: number
  imagePreview: string
  userDescription: string
  detailLevel: string
  variantCount: number
  variants: ImageToPromptResponse[]
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isGenerating = ref(false)
const imageFeaturesReady = ref(false)
const autoAnalysis = ref<AutoAnalysisResult | null>(null)
const generatedVariants = ref<ImageToPromptResponse[]>([])
const activeVariantIndex = ref(0)
const historyList = ref<HistoryItem[]>([])

const activeResult = computed(() => generatedVariants.value[activeVariantIndex.value] || null)

const brightnessProgressColor = computed(() => {
  if (!autoAnalysis.value) return '#c0c4cc'
  const b = autoAnalysis.value.brightness
  if (b < 30) return '#303133'
  if (b < 60) return '#e6a23c'
  return '#67c23a'
})

const copyingState = reactive({
  positive: false,
  negative: false,
  cn: false
})

const editMode = reactive({
  positive: false,
  negative: false,
  cn: false
})

const form = reactive({
  userDescription: '',
  subjectTypes: [] as string[],
  styles: [] as string[],
  compositions: [] as string[],
  lightings: [] as string[],
  moods: [] as string[],
  detailLevel: 'medium',
  variantCount: 3,
  includeNegative: true
})

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) {
      historyList.value = JSON.parse(stored).slice(0, 10)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList.value.slice(0, 10)))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

const clearHistory = () => {
  historyList.value = []
  saveHistory()
  ElMessage.success('历史记录已清空')
}

const loadFromHistory = (h: HistoryItem) => {
  imagePreview.value = h.imagePreview
  imageBase64.value = h.imagePreview.split(',')[1] || h.imagePreview
  generatedVariants.value = h.variants
  activeVariantIndex.value = 0
  form.userDescription = h.userDescription
  form.detailLevel = h.detailLevel
  imageFeaturesReady.value = true
  ElMessage.success('已加载历史记录')
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  loadHistory()
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    imagePreview.value = dataUrl
    imageBase64.value = dataUrl.split(',')[1] || dataUrl
    generatedVariants.value = []
    analyzeImageWithCanvas(dataUrl)
  }
  reader.readAsDataURL(file)
}

const analyzeImageWithCanvas = (dataUrl: string) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const maxSize = 100
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = Math.floor(img.width * scale)
      canvas.height = Math.floor(img.height * scale)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      let totalBrightness = 0
      let totalSaturation = 0
      let minBrightness = 255
      let maxBrightness = 0
      const colorBuckets: Record<string, number> = {}

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]
        if (a < 125) continue

        const brightness = (r + g + b) / 3
        totalBrightness += brightness
        minBrightness = Math.min(minBrightness, brightness)
        maxBrightness = Math.max(maxBrightness, brightness)

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const sat = max === 0 ? 0 : (max - min) / max
        totalSaturation += sat

        const bucketKey = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`
        colorBuckets[bucketKey] = (colorBuckets[bucketKey] || 0) + 1
      }

      const pixelCount = pixels.length / 4
      const avgBrightness = totalBrightness / pixelCount
      const avgSaturation = totalSaturation / pixelCount
      const contrast = maxBrightness - minBrightness

      const brightnessPct = Math.round((avgBrightness / 255) * 100)
      const saturationPct = Math.round(avgSaturation * 100)
      const contrastPct = Math.round((contrast / 255) * 100)

      const sortedBuckets = Object.entries(colorBuckets)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const colorNameMap: Record<string, string> = {
        '0-0-0': '纯黑', '7-7-7': '纯白', '3-3-3': '深灰', '5-5-5': '浅灰',
        '6-1-1': '深红', '7-3-3': '红色', '7-5-5': '浅红', '7-6-6': '粉红',
        '1-6-1': '深绿', '3-7-3': '绿色', '5-7-5': '浅绿', '6-7-6': '薄荷',
        '1-1-6': '深蓝', '3-3-7': '蓝色', '5-5-7': '浅蓝', '6-6-7': '天蓝',
        '7-6-1': '橙色', '7-7-1': '黄色', '5-7-1': '黄绿', '1-7-5': '青绿',
        '1-6-7': '青色', '5-1-7': '紫色', '7-1-5': '紫红', '7-4-1': '橘色'
      }

      const dominantColors = sortedBuckets.map(([key, count]) => {
        const [rB, gB, bB] = key.split('-').map(Number)
        const hex = '#' + [rB * 32, gB * 32, bB * 32].map(v => Math.min(v, 255).toString(16).padStart(2, '0')).join('')
        const name = colorNameMap[key] || `${rB > 4 ? '浅' : '深'}色`
        return { hex, name, ratio: Math.round((count / pixelCount) * 100) }
      })

      let brightnessLabel = '中等亮度'
      if (brightnessPct < 25) brightnessLabel = '非常暗'
      else if (brightnessPct < 45) brightnessLabel = '偏暗'
      else if (brightnessPct > 80) brightnessLabel = '非常明亮'
      else if (brightnessPct > 65) brightnessLabel = '明亮'

      let saturationLabel = '中等饱和度'
      if (saturationPct < 20) saturationLabel = '低饱和/灰调'
      else if (saturationPct < 40) saturationLabel = '偏低饱和'
      else if (saturationPct > 80) saturationLabel = '高饱和度'
      else if (saturationPct > 60) saturationLabel = '较高饱和'

      let contrastLabel = '中等对比'
      if (contrastPct < 25) contrastLabel = '低对比'
      else if (contrastPct < 45) contrastLabel = '偏低对比'
      else if (contrastPct > 75) contrastLabel = '高对比'
      else if (contrastPct > 60) contrastLabel = '较高对比'

      let colorProfile = '自然色调'
      const warmColors = ['红', '橘', '橙', '黄', '粉']
      const coolColors = ['蓝', '青', '绿', '紫']
      const topColorName = dominantColors[0]?.name || ''
      if (warmColors.some(c => topColorName.includes(c))) colorProfile = '暖色调'
      else if (coolColors.some(c => topColorName.includes(c))) colorProfile = '冷色调'
      if (brightnessPct > 70 && saturationPct > 60) colorProfile += ' · 清新明快'
      if (brightnessPct < 40) colorProfile += ' · 暗调氛围'
      if (saturationPct < 25) colorProfile += ' · 复古灰调'

      autoAnalysis.value = {
        dominantColors,
        brightness: brightnessPct,
        brightnessLabel,
        saturation: saturationPct,
        saturationLabel,
        contrast: contrastPct,
        contrastLabel,
        colorProfile
      }
      imageFeaturesReady.value = true
    } catch (e) {
      console.warn('Image analysis failed:', e)
      imageFeaturesReady.value = false
    }
  }
  img.src = dataUrl
}

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  imageFeaturesReady.value = false
  autoAnalysis.value = null
  generatedVariants.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const buildEnhancedDescription = (): string => {
  const parts: string[] = []
  if (form.userDescription.trim()) {
    parts.push(form.userDescription.trim())
  }
  if (form.subjectTypes.length > 0) {
    parts.push(`主体包含: ${form.subjectTypes.join(', ')}`)
  }
  if (autoAnalysis.value) {
    parts.push(`画面调性: ${autoAnalysis.value.colorProfile}`)
    parts.push(`亮度特征: ${autoAnalysis.value.brightnessLabel}`)
    parts.push(`饱和度特征: ${autoAnalysis.value.saturationLabel}`)
    parts.push(`对比度特征: ${autoAnalysis.value.contrastLabel}`)
  }
  return parts.join(' | ')
}

const generatePrompt = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传参考图片')
    return
  }

  isGenerating.value = true
  editMode.positive = false
  editMode.negative = false
  editMode.cn = false

  try {
    const enhancedDesc = buildEnhancedDescription()
    const variants: ImageToPromptResponse[] = []

    for (let i = 0; i < form.variantCount; i++) {
      const response = await imageToPromptApi.generate({
        imageBase64: imageBase64.value,
        userDescription: enhancedDesc,
        targetStyle: form.styles[0] || undefined,
        forcedStyles: form.styles.length > 0 ? form.styles : undefined,
        forcedCompositions: form.compositions.length > 0 ? form.compositions : undefined,
        forcedLightings: form.lightings.length > 0 ? form.lightings : undefined,
        forcedMoods: form.moods.length > 0 ? form.moods : undefined,
        colorProfile: autoAnalysis.value?.colorProfile,
        detailLevel: form.detailLevel,
        includeNegative: form.includeNegative,
        variantSeed: i,
        outputLanguage: 'en'
      })
      variants.push(response.data)
    }

    generatedVariants.value = variants
    activeVariantIndex.value = 0

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      userDescription: form.userDescription,
      detailLevel: form.detailLevel,
      variantCount: form.variantCount,
      variants: JSON.parse(JSON.stringify(variants))
    })
    saveHistory()

    ElMessage.success(`成功生成 ${variants.length} 个版本！`)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

const regenerateVariant = async (idx: number) => {
  if (!imageBase64.value) return
  isGenerating.value = true
  try {
    const enhancedDesc = buildEnhancedDescription()
    const response = await imageToPromptApi.generate({
      imageBase64: imageBase64.value,
      userDescription: enhancedDesc,
      targetStyle: form.styles[0] || undefined,
      forcedStyles: form.styles.length > 0 ? form.styles : undefined,
      forcedCompositions: form.compositions.length > 0 ? form.compositions : undefined,
      forcedLightings: form.lightings.length > 0 ? form.lightings : undefined,
      forcedMoods: form.moods.length > 0 ? form.moods : undefined,
      colorProfile: autoAnalysis.value?.colorProfile,
      detailLevel: form.detailLevel,
      includeNegative: form.includeNegative,
      variantSeed: Date.now(),
      outputLanguage: 'en'
    })
    generatedVariants.value[idx] = response.data
    ElMessage.success('版本已重新生成')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '重新生成失败')
  } finally {
    isGenerating.value = false
  }
}

const toggleEditMode = (key: 'positive' | 'negative' | 'cn') => {
  editMode[key] = !editMode[key]
  if (editMode[key]) {
    ElMessage.info('现在可以直接编辑提示词，点击"完成编辑"保存修改')
  }
}

const copyToClipboard = async (text: string, label: string, key: 'positive' | 'negative' | 'cn') => {
  try {
    await navigator.clipboard.writeText(text)
    copyingState[key] = true
    ElMessage.success(`${label}已复制到剪贴板`)
    setTimeout(() => {
      copyingState[key] = false
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copyingState[key] = true
    ElMessage.success(`${label}已复制到剪贴板`)
    setTimeout(() => {
      copyingState[key] = false
    }, 2000)
  }
}

const copyAllPrompts = () => {
  if (!activeResult.value) return
  const parts = [
    `【正向提示词】\n${activeResult.value.positivePrompt}`
  ]
  if (activeResult.value.negativePrompt) {
    parts.push(`\n\n【反向提示词】\n${activeResult.value.negativePrompt}`)
  }
  parts.push(`\n\n【中文描述】\n${activeResult.value.promptCn}`)
  copyToClipboard(parts.join(''), '全部提示词', 'positive')
}
</script>

<style scoped>
.image-to-prompt {
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.card-header.small {
  font-size: 15px;
}

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.intro-section {
  margin-bottom: 10px;
}

.intro-steps {
  padding: 10px 0;
}

.upload-card,
.config-card,
.result-card,
.history-card,
.empty-result-card {
  margin-bottom: 20px;
}

.divider-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.auto-analysis-section {
  margin-top: 4px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.analysis-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
}

.analysis-label {
  display: block;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 6px;
}

.analysis-value {
  display: block;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  margin-top: 4px;
  text-align: center;
}

.color-swatches {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.result-header {
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.variant-switcher {
  margin-left: auto;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-area:hover,
.upload-area-active {
  border-color: #165DFF;
  background-color: #f0f7ff;
}

.upload-area.has-image {
  padding: 0;
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.image-preview-container {
  position: relative;
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.image-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 8px;
}

.config-form {
  margin-top: 8px;
}

.generate-btn {
  width: 100%;
  margin-top: 12px;
  min-height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 16px 0 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: #c0c4cc;
  margin: 0 0 20px 0;
}

.feature-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature-hints .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.analysis-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.regen-btn {
  margin-left: auto;
}

.analysis-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  min-width: 50px;
}

.prompt-section {
  margin-bottom: 20px;
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.prompt-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.prompt-block {
  padding: 20px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.8;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  word-break: break-all;
  white-space: pre-wrap;
  position: relative;
  user-select: none;
  min-height: 80px;
}

.prompt-block.clickable {
  cursor: pointer;
  transition: all 0.25s ease;
}

.prompt-block.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.prompt-block.clickable:active {
  transform: translateY(0) scale(0.995);
}

.prompt-block.clickable.copying {
  animation: copyPulse 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.prompt-block.positive {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  color: #67c23a;
  border: 2px solid #e1f3d8;
}

.prompt-block.positive.clickable:hover {
  background: linear-gradient(135deg, #e1f3d8 0%, #d1edc4 100%);
  border-color: #67c23a;
}

.prompt-block.negative {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  color: #f56c6c;
  border: 2px solid #fde2e2;
}

.prompt-block.negative.clickable:hover {
  background: linear-gradient(135deg, #fde2e2 0%, #fbc4c4 100%);
  border-color: #f56c6c;
}

.prompt-block.cn {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  color: #165DFF;
  border: 2px solid #d9ecff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.prompt-block.cn.clickable:hover {
  background: linear-gradient(135deg, #d9ecff 0%, #c6e2ff 100%);
  border-color: #165DFF;
}

.copied-text-large {
  font-size: 16px;
  font-weight: 600;
}

@keyframes copyPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.015); }
  100% { transform: scale(1); }
}

.copy-all-section {
  text-align: center;
  margin: 16px 0 8px;
}

.copy-all-btn {
  min-width: 200px;
  min-height: 44px;
  font-weight: 500;
}

.suggestions-section {
  margin-top: 8px;
}

.tip-alert {
  margin-bottom: 8px;
}

.tip-alert:last-child {
  margin-bottom: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.history-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-time {
  font-size: 12px;
  color: #909399;
  margin: 0 0 4px 0;
}

.history-desc {
  font-size: 13px;
  color: #303133;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.history-meta {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

@media (max-width: 768px) {
  .upload-area {
    min-height: 220px;
    padding: 30px 16px;
  }

  .image-preview-container {
    min-height: 220px;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .prompt-block {
    padding: 16px;
    font-size: 13px;
    line-height: 1.7;
    min-height: 100px;
  }

  .copy-all-btn {
    width: 100%;
  }

  .prompt-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .result-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .variant-switcher {
    margin-left: 0;
    width: 100%;
  }
}
</style>
