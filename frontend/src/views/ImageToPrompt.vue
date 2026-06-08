<template>
  <div class="image-to-prompt">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#722ed1">
            <PictureFilled />
          </el-icon>
          <span>图片转 AI 绘画提示词</span>
          <el-tag size="small" type="success" class="header-tag">一键分析图片，生成专业提示词</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传图片" description="上传你的参考图片（支持 JPG/PNG/WebP）" />
          <el-step title="设置参数" description="选择目标风格、细节程度等选项" />
          <el-step title="生成提示词" description="AI 分析图片特征，一键生成可用提示词" />
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
              <p class="upload-hint">支持 JPG、PNG、WebP 等常见图片格式</p>
            </div>
            <div v-else class="image-preview-container">
              <img :src="imagePreview" alt="preview" class="image-preview" />
              <div class="image-actions">
                <el-button type="danger" size="small" @click.stop="removeImage">
                  <el-icon><Delete /></el-icon>
                  移除图片
                </el-button>
                <el-button size="small" @click.stop="triggerFileInput">
                  <el-icon><Refresh /></el-icon>
                  更换图片
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#e6a23c">
                <Setting />
              </el-icon>
              <span>生成参数设置</span>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="图片描述（可选）">
              <el-input
                v-model="form.userDescription"
                type="textarea"
                :rows="2"
                placeholder="简单描述图片中的主体内容，帮助 AI 更准确地生成提示词，例如：一只可爱的橘猫在窗台上晒太阳"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="目标风格">
              <el-select v-model="form.targetStyle" placeholder="选择一种风格（可选）" clearable>
                <el-option label="写实风格 (Photorealistic)" value="photorealistic" />
                <el-option label="动漫风格 (Anime)" value="anime style" />
                <el-option label="油画 (Oil Painting)" value="oil painting" />
                <el-option label="水彩 (Watercolor)" value="watercolor" />
                <el-option label="数字艺术 (Digital Art)" value="digital art" />
                <el-option label="赛博朋克 (Cyberpunk)" value="cyberpunk" />
                <el-option label="蒸汽朋克 (Steampunk)" value="steampunk" />
                <el-option label="奇幻 (Fantasy Art)" value="fantasy art" />
                <el-option label="像素艺术 (Pixel Art)" value="pixel art" />
                <el-option label="3D 渲染 (3D Render)" value="3D render" />
                <el-option label="电影感 (Cinematic)" value="cinematic" />
              </el-select>
            </el-form-item>

            <el-form-item label="细节程度">
              <el-radio-group v-model="form.detailLevel">
                <el-radio-button value="simple">简洁</el-radio-button>
                <el-radio-button value="medium">标准</el-radio-button>
                <el-radio-button value="detailed">详细</el-radio-button>
                <el-radio-button value="extreme">极致</el-radio-button>
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
              {{ isGenerating ? 'AI 正在分析图片...' : '开始生成提示词' }}
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="12">
        <el-card v-if="result" class="result-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#67c23a">
                <MagicStick />
              </el-icon>
              <span>生成结果</span>
              <el-tag size="small" type="success">生成成功</el-tag>
            </div>
          </template>

          <div class="analysis-section">
            <h4 class="section-title">
              <el-icon :size="16"><View /></el-icon>
              图片特征分析
            </h4>
            <div class="analysis-tags">
              <div class="tag-group">
                <span class="tag-label">主体:</span>
                <el-tag type="primary" effect="light">{{ result.analysis.mainSubject }}</el-tag>
              </div>
              <div class="tag-group">
                <span class="tag-label">风格:</span>
                <el-tag
                  v-for="s in result.analysis.style"
                  :key="s"
                  type="warning"
                  effect="light"
                  size="small"
                >{{ s }}</el-tag>
              </div>
              <div class="tag-group">
                <span class="tag-label">构图:</span>
                <el-tag
                  v-for="c in result.analysis.composition"
                  :key="c"
                  type="success"
                  effect="light"
                  size="small"
                >{{ c }}</el-tag>
              </div>
              <div class="tag-group">
                <span class="tag-label">色调:</span>
                <el-tag
                  v-for="p in result.analysis.colorPalette"
                  :key="p"
                  type="danger"
                  effect="light"
                  size="small"
                >{{ p }}</el-tag>
              </div>
              <div class="tag-group">
                <span class="tag-label">光线:</span>
                <el-tag
                  v-for="l in result.analysis.lighting"
                  :key="l"
                  type="info"
                  effect="light"
                  size="small"
                >{{ l }}</el-tag>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="prompt-section">
            <div class="prompt-header">
              <h4 class="section-title">
                <el-icon :size="16" color="#67c23a"><EditPen /></el-icon>
                正向提示词 (Positive Prompt)
              </h4>
              <el-button
                :type="copyingState.positive ? 'success' : 'primary'"
                size="default"
                @click="copyToClipboard(result.positivePrompt, '正向提示词', 'positive')"
              >
                <el-icon>
                  <CircleCheckFilled v-if="copyingState.positive" />
                  <DocumentCopy v-else />
                </el-icon>
                {{ copyingState.positive ? '已复制' : '一键复制' }}
              </el-button>
            </div>
            <div
              class="prompt-block positive clickable"
              :class="{ copying: copyingState.positive }"
              @click="copyToClipboard(result.positivePrompt, '正向提示词', 'positive')"
            >
              <template v-if="copyingState.positive">
                <el-icon :size="20" color="#67c23a"><CircleCheckFilled /></el-icon>
                <span class="copied-text-large">已复制到剪贴板！</span>
              </template>
              <template v-else>
                {{ result.positivePrompt }}
              </template>
            </div>
          </div>

          <div v-if="result.negativePrompt" class="prompt-section">
            <div class="prompt-header">
              <h4 class="section-title">
                <el-icon :size="16" color="#f56c6c"><Close /></el-icon>
                反向提示词 (Negative Prompt)
              </h4>
              <el-button
                :type="copyingState.negative ? 'success' : 'danger'"
                size="default"
                @click="copyToClipboard(result.negativePrompt, '反向提示词', 'negative')"
              >
                <el-icon>
                  <CircleCheckFilled v-if="copyingState.negative" />
                  <DocumentCopy v-else />
                </el-icon>
                {{ copyingState.negative ? '已复制' : '一键复制' }}
              </el-button>
            </div>
            <div
              class="prompt-block negative clickable"
              :class="{ copying: copyingState.negative }"
              @click="copyToClipboard(result.negativePrompt, '反向提示词', 'negative')"
            >
              <template v-if="copyingState.negative">
                <el-icon :size="20" color="#f56c6c"><CircleCheckFilled /></el-icon>
                <span class="copied-text-large">已复制到剪贴板！</span>
              </template>
              <template v-else>
                {{ result.negativePrompt }}
              </template>
            </div>
          </div>

          <el-divider />

          <div class="prompt-section">
            <div class="prompt-header">
              <h4 class="section-title">
                <el-icon :size="16" color="#165DFF"><EditPen /></el-icon>
                中文描述版
              </h4>
              <el-button
                :type="copyingState.cn ? 'success' : 'primary'"
                size="default"
                @click="copyToClipboard(result.promptCn, '中文提示词', 'cn')"
              >
                <el-icon>
                  <CircleCheckFilled v-if="copyingState.cn" />
                  <DocumentCopy v-else />
                </el-icon>
                {{ copyingState.cn ? '已复制' : '一键复制' }}
              </el-button>
            </div>
            <div
              class="prompt-block cn clickable"
              :class="{ copying: copyingState.cn }"
              @click="copyToClipboard(result.promptCn, '中文提示词', 'cn')"
            >
              <template v-if="copyingState.cn">
                <el-icon :size="20" color="#165DFF"><CircleCheckFilled /></el-icon>
                <span class="copied-text-large">已复制到剪贴板！</span>
              </template>
              <template v-else>
                {{ result.promptCn }}
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
              复制全部提示词
            </el-button>
          </div>

          <el-divider />

          <div class="suggestions-section">
            <h4 class="section-title">
              <el-icon :size="16" color="#e6a23c"><Warning /></el-icon>
              使用小贴士
            </h4>
            <el-alert
              v-for="(tip, idx) in result.suggestions"
              :key="idx"
              type="info"
              :closable="false"
              show-icon
              :title="tip"
              class="tip-alert"
            />
          </div>
        </el-card>

        <el-card v-else class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><Picture /></el-icon>
            <p class="empty-text">上传图片后点击生成按钮</p>
            <p class="empty-hint">AI 将自动分析图片特征并生成专业提示词</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  PictureFilled,
  Picture,
  Upload,
  UploadFilled,
  Delete,
  Refresh,
  Setting,
  MagicStick,
  View,
  EditPen,
  Close,
  DocumentCopy,
  CircleCheckFilled,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { imageToPromptApi, type ImageToPromptResponse } from '@/api/imageToPrompt'

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isGenerating = ref(false)
const result = ref<ImageToPromptResponse | null>(null)

const copyingState = reactive({
  positive: false,
  negative: false,
  cn: false
})

const form = reactive({
  userDescription: '',
  targetStyle: '',
  detailLevel: 'medium',
  includeNegative: true
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
    result.value = null
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  result.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const generatePrompt = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传参考图片')
    return
  }

  isGenerating.value = true
  try {
    const response = await imageToPromptApi.generate({
      imageBase64: imageBase64.value,
      userDescription: form.userDescription,
      targetStyle: form.targetStyle || undefined,
      detailLevel: form.detailLevel,
      includeNegative: form.includeNegative,
      outputLanguage: 'en'
    })
    result.value = response.data
    ElMessage.success('提示词生成成功！')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
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
  if (!result.value) return
  const parts = [
    `【正向提示词】\n${result.value.positivePrompt}`
  ]
  if (result.value.negativePrompt) {
    parts.push(`\n\n【反向提示词】\n${result.value.negativePrompt}`)
  }
  parts.push(`\n\n【中文描述】\n${result.value.promptCn}`)
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
.empty-result-card {
  margin-bottom: 20px;
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
  padding: 60px 20px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 16px 0 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: #c0c4cc;
  margin: 0;
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

@media (max-width: 768px) {
  .upload-area {
    min-height: 220px;
    padding: 30px 16px;
  }

  .image-preview-container {
    min-height: 220px;
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
}
</style>
