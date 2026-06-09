<template>
  <div class="food-calorie">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#67c23a">
            <CameraFilled />
          </el-icon>
          <span>拍照识别食物热量</span>
          <el-tag size="small" type="success" class="header-tag">AI 智能识别 · 热量估算 · 营养分析</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传/拍照" description="拍摄或上传餐盘、食物图片" />
          <el-step title="智能识别" description="AI 自动识别食物种类、估算份量" />
          <el-step title="营养分析" description="获取热量值、三大营养素与饮食建议" />
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
              <span>上传食物图片</span>
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
          </div>
        </el-card>

        <el-card class="photo-guide-card">
          <template #header>
            <div class="card-header small">
              <el-icon :size="18" color="#67c23a">
                <Bulb />
              </el-icon>
              <span>拍照建议 · 提升识别准确率</span>
              <el-tag size="small" type="success" effect="light">高质量图片 = 更精准估算</el-tag>
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
                    俯视 45° 拍摄餐盘，完整呈现所有食物
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    光线充足、均匀，避免强光直射和阴影
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    食物完整不遮挡，份量清晰可见
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    纯色或简洁背景，减少干扰
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    可在旁边放参照物（如硬币、手机、手掌）
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
                    昏暗灯光、逆光、模糊抖动
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    只拍到局部、食物被餐具遮挡
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    角度过于倾斜，难以判断份量
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    背景杂乱、多人聚餐场景
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    网图截图、滤镜过重的图片
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
              <el-tag size="small" type="warning">目标越明确，建议越贴合</el-tag>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="饮食目标">
              <el-radio-group v-model="form.dietGoal">
                <el-radio-button value="lose">
                  <el-icon><TrendCharts /></el-icon>
                  减脂减重
                </el-radio-button>
                <el-radio-button value="fitness">
                  <el-icon><Dumbbell /></el-icon>
                  健身增肌
                </el-radio-button>
                <el-radio-button value="maintain">
                  <el-icon><Aim /></el-icon>
                  保持体重
                </el-radio-button>
                <el-radio-button value="diabetes">
                  <el-icon><Sugar /></el-icon>
                  糖尿病管理
                </el-radio-button>
                <el-radio-button value="gain">
                  <el-icon><TrendCharts /></el-icon>
                  增重营养
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="餐食类型">
              <el-radio-group v-model="form.mealType">
                <el-radio-button value="breakfast">
                  <el-icon><Sunny /></el-icon>
                  早餐
                </el-radio-button>
                <el-radio-button value="lunch">
                  <el-icon><Sunrise /></el-icon>
                  午餐
                </el-radio-button>
                <el-radio-button value="dinner">
                  <el-icon><Moon /></el-icon>
                  晚餐
                </el-radio-button>
                <el-radio-button value="snack">
                  <el-icon><CoffeeCup /></el-icon>
                  加餐/零食
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="补充说明（可选）">
              <el-input
                v-model="form.extraNote"
                type="textarea"
                :rows="2"
                placeholder="例如：这是减脂期的午餐、我正在做力量训练需要高蛋白、有糖尿病需要控糖等"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-button
              type="success"
              size="large"
              class="recognize-btn"
              :loading="isRecognizing"
              :disabled="!imageBase64"
              @click="recognizeFood"
            >
              <el-icon v-if="!isRecognizing"><MagicStick /></el-icon>
              {{ isRecognizing ? 'AI 正在分析食物热量...' : '开始识别热量' }}
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
                <p class="history-calories">
                  <el-icon><Flame /></el-icon>
                  {{ h.totalCalories }} 大卡
                </p>
                <p class="history-meta">{{ h.dietGoalLabel || '未设置目标' }}</p>
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
              v-for="(w, idx) in recognitionResult.qualityWarnings"
              :key="'rw'+idx"
              type="warning"
              :closable="false"
              show-icon
              class="confidence-alert"
              :title="w"
            />
          </el-card>

          <el-card class="assessment-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" :color="assessmentColor">
                  <Trophy />
                </el-icon>
                <span>膳食健康评分</span>
                <el-tag
                  size="small"
                  :type="assessmentTagType"
                  effect="dark"
                >{{ assessmentLevelText }}</el-tag>
              </div>
            </template>
            <div class="assessment-score-row">
              <div class="assessment-score-ring">
                <el-progress
                  type="dashboard"
                  :percentage="recognitionResult.mealAssessment.score"
                  :color="assessmentColor"
                  :width="140"
                  :stroke-width="14"
                />
              </div>
              <div class="assessment-desc">
                <p>{{ recognitionResult.mealAssessment.description }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="nutrition-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#eb2f96">
                  <DataAnalysis />
                </el-icon>
                <span>营养成分概览</span>
              </div>
            </template>

            <div class="calories-total">
              <div class="calories-icon">
                <el-icon :size="40" color="#f56c6c"><Flame /></el-icon>
              </div>
              <div class="calories-info">
                <div class="calories-value">
                  {{ recognitionResult.nutritionSummary.totalCalories }}
                  <span class="calories-unit">kcal</span>
                </div>
                <div class="calories-label">本餐总热量</div>
              </div>
            </div>

            <el-divider />

            <div class="macro-grid">
              <div class="macro-item protein">
                <div class="macro-label">
                  <span class="macro-dot"></span>
                  蛋白质
                </div>
                <div class="macro-value">{{ recognitionResult.nutritionSummary.totalProtein }} g</div>
                <el-progress
                  :percentage="recognitionResult.nutritionSummary.proteinRatio"
                  color="#165DFF"
                  :stroke-width="10"
                  :show-text="false"
                />
                <div class="macro-ratio">{{ recognitionResult.nutritionSummary.proteinRatio }}%</div>
              </div>
              <div class="macro-item carbs">
                <div class="macro-label">
                  <span class="macro-dot"></span>
                  碳水化合物
                </div>
                <div class="macro-value">{{ recognitionResult.nutritionSummary.totalCarbs }} g</div>
                <el-progress
                  :percentage="recognitionResult.nutritionSummary.carbsRatio"
                  color="#e6a23c"
                  :stroke-width="10"
                  :show-text="false"
                />
                <div class="macro-ratio">{{ recognitionResult.nutritionSummary.carbsRatio }}%</div>
              </div>
              <div class="macro-item fat">
                <div class="macro-label">
                  <span class="macro-dot"></span>
                  脂肪
                </div>
                <div class="macro-value">{{ recognitionResult.nutritionSummary.totalFat }} g</div>
                <el-progress
                  :percentage="recognitionResult.nutritionSummary.fatRatio"
                  color="#f56c6c"
                  :stroke-width="10"
                  :show-text="false"
                />
                <div class="macro-ratio">{{ recognitionResult.nutritionSummary.fatRatio }}%</div>
              </div>
            </div>

            <el-divider content-position="left">
              <span class="divider-label">其他营养</span>
            </el-divider>
            <div class="other-nutrition">
              <div class="other-nutri-item">
                <el-icon :size="16" color="#67c23a"><Leaf /></el-icon>
                <span class="nutri-label">膳食纤维</span>
                <span class="nutri-value">{{ recognitionResult.nutritionSummary.totalFiber }} g</span>
              </div>
              <div class="other-nutri-item">
                <el-icon :size="16" color="#e6a23c"><Sugar /></el-icon>
                <span class="nutri-label">糖分</span>
                <span class="nutri-value">{{ recognitionResult.nutritionSummary.totalSugar }} g</span>
              </div>
            </div>
          </el-card>

          <el-card class="food-items-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#165DFF">
                  <Goods />
                </el-icon>
                <span>识别到的食物</span>
                <el-tag size="small" type="primary">共 {{ recognitionResult.foodItems.length }} 种</el-tag>
              </div>
            </template>
            <div class="food-items-list">
              <div
                v-for="item in recognitionResult.foodItems"
                :key="item.id"
                class="food-item-card"
              >
                <div class="food-item-header">
                  <div class="food-name-row">
                    <span class="food-name">{{ item.name }}</span>
                    <el-tag size="small" class="food-category">{{ item.category }}</el-tag>
                  </div>
                  <el-tag size="small" type="success" class="confidence-tag">
                    {{ item.confidence }}%
                  </el-tag>
                </div>
                <div class="food-portion">
                  <el-icon><Scale /></el-icon>
                  {{ item.portion }}
                </div>
                <div class="food-calories-row">
                  <div class="food-calories">
                    <el-icon :size="14" color="#f56c6c"><Flame /></el-icon>
                    <span>{{ item.calories }} 大卡</span>
                  </div>
                </div>
                <div class="food-macros">
                  <div class="food-macro">
                    <span class="food-macro-label">蛋白</span>
                    <span class="food-macro-value">{{ item.protein }}g</span>
                  </div>
                  <div class="food-macro">
                    <span class="food-macro-label">碳水</span>
                    <span class="food-macro-value">{{ item.carbs }}g</span>
                  </div>
                  <div class="food-macro">
                    <span class="food-macro-label">脂肪</span>
                    <span class="food-macro-value">{{ item.fat }}g</span>
                  </div>
                  <div v-if="item.giIndex && item.giIndex > 0" class="food-macro">
                    <span class="food-macro-label">GI</span>
                    <span
                      class="food-macro-value"
                      :style="{ color: item.giIndex >= 70 ? '#f56c6c' : item.giIndex >= 55 ? '#e6a23c' : '#67c23a' }"
                    >{{ item.giIndex }}</span>
                  </div>
                </div>
                <div class="food-tags">
                  <el-tag
                    v-for="(tag, idx) in item.tags"
                    :key="idx"
                    size="small"
                    effect="plain"
                  >{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="advice-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#67c23a">
                  <MagicStick />
                </el-icon>
                <span>AI 饮食建议</span>
              </div>
            </template>
            <div class="advice-list">
              <el-alert
                v-for="advice in recognitionResult.dietAdvice"
                :key="advice.id"
                :type="advice.type === 'warning' ? 'error' : advice.type === 'praise' ? 'success' : 'warning'"
                :closable="false"
                show-icon
                class="advice-alert"
                :title="advice.title"
              >
                <template #default>
                  {{ advice.description }}
                </template>
              </el-alert>
            </div>
          </el-card>

          <el-card v-if="recognitionResult.alternativeSuggestions.length > 0" class="alternative-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#722ed1">
                  <RefreshRight />
                </el-icon>
                <span>更低卡替代方案</span>
              </div>
            </template>
            <div class="alternative-list">
              <div
                v-for="alt in recognitionResult.alternativeSuggestions"
                :key="alt.id"
                class="alternative-item"
              >
                <div class="alt-main">
                  <div class="alt-replace">
                    <span class="alt-original">{{ alt.originalFood }}</span>
                    <el-icon color="#909399"><Right /></el-icon>
                    <span class="alt-new">{{ alt.alternativeFood }}</span>
                  </div>
                  <el-tag
                    size="small"
                    type="success"
                    effect="light"
                  >
                    <el-icon><TrendCharts /></el-icon>
                    少 {{ Math.abs(alt.calorieDiff) }} 大卡
                  </el-tag>
                </div>
                <p class="alt-reason">{{ alt.reason }}</p>
              </div>
            </div>
          </el-card>
        </template>

        <el-card v-else class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><Food /></el-icon>
            <p class="empty-text">上传食物图片后开始识别</p>
            <p class="empty-hint">AI 将为你识别食物种类、估算热量、分析营养结构</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain">
                <el-icon><Camera /></el-icon>
                支持拍照上传
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Flame /></el-icon>
                热量精准估算
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><DataAnalysis /></el-icon>
                三大营养素分析
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><MagicStick /></el-icon>
                个性化饮食建议
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><TrendCharts /></el-icon>
                低卡替代方案
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Dumbbell /></el-icon>
                减脂/增肌/控糖
              </el-tag>
            </div>
            <div class="example-tips">
              <h4 class="example-title">你可以尝试识别：</h4>
              <el-row :gutter="10">
                <el-col :span="8">
                  <div class="example-item">
                    <el-icon :size="24" color="#e6a23c"><Bowl /></el-icon>
                    <span>家常菜/工作餐</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="example-item">
                    <el-icon :size="24" color="#f56c6c"><CoffeeCup /></el-icon>
                    <span>奶茶/零食/甜点</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="example-item">
                    <el-icon :size="24" color="#67c23a"><Food /></el-icon>
                    <span>水果/蔬菜沙拉</span>
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
  Flame,
  Picture,
  Bulb,
  Close,
  WarningFilled,
  Check,
  CircleCheckFilled,
  CircleCloseFilled,
  Monitor,
  TrendCharts,
  Aim,
  Sunny,
  Moon,
  Sunrise,
  Trophy,
  Leaf,
  RefreshRight,
  Right,
  Scale,
  Dumbbell,
  Sugar,
  CoffeeCup,
  Bowl,
  Food
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  foodCalorieApi,
  type FoodCalorieResponse,
  type ImageQualityHints
} from '@/api/foodCalorie'

const HISTORY_KEY = 'food_calorie_history'
const DIET_GOAL_LABEL_MAP: Record<string, string> = {
  lose: '减脂减重',
  fitness: '健身增肌',
  maintain: '保持体重',
  diabetes: '糖尿病管理',
  gain: '增重营养'
}

interface HistoryItem {
  timestamp: number
  imagePreview: string
  totalCalories: number
  dietGoalLabel: string
  result: FoodCalorieResponse
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isRecognizing = ref(false)
const recognitionResult = ref<FoodCalorieResponse | null>(null)
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

const assessmentColor = computed(() => {
  if (!recognitionResult.value) return '#909399'
  const level = recognitionResult.value.mealAssessment.level
  if (level === 'excellent') return '#67c23a'
  if (level === 'good') return '#165DFF'
  if (level === 'fair') return '#e6a23c'
  return '#f56c6c'
})

const assessmentTagType = computed(() => {
  if (!recognitionResult.value) return 'info'
  const level = recognitionResult.value.mealAssessment.level
  if (level === 'excellent') return 'success'
  if (level === 'good') return 'primary'
  if (level === 'fair') return 'warning'
  return 'danger'
})

const assessmentLevelText = computed(() => {
  if (!recognitionResult.value) return ''
  const level = recognitionResult.value.mealAssessment.level
  return { excellent: '优秀', good: '良好', fair: '一般', poor: '待改善' }[level]
})

let mediaStream: MediaStream | null = null

const form = reactive({
  dietGoal: 'lose' as 'lose' | 'gain' | 'maintain' | 'diabetes' | 'fitness',
  mealType: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
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

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  recognitionResult.value = null
  resultReady.value = false
  qualityAnalysisReady.value = false
  qualityWarnings.value = []
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
  let minL = 255
  let maxL = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    totalLuminance += luminance
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
    warnings.push('图片清晰度较低，食物细节和份量估算可能不准，建议重新拍摄清晰图片')
  }
  if (imageQuality.brightnessStatus === 'dark') {
    warnings.push('图片偏暗，食物颜色和种类识别可能受影响，建议在光线充足处拍摄')
  }
  if (imageQuality.brightnessStatus === 'overexposed') {
    warnings.push('图片过亮（过曝），食物纹理特征可能失真，建议避免逆光或强光直射')
  }
  if (imageQuality.contrast < 40) {
    warnings.push('图片对比度偏低，食物与餐盘背景区分不明显')
  }
  if (originalWidth < 400 || originalHeight < 400) {
    warnings.push('图片分辨率较低，建议使用更高分辨率的图片')
  }
  qualityWarnings.value = warnings
  qualityAnalysisReady.value = true
}

const ignoreQualityWarning = () => {
  qualityIgnored.value = true
  ElMessage.info('已忽略质量提示，将继续识别')
}

const analyzeImageWithCanvas = (dataUrl: string) => {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const maxSize = 800
    let w = img.naturalWidth
    let h = img.naturalHeight
    if (w > maxSize || h > maxSize) {
      if (w > h) {
        h = Math.round(h * maxSize / w)
        w = maxSize
      } else {
        w = Math.round(w * maxSize / h)
        h = maxSize
      }
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(img, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h)
      analyzeImageQuality(imageData, w, h, img.naturalWidth, img.naturalHeight)
    }
  }
  img.src = dataUrl
}

const getQualityHints = (): ImageQualityHints | undefined => {
  if (!qualityAnalysisReady.value) return undefined
  return {
    sharpness: imageQuality.sharpness,
    brightness: imageQuality.brightness,
    brightnessStatus: imageQuality.brightnessStatus,
    contrast: imageQuality.contrast
  }
}

const recognizeFood = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传食物图片')
    return
  }

  isRecognizing.value = true
  try {
    const { data } = await foodCalorieApi.recognize({
      imageBase64: imageBase64.value,
      dietGoal: form.dietGoal,
      mealType: form.mealType,
      extraNote: form.extraNote || undefined,
      qualityHints: getQualityHints()
    })
    recognitionResult.value = data
    resultReady.value = true

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      totalCalories: data.nutritionSummary.totalCalories,
      dietGoalLabel: DIET_GOAL_LABEL_MAP[form.dietGoal] || '',
      result: data
    })
    saveHistory()

    ElMessage.success('识别完成')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '识别失败，请稍后重试')
  } finally {
    isRecognizing.value = false
  }
}
</script>

<style scoped>
.food-calorie {
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.card-header.small {
  font-size: 15px;
  font-weight: 600;
}

.header-tag {
  margin-left: auto;
}

.intro-steps {
  margin-top: 10px;
}

.upload-card,
.photo-guide-card,
.config-card,
.history-card,
.confidence-card,
.assessment-card,
.nutrition-card,
.food-items-card,
.advice-card,
.alternative-card,
.empty-result-card {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover,
.upload-area-active {
  border-color: #165DFF;
  background: #ecf5ff;
}

.upload-area.has-image {
  padding: 16px;
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
}

.image-preview {
  max-width: 100%;
  max-height: 400px;
  border-radius: 6px;
  display: block;
  margin: 0 auto;
}

.image-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.camera-video {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-top: 16px;
  background: #000;
}

.camera-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.divider-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.quality-warning {
  margin-bottom: 16px;
}

.quality-warning-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.quality-warning-list {
  margin: 8px 0;
  padding-left: 20px;
  color: #606266;
}

.quality-warning-list li {
  margin: 4px 0;
}

.quality-warning-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
}

.guide-column {
  padding: 8px;
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  font-size: 15px;
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
  align-items: flex-start;
  gap: 6px;
  padding: 6px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.config-form .recognize-btn {
  width: 100%;
  margin-top: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f5f7fa;
}

.history-thumb {
  width: 60px;
  height: 60px;
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
  font-size: 13px;
  color: #909399;
}

.history-calories {
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
}

.history-meta {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.confidence-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.confidence-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.confidence-text .confidence-label {
  font-size: 13px;
  color: #909399;
}

.confidence-text .confidence-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;
}

.confidence-alert {
  margin-top: 12px;
}

.assessment-score-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.assessment-score-ring {
  flex-shrink: 0;
}

.assessment-desc {
  flex: 1;
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
}

.assessment-desc p {
  margin: 0;
}

.calories-total {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
}

.calories-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #fef0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.calories-info .calories-value {
  font-size: 36px;
  font-weight: bold;
  color: #f56c6c;
  line-height: 1;
}

.calories-unit {
  font-size: 16px;
  font-weight: normal;
  color: #909399;
  margin-left: 4px;
}

.calories-label {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}

.macro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.macro-item {
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  background: #fafafa;
}

.macro-item.protein .macro-dot { background: #165DFF; }
.macro-item.carbs .macro-dot { background: #e6a23c; }
.macro-item.fat .macro-dot { background: #f56c6c; }

.macro-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.macro-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.macro-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.macro-ratio {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.other-nutrition {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.other-nutri-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nutri-label {
  font-size: 13px;
  color: #606266;
}

.nutri-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.food-items-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.food-item-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px 16px;
  transition: all 0.2s;
}

.food-item-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-color: #dcdfe6;
}

.food-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.food-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.food-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.food-category {
  background: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.confidence-tag {
  flex-shrink: 0;
}

.food-portion {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}

.food-calories-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.food-calories {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.food-macros {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.food-macro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.food-macro-label {
  font-size: 11px;
  color: #909399;
}

.food-macro-value {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.food-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.advice-alert {
  margin: 0;
}

.alternative-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.alternative-item {
  border: 1px solid #e1f3d8;
  background: #f0f9eb;
  border-radius: 8px;
  padding: 12px 14px;
}

.alt-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.alt-replace {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.alt-original {
  color: #f56c6c;
  font-weight: 500;
  text-decoration: line-through;
}

.alt-new {
  color: #67c23a;
  font-weight: 600;
}

.alt-reason {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 18px;
  color: #606266;
  margin: 20px 0 8px;
  font-weight: 500;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px;
}

.feature-hints {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.example-title {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.example-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: #fafafa;
  border-radius: 8px;
  font-size: 13px;
  color: #606266;
}
</style>
