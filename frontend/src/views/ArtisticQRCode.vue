<template>
  <div class="artistic-qrcode">
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
        <el-step title="输入内容" description="输入URL链接或任意文字内容" />
        <el-step title="选择风格" description="选择艺术风格或自定义参数" />
        <el-step title="添加Logo" description="可选：上传中心Logo图片" />
        <el-step title="下载使用" description="一键下载高清PNG图片" />
      </el-steps>
    </el-card>

    <el-row :gutter="24">
      <el-col :span="9">
        <el-card class="settings-card">
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
              <div class="form-hint">容错越高，二维码越耐磨损，推荐选择"高"</div>
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
            <el-form-item label="尺寸">
              <el-slider
                v-model="qrSize"
                :min="200"
                :max="1000"
                :step="50"
                show-input
                size="small"
                @change="generateQR"
              />
              <div class="unit-label">{{ qrSize }} x {{ qrSize }} px</div>
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
                <el-button type="primary" :icon="Download" @click="downloadPNG">
                  下载 PNG
                </el-button>
              </div>
            </div>
          </template>

          <div class="preview-container">
            <div class="canvas-wrapper">
              <canvas ref="qrCanvasRef" :width="qrSize" :height="qrSize"></canvas>
            </div>
          </div>

          <div class="preview-info">
            <el-tag size="small">风格: {{ currentStyleName }}</el-tag>
            <el-tag size="small" type="success">尺寸: {{ qrSize }}px</el-tag>
            <el-tag size="small" type="warning" v-if="useGradient">渐变效果</el-tag>
            <el-tag size="small" type="info">容错: {{ errorLevelText }}</el-tag>
            <el-tag size="small" type="danger" v-if="logoImage">含Logo</el-tag>
          </div>
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
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import QRCode from 'qrcode'

interface ArtStyle {
  id: string
  name: string
  previewStyle: Record<string, string>
  apply: () => void
}

const qrCanvasRef = ref<HTMLCanvasElement | null>(null)
const qrContent = ref('https://www.example.com')
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('H')
const qrSize = ref(600)
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

const errorLevelText = computed(() => {
  const map: Record<string, string> = { L: '低 7%', M: '中 15%', Q: '较高 25%', H: '高 30%' }
  return map[errorLevel.value]
})

const currentStyleName = computed(() => {
  const style = artStyles.find(s => s.id === currentStyle.value)
  return style?.name || '自定义'
})

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

const generateQR = async () => {
  const canvas = qrCanvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (!qrContent.value.trim()) {
    ElMessage.warning('请输入二维码内容')
    return
  }

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

    canvas.width = qrSize.value
    canvas.height = qrSize.value

    drawBackground(ctx)
    drawPattern(ctx)

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

const drawBackground = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, qrSize.value, qrSize.value)
}

const drawPattern = (ctx: CanvasRenderingContext2D) => {
  if (bgPattern.value === 'none') return

  ctx.save()
  ctx.fillStyle = patternColor.value
  ctx.strokeStyle = patternColor.value
  ctx.lineWidth = 1

  const size = patternSize.value

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
  const scale = (qrSize.value - marginPx * 2) / (qrWidth - cellSize * 2)

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

const downloadPNG = () => {
  const canvas = qrCanvasRef.value
  if (!canvas) return

  if (!qrContent.value.trim()) {
    ElMessage.warning('请先输入二维码内容')
    return
  }

  const link = document.createElement('a')
  link.download = `artistic-qrcode-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
  ElMessage.success('高清PNG已下载')
}

watch(currentStyle, () => {
  nextTick(() => generateQR())
})

onMounted(() => {
  nextTick(() => {
    generateQR()
  })
})
</script>

<style scoped>
.artistic-qrcode {
  max-width: 1600px;
  margin: 0 auto;
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

.canvas-wrapper {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
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
</style>
