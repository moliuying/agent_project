<template>
  <div class="grid-paper">
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
        <el-step title="选择样式" description="选择网格形状：方格、点阵、米字格等" />
        <el-step title="调整参数" description="以毫米(mm)为单位，精确设置格子尺寸" />
        <el-step title="校准打印" description="可先打印参考尺校准打印机缩放" />
        <el-step title="预览打印" description="实时预览效果，一键打印输出" />
      </el-steps>
    </el-card>

    <el-alert
      title="打印精度说明"
      type="info"
      :closable="false"
      show-icon
      class="print-tips"
    >
      <div class="tips-content">
        <p>1. 所有尺寸单位均为 <strong>毫米(mm)</strong>，按标准 96 DPI 计算屏幕像素</p>
        <p>2. 打印时请确保在浏览器打印对话框中选择：<strong>「实际大小」或「缩放=100%」</strong>，切勿选「适应页面」</p>
        <p>3. 建议先开启下方「打印校准尺」，打印后用尺子测量核对尺寸</p>
      </div>
    </el-alert>

    <el-row :gutter="24">
      <el-col :span="8">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#165DFF">
                <Setting />
              </el-icon>
              <span>参数设置</span>
            </div>
          </template>

          <el-form label-width="110px">
            <el-form-item label="网格形状">
              <el-radio-group v-model="settings.gridType" @change="drawGrid">
                <el-radio-button value="square">方格</el-radio-button>
                <el-radio-button value="dot">点阵</el-radio-button>
                <el-radio-button value="isometric">等距</el-radio-button>
                <el-radio-button value="lined">横线</el-radio-button>
                <el-radio-button value="cornell">康奈尔</el-radio-button>
                <el-radio-button value="grid5x5">5x5练习</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="格子大小">
                  <el-slider
                    v-model="settings.gridSizeMm"
                    :min="1"
                    :max="30"
                    :step="0.5"
                    show-input
                    size="small"
                    @change="drawGrid"
                  />
                  <div class="unit-label">{{ settings.gridSizeMm }} mm / 格</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="线条粗细">
                  <el-slider
                    v-model="settings.lineWidthMm"
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                    show-input
                    size="small"
                    @change="drawGrid"
                  />
                  <div class="unit-label">{{ settings.lineWidthMm }} mm</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="线条颜色">
                  <el-color-picker
                    v-model="settings.lineColor"
                    show-alpha
                    @change="drawGrid"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="背景颜色">
                  <el-color-picker
                    v-model="settings.bgColor"
                    show-alpha
                    @change="drawGrid"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="纸张尺寸">
              <el-radio-group v-model="settings.paperSize" @change="drawGrid">
                <el-radio-button value="a4">A4</el-radio-button>
                <el-radio-button value="a5">A5</el-radio-button>
                <el-radio-button value="letter">Letter</el-radio-button>
              </el-radio-group>
              <div class="unit-label">{{ paperSizeMm }}</div>
            </el-form-item>

            <el-form-item label="纸张方向">
              <el-radio-group v-model="settings.orientation" @change="drawGrid">
                <el-radio-button value="portrait">竖向</el-radio-button>
                <el-radio-button value="landscape">横向</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="边距(mm)">
              <el-slider
                v-model="settings.marginMm"
                :min="0"
                :max="30"
                :step="1"
                show-input
                size="small"
                @change="drawGrid"
              />
            </el-form-item>

            <el-form-item label="校准参考尺">
              <el-switch v-model="settings.showRuler" @change="drawGrid" />
              <div class="form-hint">打印后可用真实尺子核对，1cm刻度验证打印精度</div>
            </el-form-item>

            <el-divider content-position="left">快捷预设</el-divider>

            <div class="preset-buttons">
              <el-button size="small" @click="applyPreset('designer')">
                <el-icon><Brush /></el-icon>
                设计师草图
              </el-button>
              <el-button size="small" @click="applyPreset('student')">
                <el-icon><Reading /></el-icon>
                学生练习
              </el-button>
              <el-button size="small" @click="applyPreset('journal')">
                <el-icon><Notebook /></el-icon>
                手账模板
              </el-button>
              <el-button size="small" @click="applyPreset('calligraphy')">
                <el-icon><EditPen /></el-icon>
                书法练习
              </el-button>
              <el-button size="small" @click="applyPreset('cornell')">
                <el-icon><Document /></el-icon>
                康奈尔笔记
              </el-button>
              <el-button size="small" @click="applyPreset('dotted')">
                <el-icon><Grid /></el-icon>
                点阵笔记
              </el-button>
              <el-button size="small" @click="applyPreset('math')">
                <el-icon><DataLine /></el-icon>
                数学坐标纸
              </el-button>
              <el-button size="small" @click="applyPreset('graph5mm')">
                <el-icon><Grid /></el-icon>
                标准5mm方格
              </el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="20" color="#165DFF">
                <View />
              </el-icon>
              <span>实时预览</span>
              <div class="header-actions">
                <el-tooltip content="打开打印校准说明">
                  <el-button :icon="Warning" @click="showCalibrationHelp = true" circle />
                </el-tooltip>
                <el-button type="primary" :icon="Printer" @click="printGrid">
                  打印
                </el-button>
                <el-button :icon="Download" @click="downloadImage">
                  下载图片
                </el-button>
              </div>
            </div>
          </template>

          <div class="preview-container" ref="previewContainer">
            <div class="canvas-wrapper" :style="canvasWrapperStyle">
              <canvas ref="canvasRef"></canvas>
            </div>
          </div>

          <div class="preview-info">
            <el-tag size="small">纸张: {{ paperSizeLabel }}</el-tag>
            <el-tag size="small" type="success">网格: {{ gridTypeLabel }}</el-tag>
            <el-tag size="small" type="warning">格子: {{ settings.gridSizeMm }}mm</el-tag>
            <el-tag size="small" type="info">边距: {{ settings.marginMm }}mm</el-tag>
            <el-tag size="small" v-if="settings.showRuler" type="danger">含校准尺</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showCalibrationHelp" title="打印校准指南" width="560px">
      <div class="calibration-guide">
        <h4>📐 为什么打印尺寸可能不准？</h4>
        <p>浏览器默认会将图片「适应页面」缩放，导致实际尺寸与设置的毫米数不符。</p>

        <h4>✅ 正确的打印设置步骤</h4>
        <ol>
          <li>点击「打印」按钮，弹出浏览器打印对话框</li>
          <li><strong>缩放设置</strong>：选择「实际大小」或手动设置为 <strong>100%</strong></li>
          <li><strong>边距设置</strong>：选择「无」或「最小」</li>
          <li><strong>选项</strong>：取消勾选「页眉和页脚」、「背景图形」可勾选</li>
          <li>先用草稿纸打印校准尺验证，确认尺寸后再正式打印</li>
        </ol>

        <h4>📏 如何校准？</h4>
        <p>开启「校准参考尺」后打印，用真实尺子测量：</p>
        <ul>
          <li>如果打印出的 10cm 比真实尺子短 → 增大打印缩放比例（如 102%）</li>
          <li>如果打印出的 10cm 比真实尺子长 → 减小打印缩放比例（如 98%）</li>
        </ul>

        <el-alert title="不同打印机缩放比例可能略有差异，建议首次使用时先校准" type="warning" :closable="false"></el-alert>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import {
  InfoFilled,
  Setting,
  View,
  Printer,
  Download,
  Brush,
  Reading,
  Notebook,
  EditPen,
  Document,
  Grid,
  DataLine,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const SCREEN_DPI = 96
const MM_PER_INCH = 25.4

const mmToPx = (mm: number): number => (mm * SCREEN_DPI) / MM_PER_INCH

interface GridSettings {
  gridType: string
  gridSizeMm: number
  lineWidthMm: number
  lineColor: string
  bgColor: string
  paperSize: string
  orientation: string
  marginMm: number
  showRuler: boolean
}

interface PaperDim {
  widthMm: number
  heightMm: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewContainer = ref<HTMLElement | null>(null)
const showCalibrationHelp = ref(false)

const settings = reactive<GridSettings>({
  gridType: 'square',
  gridSizeMm: 5,
  lineWidthMm: 0.2,
  lineColor: 'rgba(180, 180, 180, 0.8)',
  bgColor: '#ffffff',
  paperSize: 'a4',
  orientation: 'portrait',
  marginMm: 10,
  showRuler: false
})

const paperDimensionsMm: Record<string, PaperDim> = {
  a4: { widthMm: 210, heightMm: 297 },
  a5: { widthMm: 148, heightMm: 210 },
  letter: { widthMm: 215.9, heightMm: 279.4 }
}

const paperSizeLabel = computed(() => {
  const map: Record<string, string> = {
    a4: 'A4 (210×297mm)',
    a5: 'A5 (148×210mm)',
    letter: 'Letter (215.9×279.4mm)'
  }
  return map[settings.paperSize]
})

const paperSizeMm = computed(() => {
  const dims = paperDimensionsMm[settings.paperSize]
  if (settings.orientation === 'landscape') {
    return `${dims.heightMm} × ${dims.widthMm} mm`
  }
  return `${dims.widthMm} × ${dims.heightMm} mm`
})

const gridTypeLabel = computed(() => {
  const map: Record<string, string> = {
    square: '方格',
    dot: '点阵',
    isometric: '等距网格',
    lined: '横线条',
    cornell: '康奈尔笔记',
    grid5x5: '5x5练习格'
  }
  return map[settings.gridType]
})

const canvasWrapperStyle = computed(() => {
  const dims = getPaperPixelDimensions()
  const container = previewContainer.value
  if (!container) return {}
  const maxWidth = container.clientWidth - 40
  const scale = Math.min(maxWidth / dims.width, 0.75)
  return {
    width: `${dims.width * scale}px`,
    height: `${dims.height * scale}px`
  }
})

const getPaperPixelDimensions = () => {
  const dims = paperDimensionsMm[settings.paperSize]
  const w = mmToPx(dims.widthMm)
  const h = mmToPx(dims.heightMm)
  if (settings.orientation === 'landscape') {
    return { width: Math.round(h), height: Math.round(w) }
  }
  return { width: Math.round(w), height: Math.round(h) }
}

const drawGrid = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = getPaperPixelDimensions()
  const marginPx = mmToPx(settings.marginMm)
  const gridSizePx = mmToPx(settings.gridSizeMm)
  const lineWidthPx = mmToPx(settings.lineWidthMm)

  canvas.width = width
  canvas.height = height

  const container = previewContainer.value
  if (container) {
    const maxWidth = container.clientWidth - 40
    const scale = Math.min(maxWidth / width, 0.75)
    canvas.style.width = `${width * scale}px`
    canvas.style.height = `${height * scale}px`
  }

  ctx.fillStyle = settings.bgColor
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.beginPath()
  ctx.rect(marginPx, marginPx, width - 2 * marginPx, height - 2 * marginPx)
  ctx.clip()

  ctx.strokeStyle = settings.lineColor
  ctx.fillStyle = settings.lineColor
  ctx.lineWidth = lineWidthPx

  const contentX = marginPx
  const contentY = marginPx
  const contentW = width - 2 * marginPx
  const contentH = height - 2 * marginPx

  switch (settings.gridType) {
    case 'square':
      drawSquareGrid(ctx, contentX, contentY, contentW, contentH, gridSizePx)
      break
    case 'dot':
      drawDotGrid(ctx, contentX, contentY, contentW, contentH, gridSizePx, lineWidthPx)
      break
    case 'isometric':
      drawIsometricGrid(ctx, contentX, contentY, contentW, contentH, gridSizePx, lineWidthPx)
      break
    case 'lined':
      drawLinedPaper(ctx, contentX, contentY, contentW, contentH, gridSizePx, lineWidthPx, width, marginPx)
      break
    case 'cornell':
      drawCornellNotes(ctx, contentX, contentY, contentW, contentH, gridSizePx, lineWidthPx)
      break
    case 'grid5x5':
      draw5x5Grid(ctx, contentX, contentY, contentW, contentH, gridSizePx, lineWidthPx)
      break
  }

  ctx.restore()

  if (settings.showRuler) {
    drawCalibrationRuler(ctx, width, height, marginPx)
  }

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
}

const drawSquareGrid = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number
) => {
  for (let gx = x; gx <= x + w; gx += size) {
    ctx.beginPath()
    ctx.moveTo(Math.round(gx) + 0.5, y)
    ctx.lineTo(Math.round(gx) + 0.5, y + h)
    ctx.stroke()
  }
  for (let gy = y; gy <= y + h; gy += size) {
    ctx.beginPath()
    ctx.moveTo(x, Math.round(gy) + 0.5)
    ctx.lineTo(x + w, Math.round(gy) + 0.5)
    ctx.stroke()
  }
}

const drawDotGrid = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
  lineWidth: number
) => {
  const dotRadius = Math.max(0.8, lineWidth * 2)
  for (let dx = x + size; dx < x + w; dx += size) {
    for (let dy = y + size; dy < y + h; dy += size) {
      ctx.beginPath()
      ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const drawIsometricGrid = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
  lineWidth: number
) => {
  const isoH = size * Math.sqrt(3) / 2
  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = lineWidth

  for (let hy = y; hy <= y + h + isoH; hy += isoH) {
    ctx.beginPath()
    ctx.moveTo(x, hy)
    ctx.lineTo(x + w, hy)
    ctx.stroke()
  }

  for (let sx = x - w; sx < x + w * 2; sx += size * 1.5) {
    ctx.beginPath()
    ctx.moveTo(sx, y)
    ctx.lineTo(sx + h * Math.tan(Math.PI / 6), y + h)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(sx, y)
    ctx.lineTo(sx - h * Math.tan(Math.PI / 6), y + h)
    ctx.stroke()
  }
}

const drawLinedPaper = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
  lineWidth: number,
  fullWidth: number,
  marginPx: number
) => {
  const redLineX = x + mmToPx(20)

  ctx.strokeStyle = 'rgba(255, 80, 80, 0.5)'
  ctx.lineWidth = Math.max(0.5, lineWidth * 1.5)
  ctx.beginPath()
  ctx.moveTo(Math.round(redLineX) + 0.5, y)
  ctx.lineTo(Math.round(redLineX) + 0.5, y + h)
  ctx.stroke()

  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = lineWidth
  for (let ly = y + size; ly <= y + h; ly += size) {
    ctx.beginPath()
    ctx.moveTo(x, Math.round(ly) + 0.5)
    ctx.lineTo(x + w, Math.round(ly) + 0.5)
    ctx.stroke()
  }
}

const drawCornellNotes = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineHeight: number,
  lineWidth: number
) => {
  const topSectionH = mmToPx(25)
  const bottomSectionH = mmToPx(50)
  const cueW = w * 0.3
  const mainContentY = y + topSectionH
  const mainContentH = h - topSectionH - bottomSectionH

  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = lineWidth

  for (let ly = mainContentY + lineHeight; ly <= y + h - bottomSectionH; ly += lineHeight) {
    ctx.beginPath()
    ctx.moveTo(x, Math.round(ly) + 0.5)
    ctx.lineTo(x + w, Math.round(ly) + 0.5)
    ctx.stroke()
  }

  ctx.lineWidth = lineWidth * 2
  ctx.beginPath()
  ctx.moveTo(x, Math.round(mainContentY) + 0.5)
  ctx.lineTo(x + w, Math.round(mainContentY) + 0.5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x, Math.round(y + h - bottomSectionH) + 0.5)
  ctx.lineTo(x + w, Math.round(y + h - bottomSectionH) + 0.5)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(Math.round(x + cueW) + 0.5, mainContentY)
  ctx.lineTo(Math.round(x + cueW) + 0.5, y + h - bottomSectionH)
  ctx.stroke()

  ctx.lineWidth = lineWidth
  for (let ly = y + h - bottomSectionH + lineHeight; ly <= y + h; ly += lineHeight) {
    ctx.beginPath()
    ctx.moveTo(x, Math.round(ly) + 0.5)
    ctx.lineTo(x + w, Math.round(ly) + 0.5)
    ctx.stroke()
  }
}

const draw5x5Grid = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  smallSize: number,
  thinWidth: number
) => {
  const bigSize = smallSize * 5
  const thickWidth = thinWidth * 2.5

  ctx.lineWidth = thinWidth
  for (let gx = x; gx <= x + w; gx += smallSize) {
    ctx.beginPath()
    ctx.moveTo(Math.round(gx) + 0.5, y)
    ctx.lineTo(Math.round(gx) + 0.5, y + h)
    ctx.stroke()
  }
  for (let gy = y; gy <= y + h; gy += smallSize) {
    ctx.beginPath()
    ctx.moveTo(x, Math.round(gy) + 0.5)
    ctx.lineTo(x + w, Math.round(gy) + 0.5)
    ctx.stroke()
  }

  ctx.strokeStyle = settings.lineColor.replace(/[\d.]+\)$/, '1)')
  ctx.lineWidth = thickWidth
  for (let gx = x; gx <= x + w; gx += bigSize) {
    ctx.beginPath()
    ctx.moveTo(Math.round(gx) + 0.5, y)
    ctx.lineTo(Math.round(gx) + 0.5, y + h)
    ctx.stroke()
  }
  for (let gy = y; gy <= y + h; gy += bigSize) {
    ctx.beginPath()
    ctx.moveTo(x, Math.round(gy) + 0.5)
    ctx.lineTo(x + w, Math.round(gy) + 0.5)
    ctx.stroke()
  }
}

const drawCalibrationRuler = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  margin: number
) => {
  const rulerColor = 'rgba(220, 38, 38, 0.9)'
  const rulerBg = 'rgba(255, 240, 240, 0.95)'
  const rulerH = mmToPx(10)
  const rulerW = mmToPx(110)

  const drawRuler = (rx: number, ry: number, horizontal: boolean) => {
    const w = horizontal ? rulerW : rulerH
    const h = horizontal ? rulerH : rulerW
    const length = horizontal ? rulerW : rulerW

    ctx.fillStyle = rulerBg
    ctx.fillRect(rx, ry, w, h)

    ctx.strokeStyle = rulerColor
    ctx.lineWidth = 0.5
    ctx.strokeRect(rx + 0.5, ry + 0.5, w - 1, h - 1)

    ctx.fillStyle = rulerColor
    ctx.font = `bold ${mmToPx(2.5)}px sans-serif`
    ctx.textBaseline = 'top'

    const maxCm = 10
    for (let cm = 0; cm <= maxCm; cm++) {
      const mm = cm * 10
      const pos = mmToPx(mm)

      if (horizontal) {
        const px = rx + pos
        const longTick = mmToPx(5)
        const shortTick = mmToPx(2.5)

        if (cm % 1 === 0) {
          ctx.fillRect(px, ry, 1, longTick)
          if (cm <= maxCm) {
            ctx.textAlign = 'center'
            ctx.fillText(`${cm}cm`, px, ry + longTick + mmToPx(0.5))
          }
        }

        for (let m = 1; m < 10 && cm < maxCm; m++) {
          const subPx = rx + mmToPx(cm * 10 + m)
          const tickH = m === 5 ? longTick * 0.7 : shortTick
          ctx.fillRect(subPx, ry, 0.5, tickH)
        }
      } else {
        const py = ry + pos
        const longTick = mmToPx(5)
        const shortTick = mmToPx(2.5)

        if (cm % 1 === 0) {
          ctx.fillRect(rx, py, longTick, 1)
          if (cm <= maxCm) {
            ctx.textAlign = 'left'
            ctx.save()
            ctx.translate(rx + longTick + mmToPx(0.5), py)
            ctx.rotate(-Math.PI / 2)
            ctx.fillText(`${cm}cm`, 0, 0)
            ctx.restore()
          }
        }

        for (let m = 1; m < 10 && cm < maxCm; m++) {
          const subPy = ry + mmToPx(cm * 10 + m)
          const tickW = m === 5 ? longTick * 0.7 : shortTick
          ctx.fillRect(rx, subPy, tickW, 0.5)
        }
      }
    }
  }

  const rx = Math.max(margin * 0.5, mmToPx(5))
  const ry = Math.max(margin * 0.5, mmToPx(5))
  drawRuler(rx, ry, true)
  drawRuler(rx, ry + mmToPx(11), false)

  ctx.fillStyle = rulerColor
  ctx.font = `bold ${mmToPx(2.8)}px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('← 校准尺：请用真实尺子核对刻度 →', rx, ry + mmToPx(22))
}

const presets: Record<string, Partial<GridSettings>> = {
  designer: {
    gridType: 'square',
    gridSizeMm: 2,
    lineWidthMm: 0.1,
    lineColor: 'rgba(100, 149, 237, 0.4)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 10,
    showRuler: false
  },
  student: {
    gridType: 'lined',
    gridSizeMm: 8,
    lineWidthMm: 0.15,
    lineColor: 'rgba(100, 149, 237, 0.8)',
    bgColor: '#fffef0',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 15,
    showRuler: false
  },
  journal: {
    gridType: 'dot',
    gridSizeMm: 5,
    lineWidthMm: 0.3,
    lineColor: 'rgba(180, 160, 200, 0.7)',
    bgColor: '#fdf6ec',
    paperSize: 'a5',
    orientation: 'portrait',
    marginMm: 10,
    showRuler: false
  },
  calligraphy: {
    gridType: 'grid5x5',
    gridSizeMm: 10,
    lineWidthMm: 0.2,
    lineColor: 'rgba(255, 100, 100, 0.7)',
    bgColor: '#fffef0',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 15,
    showRuler: false
  },
  cornell: {
    gridType: 'cornell',
    gridSizeMm: 7,
    lineWidthMm: 0.15,
    lineColor: 'rgba(100, 149, 237, 0.6)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 0,
    showRuler: false
  },
  dotted: {
    gridType: 'dot',
    gridSizeMm: 5,
    lineWidthMm: 0.2,
    lineColor: 'rgba(150, 150, 150, 0.6)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 10,
    showRuler: false
  },
  math: {
    gridType: 'square',
    gridSizeMm: 2,
    lineWidthMm: 0.1,
    lineColor: 'rgba(60, 60, 60, 0.4)',
    bgColor: '#fffef5',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 10,
    showRuler: false
  },
  graph5mm: {
    gridType: 'square',
    gridSizeMm: 5,
    lineWidthMm: 0.15,
    lineColor: 'rgba(30, 100, 200, 0.5)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait',
    marginMm: 10,
    showRuler: true
  }
}

const applyPreset = (type: string) => {
  const preset = presets[type]
  if (preset) {
    Object.assign(settings, preset)
    nextTick(() => {
      drawGrid()
    })
    const names: Record<string, string> = {
      designer: '设计师草图',
      student: '学生练习',
      journal: '手账模板',
      calligraphy: '书法练习',
      cornell: '康奈尔笔记',
      dotted: '点阵笔记',
      math: '数学坐标纸',
      graph5mm: '标准5mm方格'
    }
    ElMessage.success(`已加载${names[type]}预设`)
  }
}

const printGrid = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器设置')
    return
  }

  const dataUrl = canvas.toDataURL('image/png', 1.0)
  const dims = paperDimensionsMm[settings.paperSize]
  const { width, height } = getPaperPixelDimensions()
  const isLandscape = settings.orientation === 'landscape'
  const cssW = isLandscape ? dims.heightMm : dims.widthMm
  const cssH = isLandscape ? dims.widthMm : dims.heightMm

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>格子纸 - ${paperSizeLabel.value} - ${gridTypeLabel.value}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; }
        @page {
          size: ${settings.paperSize.toUpperCase()} ${isLandscape ? 'landscape' : 'portrait'};
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .paper-container {
            width: ${cssW}mm;
            height: ${cssH}mm;
            margin: 0 auto;
            padding: 0;
          }
          .paper-image {
            width: ${cssW}mm;
            height: ${cssH}mm;
            display: block;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          .no-print { display: none !important; }
        }
        @media screen {
          body {
            background: #e5e7eb;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .print-header {
            max-width: ${cssW}mm;
            margin: 0 auto 16px;
            padding: 16px 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .print-header h3 {
            margin: 0 0 8px 0;
            color: #111827;
            font-size: 16px;
          }
          .print-header p {
            margin: 4px 0;
            color: #6b7280;
            font-size: 13px;
          }
          .print-header .warning {
            margin-top: 12px;
            padding: 10px 14px;
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            border-radius: 4px;
            color: #92400e;
            font-size: 13px;
          }
          .print-header button {
            margin-top: 12px;
            padding: 8px 20px;
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
          }
          .print-header button:hover {
            background: #1d4ed8;
          }
          .paper-container {
            width: ${cssW}mm;
            height: ${cssH}mm;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            background: #fff;
          }
          .paper-image {
            width: 100%;
            height: 100%;
            display: block;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print print-header">
        <h3>🖨️ 格子纸打印预览</h3>
        <p><strong>纸张：</strong>${paperSizeLabel.value}（${isLandscape ? '横向' : '竖向'}）</p>
        <p><strong>网格：</strong>${gridTypeLabel.value} · ${settings.gridSizeMm}mm/格</p>
        <div class="warning">
          ⚠️ <strong>打印设置提示：</strong>请在打印对话框中设置「缩放 = 100%（实际大小）」、「边距 = 无」，否则尺寸可能不准！
        </div>
        <button onclick="window.print()">🖨️ 立即打印</button>
      </div>
      <div class="paper-container">
        <img class="paper-image" src="${dataUrl}" alt="格子纸" />
      </div>
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => {
    }, 500)
  }
}

const downloadImage = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const link = document.createElement('a')
  const dims = paperDimensionsMm[settings.paperSize]
  link.download = `grid-paper-${settings.paperSize}-${settings.gridType}-${settings.gridSizeMm}mm-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
  ElMessage.success('高清图片已下载')
}

const handleResize = () => {
  drawGrid()
}

onMounted(() => {
  nextTick(() => {
    drawGrid()
  })
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.grid-paper {
  max-width: 1400px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 16px;
}

.guide-steps {
  padding: 10px 0;
}

.print-tips {
  margin-bottom: 16px;
}

.tips-content {
  line-height: 1.8;
}

.tips-content p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.settings-card {
  height: 100%;
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

.preview-container {
  width: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
  padding: 20px;
  border-radius: 8px;
  overflow: auto;
}

.canvas-wrapper {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background: #fff;
  transition: all 0.3s ease;
}

.canvas-wrapper :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.preview-info {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-buttons .el-button {
  margin: 0;
}

:deep(.el-radio-button) {
  margin-bottom: 8px;
}

.calibration-guide h4 {
  margin: 16px 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.calibration-guide p,
.calibration-guide li {
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}

.calibration-guide ol,
.calibration-guide ul {
  padding-left: 20px;
  margin: 8px 0;
}

.calibration-guide li {
  margin-bottom: 4px;
}
</style>
