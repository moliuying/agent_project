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
        <el-step title="调整参数" description="自定义格子大小、线条颜色、纸张尺寸" />
        <el-step title="预览打印" description="实时预览效果，一键打印输出" />
      </el-steps>
    </el-card>

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

          <el-form label-width="100px">
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
                    v-model="settings.gridSize"
                    :min="5"
                    :max="50"
                    :step="1"
                    show-input
                    size="small"
                    @change="drawGrid"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="线条粗细">
                  <el-slider
                    v-model="settings.lineWidth"
                    :min="0.3"
                    :max="3"
                    :step="0.1"
                    show-input
                    @change="drawGrid"
                  />
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
            </el-form-item>

            <el-form-item label="纸张方向">
              <el-radio-group v-model="settings.orientation" @change="drawGrid">
                <el-radio-button value="portrait">竖向</el-radio-button>
                <el-radio-button value="landscape">横向</el-radio-button>
              </el-radio-group>
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
            <div class="canvas-wrapper">
              <canvas ref="canvasRef"></canvas>
            </div>
          </div>

          <div class="preview-info">
            <el-tag size="small">纸张: {{ paperSizeLabel }}</el-tag>
            <el-tag size="small" type="success">网格: {{ gridTypeLabel }}</el-tag>
            <el-tag size="small" type="warning">格子: {{ settings.gridSize }}px</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
  Grid
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface GridSettings {
  gridType: string
  gridSize: number
  lineWidth: number
  lineColor: string
  bgColor: string
  paperSize: string
  orientation: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewContainer = ref<HTMLElement | null>(null)

const settings = reactive<GridSettings>({
  gridType: 'square',
  gridSize: 20,
  lineWidth: 0.5,
  lineColor: 'rgba(180, 180, 180, 0.8)',
  bgColor: '#ffffff',
  paperSize: 'a4',
  orientation: 'portrait'
})

const paperDimensions: Record<string, { width: number; height: number }> = {
  a4: { width: 794, height: 1123 },
  a5: { width: 559, height: 794 },
  letter: { width: 816, height: 1056 }
}

const paperSizeLabel = computed(() => {
  const map: Record<string, string> = {
    a4: 'A4 (210×297mm)',
    a5: 'A5 (148×210mm)',
    letter: 'Letter (8.5×11in)'
  }
  return map[settings.paperSize]
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

const getCanvasDimensions = () => {
  const dims = paperDimensions[settings.paperSize]
  if (settings.orientation === 'landscape') {
    return { width: dims.height, height: dims.width }
  }
  return dims
}

const drawGrid = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = getCanvasDimensions()

  const container = previewContainer.value
  if (container) {
    const maxWidth = container.clientWidth - 40
    const scale = Math.min(maxWidth / width, 0.8)
    canvas.style.width = `${width * scale}px`
    canvas.style.height = `${height * scale}px`
  }

  canvas.width = width
  canvas.height = height

  ctx.fillStyle = settings.bgColor
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = settings.lineColor
  ctx.fillStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth

  switch (settings.gridType) {
    case 'square':
      drawSquareGrid(ctx, width, height)
      break
    case 'dot':
      drawDotGrid(ctx, width, height)
      break
    case 'isometric':
      drawIsometricGrid(ctx, width, height)
      break
    case 'lined':
      drawLinedPaper(ctx, width, height)
      break
    case 'cornell':
      drawCornellNotes(ctx, width, height)
      break
    case 'grid5x5':
      draw5x5Grid(ctx, width, height)
      break
  }
}

const drawSquareGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = settings.gridSize
  for (let x = 0; x <= width; x += size) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += size) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

const drawDotGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = settings.gridSize
  const dotRadius = Math.max(0.8, settings.lineWidth * 1.5)
  for (let x = size; x < width; x += size) {
    for (let y = size; y < height; y += size) {
      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const drawIsometricGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = settings.gridSize
  const h = size * Math.sqrt(3) / 2

  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth

  for (let y = 0; y <= height + h; y += h) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  for (let startX = -width; startX < width * 2; startX += size * 1.5) {
    ctx.beginPath()
    ctx.moveTo(startX, 0)
    ctx.lineTo(startX + width * Math.tan(Math.PI / 6), height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(startX, 0)
    ctx.lineTo(startX - width * Math.tan(Math.PI / 6), height)
    ctx.stroke()
  }
}

const drawLinedPaper = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = settings.gridSize
  const marginLeft = 60
  const marginTop = 80

  ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(marginLeft, marginTop)
  ctx.lineTo(marginLeft, height)
  ctx.stroke()

  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth
  for (let y = marginTop; y <= height; y += size) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

const drawCornellNotes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const marginTop = 100
  const marginBottom = 100
  const cueWidth = width * 0.3
  const lineHeight = settings.gridSize

  ctx.strokeStyle = settings.lineColor
  ctx.lineWidth = settings.lineWidth

  for (let y = marginTop; y <= height - marginBottom; y += lineHeight) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.lineWidth = settings.lineWidth * 2
  ctx.beginPath()
  ctx.moveTo(0, marginTop)
  ctx.lineTo(width, marginTop)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, height - marginBottom)
  ctx.lineTo(width, height - marginBottom)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cueWidth, marginTop)
  ctx.lineTo(cueWidth, height - marginBottom)
  ctx.stroke()

  ctx.lineWidth = settings.lineWidth
  for (let y = height - marginBottom + lineHeight; y <= height; y += lineHeight) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

const draw5x5Grid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const smallSize = settings.gridSize
  const bigSize = smallSize * 5
  const thinWidth = settings.lineWidth
  const thickWidth = settings.lineWidth * 2

  ctx.lineWidth = thinWidth
  for (let x = 0; x <= width; x += smallSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += smallSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.lineWidth = thickWidth
  for (let x = 0; x <= width; x += bigSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += bigSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

const presets: Record<string, Partial<GridSettings>> = {
  designer: {
    gridType: 'square',
    gridSize: 10,
    lineWidth: 0.3,
    lineColor: 'rgba(100, 149, 237, 0.5)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait'
  },
  student: {
    gridType: 'lined',
    gridSize: 28,
    lineWidth: 0.5,
    lineColor: 'rgba(100, 149, 237, 0.8)',
    bgColor: '#fffef0',
    paperSize: 'a4',
    orientation: 'portrait'
  },
  journal: {
    gridType: 'dot',
    gridSize: 15,
    lineWidth: 0.8,
    lineColor: 'rgba(180, 160, 200, 0.7)',
    bgColor: '#fdf6ec',
    paperSize: 'a5',
    orientation: 'portrait'
  },
  calligraphy: {
    gridType: 'grid5x5',
    gridSize: 30,
    lineWidth: 0.8,
    lineColor: 'rgba(255, 100, 100, 0.7)',
    bgColor: '#fffef0',
    paperSize: 'a4',
    orientation: 'portrait'
  },
  cornell: {
    gridType: 'cornell',
    gridSize: 28,
    lineWidth: 0.5,
    lineColor: 'rgba(100, 149, 237, 0.6)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait'
  },
  dotted: {
    gridType: 'dot',
    gridSize: 20,
    lineWidth: 0.5,
    lineColor: 'rgba(150, 150, 150, 0.6)',
    bgColor: '#ffffff',
    paperSize: 'a4',
    orientation: 'portrait'
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
      dotted: '点阵笔记'
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

  const dataUrl = canvas.toDataURL('image/png')
  const { width, height } = getCanvasDimensions()

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>格子纸打印</title>
      <style>
        @page {
          size: ${settings.paperSize.toUpperCase()} ${settings.orientation === 'landscape' ? 'landscape' : 'portrait'};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        img {
          width: 100%;
          height: auto;
          display: block;
        }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" />
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }
}

const downloadImage = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const link = document.createElement('a')
  link.download = `grid-paper-${settings.gridType}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  ElMessage.success('图片已下载')
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
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
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
}

.canvas-wrapper :deep(canvas) {
  display: block;
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
</style>
