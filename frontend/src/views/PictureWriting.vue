<template>
  <div class="picture-writing">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#f56c6c">
            <Reading />
          </el-icon>
          <span>AI 看图写话生成</span>
          <el-tag size="small" type="success" class="header-tag">智能分析 · 小学生作文 · 课后辅导</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传图片" description="上传一张看图写话的图片" />
          <el-step title="设置参数" description="选择年级、文体和写作要求" />
          <el-step title="AI 生成" description="AI 智能分析图片并生成作文" />
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
              <span>上传图片</span>
              <el-tag v-if="imagePreview" size="small" type="success">已上传</el-tag>
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
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#e6a23c">
                <List />
              </el-icon>
              <span>写作设置</span>
              <el-tag size="small" type="warning">设置越详细，作文越贴合需求</el-tag>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="选择年级">
              <el-radio-group v-model="form.gradeLevel">
                <el-radio-button value="grade1">一年级</el-radio-button>
                <el-radio-button value="grade2">二年级</el-radio-button>
                <el-radio-button value="grade3">三年级</el-radio-button>
                <el-radio-button value="grade4">四年级</el-radio-button>
                <el-radio-button value="grade5">五年级</el-radio-button>
                <el-radio-button value="grade6">六年级</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="选择文体">
              <el-radio-group v-model="form.writingStyle">
                <el-radio-button value="narrative">记叙文</el-radio-button>
                <el-radio-button value="descriptive">描写文</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="图片描述（可选，帮助 AI 更准确理解）">
              <el-input
                v-model="form.userDescription"
                type="textarea"
                :rows="3"
                placeholder="请描述图片中的场景、人物、动作等，例如：星期天的早晨，小明和小红在公园里放风筝，天空中有很多小鸟，他们玩得很开心"
                maxlength="300"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="特殊要求（可选）">
              <el-input
                v-model="form.customRequirements"
                type="textarea"
                :rows="2"
                placeholder="例如：要用到比喻句、开头要吸引人、要有心理活动描写等"
                maxlength="300"
                show-word-limit
              />
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              class="generate-btn"
              :loading="isGenerating"
              :disabled="!imageBase64"
              @click="generateWriting"
            >
              <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
              {{ isGenerating ? 'AI 正在生成作文...' : '开始生成作文' }}
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="12">
        <el-card v-if="result" class="result-card">
          <template #header>
            <div class="card-header small result-header">
              <div class="header-left">
                <el-icon :size="18" color="#67c23a">
                  <Document />
                </el-icon>
                <span>生成结果</span>
                <el-tag size="small" type="success">{{ result.gradeLevel }} · {{ result.wordCount }}字</el-tag>
              </div>
              <el-button
                link
                type="primary"
                size="small"
                @click="regenerate"
              >
                <el-icon><Refresh /></el-icon>
                换一篇
              </el-button>
            </div>
          </template>

          <div class="result-content">
            <div class="title-section">
              <h3 class="essay-title">
                <el-icon :size="20" color="#e6a23c"><Star /></el-icon>
                {{ result.title }}
              </h3>
            </div>

            <div class="analysis-section">
              <h4 class="section-title">
                <el-icon :size="16"><View /></el-icon>
                图片场景分析
              </h4>
              <div class="analysis-tags">
                <div class="tag-group">
                  <span class="tag-label">时间:</span>
                  <el-tag type="primary" effect="light" size="small">{{ result.analysis.time }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">地点:</span>
                  <el-tag type="primary" effect="light" size="small">{{ result.analysis.location }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">人物:</span>
                  <el-tag
                    v-for="c in result.analysis.characters"
                    :key="c"
                    type="warning"
                    effect="light"
                    size="small"
                  >{{ c }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">动作:</span>
                  <el-tag
                    v-for="a in result.analysis.actions"
                    :key="a"
                    type="success"
                    effect="light"
                    size="small"
                  >{{ a }}</el-tag>
                </div>
                <div class="tag-group">
                  <span class="tag-label">情绪:</span>
                  <el-tag
                    v-for="e in result.analysis.emotions"
                    :key="e"
                    type="danger"
                    effect="light"
                    size="small"
                  >{{ e }}</el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="content-section">
              <div class="content-header">
                <h4 class="section-title">
                  <el-icon :size="16" color="#67c23a"><EditPen /></el-icon>
                  作文正文
                </h4>
                <el-button
                  :type="copyingState.content ? 'success' : 'primary'"
                  size="default"
                  @click="copyToClipboard(`《${result.title}》\n\n${result.content}`, '作文内容', 'content')"
                >
                  <el-icon>
                    <CircleCheckFilled v-if="copyingState.content" />
                    <DocumentCopy v-else />
                  </el-icon>
                  {{ copyingState.content ? '已复制' : '复制全文' }}
                </el-button>
              </div>
              <div
                class="essay-content clickable"
                :class="{ copying: copyingState.content }"
                @click="copyToClipboard(`《${result.title}》\n\n${result.content}`, '作文内容', 'content')"
              >
                <template v-if="copyingState.content">
                  <el-icon :size="20" color="#67c23a"><CircleCheckFilled /></el-icon>
                  <span class="copied-text-large">已复制到剪贴板！</span>
                </template>
                <template v-else>
                  <p v-for="(para, idx) in contentParagraphs" :key="idx" class="essay-paragraph">
                    {{ para }}
                  </p>
                </template>
              </div>
            </div>

            <el-divider />

            <div class="keywords-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#722ed1"><CollectionTag /></el-icon>
                推荐好词
              </h4>
              <div class="keyword-tags">
                <el-tag
                  v-for="kw in result.keyWords"
                  :key="kw"
                  type="success"
                  effect="plain"
                  size="large"
                  class="keyword-tag"
                >{{ kw }}</el-tag>
              </div>
            </div>

            <el-divider />

            <div class="tips-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#e6a23c"><Bulb /></el-icon>
                写作建议
              </h4>
              <ul class="tips-list">
                <li v-for="(tip, idx) in result.writingTips" :key="idx">
                  <el-icon :size="14" color="#67c23a"><CircleCheck /></el-icon>
                  {{ tip }}
                </li>
              </ul>
            </div>
          </div>
        </el-card>

        <el-card v-else class="empty-card">
          <div class="empty-content">
            <el-icon :size="80" color="#c0c4cc"><Reading /></el-icon>
            <p class="empty-text">上传图片并设置参数后，AI 将自动生成一篇精彩的看图写话作文</p>
            <div class="feature-list">
              <el-tag type="success" effect="plain">智能分析场景</el-tag>
              <el-tag type="warning" effect="plain">符合年级水平</el-tag>
              <el-tag type="primary" effect="plain">推荐好词好句</el-tag>
              <el-tag type="danger" effect="plain">专业写作建议</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  UploadFilled,
  Delete,
  Refresh,
  MagicStick,
  Reading,
  Document,
  Star,
  View,
  EditPen,
  DocumentCopy,
  CircleCheckFilled,
  CollectionTag,
  Bulb,
  CircleCheck,
  List
} from '@element-plus/icons-vue'
import { pictureWritingApi, type PictureWritingResponse } from '@/api/pictureWriting'

const fileInputRef = ref<HTMLInputElement | null>(null)
const imagePreview = ref('')
const imageBase64 = ref('')
const isDragging = ref(false)
const isGenerating = ref(false)
const result = ref<PictureWritingResponse | null>(null)

const form = reactive({
  gradeLevel: 'grade3',
  writingStyle: 'narrative',
  userDescription: '',
  customRequirements: ''
})

const copyingState = reactive({
  content: false
})

const contentParagraphs = computed(() => {
  if (!result.value) return []
  return result.value.content.split('\n\n').filter(p => p.trim())
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

function processFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const data = e.target?.result as string
    imagePreview.value = data
    imageBase64.value = data
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = ''
  imageBase64.value = ''
  result.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function generateWriting() {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  isGenerating.value = true
  try {
    const res = await pictureWritingApi.generate({
      imageBase64: imageBase64.value,
      userDescription: form.userDescription || undefined,
      gradeLevel: form.gradeLevel,
      writingStyle: form.writingStyle,
      customRequirements: form.customRequirements || undefined,
      variantSeed: Date.now() % 100000
    })
    result.value = res.data
    ElMessage.success('作文生成成功！')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

function regenerate() {
  generateWriting()
}

async function copyToClipboard(text: string, label: string, key: 'content') {
  try {
    await navigator.clipboard.writeText(text)
    copyingState[key] = true
    ElMessage.success(`${label}已复制`)
    setTimeout(() => {
      copyingState[key] = false
    }, 2000)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.picture-writing {
  padding: 0;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.card-header.small {
  font-size: 15px;
}

.header-tag {
  margin-left: auto;
}

.intro-section {
  padding: 10px 0;
}

.intro-steps {
  max-width: 700px;
  margin: 0 auto;
}

.upload-card,
.config-card,
.result-card,
.empty-card {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover,
.upload-area-active {
  border-color: #165DFF;
  background-color: #f0f7ff;
}

.upload-area.has-image {
  padding: 10px;
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
}

.upload-hint {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview {
  max-width: 100%;
  max-height: 320px;
  border-radius: 6px;
  display: block;
  margin: 0 auto;
}

.image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.config-form {
  padding-top: 10px;
}

.generate-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  margin-top: 10px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-section {
  text-align: center;
  margin-bottom: 20px;
}

.essay-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.analysis-section {
  margin-bottom: 10px;
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
  min-width: 40px;
  font-weight: 500;
}

.content-section {
  margin-bottom: 10px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.essay-content {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  min-height: 150px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.essay-content.clickable {
  cursor: pointer;
}

.essay-content.clickable:hover {
  background-color: #f0f7ff;
  border-color: #165DFF;
}

.essay-content.copying {
  background-color: #f0f9eb;
  border-color: #67c23a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.copied-text-large {
  color: #67c23a;
  font-size: 16px;
  font-weight: 600;
}

.essay-paragraph {
  font-size: 15px;
  line-height: 2;
  color: #303133;
  text-indent: 2em;
  margin: 0 0 12px 0;
}

.essay-paragraph:last-child {
  margin-bottom: 0;
}

.keywords-section {
  margin-bottom: 10px;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword-tag {
  font-size: 14px;
  padding: 0 16px;
  height: 32px;
}

.tips-section {
  margin-bottom: 10px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tips-list li {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
  gap: 20px;
}

.empty-text {
  font-size: 15px;
  color: #909399;
  margin: 0;
  max-width: 360px;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
</style>
