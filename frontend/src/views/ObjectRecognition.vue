<template>
  <div class="object-recognition">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#722ed1">
            <CameraFilled />
          </el-icon>
          <span>拍照识别万物</span>
          <el-tag size="small" type="primary" class="header-tag">AI 智能识别 · 百科知识 · 探索发现</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传/拍照" description="拍摄或上传任意物体图片" />
          <el-step title="智能识别" description="AI 自动识别物体名称与类别" />
          <el-step title="百科解读" description="获取背景知识、特征介绍与趣味知识" />
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
              <span>上传物体图片</span>
              <el-tag v-if="resultReady" size="small" type="success">已识别</el-tag>
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
              <div class="upload-actions">
                <el-button type="primary" size="default" @click.stop="triggerFileInput">
                  <el-icon><Picture /></el-icon>
                  选择图片
                </el-button>
                <el-button type="success" size="default" @click.stop="triggerCamera">
                  <el-icon><Camera /></el-icon>
                  拍照识别
                </el-button>
              </div>
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
                <el-button type="primary" size="small" @click.stop="triggerCamera">
                  <el-icon><Camera /></el-icon>
                  重新拍照
                </el-button>
              </div>
            </div>
          </div>

          <video
            v-if="showCamera"
            ref="videoRef"
            class="camera-video"
            autoplay
            playsinline
            muted
          ></video>
          <div v-if="showCamera" class="camera-actions">
            <el-button type="primary" size="default" @click="capturePhoto">
              <el-icon><CameraFilled /></el-icon>
              拍照
            </el-button>
            <el-button size="default" @click="stopCamera">
              <el-icon><Close /></el-icon>
              取消
            </el-button>
          </div>

          <div v-if="imagePreview && qualityAnalysisReady" class="quality-section">
            <el-divider content-position="left">
              <span class="divider-label">
                <el-icon :size="14"><Monitor /></el-icon>
                图片质量检测
              </span>
            </el-divider>
            <el-alert
              v-if="qualityWarnings.length > 0"
              type="warning"
              :closable="false"
              show-icon
              class="quality-warning"
            >
              <template #title>
                <span class="quality-warning-title">
                  <el-icon :size="16"><WarningFilled /></el-icon>
                  图片质量可能影响识别准确度
                </span>
              </template>
              <ul class="quality-warning-list">
                <li v-for="(w, idx) in qualityWarnings" :key="idx">{{ w }}</li>
              </ul>
              <div class="quality-warning-actions">
                <el-button type="warning" size="small" @click="triggerFileInput">
                  <el-icon><Refresh /></el-icon>
                  重新上传
                </el-button>
                <el-button type="primary" size="small" @click="triggerCamera">
                  <el-icon><Camera /></el-icon>
                  重新拍照
                </el-button>
                <el-button size="small" plain @click="ignoreQualityWarning">
                  继续识别
                </el-button>
              </div>
            </el-alert>
            <div class="quality-metrics">
              <div class="quality-metric">
                <div class="metric-header">
                  <span class="metric-label">清晰度</span>
                  <el-tag
                    size="small"
                    :type="imageQuality.sharpness >= 70 ? 'success' : imageQuality.sharpness >= 40 ? 'warning' : 'danger'"
                  >{{ imageQuality.sharpness >= 70 ? '良好' : imageQuality.sharpness >= 40 ? '一般' : '模糊' }}</el-tag>
                </div>
                <el-progress
                  :percentage="imageQuality.sharpness"
                  :color="imageQuality.sharpness >= 70 ? '#67c23a' : imageQuality.sharpness >= 40 ? '#e6a23c' : '#f56c6c'"
                  :stroke-width="8"
                />
              </div>
              <div class="quality-metric">
                <div class="metric-header">
                  <span class="metric-label">亮度</span>
                  <el-tag
                    size="small"
                    :type="imageQuality.brightnessStatus === 'normal' ? 'success' : 'warning'"
                  >{{ imageQuality.brightnessStatus === 'normal' ? '适中' : imageQuality.brightnessStatus === 'dark' ? '偏暗' : '过亮' }}</el-tag>
                </div>
                <el-progress
                  :percentage="imageQuality.brightness"
                  :color="imageQuality.brightnessStatus === 'normal' ? '#67c23a' : '#e6a23c'"
                  :stroke-width="8"
                />
              </div>
              <div class="quality-metric">
                <div class="metric-header">
                  <span class="metric-label">对比度</span>
                  <el-tag
                    size="small"
                    :type="imageQuality.contrast >= 50 ? 'success' : 'warning'"
                  >{{ imageQuality.contrast >= 50 ? '清晰' : '偏低' }}</el-tag>
                </div>
                <el-progress
                  :percentage="imageQuality.contrast"
                  :color="imageQuality.contrast >= 50 ? '#67c23a' : '#e6a23c'"
                  :stroke-width="8"
                />
              </div>
            </div>

            <div v-if="compositionAnalysisReady" class="composition-section">
              <el-divider content-position="left">
                <span class="divider-label">
                  <el-icon :size="14"><Grid /></el-icon>
                  构图分析
                </span>
              </el-divider>
              <div class="composition-metrics">
                <div class="composition-item">
                  <el-icon :size="16" :color="compositionData.isScreenshot ? '#f56c6c' : '#67c23a'">
                    <component :is="compositionData.isScreenshot ? WarningFilled : CircleCheckFilled" />
                  </el-icon>
                  <span class="composition-label">截图检测</span>
                  <el-tag
                    size="small"
                    :type="compositionData.isScreenshot ? 'danger' : 'success'"
                    effect="plain"
                  >{{ compositionData.isScreenshot ? '疑似截图' : '原图拍摄' }}</el-tag>
                </div>
                <div class="composition-item">
                  <el-icon :size="16" :color="compositionData.multiPanelDetected ? '#f56c6c' : '#67c23a'">
                    <component :is="compositionData.multiPanelDetected ? WarningFilled : CircleCheckFilled" />
                  </el-icon>
                  <span class="composition-label">多图拼接</span>
                  <el-tag
                    size="small"
                    :type="compositionData.multiPanelDetected ? 'danger' : 'success'"
                    effect="plain"
                  >{{ compositionData.multiPanelDetected ? '检测到拼接' : '单图' }}</el-tag>
                </div>
                <div class="composition-item">
                  <el-icon :size="16" :color="compositionData.textDensity > 30 ? '#e6a23c' : '#67c23a'">
                    <component :is="compositionData.textDensity > 30 ? WarningFilled : CircleCheckFilled" />
                  </el-icon>
                  <span class="composition-label">文字密度</span>
                  <el-tag
                    size="small"
                    :type="compositionData.textDensity > 30 ? 'warning' : 'success'"
                    effect="plain"
                  >{{ compositionData.textDensity > 30 ? '文字较多' : '正常' }}（{{ compositionData.textDensity }}%）</el-tag>
                </div>
              </div>

              <el-alert
                v-if="compositionWarnings.length > 0"
                type="error"
                :closable="false"
                show-icon
                class="composition-warning"
              >
                <template #title>
                  <span class="composition-warning-title">
                    <el-icon :size="16"><CircleCloseFilled /></el-icon>
                    识别结果可能不稳定
                  </span>
                </template>
                <ul class="composition-warning-list">
                  <li v-for="(w, idx) in compositionWarnings" :key="idx">{{ w }}</li>
                </ul>
              </el-alert>
            </div>
          </div>
        </el-card>

        <el-card class="photo-guide-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#67c23a">
                <Bulb />
              </el-icon>
              <span>拍照建议 · 提升识别准确率</span>
              <el-tag size="small" type="success" effect="light">高质量图片 = 更精准识别</el-tag>
            </div>
          </template>
          <el-row :gutter="12">
            <el-col :span="12">
              <div class="guide-column good">
                <h4 class="guide-title good">
                  <el-icon :size="16"><CircleCheckFilled /></el-icon>
                  推荐这样拍
                </h4>
                <ul class="guide-list">
                  <li>
                    <el-icon><Check /></el-icon>
                    光线充足的自然光下拍摄
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    物体居中，完整展示全貌
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    纯色或简洁背景，减少干扰
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    拍摄角度正对物体主体
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    可拍摄多角度照片以获得更全面信息
                  </li>
                </ul>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="guide-column bad">
                <h4 class="guide-title bad">
                  <el-icon :size="16"><CircleCloseFilled /></el-icon>
                  尽量避免
                </h4>
                <ul class="guide-list">
                  <li>
                    <el-icon><Close /></el-icon>
                    昏暗灯光、逆光拍摄
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    只拍到物体局部
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    背景复杂、杂物过多
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    模糊、抖动
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    物体过小，占据画面比例不足 30%
                  </li>
                </ul>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#e6a23c">
                <Setting />
              </el-icon>
              <span>识别设置</span>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="补充说明（可选）">
              <el-input
                v-model="form.extraNote"
                type="textarea"
                :rows="2"
                placeholder="例如：这是在故宫拍的、这是我家的猫叫橘子、想知道这个植物能不能吃等"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              class="recognize-btn"
              :loading="isRecognizing"
              :disabled="!imageBase64"
              @click="recognizeObject"
            >
              <el-icon v-if="!isRecognizing"><MagicStick /></el-icon>
              {{ isRecognizing ? 'AI 正在识别中...' : '开始识别万物' }}
            </el-button>
          </el-form>
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
                <p class="history-style">{{ h.objectName || '未识别' }}</p>
                <p class="history-meta">{{ h.categoryLabel || '未知类别' }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="12">
        <template v-if="recognitionResult">
          <el-card class="confidence-card">
            <div class="confidence-header">
              <div class="confidence-left">
                <el-icon :size="24" :color="confidenceColor">
                  <component :is="confidenceIcon" />
                </el-icon>
                <div class="confidence-text">
                  <div class="confidence-label">识别置信度</div>
                  <div class="confidence-value" :style="{ color: confidenceColor }">
                    {{ recognitionResult.overallConfidence }}%
                  </div>
                </div>
              </div>
              <el-progress
                type="dashboard"
                :percentage="recognitionResult.overallConfidence"
                :color="confidenceColor"
                :width="90"
                :stroke-width="8"
              />
            </div>
            <el-alert
              v-if="recognitionResult.overallConfidence < 70"
              :type="recognitionResult.overallConfidence < 50 ? 'error' : 'warning'"
              :closable="false"
              show-icon
              class="confidence-alert"
            >
              <template #title>
                <span>
                  {{ recognitionResult.overallConfidence < 50 ? '置信度较低，建议重新上传更清晰的主体图片以获得更准确的结果' : '置信度一般，可考虑重新拍摄或裁剪图片以提升识别准确度' }}
                </span>
              </template>
            </el-alert>
            <el-alert
              v-for="(w, idx) in recognitionResult.qualityWarnings"
              :key="'rw'+idx"
              type="warning"
              :closable="false"
              show-icon
              class="confidence-alert"
              :title="w"
            />
          </el-card>

          <el-card class="primary-object-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#722ed1">
                  <Star />
                </el-icon>
                <span>识别结果 · 主要物体</span>
              </div>
            </template>

            <div class="primary-object-header">
              <div class="object-name-section">
                <h2 class="object-name">{{ recognitionResult.primaryObject.name }}</h2>
                <span class="object-english">{{ recognitionResult.primaryObject.englishName }}</span>
                <el-tag size="default" type="primary" class="category-tag">
                  {{ recognitionResult.primaryObject.categoryLabel }}
                </el-tag>
                <el-tag size="default" type="success" class="confidence-tag">
                  {{ recognitionResult.primaryObject.confidence }}%
                </el-tag>
              </div>
              <div class="object-tags-row">
                <el-tag
                  v-for="(tag, idx) in recognitionResult.primaryObject.tags"
                  :key="idx"
                  size="small"
                  effect="plain"
                  class="object-tag"
                >{{ tag }}</el-tag>
              </div>
            </div>

            <el-divider />

            <div class="object-description-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#165DFF"><Reading /></el-icon>
                简介
              </h4>
              <p class="object-description">{{ recognitionResult.primaryObject.description }}</p>
            </div>

            <div class="object-background-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#67c23a"><Notebook /></el-icon>
                背景知识
              </h4>
              <p class="object-background">{{ recognitionResult.primaryObject.backgroundKnowledge }}</p>
            </div>

            <div
              v-if="Object.keys(recognitionResult.primaryObject.taxonomy).length > 0"
              class="taxonomy-section"
            >
              <h4 class="section-title">
                <el-icon :size="16" color="#eb2f96"><Collection /></el-icon>
                分类学
              </h4>
              <div class="taxonomy-tree">
                <div
                  v-for="(value, key) in recognitionResult.primaryObject.taxonomy"
                  :key="key"
                  class="taxonomy-item"
                >
                  <span class="taxonomy-key">{{ taxonomyLabels[key as keyof typeof taxonomyLabels] }}：</span>
                  <span class="taxonomy-value">{{ value }}</span>
                </div>
              </div>
            </div>

            <div class="features-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#e6a23c"><Flag /></el-icon>
                主要特征
              </h4>
              <ul class="features-list">
                <li v-for="(feat, idx) in recognitionResult.primaryObject.keyFeatures" :key="idx">
                  <el-icon><Check /></el-icon>
                  {{ feat }}
                </li>
              </ul>
            </div>

            <div class="funfacts-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#13c2c2"><MagicStick /></el-icon>
                趣味知识
              </h4>
              <el-alert
                v-for="(fact, idx) in recognitionResult.primaryObject.funFacts"
                :key="idx"
                type="info"
                :closable="false"
                show-icon
                class="funfact-alert"
                :title="fact"
              />
            </div>

            <div class="related-section">
              <h4 class="section-title">
                <el-icon :size="16" color="#722ed1"><Link /></el-icon>
                相关物体推荐
              </h4>
              <div class="related-list">
                <div
                  v-for="rel in recognitionResult.primaryObject.relatedObjects"
                  :key="rel.id"
                  class="related-item"
                >
                  <span class="related-name">{{ rel.name }}</span>
                  <el-tag size="small" effect="plain" type="info">{{ rel.categoryLabel }}</el-tag>
                  <el-tag size="small" effect="light">{{ rel.relation }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card v-if="recognitionResult.secondaryObjects.length > 0" class="secondary-objects-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#165DFF">
                  <Goods />
                </el-icon>
                <span>其他可能识别的物体</span>
              </div>
            </template>
            <div class="secondary-list">
              <div
                v-for="obj in recognitionResult.secondaryObjects"
                :key="obj.id"
                class="secondary-item"
              >
                <div class="secondary-header">
                  <span class="secondary-name">{{ obj.name }}</span>
                  <el-tag size="small" effect="plain" type="primary">{{ obj.categoryLabel }}</el-tag>
                  <el-tag size="small" type="success">{{ obj.confidence }}%</el-tag>
                </div>
                <p class="secondary-desc">{{ obj.description }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="scene-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#f56c6c">
                  <Picture />
                </el-icon>
                <span>场景描述</span>
              </div>
            </template>
            <p class="scene-description">{{ recognitionResult.sceneDescription }}</p>
            <p class="recognition-time">识别时间：{{ formatTimestamp(recognitionResult.recognitionTimestamp) }}</p>
          </el-card>
        </template>

        <el-card v-else class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><View /></el-icon>
            <p class="empty-text">上传图片后开始识别万物</p>
            <p class="empty-hint">AI 将为你识别物体名称、分类并提供百科知识解读</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain">
                <el-icon><Camera /></el-icon>
                支持拍照上传
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Collection /></el-icon>
                识别物体分类
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Reading /></el-icon>
                百科知识介绍
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Flag /></el-icon>
                主要特征说明
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><MagicStick /></el-icon>
                趣味冷知识
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Link /></el-icon>
                相关物体推荐
              </el-tag>
            </div>
            <div class="example-tips">
              <h4 class="example-title">你可以尝试识别：</h4>
              <el-row :gutter="10">
                <el-col :span="6">
                  <div class="example-item">
                    <el-icon :size="24" color="#67c23a"><Flower /></el-icon>
                    <span>花草植物</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="example-item">
                    <el-icon :size="24" color="#eb2f96"><Bell /></el-icon>
                    <span>动物昆虫</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="example-item">
                    <el-icon :size="24" color="#e6a23c"><KnifeFork /></el-icon>
                    <span>美食佳肴</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="example-item">
                    <el-icon :size="24" color="#722ed1"><OfficeBuilding /></el-icon>
                    <span>建筑文物</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import {
  CameraFilled,
  Camera,
  Upload,
  UploadFilled,
  Delete,
  Refresh,
  Setting,
  MagicStick,
  DataAnalysis,
  Clock,
  Goods,
  Bulb,
  Close,
  WarningFilled,
  Check,
  CircleCheckFilled,
  CircleCloseFilled,
  Monitor,
  Grid,
  Picture,
  Star,
  Reading,
  Notebook,
  Collection,
  Flag,
  Link,
  View,
  Flower,
  Bell,
  KnifeFork,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  objectRecognitionApi,
  type ObjectRecognitionResponse,
  type ImageQualityHints
} from '@/api/objectRecognition'

const HISTORY_KEY = 'object_recognition_history'

const taxonomyLabels = {
  kingdom: '界',
  phylum: '门',
  class: '纲',
  order: '目',
  family: '科',
  genus: '属',
  species: '种'
}

interface HistoryItem {
  timestamp: number
  imagePreview: string
  objectName: string
  categoryLabel: string
  result: ObjectRecognitionResponse
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isRecognizing = ref(false)
const recognitionResult = ref<ObjectRecognitionResponse | null>(null)
const resultReady = ref(false)
const historyList = ref<HistoryItem[]>([])
const showCamera = ref(false)

const qualityAnalysisReady = ref(false)
const qualityIgnored = ref(false)
const imageQuality = reactive({
  sharpness: 0,
  brightness: 0,
  brightnessStatus: 'normal' as 'normal' | 'dark' | 'overexposed',
  contrast: 0
})
const qualityWarnings = ref<string[]>([])

const compositionAnalysisReady = ref(false)
const compositionData = reactive({
  isScreenshot: false,
  multiPanelDetected: false,
  textDensity: 0,
  hasUiElements: false
})
const compositionWarnings = ref<string[]>([])

const confidenceColor = computed(() => {
  if (!recognitionResult.value) return '#909399'
  const c = recognitionResult.value.overallConfidence
  if (c >= 80) return '#67c23a'
  if (c >= 60) return '#e6a23c'
  return '#f56c6c'
})

const confidenceIcon = computed(() => {
  if (!recognitionResult.value) return WarningFilled
  const c = recognitionResult.value.overallConfidence
  if (c >= 80) return CircleCheckFilled
  if (c >= 60) return WarningFilled
  return CircleCloseFilled
})

let mediaStream: MediaStream | null = null

const form = reactive({
  extraNote: ''
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
  recognitionResult.value = h.result
  resultReady.value = true
  qualityAnalysisReady.value = true
  ElMessage.success('已加载历史记录')
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const formatTimestamp = (isoString: string) => {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

onMounted(() => {
  loadHistory()
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const triggerCamera = async () => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      showCamera.value = true
      await nextTick()
      if (videoRef.value && mediaStream) {
        videoRef.value.srcObject = mediaStream
      }
    } else {
      ElMessage.warning('当前浏览器不支持摄像头功能')
      triggerFileInput()
    }
  } catch (e) {
    ElMessage.warning('无法访问摄像头，请手动选择图片')
    triggerFileInput()
  }
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  showCamera.value = false
}

const capturePhoto = () => {
  if (!videoRef.value) return
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    qualityAnalysisReady.value = false
    qualityIgnored.value = false
    qualityWarnings.value = []
    imagePreview.value = dataUrl
    imageBase64.value = dataUrl.split(',')[1] || dataUrl
    recognitionResult.value = null
    resultReady.value = false
    analyzeImageWithCanvas(dataUrl)
    stopCamera()
    ElMessage.success('拍照成功')
  }
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

  qualityAnalysisReady.value = false
  qualityIgnored.value = false
  qualityWarnings.value = []

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    imagePreview.value = dataUrl
    imageBase64.value = dataUrl.split(',')[1] || dataUrl
    recognitionResult.value = null
    resultReady.value = false
    analyzeImageWithCanvas(dataUrl)
  }
  reader.readAsDataURL(file)
}

const analyzeImageQuality = (
  imageData: ImageData,
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number
) => {
  const pixels = imageData.data
  const pixelCount = width * height

  let totalLuminance = 0
  const luminanceValues: number[] = []
  let minL = 255
  let maxL = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    totalLuminance += luminance
    luminanceValues.push(luminance)
    if (luminance < minL) minL = luminance
    if (luminance > maxL) maxL = luminance
  }

  const avgLuminance = totalLuminance / pixelCount
  imageQuality.brightness = Math.round((avgLuminance / 255) * 100)

  if (avgLuminance < 60) {
    imageQuality.brightnessStatus = 'dark'
  } else if (avgLuminance > 220) {
    imageQuality.brightnessStatus = 'overexposed'
  } else {
    imageQuality.brightnessStatus = 'normal'
  }

  const contrastRange = maxL - minL
  imageQuality.contrast = Math.round((contrastRange / 255) * 100)

  let laplacianSum = 0
  const kernel = [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0]
  ]
  const grayMatrix: number[][] = []
  for (let y = 0; y < height; y++) {
    grayMatrix[y] = []
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      grayMatrix[y][x] = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let val = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          val += grayMatrix[y + ky][x + kx] * kernel[ky + 1][kx + 1]
        }
      }
      laplacianSum += val * val
    }
  }
  const laplacianVariance = laplacianSum / ((height - 2) * (width - 2))
  const sharpnessRaw = Math.min(100, Math.sqrt(laplacianVariance) * 2)
  const resolutionFactor = Math.min(1, (originalWidth * originalHeight) / (2000000))
  imageQuality.sharpness = Math.round(sharpnessRaw * 0.7 + resolutionFactor * 30)

  const warnings: string[] = []
  if (imageQuality.sharpness < 40) {
    warnings.push('图片清晰度较低，可能是拍摄抖动或图片压缩过度导致，建议重新拍摄清晰的图片')
  }
  if (imageQuality.brightnessStatus === 'dark') {
    warnings.push('图片偏暗，物体细节可能无法充分识别，建议在光线充足处重新拍摄')
  }
  if (imageQuality.brightnessStatus === 'overexposed') {
    warnings.push('图片过亮（过曝），颜色和纹理可能失真，建议避免逆光或强光直射')
  }
  if (imageQuality.contrast < 40) {
    warnings.push('图片对比度偏低，物体与背景区分不明显，建议使用纯色背景并调整光线')
  }
  if (originalWidth < 400 || originalHeight < 400) {
    warnings.push('图片分辨率较低（小于 400×400），建议使用更高分辨率的图片')
  }
  qualityWarnings.value = warnings
  qualityAnalysisReady.value = true
}

const ignoreQualityWarning = () => {
  qualityIgnored.value = true
  ElMessage.info('已忽略质量提示，将继续识别')
}

const analyzeImageComposition = (
  imageData: ImageData,
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number
) => {
  const pixels = imageData.data
  const grayPixels: number[] = []
  for (let i = 0; i < pixels.length; i += 4) {
    grayPixels.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2])
  }

  let hSplitCount = 0
  const hThreshold = Math.min(12, Math.floor(height * 0.06))
  for (let y = 1; y < height - 1; y++) {
    let rowUniform = true
    let firstVal = grayPixels[y * width]
    for (let x = 1; x < width; x++) {
      if (Math.abs(grayPixels[y * width + x] - firstVal) > 8) {
        rowUniform = false
        break
      }
    }
    if (rowUniform && firstVal < 250 && firstVal > 5) {
      let neighborUniform = true
      for (let dy = -1; dy <= 1; dy += 2) {
        let ny = y + dy
        if (ny < 0 || ny >= height) continue
        let nFirstVal = grayPixels[ny * width]
        for (let x = 1; x < width; x++) {
          if (Math.abs(grayPixels[ny * width + x] - nFirstVal) > 8) {
            neighborUniform = false
            break
          }
        }
      }
      if (neighborUniform) hSplitCount++
    }
  }

  let vSplitCount = 0
  const vThreshold = Math.min(12, Math.floor(width * 0.06))
  for (let x = 1; x < width - 1; x++) {
    let colUniform = true
    let firstVal = grayPixels[x]
    for (let y = 1; y < height; y++) {
      if (Math.abs(grayPixels[y * width + x] - firstVal) > 8) {
        colUniform = false
        break
      }
    }
    if (colUniform && firstVal < 250 && firstVal > 5) {
      let neighborUniform = true
      for (let dx = -1; dx <= 1; dx += 2) {
        let nx = x + dx
        if (nx < 0 || nx >= width) continue
        let nFirstVal = grayPixels[nx]
        for (let y = 1; y < height; y++) {
          if (Math.abs(grayPixels[y * width + nx] - nFirstVal) > 8) {
            neighborUniform = false
            break
          }
        }
      }
      if (neighborUniform) vSplitCount++
    }
  }

  compositionData.multiPanelDetected = (hSplitCount >= hThreshold || vSplitCount >= vThreshold)

  let edgeCount = 0
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = y * width + x
      const gx = Math.abs(grayPixels[idx + 1] - grayPixels[idx - 1])
      const gy = Math.abs(grayPixels[idx + width] - grayPixels[idx - width])
      if (gx + gy > 50) edgeCount++
    }
  }
  const smallEdgeDensity = edgeCount / (width * height) * 100
  compositionData.textDensity = Math.round(smallEdgeDensity * 2.5)

  let cornerWhite = 0
  const cornerSize = Math.min(8, Math.floor(Math.min(width, height) * 0.08))
  for (let y = 0; y < cornerSize; y++) {
    for (let x = 0; x < cornerSize; x++) {
      if (grayPixels[y * width + x] > 240) cornerWhite++
    }
  }
  const cornerRatio = cornerWhite / (cornerSize * cornerSize)
  const aspectRatio = originalWidth / originalHeight
  const hasTopBottomBars = (aspectRatio > 1.8 && cornerRatio > 0.7) ||
    (aspectRatio < 0.6 && cornerRatio > 0.7)

  compositionData.isScreenshot = (
    hasTopBottomBars ||
    (compositionData.textDensity > 35 && compositionData.multiPanelDetected) ||
    (aspectRatio > 2.0 || aspectRatio < 0.5)
  )

  compositionData.hasUiElements = (
    compositionData.textDensity > 40 ||
    (compositionData.isScreenshot && compositionData.textDensity > 20)
  )

  const warnings: string[] = []
  if (compositionData.multiPanelDetected) {
    warnings.push('图片中检测到多角度拼接图，建议只拍摄目标物体的单张清晰图片')
  }
  if (compositionData.isScreenshot) {
    warnings.push('疑似屏幕截图，包含界面元素，建议直接拍摄物体原图')
  }
  if (compositionData.textDensity > 35) {
    warnings.push(`文字区域占比较高（约 ${compositionData.textDensity}%），建议拍摄纯净的物体图片`)
  }
  compositionWarnings.value = warnings
  compositionAnalysisReady.value = true
}

const analyzeImageWithCanvas = (dataUrl: string) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const originalWidth = img.width
      const originalHeight = img.height

      const qualityCanvas = document.createElement('canvas')
      const qualityCtx = qualityCanvas.getContext('2d')!
      const qualitySize = 200
      const qScale = Math.min(qualitySize / originalWidth, qualitySize / originalHeight)
      qualityCanvas.width = Math.floor(originalWidth * qScale)
      qualityCanvas.height = Math.floor(originalHeight * qScale)
      qualityCtx.drawImage(img, 0, 0, qualityCanvas.width, qualityCanvas.height)
      const qualityImageData = qualityCtx.getImageData(0, 0, qualityCanvas.width, qualityCanvas.height)
      analyzeImageQuality(qualityImageData, qualityCanvas.width, qualityCanvas.height, originalWidth, originalHeight)

      const compCanvas = document.createElement('canvas')
      const compCtx = compCanvas.getContext('2d')!
      const compSize = 350
      const compScale = Math.min(compSize / originalWidth, compSize / originalHeight)
      compCanvas.width = Math.floor(originalWidth * compScale)
      compCanvas.height = Math.floor(originalHeight * compScale)
      compCtx.drawImage(img, 0, 0, compCanvas.width, compCanvas.height)
      const compImageData = compCtx.getImageData(0, 0, compCanvas.width, compCanvas.height)
      analyzeImageComposition(compImageData, compCanvas.width, compCanvas.height, originalWidth, originalHeight)
    } catch (e) {
      console.warn('Image analysis failed:', e)
      qualityAnalysisReady.value = false
      compositionAnalysisReady.value = false
    }
  }
  img.src = dataUrl
}

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  recognitionResult.value = null
  resultReady.value = false
  qualityAnalysisReady.value = false
  qualityIgnored.value = false
  qualityWarnings.value = []
  imageQuality.sharpness = 0
  imageQuality.brightness = 0
  imageQuality.brightnessStatus = 'normal'
  imageQuality.contrast = 0
  compositionAnalysisReady.value = false
  compositionWarnings.value = []
  compositionData.isScreenshot = false
  compositionData.multiPanelDetected = false
  compositionData.textDensity = 0
  compositionData.hasUiElements = false
  stopCamera()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const recognizeObject = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (qualityWarnings.value.length > 0 && !qualityIgnored.value) {
    ElMessage.warning({
      message: '当前图片质量较低，建议重新上传后再识别，或确认继续识别',
      duration: 3000,
      showClose: true
    })
    return
  }

  isRecognizing.value = true

  try {
    const qualityHints: ImageQualityHints = {
      isScreenshot: compositionData.isScreenshot,
      multiPanelDetected: compositionData.multiPanelDetected,
      textDensity: compositionData.textDensity,
      hasUiElements: compositionData.hasUiElements,
      sharpness: imageQuality.sharpness,
      brightness: imageQuality.brightness,
      brightnessStatus: imageQuality.brightnessStatus,
      contrast: imageQuality.contrast
    }

    const response = await objectRecognitionApi.recognize({
      imageBase64: imageBase64.value,
      extraNote: form.extraNote || undefined,
      qualityHints
    })

    recognitionResult.value = response.data
    resultReady.value = true

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      objectName: response.data.primaryObject.name,
      categoryLabel: response.data.primaryObject.categoryLabel,
      result: JSON.parse(JSON.stringify(response.data))
    })
    saveHistory()

    ElMessage.success(`识别成功！已识别为「${response.data.primaryObject.name}」`)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '识别失败，请稍后重试')
  } finally {
    isRecognizing.value = false
  }
}
</script>

<style scoped>
.object-recognition {
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
.photo-guide-card,
.config-card,
.history-card,
.confidence-card,
.primary-object-card,
.secondary-objects-card,
.scene-card,
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

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-area:hover,
.upload-area-active {
  border-color: #722ed1;
  background-color: #f9f0ff;
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

.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.image-preview-container {
  position: relative;
  width: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 340px;
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

.camera-video {
  width: 100%;
  max-height: 360px;
  border-radius: 12px;
  margin-top: 16px;
  background: #000;
}

.camera-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
}

.quality-section {
  margin-top: 4px;
}

.quality-warning {
  margin-bottom: 16px;
}

.quality-warning-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.quality-warning-list {
  margin: 8px 0 12px;
  padding-left: 20px;
}

.quality-warning-list li {
  margin-bottom: 4px;
  color: #606266;
  font-size: 13px;
}

.quality-warning-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quality-metric {
  width: 100%;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.metric-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.composition-section {
  margin-top: 8px;
}

.composition-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.composition-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.composition-label {
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.composition-warning {
  margin-top: 12px;
}

.composition-warning-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.composition-warning-list {
  margin: 8px 0;
  padding-left: 20px;
}

.composition-warning-list li {
  margin-bottom: 4px;
  color: #606266;
  font-size: 13px;
}

.photo-guide-card {
  margin-bottom: 20px;
}

.guide-column {
  padding: 12px;
  border-radius: 8px;
}

.guide-column.good {
  background: #f0f9eb;
}

.guide-column.bad {
  background: #fef0f0;
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
}

.guide-title.good {
  color: #67c23a;
}

.guide-title.bad {
  color: #f56c6c;
}

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guide-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #606266;
}

.config-form {
  margin-top: 8px;
}

.recognize-btn {
  width: 100%;
  margin-top: 12px;
  min-height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #ecf5ff;
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
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.history-style {
  margin: 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.history-meta {
  margin: 0;
  font-size: 12px;
  color: #606266;
}

.confidence-card {
  margin-bottom: 20px;
}

.confidence-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.confidence-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confidence-text {
  display: flex;
  flex-direction: column;
}

.confidence-label {
  font-size: 13px;
  color: #909399;
}

.confidence-value {
  font-size: 28px;
  font-weight: bold;
}

.confidence-alert {
  margin-top: 12px;
}

.primary-object-card {
  margin-bottom: 20px;
}

.primary-object-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.object-name-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.object-name {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: bold;
}

.object-english {
  font-size: 14px;
  color: #909399;
  font-style: italic;
}

.category-tag {
  margin-left: 4px;
}

.confidence-tag {
  font-weight: 600;
}

.object-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.object-tag {
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.object-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  text-indent: 2em;
}

.object-background {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  text-indent: 2em;
}

.object-description-section,
.object-background-section,
.taxonomy-section,
.features-section,
.funfacts-section,
.related-section {
  margin-top: 16px;
}

.taxonomy-tree {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f9f0ff;
  border-radius: 8px;
}

.taxonomy-item {
  display: flex;
  font-size: 13px;
}

.taxonomy-key {
  color: #722ed1;
  font-weight: 600;
  min-width: 40px;
}

.taxonomy-value {
  color: #303133;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: #606266;
}

.features-list li .el-icon {
  color: #67c23a;
  margin-top: 2px;
  flex-shrink: 0;
}

.funfact-alert {
  margin-bottom: 8px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.related-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.secondary-objects-card {
  margin-bottom: 20px;
}

.secondary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secondary-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.secondary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.secondary-name {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.secondary-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.scene-card {
  margin-bottom: 20px;
}

.scene-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.recognition-time {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #909399;
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
  margin-bottom: 24px;
}

.example-tips {
  text-align: center;
}

.example-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.example-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.example-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.example-item span {
  font-size: 13px;
  color: #606266;
}
</style>
