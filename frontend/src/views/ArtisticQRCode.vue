<template>
  <div class="artistic-qrcode">
    <el-card class="dpi-alert-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="22" color="#e6a23c">
            <Warning />
          </el-icon>
          <span>📐 输出分辨率与尺寸说明（下载前请务必阅读）</span>
          <el-button
            size="small"
            text
            type="primary"
            :icon="QuestionFilled"
            @click="showDpiGuide = true"
            style="margin-left: auto"
          >
            什么是DPI？
          </el-button>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="dpi-info-item">
            <div class="dpi-icon" style="background: #e1f3d8">
              <el-icon color="#67c23a"><Monitor /></el-icon>
            </div>
            <div class="dpi-info-content">
              <div class="dpi-info-title">屏幕显示 / 社交媒体</div>
              <div class="dpi-info-desc">推荐 <strong>72 DPI</strong>，像素≥500px 即可</div>
              <div class="dpi-info-tag">微信/朋友圈/网页/PPT</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="dpi-info-item">
            <div class="dpi-icon" style="background: #d9ecff">
              <el-icon color="#165DFF"><Document /></el-icon>
            </div>
            <div class="dpi-info-content">
              <div class="dpi-info-title">普通印刷 / 名片宣传单</div>
              <div class="dpi-info-desc">推荐 <strong>150 DPI</strong>，物理尺寸≥3cm</div>
              <div class="dpi-info-tag">名片/海报/传单/展架</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="dpi-info-item">
            <div class="dpi-icon" style="background: #fde2e2">
              <el-icon color="#f56c6c"><Printer /></el-icon>
            </div>
            <div class="dpi-info-content">
              <div class="dpi-info-title">高清印刷 / 出版级品质</div>
              <div class="dpi-info-desc">推荐 <strong>300 DPI</strong>，印刷厂标准要求</div>
              <div class="dpi-info-tag">画册/包装/户外广告/杂志</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <InfoFilled />
          </el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <el-steps :active="0" finish-status="wait" simple class="guide-steps">
        <el-step title="选择输出规格" description="根据用途选择DPI和物理尺寸预设" />
        <el-step title="输入内容" description="输入URL链接或任意文字内容" />
        <el-step title="选择风格" description="选择艺术风格或自定义参数" />
        <el-step title="确认后下载" description="核对输出参数后一键下载高清PNG" />
      </el-steps>
    </el-card>

    <el-row :gutter="24">
      <el-col :span="9">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#e6a23c">
                <ScaleToOriginal />
              </el-icon>
              <span>输出规格（DPI / 尺寸）</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="画布比例">
              <div class="ratio-buttons">
                <el-button
                  v-for="r in canvasRatioPresets"
                  :key="r.id"
                  size="small"
                  :type="canvasRatio === r.id ? 'primary' : 'default'"
                  @click="selectCanvasRatio(r.id)"
                >
                  <span class="ratio-label">{{ r.label }}</span>
                  <span class="ratio-sub">{{ r.desc }}</span>
                </el-button>
              </div>
              <div v-if="canvasRatio === 'custom'" class="custom-ratio-input">
                <el-input-number v-model="customRatioW" :min="1" :max="100" size="small" controls-position="right" @change="updateCustomRatio" />
                <span class="ratio-colon">:</span>
                <el-input-number v-model="customRatioH" :min="1" :max="100" size="small" controls-position="right" @change="updateCustomRatio" />
              </div>
              <div class="form-hint">
                <el-tag size="small" type="info" effect="light">
                  当前：{{ canvasRatioLabel }} · 画布将按此比例输出
                </el-tag>
              </div>
            </el-form-item>
            <el-form-item label="用途预设">
              <el-select v-model="selectedPreset" placeholder="选择用途" @change="applyPreset">
                <el-option
                  v-for="p in sizePresets"
                  :key="p.id"
                  :label="p.name"
                  :value="p.id"
                >
                  <div class="preset-option">
                    <span class="preset-name">{{ p.name }}</span>
                    <span class="preset-spec">{{ p.dpi }} DPI · {{ p.sizeMm }}</span>
                  </div>
                </el-option>
              </el-select>
              <div class="form-hint">选择预设会自动设置DPI、像素和物理尺寸</div>
            </el-form-item>
            <el-form-item label="输出DPI">
              <el-radio-group v-model="outputDpi" @change="onDpiChange">
                <el-radio-button :value="72">72</el-radio-button>
                <el-radio-button :value="96">96</el-radio-button>
                <el-radio-button :value="150">150</el-radio-button>
                <el-radio-button :value="200">200</el-radio-button>
                <el-radio-button :value="300">300</el-radio-button>
              </el-radio-group>
              <div class="dpi-hint">
                <el-tag
                  size="small"
                  :type="outputDpi >= 300 ? 'danger' : outputDpi >= 150 ? 'warning' : 'success'"
                  effect="light"
                >
                  {{ dpiLevelText }}
                </el-tag>
              </div>
            </el-form-item>
            <el-divider content-position="left">🔲 画布尺寸（最终输出大小）</el-divider>
            <el-form-item label="物理尺寸">
              <div class="canvas-size-row">
                <div class="size-input-group">
                  <span class="size-axis-label">宽</span>
                  <el-input-number
                    v-model="canvasWidthMm"
                    :min="10"
                    :max="1000"
                    :step="5"
                    size="small"
                    controls-position="right"
                    @change="onCanvasSizeMmChange"
                  />
                  <span class="unit-text">mm</span>
                </div>
                <span class="size-mul">×</span>
                <div class="size-input-group">
                  <span class="size-axis-label">高</span>
                  <el-input-number
                    v-model="canvasHeightMm"
                    :min="10"
                    :max="1000"
                    :step="5"
                    size="small"
                    controls-position="right"
                    @change="onCanvasSizeMmChange"
                  />
                  <span class="unit-text">mm</span>
                </div>
              </div>
              <div class="size-convert-line">
                ≈ {{ canvasWidthCm }} cm × {{ canvasHeightCm }} cm
              </div>
            </el-form-item>
            <el-form-item label="像素尺寸">
              <div class="canvas-size-row">
                <div class="size-input-group">
                  <span class="size-axis-label">宽</span>
                  <el-slider
                    v-model="canvasWidthPx"
                    :min="200"
                    :max="4000"
                    :step="50"
                    size="small"
                    @change="onCanvasSizePxChange"
                    style="width: 140px; margin-right: 8px"
                  />
                  <span class="unit-text">{{ canvasWidthPx }}px</span>
                </div>
              </div>
              <div class="canvas-size-row" style="margin-top: 8px">
                <div class="size-input-group">
                  <span class="size-axis-label">高</span>
                  <el-slider
                    v-model="canvasHeightPx"
                    :min="200"
                    :max="4000"
                    :step="50"
                    size="small"
                    @change="onCanvasSizePxChange"
                    style="width: 140px; margin-right: 8px"
                  />
                  <span class="unit-text">{{ canvasHeightPx }}px</span>
                </div>
              </div>
              <div class="size-convert-line">
                对应 {{ canvasWidthMm.toFixed(1) }}mm × {{ canvasHeightMm.toFixed(1) }}mm @ {{ outputDpi }} DPI
              </div>
            </el-form-item>
            <el-divider content-position="left">🔳 二维码在画布中的设置</el-divider>
            <el-form-item label="二维码大小">
              <el-slider
                v-model="qrScalePercent"
                :min="10"
                :max="100"
                show-input
                size="small"
                @change="generateQR"
              />
              <div class="unit-label">占画布较小边的 {{ qrScalePercent }}% · 二维码 {{ qrSize }}×{{ qrSize }} px</div>
            </el-form-item>
            <el-form-item label="画布填充">
              <el-color-picker v-model="canvasBgColor" show-alpha @change="generateQR" />
              <div class="form-hint">画布中二维码以外区域的背景色</div>
            </el-form-item>
            <el-divider content-position="left">📏 常用画布速查</el-divider>
            <div class="quick-size-buttons">
              <el-button
                v-for="qs in quickSizes"
                :key="qs.label"
                size="small"
                @click="setQuickSize(qs)"
              >
                {{ qs.label }}
                <span class="quick-size-sub">{{ qs.sub }}</span>
              </el-button>
            </div>
          </el-form>
        </el-card>

        <el-card class="settings-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#165DFF">
                <Edit />
              </el-icon>
              <span>内容输入</span>
            </div>
          </template>
          <el-form label-width="80px">
            <el-form-item label="二维码内容">
              <el-input
                v-model="qrContent"
                type="textarea"
                :rows="3"
                placeholder="请输入URL或文字内容，例如：https://example.com"
                maxlength="500"
                show-word-limit
                @input="generateQR"
              />
            </el-form-item>
            <el-form-item label="容错等级">
              <el-radio-group v-model="errorLevel" @change="generateQR">
                <el-radio-button value="L">低 7%</el-radio-button>
                <el-radio-button value="M">中 15%</el-radio-button>
                <el-radio-button value="Q">较高 25%</el-radio-button>
                <el-radio-button value="H">高 30%</el-radio-button>
              </el-radio-group>
              <div class="form-hint">
                容错越高越耐磨损，印刷用途或添加Logo时请选择"高"
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="settings-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#722ed1">
                <MagicStick />
              </el-icon>
              <span>艺术风格</span>
            </div>
          </template>
          <div class="style-grid">
            <div
              v-for="style in artStyles"
              :key="style.id"
              class="style-item"
              :class="{ active: currentStyle === style.id }"
              @click="selectStyle(style.id)"
            >
              <div class="style-preview" :style="style.previewStyle"></div>
              <div class="style-name">{{ style.name }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="settings-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#eb2f96">
                <Setting />
              </el-icon>
              <span>自定义参数</span>
            </div>
          </template>
          <el-form label-width="90px">
            <el-form-item label="前景色">
              <el-color-picker v-model="foregroundColor" @change="generateQR" />
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="backgroundColor" show-alpha @change="generateQR" />
            </el-form-item>
            <el-form-item label="渐变效果">
              <el-switch v-model="useGradient" @change="generateQR" />
            </el-form-item>
            <template v-if="useGradient">
              <el-form-item label="渐变色1">
                <el-color-picker v-model="gradientColor1" @change="generateQR" />
              </el-form-item>
              <el-form-item label="渐变色2">
                <el-color-picker v-model="gradientColor2" @change="generateQR" />
              </el-form-item>
              <el-form-item label="渐变方向">
                <el-radio-group v-model="gradientDirection" @change="generateQR">
                  <el-radio-button value="horizontal">水平</el-radio-button>
                  <el-radio-button value="vertical">垂直</el-radio-button>
                  <el-radio-button value="diagonal">对角</el-radio-button>
                  <el-radio-button value="radial">径向</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </template>
            <el-form-item label="点点样式">
              <el-radio-group v-model="dotStyle" @change="generateQR">
                <el-radio-button value="square">方形</el-radio-button>
                <el-radio-button value="rounded">圆角</el-radio-button>
                <el-radio-button value="circle">圆形</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="圆角大小">
              <el-slider
                v-model="dotRadius"
                :min="0"
                :max="50"
                show-input
                size="small"
                @change="generateQR"
              />
            </el-form-item>
            <el-form-item label="边距">
              <el-slider
                v-model="qrMargin"
                :min="0"
                :max="40"
                show-input
                size="small"
                @change="generateQR"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="settings-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#e6a23c">
                <PictureFilled />
              </el-icon>
              <span>中心 Logo</span>
            </div>
          </template>
          <el-form label-width="90px">
            <el-form-item label="上传Logo">
              <el-upload
                class="logo-uploader"
                :show-file-list="false"
                :before-upload="beforeLogoUpload"
                accept="image/*"
              >
                <div v-if="logoImage" class="logo-preview">
                  <img :src="logoImage" alt="Logo" />
                </div>
                <el-button v-else type="primary" :icon="Upload">选择图片</el-button>
              </el-upload>
              <div class="form-hint">建议使用方形PNG透明图片，最大2MB</div>
            </el-form-item>
            <el-form-item v-if="logoImage" label="Logo大小">
              <el-slider
                v-model="logoSize"
                :min="15"
                :max="35"
                show-input
                size="small"
                @change="generateQR"
              />
              <div class="unit-label">占二维码 {{ logoSize }}%</div>
            </el-form-item>
            <el-form-item v-if="logoImage" label="Logo边距">
              <el-switch v-model="logoPadding" @change="generateQR">
                <template #active>白底边距</template>
                <template #inactive>无背景</template>
              </el-switch>
            </el-form-item>
            <el-form-item v-if="logoImage">
              <el-button type="danger" size="small" :icon="Delete" @click="removeLogo">
                移除Logo
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="15">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#165DFF">
                <View />
              </el-icon>
              <span>实时预览</span>
              <div class="header-actions">
                <el-button :icon="Refresh" @click="resetStyle">重置</el-button>
                <el-button type="primary" :icon="Download" @click="confirmDownload">
                  下载 PNG
                </el-button>
              </div>
            </div>
          </template>

          <div class="preview-container">
            <div
              class="canvas-wrapper"
              :style="canvasWrapperStyle"
              :class="{ 'canvas-wrapper-non-square': !isSquareCanvas }"
            >
              <canvas ref="qrCanvasRef" :width="canvasWidthPx" :height="canvasHeightPx"></canvas>
              <div v-if="!isSquareCanvas" class="canvas-aspect-badge">
                {{ canvasRatioLabel }}
              </div>
            </div>
          </div>

          <div class="preview-info">
            <el-tag size="small" type="primary">🖼️ 画布: {{ canvasWidthPx }}×{{ canvasHeightPx }} px</el-tag>
            <el-tag size="small" type="info">
              {{ canvasWidthMm }}×{{ canvasHeightMm }}mm ({{ canvasWidthCm }}×{{ canvasHeightCm }}cm)
            </el-tag>
            <el-tag size="small" type="success">
              🔲 二维码: {{ qrSize }}×{{ qrSize }} px
            </el-tag>
            <el-tag size="small" :type="outputDpi >= 300 ? 'danger' : outputDpi >= 150 ? 'warning' : 'success'">
              {{ outputDpi }} DPI
            </el-tag>
            <el-tag size="small" type="warning" v-if="useGradient">渐变效果</el-tag>
            <el-tag size="small" type="info">容错: {{ errorLevelText }}</el-tag>
            <el-tag size="small" type="danger" v-if="logoImage">含Logo</el-tag>
          </div>

          <el-alert
            v-if="printWarning"
            :title="printWarning"
            type="warning"
            :closable="false"
            show-icon
            class="preview-warning"
          />
        </el-card>

        <el-card class="settings-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#13c2c2">
                <Picture />
              </el-icon>
              <span>装饰背景</span>
            </div>
          </template>
          <el-form label-width="90px">
            <el-form-item label="背景图案">
              <el-radio-group v-model="bgPattern" @change="generateQR">
                <el-radio-button value="none">无</el-radio-button>
                <el-radio-button value="dots">点阵</el-radio-button>
                <el-radio-button value="grid">网格</el-radio-button>
                <el-radio-button value="diagonal">斜纹</el-radio-button>
                <el-radio-button value="radial">放射</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="图案颜色">
              <el-color-picker v-model="patternColor" show-alpha @change="generateQR" />
            </el-form-item>
            <el-form-item label="图案大小">
              <el-slider
                v-model="patternSize"
                :min="5"
                :max="30"
                show-input
                size="small"
                @change="generateQR"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showDpiGuide" title="📐 DPI 与印刷输出指南" width="640px">
      <div class="dpi-guide-content">
        <h4>什么是 DPI？</h4>
        <p>
          DPI（Dots Per Inch，每英寸点数）表示每英寸长度内的像素点数，是衡量印刷清晰度的标准。
          <strong>DPI 越高，印刷出来越清晰。</strong>
        </p>
        <el-divider />
        <h4>像素、DPI、物理尺寸的关系</h4>
        <div class="formula-box">
          <div class="formula">物理尺寸(mm) = 像素数 ÷ DPI × 25.4</div>
          <div class="formula">像素数 = 物理尺寸(mm) ÷ 25.4 × DPI</div>
        </div>
        <p class="formula-example">
          例：300 DPI 下，1000 像素 ≈ 84.7 mm；30mm 的二维码在 300 DPI 下需要 354 像素
        </p>
        <el-divider />
        <h4>各场景推荐配置</h4>
        <el-table :data="dpiRecommendTable" size="small" border>
          <el-table-column prop="scene" label="使用场景" width="140" />
          <el-table-column prop="dpi" label="推荐DPI" width="90" align="center" />
          <el-table-column prop="size" label="建议物理尺寸" width="130" align="center" />
          <el-table-column prop="pixel" label="最小像素" width="100" align="center" />
          <el-table-column prop="note" label="说明" />
        </el-table>
        <el-divider />
        <h4>⚠️ 常见误区</h4>
        <ul class="mistake-list">
          <li>❌ 只看像素数不看DPI：1000px 在72DPI下约35cm，在300DPI下仅8.5cm</li>
          <li>❌ 印刷使用72DPI图片：会出现锯齿、模糊，印刷厂通常拒收</li>
          <li>❌ 二维码太小：印刷建议最小边长≥15mm（约0.6英寸）</li>
          <li>❌ 用JPG格式保存：请使用PNG格式，避免压缩导致识别失败</li>
        </ul>
      </div>
    </el-dialog>

    <el-dialog v-model="showDownloadConfirm" title="确认下载参数" width="520px">
      <div class="download-confirm">
        <div class="confirm-summary">
          请核对以下输出参数是否符合您的需求：
        </div>
        <el-descriptions :column="2" border size="small" class="confirm-desc">
          <el-descriptions-item label="画布像素" :span="2">
            <strong>{{ canvasWidthPx }} × {{ canvasHeightPx }} px</strong>
            <el-tag size="small" type="primary" style="margin-left: 8px">比例 {{ canvasRatioLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="画布物理尺寸" :span="2">
            <strong>{{ canvasWidthMm }}mm × {{ canvasHeightMm }}mm</strong>
            <span class="muted">（{{ canvasWidthCm }}cm × {{ canvasHeightCm }}cm）</span>
          </el-descriptions-item>
          <el-descriptions-item label="输出DPI">
            <strong>{{ outputDpi }} DPI</strong>
            <el-tag
              size="small"
              :type="outputDpi >= 300 ? 'danger' : outputDpi >= 150 ? 'warning' : 'success'"
              style="margin-left: 6px"
            >
              {{ dpiLevelText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="二维码尺寸">
            <strong>{{ qrSize }} × {{ qrSize }} px</strong>
            <span class="muted">（居中显示）</span>
          </el-descriptions-item>
          <el-descriptions-item label="艺术风格">{{ currentStyleName }}</el-descriptions-item>
          <el-descriptions-item label="容错等级">{{ errorLevelText }}</el-descriptions-item>
          <el-descriptions-item label="中心Logo" :span="2">{{ logoImage ? '已添加' : '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-alert
          v-if="printWarning"
          :title="printWarning"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 16px"
        />

        <el-alert
          v-if="physicalSizeMm < 15"
          title="物理尺寸小于15mm，部分扫描设备可能识别困难"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 8px"
        />
      </div>
      <template #footer>
        <el-button @click="showDownloadConfirm = false">返回修改</el-button>
        <el-button type="primary" :icon="Download" @click="doDownloadPNG">
          确认下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import {
  InfoFilled,
  Edit,
  MagicStick,
  Setting,
  View,
  Download,
  Refresh,
  PictureFilled,
  Picture,
  Upload,
  Delete,
  Warning,
  QuestionFilled,
  Monitor,
  Document,
  Printer,
  ScaleToOriginal
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcode'

interface ArtStyle {
  id: string
  name: string
  previewStyle: Record<string, string>
  apply: () => void
}

interface SizePreset {
  id: string
  name: string
  dpi: number
  sizeMm: string
  canvasW: number
  canvasH: number
  description: string
}

interface QuickSize {
  label: string
  sub: string
  dpi: number
  mm?: number
  px?: number
  ratio?: string
  canvasWmm?: number
  canvasHmm?: number
}

interface CanvasRatioPreset {
  id: string
  label: string
  desc: string
  w: number
  h: number
}

const MM_PER_INCH = 25.4

const qrCanvasRef = ref<HTMLCanvasElement | null>(null)
const qrContent = ref('https://www.example.com')
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('H')
const qrSize = ref(1000)
const qrMargin = ref(10)
const foregroundColor = ref('#1a1a1a')
const backgroundColor = ref('#ffffff')
const useGradient = ref(false)
const gradientColor1 = ref('#667eea')
const gradientColor2 = ref('#764ba2')
const gradientDirection = ref<'horizontal' | 'vertical' | 'diagonal' | 'radial'>('diagonal')
const dotStyle = ref<'square' | 'rounded' | 'circle'>('rounded')
const dotRadius = ref(30)
const bgPattern = ref<'none' | 'dots' | 'grid' | 'diagonal' | 'radial'>('none')
const patternColor = ref('rgba(100, 100, 255, 0.1)')
const patternSize = ref(15)
const logoImage = ref<string>('')
const logoSize = ref(22)
const logoPadding = ref(true)
const currentStyle = ref('classic')

const outputDpi = ref(300)
const canvasWidthPx = ref(1200)
const canvasHeightPx = ref(1200)
const canvasWidthMm = ref(100)
const canvasHeightMm = ref(100)
const canvasRatio = ref('1:1')
const customRatioW = ref(1)
const customRatioH = ref(1)
const qrScalePercent = ref(80)
const canvasBgColor = ref('#ffffff')
const selectedPreset = ref('print-business-card')
const showDpiGuide = ref(false)
const showDownloadConfirm = ref(false)

const canvasRatioPresets: CanvasRatioPreset[] = reactive([
  { id: '1:1', label: '1:1', desc: '正方形', w: 1, h: 1 },
  { id: '4:3', label: '4:3', desc: '横版', w: 4, h: 3 },
  { id: '3:4', label: '3:4', desc: '竖版', w: 3, h: 4 },
  { id: '16:9', label: '16:9', desc: '宽屏', w: 16, h: 9 },
  { id: '9:16', label: '9:16', desc: '手机', w: 9, h: 16 },
  { id: '3:2', label: '3:2', desc: '卡片', w: 3, h: 2 },
  { id: 'a4', label: 'A4', desc: '210×297mm', w: 210, h: 297 },
  { id: 'custom', label: '自定义', desc: '自定义比例', w: 1, h: 1 }
])

const sizePresets: SizePreset[] = reactive([
  { id: 'screen-social', name: '社交媒体 / 网页分享', dpi: 72, sizeMm: '150×150mm', canvasW: 150, canvasH: 150, description: '微信、朋友圈、网页、PPT展示' },
  { id: 'screen-wechat', name: '微信公众号配图', dpi: 96, sizeMm: '100×100mm', canvasW: 100, canvasH: 100, description: '公众号文章内嵌二维码' },
  { id: 'print-brochure', name: '普通宣传册 / 传单', dpi: 150, sizeMm: '210×148mm(A5)', canvasW: 210, canvasH: 148, description: '宣传单、折页、海报局部' },
  { id: 'print-business-card', name: '名片 / 会员卡', dpi: 300, sizeMm: '90×54mm(名片)', canvasW: 90, canvasH: 54, description: '标准名片印刷，二维码居中' },
  { id: 'print-poster', name: '高清海报 / 展架', dpi: 300, sizeMm: '420×297mm(A3)', canvasW: 420, canvasH: 297, description: '易拉宝、X展架、户外海报' },
  { id: 'print-magazine', name: '出版级 / 杂志画册', dpi: 300, sizeMm: '210×297mm(A4)', canvasW: 210, canvasH: 297, description: '杂志、书籍、产品画册' },
  { id: 'print-large', name: '大型喷绘 / 户外广告', dpi: 150, sizeMm: '600×900mm', canvasW: 600, canvasH: 900, description: '灯箱、大型广告牌、车身贴' },
  { id: 'print-package', name: '包装印刷 / 标签', dpi: 300, sizeMm: '100×60mm', canvasW: 100, canvasH: 60, description: '产品包装、不干胶标签' }
])

const quickSizes: QuickSize[] = [
  { label: '名片', sub: '90×54mm/300dpi', dpi: 300, canvasWmm: 90, canvasHmm: 54, ratio: '3:2' },
  { label: 'A4海报', sub: '210×297mm/300dpi', dpi: 300, canvasWmm: 210, canvasHmm: 297, ratio: 'a4' },
  { label: '公众号', sub: '500×500px/72dpi', dpi: 72, px: 500, ratio: '1:1' },
  { label: '手机竖版', sub: '1080×1920/96dpi', dpi: 96, px: 1080, ratio: '9:16' },
  { label: '横幅', sub: '1920×1080/96dpi', dpi: 96, px: 1920, ratio: '16:9' }
]

const dpiRecommendTable = [
  { scene: '屏幕显示', dpi: '72-96', size: '任意', pixel: '≥500px', note: '网站、APP、PPT、微信' },
  { scene: '普通印刷', dpi: '150', size: '≥30mm', pixel: '≥177px', note: '传单、海报、展板' },
  { scene: '高清印刷', dpi: '300', size: '≥20mm', pixel: '≥236px', note: '名片、画册、杂志' },
  { scene: '出版级', dpi: '300-600', size: '≥15mm', pixel: '≥354px', note: '精装画册、包装' },
  { scene: '大型喷绘', dpi: '72-150', size: '≥100mm', pixel: '≥283px', note: '户外广告、灯箱' }
]

const isSquareCanvas = computed(() => canvasWidthPx.value === canvasHeightPx.value)

const canvasWidthCm = computed(() => (canvasWidthMm.value / 10).toFixed(1))
const canvasHeightCm = computed(() => (canvasHeightMm.value / 10).toFixed(1))

const canvasRatioLabel = computed(() => {
  if (canvasRatio.value === 'custom') {
    return `${customRatioW.value}:${customRatioH.value}（自定义）`
  }
  const preset = canvasRatioPresets.find(r => r.id === canvasRatio.value)
  return preset ? `${preset.label} · ${preset.desc}` : '1:1'
})

const dpiLevelText = computed(() => {
  if (outputDpi.value >= 300) return '印刷级'
  if (outputDpi.value >= 150) return '普通印刷'
  if (outputDpi.value >= 96) return '屏幕高清'
  return '屏幕标准'
})

const printWarning = computed(() => {
  const minMm = Math.min(canvasWidthMm.value, canvasHeightMm.value)
  if (outputDpi.value < 150 && minMm >= 30) {
    return `当前DPI为${outputDpi.value}，画布最小边${minMm}mm用于印刷可能不清晰，建议提高DPI至150+`
  }
  if (outputDpi.value < 300 && minMm <= 50 && minMm >= 15) {
    return `小尺寸画布(${minMm}mm)用于印刷建议使用300DPI，当前${outputDpi.value}DPI可能不够清晰`
  }
  return ''
})

const canvasWrapperStyle = computed(() => {
  const maxPreview = 480
  let w = canvasWidthPx.value
  let h = canvasHeightPx.value
  const scale = Math.min(maxPreview / Math.max(w, h), 1)
  const displayW = Math.round(w * scale)
  const displayH = Math.round(h * scale)
  return {
    width: `${displayW}px`,
    height: `${displayH}px`,
    aspectRatio: `${w} / ${h}`
  }
})

const errorLevelText = computed(() => {
  const map: Record<string, string> = { L: '低 7%', M: '中 15%', Q: '较高 25%', H: '高 30%' }
  return map[errorLevel.value]
})

const currentStyleName = computed(() => {
  const style = artStyles.find(s => s.id === currentStyle.value)
  return style?.name || '自定义'
})

const pxToMm = (px: number, dpi: number) => (px / dpi) * MM_PER_INCH
const mmToPx = (mm: number, dpi: number) => Math.round((mm / MM_PER_INCH) * dpi)

const updateQrSizeFromCanvas = () => {
  const minSide = Math.min(canvasWidthPx.value, canvasHeightPx.value)
  qrSize.value = Math.round(minSide * (qrScalePercent.value / 100))
}

const selectCanvasRatio = (ratioId: string) => {
  canvasRatio.value = ratioId
  if (ratioId === 'custom') {
    customRatioW.value = 1
    customRatioH.value = 1
    return
  }
  const preset = canvasRatioPresets.find(r => r.id === ratioId)
  if (!preset) return
  const basePx = canvasWidthPx.value
  canvasHeightPx.value = Math.round(basePx * (preset.h / preset.w))
  canvasWidthMm.value = Math.round(pxToMm(canvasWidthPx.value, outputDpi.value))
  canvasHeightMm.value = Math.round(pxToMm(canvasHeightPx.value, outputDpi.value))
  updateQrSizeFromCanvas()
  selectedPreset.value = ''
  nextTick(() => generateQR())
}

const updateCustomRatio = () => {
  if (canvasRatio.value !== 'custom' || customRatioW.value === 0 || customRatioH.value === 0) return
  const basePx = canvasWidthPx.value
  canvasHeightPx.value = Math.round(basePx * (customRatioH.value / customRatioW.value))
  canvasWidthMm.value = Math.round(pxToMm(canvasWidthPx.value, outputDpi.value))
  canvasHeightMm.value = Math.round(pxToMm(canvasHeightPx.value, outputDpi.value))
  updateQrSizeFromCanvas()
  selectedPreset.value = ''
  nextTick(() => generateQR())
}

const onDpiChange = () => {
  canvasWidthMm.value = Math.round(pxToMm(canvasWidthPx.value, outputDpi.value))
  canvasHeightMm.value = Math.round(pxToMm(canvasHeightPx.value, outputDpi.value))
  updateQrSizeFromCanvas()
  selectedPreset.value = ''
  nextTick(() => generateQR())
}

const onCanvasSizeMmChange = () => {
  canvasWidthPx.value = mmToPx(canvasWidthMm.value, outputDpi.value)
  canvasHeightPx.value = mmToPx(canvasHeightMm.value, outputDpi.value)
  updateQrSizeFromCanvas()
  selectedPreset.value = ''
  nextTick(() => generateQR())
}

const onCanvasSizePxChange = () => {
  canvasWidthMm.value = Math.round(pxToMm(canvasWidthPx.value, outputDpi.value))
  canvasHeightMm.value = Math.round(pxToMm(canvasHeightPx.value, outputDpi.value))
  updateQrSizeFromCanvas()
  selectedPreset.value = ''
  nextTick(() => generateQR())
}

const applyPreset = (presetId: string) => {
  const preset = sizePresets.find(p => p.id === presetId)
  if (!preset) return
  outputDpi.value = preset.dpi
  canvasWidthMm.value = preset.canvasW
  canvasHeightMm.value = preset.canvasH
  canvasWidthPx.value = mmToPx(preset.canvasW, preset.dpi)
  canvasHeightPx.value = mmToPx(preset.canvasH, preset.dpi)

  if (preset.canvasW === preset.canvasH) {
    canvasRatio.value = '1:1'
  } else {
    canvasRatio.value = 'custom'
    customRatioW.value = preset.canvasW
    customRatioH.value = preset.canvasH
  }
  updateQrSizeFromCanvas()
  ElMessage.success(`已应用「${preset.name}」预设：${preset.dpi} DPI · ${preset.sizeMm}`)
  nextTick(() => generateQR())
}

const setQuickSize = (qs: QuickSize) => {
  outputDpi.value = qs.dpi
  if (qs.canvasWmm && qs.canvasHmm) {
    canvasWidthMm.value = qs.canvasWmm
    canvasHeightMm.value = qs.canvasHmm
    canvasWidthPx.value = mmToPx(qs.canvasWmm, qs.dpi)
    canvasHeightPx.value = mmToPx(qs.canvasHmm, qs.dpi)
    canvasRatio.value = qs.ratio || 'custom'
    if (canvasRatio.value === 'custom') {
      customRatioW.value = qs.canvasWmm
      customRatioH.value = qs.canvasHmm
    }
  } else if (qs.px && qs.ratio) {
    const preset = canvasRatioPresets.find(r => r.id === qs.ratio)
    if (preset) {
      canvasRatio.value = qs.ratio
      canvasWidthPx.value = qs.px
      canvasHeightPx.value = Math.round(qs.px * (preset.h / preset.w))
      canvasWidthMm.value = Math.round(pxToMm(canvasWidthPx.value, qs.dpi))
      canvasHeightMm.value = Math.round(pxToMm(canvasHeightPx.value, qs.dpi))
    }
  }
  updateQrSizeFromCanvas()
  selectedPreset.value = ''
  nextTick(() => generateQR())
}

const artStyles: ArtStyle[] = reactive([
  {
    id: 'classic',
    name: '经典黑白',
    previewStyle: {
      background: 'linear-gradient(135deg, #ffffff, #ffffff)',
      border: '2px solid #e5e7eb'
    },
    apply: () => {
      foregroundColor.value = '#1a1a1a'
      backgroundColor.value = '#ffffff'
      useGradient.value = false
      dotStyle.value = 'square'
      dotRadius.value = 0
      bgPattern.value = 'none'
    }
  },
  {
    id: 'blue-tech',
    name: '科技蓝',
    previewStyle: {
      background: 'linear-gradient(135deg, #0066ff, #00ccff)'
    },
    apply: () => {
      foregroundColor.value = '#0066ff'
      backgroundColor.value = '#f0f8ff'
      useGradient.value = true
      gradientColor1.value = '#0066ff'
      gradientColor2.value = '#00ccff'
      gradientDirection.value = 'diagonal'
      dotStyle.value = 'rounded'
      dotRadius.value = 40
      bgPattern.value = 'dots'
      patternColor.value = 'rgba(0, 150, 255, 0.08)'
      patternSize.value = 10
    }
  },
  {
    id: 'purple-dream',
    name: '梦幻紫',
    previewStyle: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    apply: () => {
      foregroundColor.value = '#667eea'
      backgroundColor.value = '#faf5ff'
      useGradient.value = true
      gradientColor1.value = '#667eea'
      gradientColor2.value = '#764ba2'
      gradientDirection.value = 'diagonal'
      dotStyle.value = 'circle'
      dotRadius.value = 50
      bgPattern.value = 'radial'
      patternColor.value = 'rgba(118, 75, 162, 0.08)'
      patternSize.value = 20
    }
  },
  {
    id: 'sunset-warm',
    name: '暖阳橙',
    previewStyle: {
      background: 'linear-gradient(135deg, #f093fb, #f5576c)'
    },
    apply: () => {
      foregroundColor.value = '#f5576c'
      backgroundColor.value = '#fff5f5'
      useGradient.value = true
      gradientColor1.value = '#f093fb'
      gradientColor2.value = '#f5576c'
      gradientDirection.value = 'horizontal'
      dotStyle.value = 'rounded'
      dotRadius.value = 35
      bgPattern.value = 'diagonal'
      patternColor.value = 'rgba(245, 87, 108, 0.08)'
      patternSize.value = 12
    }
  },
  {
    id: 'green-nature',
    name: '清新绿',
    previewStyle: {
      background: 'linear-gradient(135deg, #11998e, #38ef7d)'
    },
    apply: () => {
      foregroundColor.value = '#11998e'
      backgroundColor.value = '#f0fff4'
      useGradient.value = true
      gradientColor1.value = '#11998e'
      gradientColor2.value = '#38ef7d'
      gradientDirection.value = 'vertical'
      dotStyle.value = 'circle'
      dotRadius.value = 45
      bgPattern.value = 'grid'
      patternColor.value = 'rgba(17, 153, 142, 0.06)'
      patternSize.value = 15
    }
  },
  {
    id: 'luxury-gold',
    name: '奢华金',
    previewStyle: {
      background: 'linear-gradient(135deg, #d4af37, #f9d976)'
    },
    apply: () => {
      foregroundColor.value = '#b8860b'
      backgroundColor.value = '#fffbf0'
      useGradient.value = true
      gradientColor1.value = '#d4af37'
      gradientColor2.value = '#8b6914'
      gradientDirection.value = 'radial'
      dotStyle.value = 'rounded'
      dotRadius.value = 25
      bgPattern.value = 'dots'
      patternColor.value = 'rgba(212, 175, 55, 0.12)'
      patternSize.value = 8
    }
  },
  {
    id: 'cyber-punk',
    name: '赛博朋克',
    previewStyle: {
      background: 'linear-gradient(135deg, #ff00ff, #00ffff)'
    },
    apply: () => {
      foregroundColor.value = '#ff00ff'
      backgroundColor.value = '#0a0a0a'
      useGradient.value = true
      gradientColor1.value = '#ff00ff'
      gradientColor2.value = '#00ffff'
      gradientDirection.value = 'horizontal'
      dotStyle.value = 'square'
      dotRadius.value = 15
      bgPattern.value = 'grid'
      patternColor.value = 'rgba(255, 0, 255, 0.15)'
      patternSize.value = 18
    }
  },
  {
    id: 'ink-style',
    name: '水墨风',
    previewStyle: {
      background: 'linear-gradient(135deg, #2c3e50, #4a5568)'
    },
    apply: () => {
      foregroundColor.value = '#2c3e50'
      backgroundColor.value = '#f7f5f0'
      useGradient.value = false
      dotStyle.value = 'rounded'
      dotRadius.value = 30
      bgPattern.value = 'radial'
      patternColor.value = 'rgba(44, 62, 80, 0.05)'
      patternSize.value = 25
    }
  }
])

const selectStyle = (styleId: string) => {
  currentStyle.value = styleId
  const style = artStyles.find(s => s.id === styleId)
  if (style) {
    style.apply()
    nextTick(() => generateQR())
  }
}

const resetStyle = () => {
  selectStyle('classic')
  logoImage.value = ''
  qrScalePercent.value = 80
  canvasBgColor.value = '#ffffff'
  canvasRatio.value = '3:2'
  selectedPreset.value = 'print-business-card'
  applyPreset('print-business-card')
  ElMessage.success('已重置为默认样式')
}

const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    logoImage.value = e.target?.result as string
    nextTick(() => generateQR())
  }
  reader.readAsDataURL(file)
  return false
}

const removeLogo = () => {
  logoImage.value = ''
  nextTick(() => generateQR())
  ElMessage.success('已移除Logo')
}

const qrOffsetX = computed(() => Math.round((canvasWidthPx.value - qrSize.value) / 2))
const qrOffsetY = computed(() => Math.round((canvasHeightPx.value - qrSize.value) / 2))

const generateQR = async () => {
  const canvas = qrCanvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (!qrContent.value.trim()) {
    ElMessage.warning('请输入二维码内容')
    return
  }

  updateQrSizeFromCanvas()

  try {
    const qrCanvas = document.createElement('canvas')
    await QRCode.toCanvas(qrCanvas, qrContent.value, {
      width: qrSize.value,
      margin: qrMargin.value,
      errorCorrectionLevel: errorLevel.value,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    canvas.width = canvasWidthPx.value
    canvas.height = canvasHeightPx.value

    drawCanvasBackground(ctx)

    ctx.save()
    ctx.translate(qrOffsetX.value, qrOffsetY.value)
    drawQRBackground(ctx)
    drawQRPattern(ctx)

    const qrCtx = qrCanvas.getContext('2d')
    if (!qrCtx) return

    const qrImageData = qrCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height)
    const qrData = qrImageData.data

    const cellSize = qrCanvas.width / getModuleCount(qrData, qrCanvas.width)

    drawQRModules(ctx, qrData, qrCanvas.width, qrCanvas.height, cellSize)
    drawFinderPatterns(ctx, qrData, qrCanvas.width, cellSize)

    if (logoImage.value) {
      await drawLogo(ctx)
    }
    ctx.restore()
  } catch (err) {
    console.error(err)
    ElMessage.error('生成二维码失败')
  }
}

const getModuleCount = (data: Uint8ClampedArray, width: number): number => {
  for (let i = 0; i < width; i++) {
    const idx = (i * width + i) * 4
    if (data[idx] === 0 && data[idx + 1] === 0 && data[idx + 2] === 0) {
      let count = 0
      for (let j = i; j < width; j++) {
        const jdx = (i * width + j) * 4
        if (data[jdx] === 0 && data[jdx + 1] === 0 && data[jdx + 2] === 0) {
          count++
        } else {
          break
        }
      }
      const moduleCount = Math.round(width / ((count + i * 2) / 7))
      return moduleCount
    }
  }
  return 29
}

const drawCanvasBackground = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = canvasBgColor.value
  ctx.fillRect(0, 0, canvasWidthPx.value, canvasHeightPx.value)
}

const drawQRBackground = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, qrSize.value, qrSize.value)
}

const drawQRPattern = (ctx: CanvasRenderingContext2D) => {
  if (bgPattern.value === 'none') return

  ctx.save()
  ctx.fillStyle = patternColor.value
  ctx.strokeStyle = patternColor.value
  ctx.lineWidth = 1

  const size = patternSize.value * (qrSize.value / 600)

  switch (bgPattern.value) {
    case 'dots':
      for (let y = 0; y < qrSize.value; y += size * 2) {
        for (let x = 0; x < qrSize.value; x += size * 2) {
          ctx.beginPath()
          ctx.arc(x, y, size / 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    case 'grid':
      ctx.lineWidth = 0.5
      for (let x = 0; x < qrSize.value; x += size) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, qrSize.value)
        ctx.stroke()
      }
      for (let y = 0; y < qrSize.value; y += size) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(qrSize.value, y)
        ctx.stroke()
      }
      break
    case 'diagonal':
      ctx.lineWidth = 0.8
      for (let i = -qrSize.value; i < qrSize.value * 2; i += size) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + qrSize.value, qrSize.value)
        ctx.stroke()
      }
      break
    case 'radial':
      const cx = qrSize.value / 2
      const cy = qrSize.value / 2
      ctx.lineWidth = 0.5
      for (let r = size; r < qrSize.value; r += size) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      break
  }

  ctx.restore()
}

const getFillStyle = (ctx: CanvasRenderingContext2D, size: number): string | CanvasGradient => {
  if (!useGradient.value) {
    return foregroundColor.value
  }

  let gradient: CanvasGradient
  switch (gradientDirection.value) {
    case 'horizontal':
      gradient = ctx.createLinearGradient(0, 0, size, 0)
      break
    case 'vertical':
      gradient = ctx.createLinearGradient(0, 0, 0, size)
      break
    case 'diagonal':
      gradient = ctx.createLinearGradient(0, 0, size, size)
      break
    case 'radial':
      gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      break
  }
  gradient.addColorStop(0, gradientColor1.value)
  gradient.addColorStop(1, gradientColor2.value)
  return gradient
}

const drawQRModules = (
  ctx: CanvasRenderingContext2D,
  qrData: Uint8ClampedArray,
  qrWidth: number,
  qrHeight: number,
  cellSize: number
) => {
  const fillStyle = getFillStyle(ctx, qrSize.value)
  ctx.fillStyle = fillStyle

  const marginPx = (qrMargin.value / 100) * qrSize.value
  const moduleCount = Math.round((qrWidth - cellSize * 2) / cellSize)
  const actualCellSize = (qrSize.value - marginPx * 2) / moduleCount

  const isFinderPattern = (row: number, col: number): boolean => {
    const inTopLeft = row < 7 && col < 7
    const inTopRight = row < 7 && col >= moduleCount - 7
    const inBottomLeft = row >= moduleCount - 7 && col < 7
    return inTopLeft || inTopRight || inBottomLeft
  }

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderPattern(row, col)) continue

      const srcX = Math.round(cellSize + col * cellSize)
      const srcY = Math.round(cellSize + row * cellSize)
      const idx = (srcY * qrWidth + srcX) * 4

      if (qrData[idx] === 0 && qrData[idx + 1] === 0 && qrData[idx + 2] === 0) {
        const x = marginPx + col * actualCellSize
        const y = marginPx + row * actualCellSize

        drawModule(ctx, x, y, actualCellSize)
      }
    }
  }
}

const drawModule = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const padding = size * 0.05
  const innerSize = size - padding * 2
  const radius = (dotRadius.value / 100) * (innerSize / 2)

  ctx.save()
  ctx.translate(x + padding, y + padding)

  switch (dotStyle.value) {
    case 'square':
      ctx.fillRect(0, 0, innerSize, innerSize)
      break
    case 'rounded':
      roundRect(ctx, 0, 0, innerSize, innerSize, radius)
      ctx.fill()
      break
    case 'circle':
      ctx.beginPath()
      ctx.arc(innerSize / 2, innerSize / 2, innerSize / 2, 0, Math.PI * 2)
      ctx.fill()
      break
  }

  ctx.restore()
}

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

const drawFinderPatterns = (
  ctx: CanvasRenderingContext2D,
  qrData: Uint8ClampedArray,
  qrWidth: number,
  cellSize: number
) => {
  const fillStyle = getFillStyle(ctx, qrSize.value)
  ctx.fillStyle = fillStyle

  const marginPx = (qrMargin.value / 100) * qrSize.value
  const moduleCount = Math.round((qrWidth - cellSize * 2) / cellSize)
  const actualCellSize = (qrSize.value - marginPx * 2) / moduleCount

  const positions = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 }
  ]

  positions.forEach(pos => {
    const baseX = marginPx + pos.col * actualCellSize
    const baseY = marginPx + pos.row * actualCellSize

    ctx.save()
    const outerRadius = (dotRadius.value / 100) * (actualCellSize * 0.3)
    roundRect(ctx, baseX, baseY, actualCellSize * 7, actualCellSize * 7, outerRadius * 2)
    ctx.fill()

    ctx.fillStyle = backgroundColor.value
    const innerRadius = (dotRadius.value / 100) * (actualCellSize * 0.25)
    roundRect(
      ctx,
      baseX + actualCellSize,
      baseY + actualCellSize,
      actualCellSize * 5,
      actualCellSize * 5,
      innerRadius * 1.5
    )
    ctx.fill()

    ctx.fillStyle = fillStyle
    roundRect(
      ctx,
      baseX + actualCellSize * 2,
      baseY + actualCellSize * 2,
      actualCellSize * 3,
      actualCellSize * 3,
      innerRadius
    )
    ctx.fill()
    ctx.restore()
  })
}

const drawLogo = async (ctx: CanvasRenderingContext2D) => {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const logoPxSize = (logoSize.value / 100) * qrSize.value
      const x = (qrSize.value - logoPxSize) / 2
      const y = (qrSize.value - logoPxSize) / 2

      if (logoPadding.value) {
        const paddingPx = logoPxSize * 0.12
        ctx.save()
        ctx.fillStyle = backgroundColor.value
        roundRect(
          ctx,
          x - paddingPx,
          y - paddingPx,
          logoPxSize + paddingPx * 2,
          logoPxSize + paddingPx * 2,
          paddingPx
        )
        ctx.fill()
        ctx.restore()
      }

      ctx.save()
      const radius = logoPxSize * 0.15
      ctx.beginPath()
      roundRect(ctx, x, y, logoPxSize, logoPxSize, radius)
      ctx.clip()
      ctx.drawImage(img, x, y, logoPxSize, logoPxSize)
      ctx.restore()

      resolve()
    }
    img.src = logoImage.value
  })
}

const confirmDownload = () => {
  if (!qrContent.value.trim()) {
    ElMessage.warning('请先输入二维码内容')
    return
  }
  showDownloadConfirm.value = true
}

const doDownloadPNG = () => {
  const canvas = qrCanvasRef.value
  if (!canvas) return

  const ratioTag = canvasRatio.value.replace('/', 'x').replace(':', 'x')
  const link = document.createElement('a')
  link.download = `artistic-qrcode-${canvasWidthPx.value}x${canvasHeightPx.value}-${ratioTag}-${outputDpi.value}dpi-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
  showDownloadConfirm.value = false
  ElMessage.success(
    `已下载：${canvasWidthPx.value}×${canvasHeightPx.value}px · ${canvasRatioLabel} · ${outputDpi.value}DPI`
  )
}

watch(currentStyle, () => {
  nextTick(() => generateQR())
})

onMounted(() => {
  nextTick(() => {
    applyPreset(selectedPreset.value)
    generateQR()
  })
})
</script>

<style scoped>
.artistic-qrcode {
  max-width: 1600px;
  margin: 0 auto;
}

.dpi-alert-card {
  margin-bottom: 16px;
  border: 1px solid #faecd8;
  background: linear-gradient(to right, #fffbe6, #ffffff);
}

.dpi-info-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 4px;
}

.dpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dpi-icon :deep(.el-icon) {
  font-size: 20px;
}

.dpi-info-content {
  flex: 1;
  min-width: 0;
}

.dpi-info-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.dpi-info-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.dpi-info-tag {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.guide-card {
  margin-bottom: 16px;
}

.guide-steps {
  padding: 10px 0;
}

.settings-card {
  height: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.preview-card .card-header {
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.ratio-buttons .el-button {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 12px;
  height: auto;
  min-width: 52px;
}

.ratio-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.ratio-sub {
  font-size: 10px;
  opacity: 0.75;
  font-weight: normal;
  line-height: 1.2;
}

.custom-ratio-input {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.ratio-colon {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.canvas-size-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.size-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.size-axis-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  min-width: 14px;
}

.size-mul {
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}

.size-convert-line {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.physical-size-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.canvas-wrapper {
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
}

.canvas-wrapper-non-square {
  border: 2px solid #e6a23c;
}

.canvas-aspect-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(230, 162, 60, 0.95);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  z-index: 10;
}

.unit-text {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.size-convert {
  font-size: 12px;
  color: #909399;
}

.size-convert-inline {
  color: #909399;
  margin-left: 6px;
}

.dpi-hint {
  margin-top: 6px;
}

.preset-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preset-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.preset-spec {
  font-size: 11px;
  color: #909399;
}

.quick-size-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-size-buttons .el-button {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 14px;
  height: auto;
}

.quick-size-sub {
  font-size: 10px;
  color: #909399;
  font-weight: normal;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.style-item {
  cursor: pointer;
  border-radius: 10px;
  padding: 10px;
  border: 2px solid #e5e7eb;
  transition: all 0.25s ease;
  background: #fff;
}

.style-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.style-item.active {
  border-color: #165DFF;
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.15);
}

.style-preview {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.style-name {
  text-align: center;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.preview-container {
  width: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
  padding: 30px;
  border-radius: 8px;
}

.canvas-wrapper :deep(canvas) {
  display: block;
  max-width: 520px;
  max-height: 520px;
  width: 100% !important;
  height: auto !important;
}

.preview-info {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.preview-warning {
  margin-top: 16px;
}

.logo-uploader :deep(.el-upload) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  padding: 10px;
}

.logo-uploader :deep(.el-upload:hover) {
  border-color: #165DFF;
}

.logo-preview {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.unit-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  font-family: 'Menlo', 'Monaco', monospace;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-radio-button) {
  margin-bottom: 8px;
}

.dpi-guide-content h4 {
  margin: 16px 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.dpi-guide-content p {
  margin: 6px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;
}

.formula-box {
  background: #f4f8ff;
  border: 1px solid #d9ecff;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0;
}

.formula {
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #165DFF;
  font-weight: 500;
  line-height: 1.8;
}

.formula-example {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  font-style: italic;
}

.mistake-list {
  padding-left: 20px;
  margin: 8px 0;
}

.mistake-list li {
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}

.download-confirm .confirm-summary {
  font-size: 14px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

.confirm-desc {
  margin-top: 8px;
}

.muted {
  color: #909399;
  font-weight: normal;
  margin-left: 4px;
}
</style>
