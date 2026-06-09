<template>
  <div class="outfit-recognition">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#eb2f96">
            <CameraFilled />
          </el-icon>
          <span>拍照识别穿搭</span>
          <el-tag size="small" type="danger" class="header-tag">AI 智能识别 · 穿搭建议 · 款式推荐</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="上传/拍照" description="上传服装单品、整套搭配或街拍图片" />
          <el-step title="智能识别" description="AI 自动识别衣物类别、颜色、风格特征" />
          <el-step title="穿搭建议" description="获取搭配方案、同款推荐和购物建议" />
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
              <span>上传穿搭图片</span>
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
                <el-button type="warning" size="small" @click.stop="openCropModal">
                  <el-icon><Crop /></el-icon>
                  裁剪单品
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

          <div v-if="imagePreview && colorAnalysisReady" class="color-analysis-section">
            <el-divider content-position="left">
              <span class="divider-label">
                <el-icon :size="14"><DataAnalysis /></el-icon>
                图片主色调分析
              </span>
            </el-divider>
            <div class="color-swatches-row">
              <div
                v-for="(c, idx) in autoColorAnalysis"
                :key="idx"
                class="color-swatch-large"
                :style="{ background: c.hex }"
                :title="`${c.hex} - ${c.name} (${c.ratio}%)`"
              >
                <span class="color-swatch-label">{{ c.name }}</span>
                <span class="color-swatch-ratio">{{ c.ratio }}%</span>
              </div>
            </div>
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
                <div class="composition-item">
                  <el-icon :size="16" :color="compositionData.hasUiElements ? '#e6a23c' : '#67c23a'">
                    <component :is="compositionData.hasUiElements ? WarningFilled : CircleCheckFilled" />
                  </el-icon>
                  <span class="composition-label">UI 元素</span>
                  <el-tag
                    size="small"
                    :type="compositionData.hasUiElements ? 'warning' : 'success'"
                    effect="plain"
                  >{{ compositionData.hasUiElements ? '检测到界面元素' : '无干扰' }}</el-tag>
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
                <div class="composition-warning-actions">
                  <el-button type="primary" size="small" @click="openCropModal">
                    <el-icon><Crop /></el-icon>
                    框选单品区域
                  </el-button>
                  <el-button type="warning" size="small" @click="triggerFileInput">
                    <el-icon><Upload /></el-icon>
                    重新上传原图
                  </el-button>
                </div>
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
              <el-tag size="small" type="success" effect="light">高质量图片 = 更精准推荐</el-tag>
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
                    衣物平铺或挂起，保持平整
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    正面居中拍摄，完整展示单品
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    纯色或简洁背景，减少干扰
                  </li>
                  <li>
                    <el-icon><Check /></el-icon>
                    整套穿搭拍全身照，比例协调
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
                    衣物褶皱、堆放杂乱
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    角度倾斜、只拍到局部
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    背景复杂、杂物过多
                  </li>
                  <li>
                    <el-icon><Close /></el-icon>
                    模糊、抖动、网购截图
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
              <el-tag size="small" type="warning">设置越精准，建议越贴合</el-tag>
            </div>
          </template>

          <el-form label-position="top" class="config-form">
            <el-form-item label="穿搭场景">
              <el-radio-group v-model="form.sceneType">
                <el-radio-button value="daily">
                  <el-icon><Sunny /></el-icon>
                  日常
                </el-radio-button>
                <el-radio-button value="work">
                  <el-icon><OfficeBuilding /></el-icon>
                  职场
                </el-radio-button>
                <el-radio-button value="date">
                  <el-icon><Cherry /></el-icon>
                  约会
                </el-radio-button>
                <el-radio-button value="party">
                  <el-icon><ChampagneCup /></el-icon>
                  派对
                </el-radio-button>
                <el-radio-button value="travel">
                  <el-icon><Aim /></el-icon>
                  旅行
                </el-radio-button>
                <el-radio-button value="sport">
                  <el-icon><Basketball /></el-icon>
                  运动
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="性别偏好">
              <el-radio-group v-model="form.userGender">
                <el-radio-button value="female">女装</el-radio-button>
                <el-radio-button value="male">男装</el-radio-button>
                <el-radio-button value="unisex">中性/不限</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="补充说明（可选）">
              <el-input
                v-model="form.extraNote"
                type="textarea"
                :rows="2"
                placeholder="例如：我想穿去下周的面试、这是我新买的大衣不知道怎么搭、想要模仿某明星的穿搭风格等"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-button
              type="danger"
              size="large"
              class="recognize-btn"
              :loading="isRecognizing"
              :disabled="!imageBase64"
              @click="recognizeOutfit"
            >
              <el-icon v-if="!isRecognizing"><MagicStick /></el-icon>
              {{ isRecognizing ? 'AI 正在识别穿搭...' : '开始识别穿搭' }}
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
                <p class="history-style">{{ h.mainStyle || '未识别' }}</p>
                <p class="history-meta">{{ h.sceneLabel || '日常场景' }}</p>
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
                  {{ recognitionResult.overallConfidence < 50 ? '置信度较低，建议重新上传更清晰的单品图片以获得更准确的结果' : '置信度一般，可考虑重新拍摄或裁剪图片以提升识别准确度' }}
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

          <el-card class="style-analysis-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#722ed1">
                  <DataAnalysis />
                </el-icon>
                <span>整体风格分析</span>
              </div>
            </template>

            <div class="style-overview">
              <div class="style-main-tag">
                <el-tag size="large" type="danger" effect="dark">{{ recognitionResult.overallStyle.mainStyle }}风</el-tag>
              </div>
              <div class="style-sub-tags">
                <el-tag
                  v-for="(s, idx) in recognitionResult.overallStyle.subStyles"
                  :key="idx"
                  size="default"
                  effect="plain"
                  class="sub-tag"
                >{{ s }}</el-tag>
              </div>
            </div>

            <div class="style-meta-grid">
              <div class="meta-item">
                <el-icon :size="16" color="#e6a23c"><Calendar /></el-icon>
                <span class="meta-label">适用季节</span>
                <span class="meta-value">{{ recognitionResult.overallStyle.seasonTag }}</span>
              </div>
              <div class="meta-item">
                <el-icon :size="16" color="#165DFF"><Medal /></el-icon>
                <span class="meta-label">正式程度</span>
                <span class="meta-value">{{ recognitionResult.overallStyle.formalityLevel }}</span>
              </div>
            </div>

            <el-divider content-position="left">
              <span class="divider-label">色彩搭配</span>
            </el-divider>
            <div class="palette-row">
              <div
                v-for="(c, idx) in recognitionResult.overallStyle.colorPalette"
                :key="idx"
                class="palette-item"
              >
                <div class="palette-color" :style="{ background: c.hex, width: c.ratio + '%' }"></div>
                <div class="palette-info">
                  <span class="palette-name">{{ c.color }}</span>
                  <span class="palette-ratio">{{ c.ratio }}%</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="items-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#165DFF">
                  <Goods />
                </el-icon>
                <span>识别到的单品</span>
                <el-tag size="small" type="primary">共 {{ recognitionResult.clothingItems.length }} 件</el-tag>
              </div>
            </template>
            <div class="items-grid">
              <div
                v-for="item in recognitionResult.clothingItems"
                :key="item.id"
                class="item-card"
              >
                <div class="item-header">
                  <div class="item-color-dot" :style="{ background: item.colorHex }"></div>
                  <span class="item-name">{{ item.color }}{{ item.subCategory }}</span>
                  <el-tag size="small" type="success" class="confidence-tag">
                    {{ item.confidence }}%
                  </el-tag>
                </div>
                <div class="item-meta">
                  <span class="item-category">{{ item.category }}</span>
                  <span class="item-material">{{ item.material }}</span>
                </div>
                <div class="item-tags">
                  <el-tag
                    v-for="(tag, idx) in item.style"
                    :key="idx"
                    size="small"
                    effect="plain"
                  >{{ tag }}</el-tag>
                  <el-tag
                    v-for="(s, idx) in item.season"
                    :key="'s'+idx"
                    size="small"
                    type="warning"
                    effect="plain"
                  >{{ s }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="suggestions-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#67c23a">
                  <MagicStick />
                </el-icon>
                <span>穿搭搭配建议</span>
              </div>
            </template>
            <div class="suggestions-list">
              <div
                v-for="(sug, idx) in recognitionResult.suggestions"
                :key="sug.id"
                class="suggestion-card"
              >
                <div class="suggestion-header">
                  <el-tag size="default" type="success" effect="dark" class="suggestion-title-tag">
                    {{ idx + 1 }}. {{ sug.title }}
                  </el-tag>
                  <el-tag size="small" type="info">{{ sug.occasion }}</el-tag>
                </div>
                <p class="suggestion-desc">{{ sug.description }}</p>
                <div class="suggestion-items">
                  <el-tag
                    v-for="(item, i) in sug.items"
                    :key="i"
                    size="default"
                    effect="light"
                    type="primary"
                    class="item-tag"
                  >
                    <el-icon><Promotion /></el-icon>
                    {{ item }}
                  </el-tag>
                </div>
                <div class="suggestion-meta">
                  <el-tag size="small" effect="plain" type="warning">
                    配色：{{ sug.colorScheme }}
                  </el-tag>
                  <el-tag size="small" effect="plain" type="danger">
                    氛围：{{ sug.vibe }}
                  </el-tag>
                  <el-tag
                    v-for="(tag, i) in sug.style"
                    :key="i"
                    size="small"
                    effect="plain"
                  >{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="similar-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#eb2f96">
                  <ShoppingCart />
                </el-icon>
                <span>相似款式推荐</span>
              </div>
            </template>
            <div class="similar-list">
              <div
                v-for="sim in recognitionResult.similarStyles"
                :key="sim.id"
                class="similar-item"
              >
                <div class="similar-main">
                  <div class="similar-name">{{ sim.name }}</div>
                  <div class="similar-brand">{{ sim.brand }}</div>
                </div>
                <div class="similar-right">
                  <div class="similar-price">{{ sim.priceRange }}</div>
                  <div class="similar-score">
                    <el-progress
                      :percentage="sim.matchScore"
                      :color="sim.matchScore >= 90 ? '#67c23a' : '#e6a23c'"
                      :show-text="false"
                      :stroke-width="6"
                      style="width: 80px"
                    />
                    <span class="match-label">匹配度 {{ sim.matchScore }}%</span>
                  </div>
                </div>
                <p class="similar-desc">{{ sim.description }}</p>
                <div class="similar-tags">
                  <el-tag
                    v-for="(tag, i) in sim.tags"
                    :key="i"
                    size="small"
                    effect="plain"
                  >{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="tips-card">
            <template #header>
              <div class="card-header small">
                <el-icon :size="18" color="#e6a23c">
                  <Bulb />
                </el-icon>
                <span>穿搭技巧 & 购物建议</span>
              </div>
            </template>
            <el-tabs v-model="activeTipsTab">
              <el-tab-pane label="穿搭技巧" name="styling">
                <el-alert
                  v-for="(tip, idx) in recognitionResult.stylingTips"
                  :key="idx"
                  type="success"
                  :closable="false"
                  show-icon
                  :title="tip"
                  class="tip-alert"
                />
              </el-tab-pane>
              <el-tab-pane label="购物建议" name="shopping">
                <el-alert
                  v-for="(tip, idx) in recognitionResult.shoppingTips"
                  :key="idx"
                  type="warning"
                  :closable="false"
                  show-icon
                  :title="tip"
                  class="tip-alert"
                />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </template>

        <el-card v-else class="empty-result-card">
          <div class="empty-state">
            <el-icon :size="64" color="#c0c4cc"><ShoppingBag /></el-icon>
            <p class="empty-text">上传穿搭图片后开始识别</p>
            <p class="empty-hint">AI 将为你分析单品、推荐搭配、提供同款购物建议</p>
            <div class="feature-hints">
              <el-tag size="small" effect="plain">
                <el-icon><Camera /></el-icon>
                支持拍照上传
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Goods /></el-icon>
                识别衣物类别
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Brush /></el-icon>
                分析色彩风格
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><MagicStick /></el-icon>
                智能搭配建议
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><ShoppingCart /></el-icon>
                相似款式推荐
              </el-tag>
              <el-tag size="small" effect="plain">
                <el-icon><Bulb /></el-icon>
                穿搭技巧指导
              </el-tag>
            </div>
            <div class="example-tips">
              <h4 class="example-title">你可以尝试识别：</h4>
              <el-row :gutter="10">
                <el-col :span="8">
                  <div class="example-item">
                    <el-icon :size="24" color="#eb2f96"><Tshirt /></el-icon>
                    <span>单件服装</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="example-item">
                    <el-icon :size="24" color="#722ed1"><User /></el-icon>
                    <span>整套搭配</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="example-item">
                    <el-icon :size="24" color="#165DFF"><Picture /></el-icon>
                    <span>街拍/明星造型</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showCropModal"
      title="框选单品区域 · 提升识别准确率"
      width="680px"
      :close-on-click-modal="false"
      class="crop-dialog"
    >
      <div class="crop-instruction">
        <el-icon :size="16" color="#e6a23c"><WarningFilled /></el-icon>
        <span>拖动并调整下方矩形框，精确框选你要识别的衣物主体（排除文字、价格、其他角度图片等干扰元素）</span>
      </div>
      <div
        class="crop-container"
        ref="cropContainerRef"
        @mousedown="startCropDrag"
        @mousemove="onCropDrag"
        @mouseup="endCropDrag"
        @mouseleave="endCropDrag"
      >
        <img :src="cropImageSrc" alt="裁剪图片" class="crop-image" ref="cropImageRef" />
        <div
          v-if="cropRect.width > 0 && cropRect.height > 0"
          class="crop-selection"
          :style="cropRectStyle"
          @mousedown.stop="startResize"
        >
          <div class="crop-handle nw" data-dir="nw"></div>
          <div class="crop-handle ne" data-dir="ne"></div>
          <div class="crop-handle sw" data-dir="sw"></div>
          <div class="crop-handle se" data-dir="se"></div>
          <div class="crop-handle n" data-dir="n"></div>
          <div class="crop-handle s" data-dir="s"></div>
          <div class="crop-handle e" data-dir="e"></div>
          <div class="crop-handle w" data-dir="w"></div>
        </div>
      </div>
      <div class="crop-hint-row">
        <el-tag size="small" type="info">提示：双击图片可快速全选；调整四角手柄可精确裁剪</el-tag>
        <el-button size="small" plain @click="resetCropRect">
          <el-icon><Refresh /></el-icon>
          重置选区
        </el-button>
      </div>
      <template #footer>
        <el-button @click="showCropModal = false">取消</el-button>
        <el-button type="primary" @click="applyCrop">
          <el-icon><Check /></el-icon>
          确认裁剪并重新分析
        </el-button>
      </template>
    </el-dialog>
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
  Sunny,
  OfficeBuilding,
  Cherry,
  ChampagneCup,
  Aim,
  Basketball,
  Goods,
  ShoppingCart,
  ShoppingBag,
  Promotion,
  Medal,
  Calendar,
  Brush,
  User,
  Tshirt,
  Picture,
  Bulb,
  Close,
  WarningFilled,
  Check,
  CircleCheckFilled,
  CircleCloseFilled,
  Monitor,
  Crop,
  Grid
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  outfitRecognitionApi,
  type OutfitRecognitionResponse,
  type ImageQualityHints
} from '@/api/outfitRecognition'

const HISTORY_KEY = 'outfit_recognition_history'
const SCENE_LABEL_MAP: Record<string, string> = {
  daily: '日常',
  work: '职场',
  date: '约会',
  party: '派对',
  travel: '旅行',
  sport: '运动'
}

interface AutoColorItem {
  hex: string
  name: string
  ratio: number
}

interface HistoryItem {
  timestamp: number
  imagePreview: string
  mainStyle: string
  sceneLabel: string
  result: OutfitRecognitionResponse
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const isDragging = ref(false)
const imagePreview = ref('')
const imageBase64 = ref('')
const isRecognizing = ref(false)
const colorAnalysisReady = ref(false)
const autoColorAnalysis = ref<AutoColorItem[]>([])
const recognitionResult = ref<OutfitRecognitionResponse | null>(null)
const resultReady = ref(false)
const historyList = ref<HistoryItem[]>([])
const showCamera = ref(false)
const activeTipsTab = ref('styling')

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

const showCropModal = ref(false)
const cropImageSrc = ref('')
const cropContainerRef = ref<HTMLDivElement | null>(null)
const cropImageRef = ref<HTMLImageElement | null>(null)
const cropRect = reactive({ x: 0, y: 0, width: 0, height: 0 })
const cropImageNaturalSize = reactive({ width: 0, height: 0 })
const cropDragState = reactive({
  active: false,
  mode: 'create' as 'create' | 'move' | 'resize',
  startX: 0,
  startY: 0,
  origX: 0,
  origY: 0,
  origW: 0,
  origH: 0,
  resizeDir: ''
})

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

const cropRectStyle = computed(() => ({
  left: cropRect.x + 'px',
  top: cropRect.y + 'px',
  width: cropRect.width + 'px',
  height: cropRect.height + 'px'
}))

let mediaStream: MediaStream | null = null

const form = reactive({
  sceneType: 'daily' as 'daily' | 'work' | 'date' | 'party' | 'travel' | 'sport',
  userGender: 'unisex' as 'male' | 'female' | 'unisex',
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
  colorAnalysisReady.value = true
  if (h.result) {
    autoColorAnalysis.value = h.result.overallStyle.colorPalette
  }
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
    warnings.push('图片偏暗，衣物细节可能无法充分识别，建议在光线充足处重新拍摄')
  }
  if (imageQuality.brightnessStatus === 'overexposed') {
    warnings.push('图片过亮（过曝），颜色和纹理可能失真，建议避免逆光或强光直射')
  }
  if (imageQuality.contrast < 40) {
    warnings.push('图片对比度偏低，衣物与背景区分不明显，建议使用纯色背景并调整光线')
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
  const textEdgeThreshold = 30
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
    warnings.push('图片中检测到多角度拼接图，建议使用「裁剪单品」功能只框选要识别的那件衣服')
  }
  if (compositionData.isScreenshot) {
    warnings.push('疑似网购详情页截图，包含价格、文字、UI 元素，建议使用服装原图或裁剪主体区域')
  }
  if (compositionData.textDensity > 35) {
    warnings.push(`文字区域占比较高（约 ${compositionData.textDensity}%），建议裁剪去除文字后再识别`)
  }
  compositionWarnings.value = warnings
  compositionAnalysisReady.value = true
}

const openCropModal = async () => {
  if (!imagePreview.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  cropImageSrc.value = imagePreview.value
  showCropModal.value = true
  await nextTick()
  resetCropRect()
}

const resetCropRect = async () => {
  await nextTick()
  const imgEl = cropImageRef.value
  const containerEl = cropContainerRef.value
  if (!imgEl || !containerEl) return
  cropImageNaturalSize.width = imgEl.naturalWidth
  cropImageNaturalSize.height = imgEl.naturalHeight
  const dispW = imgEl.clientWidth
  const dispH = imgEl.clientHeight
  cropRect.x = Math.floor(dispW * 0.1)
  cropRect.y = Math.floor(dispH * 0.1)
  cropRect.width = Math.floor(dispW * 0.8)
  cropRect.height = Math.floor(dispH * 0.8)
}

const startCropDrag = (e: MouseEvent) => {
  if (!cropContainerRef.value) return
  const rect = cropContainerRef.value.getBoundingClientRect()
  cropDragState.active = true
  cropDragState.mode = 'create'
  cropDragState.startX = e.clientX - rect.left
  cropDragState.startY = e.clientY - rect.top
  cropRect.x = cropDragState.startX
  cropRect.y = cropDragState.startY
  cropRect.width = 0
  cropRect.height = 0
}

const onCropDrag = (e: MouseEvent) => {
  if (!cropDragState.active || !cropContainerRef.value) return
  const rect = cropContainerRef.value.getBoundingClientRect()
  const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
  const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top))

  if (cropDragState.mode === 'create') {
    cropRect.x = Math.min(cropDragState.startX, curX)
    cropRect.y = Math.min(cropDragState.startY, curY)
    cropRect.width = Math.abs(curX - cropDragState.startX)
    cropRect.height = Math.abs(curY - cropDragState.startY)
  } else if (cropDragState.mode === 'move') {
    const dx = curX - cropDragState.startX
    const dy = curY - cropDragState.startY
    let newX = cropDragState.origX + dx
    let newY = cropDragState.origY + dy
    newX = Math.max(0, Math.min(rect.width - cropRect.width, newX))
    newY = Math.max(0, Math.min(rect.height - cropRect.height, newY))
    cropRect.x = newX
    cropRect.y = newY
  } else if (cropDragState.mode === 'resize') {
    const dir = cropDragState.resizeDir
    let x = cropDragState.origX
    let y = cropDragState.origY
    let w = cropDragState.origW
    let h = cropDragState.origH
    const dx = curX - cropDragState.startX
    const dy = curY - cropDragState.startY
    if (dir.includes('e')) w = Math.max(20, cropDragState.origW + dx)
    if (dir.includes('s')) h = Math.max(20, cropDragState.origH + dy)
    if (dir.includes('w')) {
      const newW = Math.max(20, cropDragState.origW - dx)
      x = cropDragState.origX + (cropDragState.origW - newW)
      w = newW
    }
    if (dir.includes('n')) {
      const newH = Math.max(20, cropDragState.origH - dy)
      y = cropDragState.origY + (cropDragState.origH - newH)
      h = newH
    }
    x = Math.max(0, x)
    y = Math.max(0, y)
    if (x + w > rect.width) w = rect.width - x
    if (y + h > rect.height) h = rect.height - y
    cropRect.x = x
    cropRect.y = y
    cropRect.width = w
    cropRect.height = h
  }
}

const endCropDrag = () => {
  cropDragState.active = false
}

const startResize = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const dir = target.dataset.dir || ''
  if (!dir) {
    cropDragState.mode = 'move'
  } else {
    cropDragState.mode = 'resize'
    cropDragState.resizeDir = dir
  }
  if (!cropContainerRef.value) return
  const rect = cropContainerRef.value.getBoundingClientRect()
  cropDragState.active = true
  cropDragState.startX = e.clientX - rect.left
  cropDragState.startY = e.clientY - rect.top
  cropDragState.origX = cropRect.x
  cropDragState.origY = cropRect.y
  cropDragState.origW = cropRect.width
  cropDragState.origH = cropRect.height
  e.stopPropagation()
}

const applyCrop = () => {
  if (cropRect.width < 20 || cropRect.height < 20) {
    ElMessage.warning('请框选有效区域')
    return
  }
  const imgEl = cropImageRef.value
  if (!imgEl) return
  const scaleX = imgEl.naturalWidth / imgEl.clientWidth
  const scaleY = imgEl.naturalHeight / imgEl.clientHeight
  const sx = cropRect.x * scaleX
  const sy = cropRect.y * scaleY
  const sw = cropRect.width * scaleX
  const sh = cropRect.height * scaleY

  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  imagePreview.value = dataUrl
  imageBase64.value = dataUrl.split(',')[1] || dataUrl
  recognitionResult.value = null
  resultReady.value = false
  qualityAnalysisReady.value = false
  compositionAnalysisReady.value = false
  qualityIgnored.value = false
  showCropModal.value = false
  analyzeImageWithCanvas(dataUrl)
  ElMessage.success('裁剪完成，已重新分析图片质量')
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

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const maxSize = 100
      const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight)
      canvas.width = Math.floor(originalWidth * scale)
      canvas.height = Math.floor(originalHeight * scale)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {}

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]
        if (a < 125) continue

        const bucketKey = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`
        if (!colorBuckets[bucketKey]) {
          colorBuckets[bucketKey] = { r, g, b, count: 0 }
        }
        colorBuckets[bucketKey].count++
      }

      const pixelCount = pixels.length / 4
      const sortedBuckets = Object.entries(colorBuckets)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 4)

      const colorNameMap: Record<string, string> = {
        '0-0-0': '纯黑', '7-7-7': '纯白', '3-3-3': '深灰', '5-5-5': '浅灰',
        '6-1-1': '深红', '7-3-3': '红色', '7-5-5': '浅红', '7-6-6': '粉红',
        '1-6-1': '深绿', '3-7-3': '绿色', '5-7-5': '浅绿', '6-7-6': '薄荷绿',
        '1-1-6': '深蓝', '3-3-7': '蓝色', '5-5-7': '浅蓝', '6-6-7': '雾霾蓝',
        '7-6-1': '焦糖色', '7-7-1': '明黄色', '5-7-1': '黄绿色', '1-7-5': '青绿色',
        '1-6-7': '青色', '5-1-7': '薰衣草紫', '7-1-5': '珊瑚橘', '7-4-1': '橘色',
        '4-3-2': '卡其色', '2-3-4': '牛仔蓝', '2-2-1': '军绿色'
      }

      autoColorAnalysis.value = sortedBuckets.map(([key, data]) => {
        const [rB, gB, bB] = key.split('-').map(Number)
        const hex = '#' + [data.r, data.g, data.b]
          .map(v => Math.min(v, 255).toString(16).padStart(2, '0')).join('')
        const name = colorNameMap[key] || `${rB > 4 ? '浅' : '深'}色调`
        return { hex, name, ratio: Math.round((data.count / pixelCount) * 100) }
      })
      colorAnalysisReady.value = true
    } catch (e) {
      console.warn('Image analysis failed:', e)
      colorAnalysisReady.value = false
      qualityAnalysisReady.value = false
    }
  }
  img.src = dataUrl
}

const removeImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  colorAnalysisReady.value = false
  autoColorAnalysis.value = []
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

const recognizeOutfit = async () => {
  if (!imageBase64.value) {
    ElMessage.warning('请先上传穿搭图片')
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
      contrast: imageQuality.contrast
    }

    const response = await outfitRecognitionApi.recognize({
      imageBase64: imageBase64.value,
      sceneType: form.sceneType,
      userGender: form.userGender,
      extraNote: form.extraNote || undefined,
      qualityHints
    })

    recognitionResult.value = response.data
    resultReady.value = true

    historyList.value.unshift({
      timestamp: Date.now(),
      imagePreview: imagePreview.value,
      mainStyle: response.data.overallStyle.mainStyle,
      sceneLabel: SCENE_LABEL_MAP[form.sceneType] || '日常',
      result: JSON.parse(JSON.stringify(response.data))
    })
    saveHistory()

    ElMessage.success('识别成功！已为你生成穿搭建议')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '识别失败，请稍后重试')
  } finally {
    isRecognizing.value = false
  }
}
</script>

<style scoped>
.outfit-recognition {
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
.history-card,
.style-analysis-card,
.items-card,
.suggestions-card,
.similar-card,
.tips-card,
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
  border-color: #eb2f96;
  background-color: #fef0f6;
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

.color-analysis-section {
  margin-top: 4px;
}

.color-swatches-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch-large {
  min-width: 80px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 4px 8px;
}

.color-swatch-label {
  font-size: 12px;
}

.color-swatch-ratio {
  font-size: 11px;
  opacity: 0.9;
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

.feature-hints .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.example-tips {
  margin-top: 20px;
  text-align: left;
}

.example-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.example-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;
}

.example-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
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
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.history-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.history-style {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin: 0;
}

.history-meta {
  font-size: 12px;
  color: #606266;
  margin: 0;
}

.style-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.style-main-tag :deep(.el-tag) {
  font-size: 18px;
  padding: 8px 20px;
  height: auto;
  border-radius: 24px;
}

.style-sub-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-tag {
  margin: 0;
}

.style-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.meta-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 13px;
  color: #909399;
}

.meta-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-left: auto;
}

.palette-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-item {
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.palette-color {
  height: 28px;
  border-radius: 8px 8px 0 0;
  min-width: 10%;
}

.palette-info {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.palette-name {
  color: #303133;
  font-weight: 500;
}

.palette-ratio {
  color: #909399;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.item-card {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s;
}

.item-card:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.item-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.confidence-tag {
  margin-left: auto;
}

.item-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #606266;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-card {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e0 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #c2e7b0;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.suggestion-title-tag :deep(.el-tag) {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  height: auto;
}

.suggestion-desc {
  font-size: 13px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.suggestion-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.item-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.suggestion-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px dashed #c2e7b0;
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.similar-item {
  background: #fef0f6;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #fbc4d9;
}

.similar-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
  flex-wrap: wrap;
  gap: 8px;
}

.similar-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.similar-brand {
  font-size: 12px;
  color: #eb2f96;
  font-weight: 500;
  width: 100%;
}

.similar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.similar-price {
  font-size: 15px;
  font-weight: 600;
  color: #eb2f96;
}

.similar-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-label {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.similar-desc {
  font-size: 13px;
  color: #606266;
  margin: 8px 0;
  line-height: 1.5;
}

.similar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tip-alert {
  margin-bottom: 10px;
}

.tip-alert:last-child {
  margin-bottom: 0;
}

.photo-guide-card {
  margin-bottom: 20px;
}

.guide-column {
  border-radius: 10px;
  padding: 14px;
}

.guide-column.good {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border: 1px solid #c2e7b0;
}

.guide-column.bad {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 1px solid #fbc4c4;
}

.guide-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.guide-title.good {
  color: #529b2e;
}

.guide-title.bad {
  color: #f56c6c;
}

.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guide-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.guide-list li :deep(.el-icon) {
  flex-shrink: 0;
}

.guide-column.good li :deep(.el-icon) {
  color: #67c23a;
}

.guide-column.bad li :deep(.el-icon) {
  color: #f56c6c;
}

.quality-section {
  margin-top: 4px;
}

.quality-warning {
  margin-bottom: 16px;
  border-radius: 10px;
}

.quality-warning-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
}

.quality-warning-list {
  margin: 8px 0 12px 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quality-warning-list li {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.quality-warning-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quality-metric {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.confidence-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.confidence-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.confidence-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.confidence-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 2px;
}

.confidence-subtitle {
  font-size: 13px;
  color: #64748b;
}

.confidence-score-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.confidence-ring {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.confidence-ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 12;
}

.confidence-ring-fg {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.confidence-ring-text {
  font-size: 28px;
  font-weight: 700;
  fill: #1e293b;
  dominant-baseline: middle;
  text-anchor: middle;
}

.confidence-ring-label {
  font-size: 11px;
  fill: #94a3b8;
  dominant-baseline: middle;
  text-anchor: middle;
}

.confidence-details {
  flex: 1;
}

.confidence-warnings {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(186, 230, 253, 0.6);
}

.confidence-warning-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  padding: 4px 0;
}

.confidence-warning-item :deep(.el-icon) {
  margin-top: 2px;
  flex-shrink: 0;
}

.composition-section {
  background: #fef7f0;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.composition-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #c2410c;
  margin-bottom: 12px;
}

.composition-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.composition-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  padding: 8px 12px;
}

.composition-metric-label {
  font-size: 12px;
  color: #9a3412;
}

.composition-metric-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.composition-warnings {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(254, 215, 170, 0.6);
}

.composition-warning-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #9a3412;
  padding: 4px 0;
}

.crop-btn {
  margin-left: 8px;
}

:deep(.crop-dialog) .el-dialog__body {
  padding: 16px;
}

.crop-tip {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  text-align: center;
}

.crop-image-container {
  position: relative;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  cursor: crosshair;
  user-select: none;
}

.crop-image {
  max-width: 100%;
  max-height: 500px;
  display: block;
  pointer-events: none;
  user-select: none;
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.crop-mask {
  position: absolute;
  background: rgba(0, 0, 0, 0.55);
}

.crop-rect {
  position: absolute;
  border: 2px solid #409eff;
  box-sizing: content-box;
  cursor: move;
  pointer-events: auto;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 50%;
  z-index: 10;
}

.crop-handle.nw { top: -7px; left: -7px; cursor: nw-resize; }
.crop-handle.n  { top: -7px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.crop-handle.ne { top: -7px; right: -7px; cursor: ne-resize; }
.crop-handle.e  { top: 50%; right: -7px; transform: translateY(-50%); cursor: e-resize; }
.crop-handle.se { bottom: -7px; right: -7px; cursor: se-resize; }
.crop-handle.s  { bottom: -7px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.crop-handle.sw { bottom: -7px; left: -7px; cursor: sw-resize; }
.crop-handle.w  { top: 50%; left: -7px; transform: translateY(-50%); cursor: w-resize; }

.crop-footer {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.crop-footer-info {
  font-size: 12px;
  color: #94a3b8;
}
</style>
