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

            <el-form-item label="参照物校准（大幅提升份量准确度）">
              <el-radio-group v-model="form.referenceObject" class="ref-radio-group">
                <el-radio-button value="none">
                  <el-icon><QuestionFilled /></el-icon>
                  无参照
                </el-radio-button>
                <el-radio-button value="standard_plate">
                  <el-icon><Dish /></el-icon>
                  标准餐盘(≈26cm)
                </el-radio-button>
                <el-radio-button value="small_plate">
                  <el-icon><Dish /></el-icon>
                  小餐盘(≈20cm)
                </el-radio-button>
                <el-radio-button value="bowl">
                  <el-icon><Bowl /></el-icon>
                  普通碗
                </el-radio-button>
                <el-radio-button value="phone">
                  <el-icon><Iphone /></el-icon>
                  手机
                </el-radio-button>
                <el-radio-button value="hand">
                  <el-icon><Hand /></el-icon>
                  手掌
                </el-radio-button>
                <el-radio-button value="coin">
                  <el-icon><Coin /></el-icon>
                  1元硬币
                </el-radio-button>
              </el-radio-group>
              <div class="ref-hint">
                <el-icon :size="13"><InfoFilled /></el-icon>
                拍照时请将参照物与食物放在同一平面，俯视 45° 拍摄效果最佳。选择参照物后，系统将自动校准份量估算。
              </div>
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
                  {{ adjustedNutrition.totalCalories }}
                  <span class="calories-unit">kcal</span>
                </div>
                <div class="calories-range" v-if="resultReady">
                  <el-icon :size="12"><Warning /></el-icon>
                  估算范围：{{ adjustedNutrition.totalCaloriesMin }} ~ {{ adjustedNutrition.totalCaloriesMax }} kcal
                  <el-tag
                    size="small"
                    :type="adjustedNutrition.estimationUncertainty <= 20 ? 'success' : adjustedNutrition.estimationUncertainty <= 30 ? 'warning' : 'danger'"
                    effect="light"
                    class="uncertainty-tag"
                  >
                    误差 ±{{ adjustedNutrition.estimationUncertainty }}%
                  </el-tag>
                </div>
                <div class="calories-reliability" v-if="resultReady && adjustedNutrition.dailyStatsReliability !== 'reliable'">
                  <el-tag
                    size="small"
                    :type="RELIABILITY_STYLE[adjustedNutrition.dailyStatsReliability].type"
                    effect="dark"
                    class="reliability-tag"
                  >
                    <el-icon :size="12"><InfoFilled /></el-icon>
                    {{ RELIABILITY_STYLE[adjustedNutrition.dailyStatsReliability].label }}
                  </el-tag>
                  <span class="reliability-hint" v-if="adjustedNutrition.dailyStatsReliability === 'unreliable' || adjustedNutrition.dailyStatsReliability === 'uncertain'">
                    热量统计可能存在较大偏差，请手动确认份量
                  </span>
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
                <div class="macro-value">{{ adjustedNutrition.totalProtein }} g</div>
                <el-progress
                  :percentage="adjustedNutrition.proteinRatio"
                  color="#165DFF"
                  :stroke-width="10"
                  :show-text="false"
                />
                <div class="macro-ratio">{{ adjustedNutrition.proteinRatio }}%</div>
              </div>
              <div class="macro-item carbs">
                <div class="macro-label">
                  <span class="macro-dot"></span>
                  碳水化合物
                </div>
                <div class="macro-value">{{ adjustedNutrition.totalCarbs }} g</div>
                <el-progress
                  :percentage="adjustedNutrition.carbsRatio"
                  color="#e6a23c"
                  :stroke-width="10"
                  :show-text="false"
                />
                <div class="macro-ratio">{{ adjustedNutrition.carbsRatio }}%</div>
              </div>
              <div class="macro-item fat">
                <div class="macro-label">
                  <span class="macro-dot"></span>
                  脂肪
                </div>
                <div class="macro-value">{{ adjustedNutrition.totalFat }} g</div>
                <el-progress
                  :percentage="adjustedNutrition.fatRatio"
                  color="#f56c6c"
                  :stroke-width="10"
                  :show-text="false"
                />
                <div class="macro-ratio">{{ adjustedNutrition.fatRatio }}%</div>
              </div>
            </div>

            <el-divider content-position="left">
              <span class="divider-label">其他营养</span>
            </el-divider>
            <div class="other-nutrition">
              <div class="other-nutri-item">
                <el-icon :size="16" color="#67c23a"><Leaf /></el-icon>
                <span class="nutri-label">膳食纤维</span>
                <span class="nutri-value">{{ adjustedNutrition.totalFiber }} g</span>
              </div>
              <div class="other-nutri-item">
                <el-icon :size="16" color="#e6a23c"><Sugar /></el-icon>
                <span class="nutri-label">糖分</span>
                <span class="nutri-value">{{ adjustedNutrition.totalSugar }} g</span>
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
                <div class="food-header-actions">
                  <el-tag size="small" type="primary">共 {{ adjustedFoodItems.length }} 种</el-tag>
                  <el-tooltip content="AI 份量估算存在误差，建议根据实际情况手动调整每种食物的份量" placement="top">
                    <el-icon :size="16" color="#e6a23c"><WarningFilled /></el-icon>
                  </el-tooltip>
                </div>
              </div>
            </template>
            <div class="portion-tip-bar">
              <el-icon :size="14"><InfoFilled /></el-icon>
              <span>份量估算仅供参考，请根据实际用餐量使用滑块或输入框精准调整，调整后热量和营养数据会实时重新计算。</span>
            </div>
            <div class="food-items-list">
              <div
                v-for="item in adjustedFoodItems"
                :key="item.id"
                class="food-item-card"
                :class="{ 'food-item-high-risk': item.underestimationRisk === 'high' || item.underestimationRisk === 'critical' }"
              >
                <div class="food-item-header">
                  <div class="food-name-row">
                    <span class="food-name">{{ item.name }}</span>
                    <el-tag size="small" class="food-category">{{ item.category }}</el-tag>
                    <el-tooltip
                      v-if="item.underestimationRisk !== 'none' && item.underestimationRisk !== 'low'"
                      :content="item.portionUncertaintyAsymmetry === 'underestimation_risk' ? '拍摄角度可能导致厚度压缩，实际份量容易被低估' : '份量估算存在不确定性'"
                      placement="top"
                    >
                      <el-tag
                        size="small"
                        :type="UNDERESTIMATION_RISK_STYLE[item.underestimationRisk].type"
                        effect="dark"
                        class="risk-tag"
                      >
                        <el-icon :size="12"><WarningFilled /></el-icon>
                        {{ UNDERESTIMATION_RISK_STYLE[item.underestimationRisk].label }}
                      </el-tag>
                    </el-tooltip>
                  </div>
                  <el-tag size="small" type="success" class="confidence-tag">
                    {{ item.confidence }}%
                  </el-tag>
                </div>

                <el-alert
                  v-if="item.underestimationRisk === 'critical' || item.underestimationRisk === 'high'"
                  :type="item.underestimationRisk === 'critical' ? 'error' : 'warning'"
                  :closable="false"
                  show-icon
                  class="food-risk-alert"
                >
                  <template #title>
                    <strong>{{ item.underestimationRisk === 'critical' ? '严重低估风险' : '高度低估风险' }}</strong>
                  </template>
                  <span v-if="item.portionUncertaintyAsymmetry === 'underestimation_risk'">
                    {{ item.name }} 属于立体块状食物，拍摄角度容易导致厚度视觉压缩。
                    <b>实测 150g 可能被系统低估为 100g，热量差可达 60~100 大卡！</b>
                    建议使用下方「厚度系数」或「常见份量预设」修正。
                  </span>
                  <span v-else>
                    {{ item.name }} 热量密度较高，份量偏差对总热量影响显著，建议手动确认。
                  </span>
                </el-alert>

                <div class="food-calories-row">
                  <div class="food-calories">
                    <el-icon :size="14" color="#f56c6c"><Flame /></el-icon>
                    <span class="food-calories-main">{{ item.adjustedCalories }} 大卡</span>
                    <span class="food-calories-range" :class="{ 'asymmetric-range': item.portionUncertaintyAsymmetry === 'underestimation_risk' }">
                      ({{ item.adjustedCaloriesMin }} ~ {{ item.adjustedCaloriesMax }})
                    </span>
                    <el-tag
                      v-if="item.portionUncertaintyAsymmetry === 'underestimation_risk'"
                      size="small"
                      type="danger"
                      effect="plain"
                      class="asymmetry-tag"
                    >
                      <el-icon :size="11"><TrendCharts /></el-icon>
                      易低估
                    </el-tag>
                  </div>
                  <el-tag
                    size="small"
                    :type="item.portionUncertainty <= 20 ? 'success' : item.portionUncertainty <= 30 ? 'warning' : 'danger'"
                    effect="light"
                  >
                    ±{{ item.portionUncertainty }}%
                  </el-tag>
                </div>

                <div class="food-macros">
                  <div class="food-macro">
                    <span class="food-macro-label">蛋白</span>
                    <span class="food-macro-value">{{ item.adjustedProtein }}g</span>
                  </div>
                  <div class="food-macro">
                    <span class="food-macro-label">碳水</span>
                    <span class="food-macro-value">{{ item.adjustedCarbs }}g</span>
                  </div>
                  <div class="food-macro">
                    <span class="food-macro-label">脂肪</span>
                    <span class="food-macro-value">{{ item.adjustedFat }}g</span>
                  </div>
                  <div v-if="item.giIndex && item.giIndex > 0" class="food-macro">
                    <span class="food-macro-label">GI</span>
                    <span
                      class="food-macro-value"
                      :style="{ color: item.giIndex >= 70 ? '#f56c6c' : item.giIndex >= 55 ? '#e6a23c' : '#67c23a' }"
                    >{{ item.giIndex }}</span>
                  </div>
                  <div class="food-macro" v-if="item.isHighDensity">
                    <span class="food-macro-label">热量密度</span>
                    <span class="food-macro-value" style="color:#f56c6c">{{ item.calorieDensity }} kcal/100g</span>
                  </div>
                </div>

                <div class="portion-control-section">
                  <div class="portion-control-header">
                    <span class="portion-control-label">
                      <el-icon :size="14"><Scale /></el-icon>
                      份量调节
                    </span>
                    <div class="portion-presets">
                      <el-button
                        v-for="preset in portionPresets"
                        :key="preset.value"
                        size="small"
                        :type="Math.abs(item.adjustedGrams - Math.round(item.originalGrams * preset.value)) < 5 && Math.abs(item.thicknessFactor - 1) < 0.01 ? 'primary' : 'default'"
                        plain
                        @click="setPortionPreset(item.id, preset.value)"
                      >
                        {{ preset.label }}
                      </el-button>
                    </div>
                  </div>

                  <div class="portion-preset-hints" v-if="item.portionPresetHints && item.portionPresetHints.length > 0">
                    <span class="preset-hint-label">常见份量：</span>
                    <el-button
                      v-for="hint in item.portionPresetHints.slice(0, 4)"
                      :key="hint"
                      size="small"
                      type="success"
                      plain
                      @click="applyPresetHint(item.id, hint)"
                    >
                      {{ hint }}
                    </el-button>
                  </div>

                  <div class="portion-slider-row">
                    <el-slider
                      v-model="item.adjustedGrams"
                      :min="20"
                      :max="500"
                      :step="10"
                      show-input
                      :input-size="60"
                      class="portion-slider"
                      @change="watchFoodPortionChange(item.id)"
                    />
                    <span class="portion-grams-label">g</span>
                  </div>

                  <div
                    v-if="item.foodShape === 'solid_3d'"
                    class="thickness-control-section"
                  >
                    <div class="thickness-header">
                      <span class="thickness-label">
                        <el-icon :size="14" color="#e6a23c"><Box /></el-icon>
                        厚度系数（补偿拍摄角度导致的厚度压缩）
                      </span>
                      <span class="thickness-value">× {{ item.thicknessFactor.toFixed(2) }}</span>
                    </div>
                    <div class="thickness-slider-row">
                      <el-slider
                        v-model="item.thicknessFactor"
                        :min="0.5"
                        :max="2.5"
                        :step="0.05"
                        :marks="{ 0.5: '薄', 1: '正常', 1.5: '较厚', 2: '很厚', 2.5: '极厚' }"
                        class="thickness-slider"
                        @change="updateFoodItemFromThickness(item.id)"
                      />
                    </div>
                    <div class="thickness-hint">
                      <el-tag size="small" type="info" effect="plain">看起来很薄？</el-tag>
                      可能是拍摄角度导致的，可将厚度系数调至 1.3~1.8；
                      <el-tag size="small" type="success" effect="plain">非常厚实？</el-tag>
                      调至 1.8~2.5
                    </div>
                    <div class="effective-weight">
                      实际估算重量：<b>{{ Math.round(item.adjustedGrams * item.thicknessFactor) }}g</b>
                      （重量 × 厚度系数）
                    </div>
                  </div>

                  <div class="portion-compare-row">
                    <span class="portion-original" v-if="Math.abs(item.adjustedGrams - item.originalGrams) > 5 || Math.abs(item.thicknessFactor - 1) > 0.01">
                      AI 原始估算：{{ item.originalGrams }}g
                      <el-tag
                        size="small"
                        :type="(item.adjustedGrams * item.thicknessFactor) > item.originalGrams ? 'warning' : 'success'"
                        effect="plain"
                      >
                        {{ (item.adjustedGrams * item.thicknessFactor) > item.originalGrams ? '+' : '' }}{{ Math.round(item.adjustedGrams * item.thicknessFactor - item.originalGrams) }}g
                      </el-tag>
                    </span>
                    <span class="portion-per-100g">
                      每 100g：{{ item.caloriesPer100g }} 大卡 | {{ item.proteinPer100g }}g蛋白 | {{ item.carbsPer100g }}g碳水 | {{ item.fatPer100g }}g脂肪
                    </span>
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

          <el-card class="disclaimer-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#909399">
                  <InfoFilled />
                </el-icon>
                <span>数据说明与免责声明</span>
              </div>
            </template>
            <el-alert type="info" :closable="false" show-icon class="disclaimer-alert">
              <template #title>
                <strong>关于热量和营养数据的说明</strong>
              </template>
              <ul class="disclaimer-list">
                <li>
                  <el-icon :size="12"><Warning /></el-icon>
                  <strong>份量估算误差</strong>：AI 通过图片估算食物份量时，受拍摄角度、光线、参照物缺失等因素影响，误差范围通常在 <b>±20% ~ ±40%</b>。建议使用参照物校准或手动调整份量滑块，以获得更准确的结果。
                </li>
                <li>
                  <el-icon :size="12"><Warning /></el-icon>
                  <strong>营养数据来源</strong>：营养数据参考《中国食物成分表》及常见食品营养数据库，实际数值因食材品种、烹饪方式（油盐用量）、加工工艺等会有较大差异。
                </li>
                <li>
                  <el-icon :size="12"><Warning /></el-icon>
                  <strong>烹饪方式影响</strong>：清蒸、水煮、烧烤、油炸等不同烹饪方式对热量和营养的影响差异巨大（如 100g 生鸡胸肉 vs 100g 油炸鸡排，热量可相差 3 倍以上）。系统默认按常见家庭烹饪方式估算。
                </li>
                <li>
                  <el-icon :size="12"><Warning /></el-icon>
                  <strong>仅供参考</strong>：本工具提供的所有数据均为 AI 估算值，<b>不作为医疗或营养诊断依据</b>。糖尿病、肾病、痛风等需要严格饮食管理的人群，请以专业营养师或医生建议为准。
                </li>
                <li>
                  <el-icon :size="12"><Warning /></el-icon>
                  <strong>使用建议</strong>：建议长期记录并观察整体趋势，而非过度纠结于单餐的精确数值。配合体重、体脂等生理指标的变化趋势，更能真实反映饮食效果。
                </li>
              </ul>
            </el-alert>
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
  Warning,
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
  Food,
  QuestionFilled,
  Dish,
  Iphone,
  Hand,
  Coin,
  InfoFilled,
  Box
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  foodCalorieApi,
  type FoodCalorieResponse,
  type FoodItem,
  type NutritionSummary,
  type ImageQualityHints,
  type ReferenceObject
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
  extraNote: '',
  referenceObject: 'none' as ReferenceObject
})

const portionPresets = [
  { label: '半份', value: 0.5 },
  { label: '标准份', value: 1 },
  { label: '1.5份', value: 1.5 },
  { label: '2份', value: 2 }
]

interface AdjustedFoodItem extends FoodItem {
  adjustedGrams: number
  originalGrams: number
  adjustedCalories: number
  adjustedCaloriesMin: number
  adjustedCaloriesMax: number
  adjustedProtein: number
  adjustedCarbs: number
  adjustedFat: number
  thicknessFactor: number
}

const UNDERESTIMATION_RISK_STYLE: Record<string, { label: string; type: 'success' | 'info' | 'warning' | 'danger'; color: string }> = {
  none: { label: '低估风险低', type: 'success', color: '#67c23a' },
  low: { label: '低估风险较低', type: 'info', color: '#909399' },
  medium: { label: '有低估风险', type: 'warning', color: '#e6a23c' },
  high: { label: '低估风险高', type: 'warning', color: '#f56c6c' },
  critical: { label: '严重低估风险', type: 'danger', color: '#f56c6c' }
}

const RELIABILITY_STYLE: Record<string, { label: string; type: 'success' | 'info' | 'warning' | 'danger'; color: string }> = {
  reliable: { label: '数据可靠', type: 'success', color: '#67c23a' },
  acceptable: { label: '基本可信', type: 'info', color: '#165DFF' },
  uncertain: { label: '存在偏差', type: 'warning', color: '#e6a23c' },
  unreliable: { label: '仅供参考', type: 'danger', color: '#f56c6c' }
}

const adjustedFoodItems = ref<AdjustedFoodItem[]>([])

const initAdjustedFoodItems = (items: FoodItem[]): AdjustedFoodItem[] => {
  return items.map(item => {
    const gramFactor = item.portionGrams / 100
    const uncertaintyFactor = item.portionUncertainty / 100
    return {
      ...item,
      adjustedGrams: item.portionGrams,
      originalGrams: item.portionGrams,
      thicknessFactor: 1,
      adjustedCalories: item.calories,
      adjustedCaloriesMin: item.caloriesMin,
      adjustedCaloriesMax: item.caloriesMax,
      adjustedProtein: Math.round(item.protein * 10) / 10,
      adjustedCarbs: Math.round(item.carbs * 10) / 10,
      adjustedFat: Math.round(item.fat * 10) / 10
    }
  }) as AdjustedFoodItem[]
}

const adjustedNutrition = computed<NutritionSummary>(() => {
  if (!recognitionResult.value && adjustedFoodItems.value.length === 0) {
    return {
      totalCalories: 0, totalCaloriesMin: 0, totalCaloriesMax: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSugar: 0, proteinRatio: 0, carbsRatio: 0, fatRatio: 0, estimationUncertainty: 0,
      hasHighUnderestimationRisk: false, highRiskFoodCount: 0, dailyStatsReliability: 'reliable'
    }
  }
  const items = adjustedFoodItems.value
  const totalCalories = items.reduce((s, i) => s + i.adjustedCalories, 0)
  const totalCaloriesMin = items.reduce((s, i) => s + i.adjustedCaloriesMin, 0)
  const totalCaloriesMax = items.reduce((s, i) => s + i.adjustedCaloriesMax, 0)
  const totalProtein = items.reduce((s, i) => s + i.adjustedProtein, 0)
  const totalCarbs = items.reduce((s, i) => s + i.adjustedCarbs, 0)
  const totalFat = items.reduce((s, i) => s + i.adjustedFat, 0)
  const totalFiber = items.reduce((s, i) => s + (i.fiber || 0), 0)
  const totalSugar = items.reduce((s, i) => s + (i.sugar || 0), 0)
  const avgUncertainty = items.length > 0
    ? items.reduce((s, i) => s + i.portionUncertainty, 0) / items.length
    : (recognitionResult.value?.nutritionSummary.estimationUncertainty || 25)
  const highRiskFoods = items.filter(i => i.underestimationRisk === 'high' || i.underestimationRisk === 'critical')

  let reliability: NutritionSummary['dailyStatsReliability'] = 'reliable'
  if (avgUncertainty >= 45 || highRiskFoods.length >= 2) {
    reliability = 'unreliable'
  } else if (avgUncertainty >= 30 || highRiskFoods.length >= 1) {
    reliability = 'uncertain'
  } else if (avgUncertainty >= 20) {
    reliability = 'acceptable'
  }

  const proteinKcal = totalProtein * 4
  const carbsKcal = totalCarbs * 4
  const fatKcal = totalFat * 9
  const totalKcal = proteinKcal + carbsKcal + fatKcal || 1

  return {
    totalCalories,
    totalCaloriesMin,
    totalCaloriesMax,
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    totalSugar: Math.round(totalSugar * 10) / 10,
    proteinRatio: Math.round((proteinKcal / totalKcal) * 100),
    carbsRatio: Math.round((carbsKcal / totalKcal) * 100),
    fatRatio: Math.round((fatKcal / totalKcal) * 100),
    estimationUncertainty: Math.round(avgUncertainty),
    hasHighUnderestimationRisk: highRiskFoods.length > 0,
    highRiskFoodCount: highRiskFoods.length,
    dailyStatsReliability: reliability
  }
})

const recalcFoodItemNutrition = (item: AdjustedFoodItem) => {
  const effectiveGrams = item.adjustedGrams * item.thicknessFactor
  const gramFactor = effectiveGrams / 100
  const uncertaintyFactor = item.portionUncertainty / 100
  item.adjustedCalories = Math.round(item.caloriesPer100g * gramFactor)
  item.adjustedProtein = Math.round(item.proteinPer100g * gramFactor * 10) / 10
  item.adjustedCarbs = Math.round(item.carbsPer100g * gramFactor * 10) / 10
  item.adjustedFat = Math.round(item.fatPer100g * gramFactor * 10) / 10
  item.adjustedCaloriesMin = Math.max(1, Math.round(item.adjustedCalories * (1 - uncertaintyFactor)))
  item.adjustedCaloriesMax = Math.round(item.adjustedCalories * (1 + uncertaintyFactor))
}

const updateFoodItemFromGrams = (id: string) => {
  const item = adjustedFoodItems.value.find(i => i.id === id)
  if (!item) return
  recalcFoodItemNutrition(item)
}

const updateFoodItemFromThickness = (id: string) => {
  const item = adjustedFoodItems.value.find(i => i.id === id)
  if (!item) return
  recalcFoodItemNutrition(item)
}

const parsePresetGrams = (hint: string): number | null => {
  const match = hint.match(/(\d+)\s*g/)
  return match ? parseInt(match[1], 10) : null
}

const applyPresetHint = (id: string, hint: string) => {
  const item = adjustedFoodItems.value.find(i => i.id === id)
  if (!item) return
  const grams = parsePresetGrams(hint)
  if (grams) {
    item.adjustedGrams = grams
    recalcFoodItemNutrition(item)
    ElMessage.success(`已应用预设：${hint}`)
  }
}

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
  adjustedFoodItems.value = initAdjustedFoodItems(h.result.foodItems)
  ElMessage.success('已加载历史记录，可手动调节份量')
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
  adjustedFoodItems.value = []
  try {
    const { data } = await foodCalorieApi.recognize({
      imageBase64: imageBase64.value,
      dietGoal: form.dietGoal,
      mealType: form.mealType,
      extraNote: form.extraNote || undefined,
      qualityHints: getQualityHints(),
      referenceObject: form.referenceObject
    })
    recognitionResult.value = data
    resultReady.value = true
    adjustedFoodItems.value = initAdjustedFoodItems(data.foodItems)

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      totalCalories: adjustedNutrition.value.totalCalories,
      dietGoalLabel: DIET_GOAL_LABEL_MAP[form.dietGoal] || '',
      result: data
    })
    saveHistory()

    ElMessage.success('识别完成，可手动调节份量获取更准确结果')
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
.disclaimer-card,
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

.ref-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.ref-hint {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}

.food-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.portion-tip-bar {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 14px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #906b0f;
  line-height: 1.5;
}

.food-calories-main {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.food-calories-range {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.food-calories {
  display: flex;
  align-items: center;
  gap: 4px;
}

.food-calories-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.portion-control-section {
  margin: 12px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.portion-control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.portion-control-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.portion-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.portion-slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.portion-slider {
  flex: 1;
}

.portion-grams-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.portion-compare-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.portion-original {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
}

.portion-per-100g {
  color: #909399;
}

.calories-range {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin: 6px 0;
  flex-wrap: wrap;
}

.uncertainty-tag {
  margin-left: 4px;
}

.disclaimer-card {
  margin-bottom: 20px;
}

.disclaimer-alert {
  margin: 0;
}

.disclaimer-list {
  margin: 8px 0 0 0;
  padding-left: 0;
  list-style: none;
}

.disclaimer-list li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.disclaimer-list li strong {
  color: #303133;
}

.disclaimer-alert :deep(.el-alert__content) {
  width: 100%;
}

.risk-tag {
  margin-left: 6px;
}

.food-item-card.food-item-high-risk {
  border-color: #fbc4c4;
  background: linear-gradient(to bottom, #fef0f0, #ffffff);
}

.food-risk-alert {
  margin: 8px 0 14px;
}

.food-risk-alert :deep(.el-alert__content) {
  font-size: 13px;
  line-height: 1.6;
}

.asymmetric-range {
  color: #f56c6c;
  font-weight: 500;
}

.asymmetry-tag {
  margin-left: 6px;
  font-weight: 500;
}

.portion-preset-hints {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.preset-hint-label {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.thickness-control-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #e4e7ed;
}

.thickness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.thickness-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.thickness-value {
  font-size: 14px;
  font-weight: 700;
  color: #e6a23c;
}

.thickness-slider {
  margin: 4px 0;
}

.thickness-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.6;
}

.thickness-hint :deep(.el-tag) {
  margin-right: 4px;
}

.effective-weight {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fdf6ec;
  border-radius: 4px;
  font-size: 13px;
  color: #906b0f;
}

.effective-weight b {
  color: #b88230;
  font-size: 15px;
  margin: 0 4px;
}

.calories-reliability {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
  flex-wrap: wrap;
}

.reliability-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.reliability-hint {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 500;
}
</style>
