<template>
  <div class="whiteboard-container">
    <div class="toolbar">
      <div class="toolbar-group">
        <div class="tool-btn-wrapper">
          <el-tooltip content="选择/移动">
            <el-button
              :type="currentTool === 'select' ? 'primary' : 'default'"
              :icon="Pointer"
              @click="setTool('select')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">V</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="画笔">
            <el-button
              :type="currentTool === 'pen' ? 'primary' : 'default'"
              :icon="EditPen"
              @click="setTool('pen')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">P</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="橡皮擦">
            <el-button
              :type="currentTool === 'eraser' ? 'primary' : 'default'"
              :icon="Delete"
              @click="setTool('eraser')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">E</span>
        </div>
      </div>

      <el-divider direction="vertical" />

      <div class="toolbar-group">
        <div class="tool-btn-wrapper">
          <el-tooltip content="直线">
            <el-button
              :type="currentTool === 'line' ? 'primary' : 'default'"
              :icon="Minus"
              @click="setTool('line')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">L</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="箭头">
            <el-button
              :type="currentTool === 'arrow' ? 'primary' : 'default'"
              :icon="Right"
              @click="setTool('arrow')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">A</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="矩形">
            <el-button
              :type="currentTool === 'rect' ? 'primary' : 'default'"
              :icon="Grid"
              @click="setTool('rect')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">R</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="圆形">
            <el-button
              :type="currentTool === 'circle' ? 'primary' : 'default'"
              :icon="CircleCheck"
              @click="setTool('circle')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">C</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="文字">
            <el-button
              :type="currentTool === 'text' ? 'primary' : 'default'"
              :icon="Edit"
              @click="setTool('text')"
              circle
            />
          </el-tooltip>
          <span class="shortcut-badge">T</span>
        </div>
      </div>

      <el-divider direction="vertical" />

      <div class="toolbar-group">
        <el-tooltip content="颜色">
          <div class="color-picker-wrapper">
            <el-color-picker
              v-model="strokeColor"
              show-alpha
              size="small"
              @change="handleColorChange"
            />
          </div>
        </el-tooltip>

        <el-tooltip content="线宽">
          <div class="line-width-control">
            <el-dropdown trigger="click">
              <el-button circle size="small">
                <div
                  class="line-width-preview"
                  :style="{ width: `${lineWidth}px`, height: `${lineWidth}px` }"
                />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="setLineWidth(1)">
                    <div class="line-width-option">
                      <div class="line-dot" style="width: 2px; height: 2px" />
                      <span>极细 (1px)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="setLineWidth(3)">
                    <div class="line-width-option">
                      <div class="line-dot" style="width: 4px; height: 4px" />
                      <span>细 (3px)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="setLineWidth(6)">
                    <div class="line-width-option">
                      <div class="line-dot" style="width: 7px; height: 7px" />
                      <span>中 (6px)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="setLineWidth(10)">
                    <div class="line-width-option">
                      <div class="line-dot" style="width: 11px; height: 11px" />
                      <span>粗 (10px)</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="setLineWidth(20)">
                    <div class="line-width-option">
                      <div class="line-dot" style="width: 20px; height: 20px" />
                      <span>极粗 (20px)</span>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-tooltip>

        <el-tooltip content="填充">
          <el-switch v-model="fillEnabled" size="small" />
        </el-tooltip>
        <el-color-picker
          v-if="fillEnabled"
          v-model="fillColor"
          show-alpha
          size="small"
        />
      </div>

      <el-divider direction="vertical" />

      <div class="toolbar-group">
        <div class="tool-btn-wrapper">
          <el-tooltip content="撤销">
            <el-button :icon="RefreshLeft" @click="undo" :disabled="historyIndex <= 0" circle />
          </el-tooltip>
          <span class="shortcut-badge shortcut-combo">⌘Z</span>
        </div>
        <div class="tool-btn-wrapper">
          <el-tooltip content="重做">
            <el-button :icon="RefreshRight" @click="redo" :disabled="historyIndex >= history.length - 1" circle />
          </el-tooltip>
          <span class="shortcut-badge shortcut-combo">⌘Y</span>
        </div>
        <el-tooltip content="清空画布">
          <el-button :icon="DeleteFilled" @click="clearCanvas" type="danger" circle />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="toolbar-group">
        <div class="tool-btn-wrapper">
          <el-tooltip content="缩小">
            <el-button :icon="ZoomOut" @click="zoomOut" circle />
          </el-tooltip>
          <span class="shortcut-badge shortcut-simple">-</span>
        </div>
        <el-button @click="resetView" size="small" class="scale-btn">
          {{ Math.round(scale * 100) }}%
        </el-button>
        <div class="tool-btn-wrapper">
          <el-tooltip content="放大">
            <el-button :icon="ZoomIn" @click="zoomIn" circle />
          </el-tooltip>
          <span class="shortcut-badge shortcut-simple">+</span>
        </div>
        <el-tooltip content="重置视图">
          <el-button :icon="FullScreen" @click="resetView" circle />
        </el-tooltip>
      </div>

      <div class="toolbar-group toolbar-right">
        <el-tooltip content="快捷键帮助 (?)">
          <el-button :icon="QuestionFilled" @click="showShortcutHelp = true" circle />
        </el-tooltip>
        <el-tooltip content="导出 PNG">
          <el-button :icon="Download" @click="exportPNG" circle />
        </el-tooltip>
      </div>
    </div>

    <div
      class="canvas-container"
      ref="canvasContainerRef"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @contextmenu.prevent
    >
      <canvas ref="gridCanvasRef" class="grid-canvas" />
      <canvas ref="drawCanvasRef" class="draw-canvas" />
      <canvas ref="previewCanvasRef" class="preview-canvas" />

      <div
        v-if="currentTool === 'text' && textInputVisible"
        class="text-input-overlay"
        :style="textInputStyle"
      >
        <textarea
          ref="textInputRef"
          v-model="textInputValue"
          class="text-input"
          :style="textAreaStyle"
          placeholder="输入文字..."
          @blur="handleTextBlur"
          @keydown.enter.ctrl="handleTextEnter"
          @keydown.esc="cancelTextInput"
        />
        <div class="text-input-hint">Ctrl+Enter 确认，Esc 取消</div>
      </div>
    </div>

    <div class="status-bar">
      <span class="status-item">
        <el-icon><component :is="getToolIcon(currentTool)" /></el-icon>
        {{ toolLabels[currentTool] }}
      </span>
      <span class="status-item">坐标: ({{ Math.round(mousePos.x) }}, {{ Math.round(mousePos.y) }})</span>
      <span class="status-item">缩放: {{ Math.round(scale * 100) }}%</span>
      <span class="status-item">元素: {{ shapes.length }}</span>
      <span class="status-hint">
        <el-tag size="small" type="info" effect="plain" class="kbd-hint">空格</el-tag>
        拖拽平移
        <el-tag size="small" type="info" effect="plain" class="kbd-hint">滚轮</el-tag>
        缩放
        <el-tag size="small" type="info" effect="plain" class="kbd-hint">⌘Z</el-tag>
        撤销
        <el-tag size="small" type="info" effect="plain" class="kbd-hint" @click="showShortcutHelp = true">?</el-tag>
        快捷键
      </span>
    </div>

    <el-dialog v-model="showShortcutHelp" title="⌨️ 快捷键参考" width="600px" class="shortcut-dialog">
      <div class="shortcut-content">
        <div class="shortcut-section">
          <h4>🎨 绘图工具</h4>
          <div class="shortcut-grid">
            <div class="shortcut-row"><span class="kbd">V</span><span>选择/移动</span></div>
            <div class="shortcut-row"><span class="kbd">P</span><span>画笔</span></div>
            <div class="shortcut-row"><span class="kbd">E</span><span>橡皮擦</span></div>
            <div class="shortcut-row"><span class="kbd">L</span><span>直线</span></div>
            <div class="shortcut-row"><span class="kbd">A</span><span>箭头</span></div>
            <div class="shortcut-row"><span class="kbd">R</span><span>矩形</span></div>
            <div class="shortcut-row"><span class="kbd">C</span><span>圆形</span></div>
            <div class="shortcut-row"><span class="kbd">T</span><span>文字</span></div>
          </div>
        </div>

        <div class="shortcut-section">
          <h4>🔧 编辑操作</h4>
          <div class="shortcut-grid">
            <div class="shortcut-row"><span class="kbd"><span>⌘</span>+<span>Z</span></span><span>撤销</span></div>
            <div class="shortcut-row"><span class="kbd"><span>⌘</span>+<span>Y</span></span><span>重做</span></div>
            <div class="shortcut-row"><span class="kbd">Esc</span><span>取消文字输入</span></div>
            <div class="shortcut-row"><span class="kbd"><span>⌘</span>+<span>Enter</span></span><span>确认文字输入</span></div>
          </div>
        </div>

        <div class="shortcut-section">
          <h4>🖼️ 画布导航</h4>
          <div class="shortcut-grid">
            <div class="shortcut-row"><span class="kbd">空格</span><span>+ 拖拽平移画布</span></div>
            <div class="shortcut-row"><span class="kbd">滚轮</span><span>缩放画布（以鼠标为中心）</span></div>
            <div class="shortcut-row"><span class="kbd">+</span><span>放大</span></div>
            <div class="shortcut-row"><span class="kbd">-</span><span>缩小</span></div>
            <div class="shortcut-row"><span class="kbd">0</span><span>重置视图 (100%)</span></div>
            <div class="shortcut-row"><span class="kbd">?</span><span>打开快捷键帮助</span></div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showShortcutHelp = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import {
  Pointer,
  EditPen,
  Delete,
  DeleteFilled,
  Minus,
  Right,
  Grid,
  CircleCheck,
  Edit,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut,
  FullScreen,
  Download,
  QuestionFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Component } from 'vue'

type ToolType = 'select' | 'pen' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'text'

interface Point {
  x: number
  y: number
}

interface BaseShape {
  id: string
  type: string
  strokeColor: string
  strokeWidth: number
  fillColor?: string
  fillEnabled: boolean
}

interface PenShape extends BaseShape {
  type: 'pen'
  points: Point[]
}

interface LineShape extends BaseShape {
  type: 'line' | 'arrow'
  start: Point
  end: Point
}

interface RectShape extends BaseShape {
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
}

interface CircleShape extends BaseShape {
  type: 'circle'
  cx: number
  cy: number
  rx: number
  ry: number
}

interface TextShape extends BaseShape {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
}

type Shape = PenShape | LineShape | RectShape | CircleShape | TextShape

const toolLabels: Record<ToolType, string> = {
  select: '选择/移动',
  pen: '画笔',
  eraser: '橡皮擦',
  line: '直线',
  arrow: '箭头',
  rect: '矩形',
  circle: '圆形',
  text: '文字'
}

const toolIcons: Record<ToolType, Component> = {
  select: Pointer,
  pen: EditPen,
  eraser: Delete,
  line: Minus,
  arrow: Right,
  rect: Grid,
  circle: CircleCheck,
  text: Edit
}

const getToolIcon = (tool: ToolType): Component => toolIcons[tool]

const showShortcutHelp = ref(false)

const canvasContainerRef = ref<HTMLElement | null>(null)
const gridCanvasRef = ref<HTMLCanvasElement | null>(null)
const drawCanvasRef = ref<HTMLCanvasElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const textInputRef = ref<HTMLTextAreaElement | null>(null)

const currentTool = ref<ToolType>('pen')
const strokeColor = ref('#165DFF')
const fillColor = ref('rgba(22, 93, 255, 0.2)')
const fillEnabled = ref(false)
const lineWidth = ref(3)
const fontSize = ref(18)

const offset = reactive<Point>({ x: 0, y: 0 })
const scale = ref(1)
const shapes = ref<Shape[]>([])
const history = ref<Shape[][]>([[]])
const historyIndex = ref(0)

const isDrawing = ref(false)
const isPanning = ref(false)
const spacePressed = ref(false)
const currentShape = ref<Shape | null>(null)
const panStart = reactive<Point>({ x: 0, y: 0 })
const mousePos = reactive<Point>({ x: 0, y: 0 })
const screenMousePos = reactive<Point>({ x: 0, y: 0 })

const textInputVisible = ref(false)
const textInputValue = ref('')
const textInsertPos = reactive<Point>({ x: 0, y: 0 })

const textInputStyle = computed(() => ({
  left: `${textInsertPos.x * scale.value + offset.x}px`,
  top: `${textInsertPos.y * scale.value + offset.y}px`
}))

const textAreaStyle = computed(() => ({
  color: strokeColor.value,
  fontSize: `${fontSize.value * scale.value}px`,
  lineHeight: `${fontSize.value * 1.4 * scale.value}px`
}))

const generateId = () => Math.random().toString(36).substring(2, 11)

const screenToWorld = (sx: number, sy: number): Point => ({
  x: (sx - offset.x) / scale.value,
  y: (sy - offset.y) / scale.value
})

const setTool = (tool: ToolType) => {
  currentTool.value = tool
  if (tool !== 'text' && textInputVisible.value) {
    cancelTextInput()
  }
}

const setLineWidth = (w: number) => {
  lineWidth.value = w
}

const handleColorChange = () => {
  // color is handled by v-model
}

const drawGrid = () => {
  const canvas = gridCanvasRef.value
  const container = canvasContainerRef.value
  if (!canvas || !container) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = container.clientWidth * dpr
  canvas.height = container.clientHeight * dpr
  canvas.style.width = `${container.clientWidth}px`
  canvas.style.height = `${container.clientHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  const w = container.clientWidth
  const h = container.clientHeight
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, w, h)

  const gridSize = 40 * scale.value
  const gridSizeLarge = 200 * scale.value

  const startX = ((offset.x % gridSize) + gridSize) % gridSize
  const startY = ((offset.y % gridSize) + gridSize) % gridSize

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'
  ctx.lineWidth = 1
  for (let x = startX; x < w; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = startY; y < h; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const startXL = ((offset.x % gridSizeLarge) + gridSizeLarge) % gridSizeLarge
  const startYL = ((offset.y % gridSizeLarge) + gridSizeLarge) % gridSizeLarge

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.lineWidth = 1
  for (let x = startXL; x < w; x += gridSizeLarge) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = startYL; y < h; y += gridSizeLarge) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}

const renderShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.save()
  ctx.strokeStyle = shape.strokeColor
  ctx.lineWidth = shape.strokeWidth * scale.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (shape.fillEnabled && shape.fillColor) {
    ctx.fillStyle = shape.fillColor
  }

  switch (shape.type) {
    case 'pen':
      if (shape.points.length < 2) {
        if (shape.points.length === 1) {
          const p = shape.points[0]
          ctx.beginPath()
          ctx.arc(p.x * scale.value + offset.x, p.y * scale.value + offset.y, shape.strokeWidth * scale.value / 2, 0, Math.PI * 2)
          ctx.fillStyle = shape.strokeColor
          ctx.fill()
        }
        break
      }
      ctx.beginPath()
      const first = shape.points[0]
      ctx.moveTo(first.x * scale.value + offset.x, first.y * scale.value + offset.y)
      for (let i = 1; i < shape.points.length; i++) {
        const p = shape.points[i]
        ctx.lineTo(p.x * scale.value + offset.x, p.y * scale.value + offset.y)
      }
      ctx.stroke()
      break

    case 'line':
    case 'arrow': {
      const sx = shape.start.x * scale.value + offset.x
      const sy = shape.start.y * scale.value + offset.y
      const ex = shape.end.x * scale.value + offset.x
      const ey = shape.end.y * scale.value + offset.y
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()

      if (shape.type === 'arrow') {
        const angle = Math.atan2(ey - sy, ex - sx)
        const headLen = 15 * scale.value
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6))
        ctx.strokeStyle = shape.strokeColor
        ctx.lineWidth = shape.strokeWidth * scale.value
        ctx.stroke()
      }
      break
    }

    case 'rect': {
      const x = shape.x * scale.value + offset.x
      const y = shape.y * scale.value + offset.y
      const w = shape.width * scale.value
      const h = shape.height * scale.value
      if (shape.fillEnabled) {
        ctx.fillRect(x, y, w, h)
      }
      ctx.strokeRect(x, y, w, h)
      break
    }

    case 'circle': {
      const cx = shape.cx * scale.value + offset.x
      const cy = shape.cy * scale.value + offset.y
      const rx = shape.rx * scale.value
      const ry = shape.ry * scale.value
      ctx.beginPath()
      ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2)
      if (shape.fillEnabled) {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'text': {
      ctx.font = `${shape.fontSize * scale.value}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
      ctx.fillStyle = shape.strokeColor
      ctx.textBaseline = 'top'
      const lines = shape.text.split('\n')
      lines.forEach((line, i) => {
        ctx.fillText(
          line,
          shape.x * scale.value + offset.x,
          shape.y * scale.value + offset.y + i * shape.fontSize * 1.4 * scale.value
        )
      })
      break
    }
  }

  ctx.restore()
}

const redrawCanvas = () => {
  const canvas = drawCanvasRef.value
  const container = canvasContainerRef.value
  if (!canvas || !container) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = container.clientWidth * dpr
  canvas.height = container.clientHeight * dpr
  canvas.style.width = `${container.clientWidth}px`
  canvas.style.height = `${container.clientHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, container.clientWidth, container.clientHeight)

  shapes.value.forEach(shape => renderShape(ctx, shape))
}

const clearPreview = () => {
  const canvas = previewCanvasRef.value
  const container = canvasContainerRef.value
  if (!canvas || !container) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = container.clientWidth * dpr
  canvas.height = container.clientHeight * dpr
  canvas.style.width = `${container.clientWidth}px`
  canvas.style.height = `${container.clientHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, container.clientWidth, container.clientHeight)
}

const drawPreview = (shape: Shape) => {
  clearPreview()
  const canvas = previewCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  renderShape(ctx, shape)
}

const eraseAt = (worldX: number, worldY: number) => {
  const eraseRadius = (lineWidth.value * 5) / scale.value
  const toRemove: string[] = []

  shapes.value = shapes.value.filter(shape => {
    if (shape.type === 'pen') {
      const hasPoint = shape.points.some(p => {
        const dx = p.x - worldX
        const dy = p.y - worldY
        return Math.sqrt(dx * dx + dy * dy) < eraseRadius
      })
      return !hasPoint
    }
    if (shape.type === 'line' || shape.type === 'arrow') {
      const dist = pointToLineDistance(worldX, worldY, shape.start, shape.end)
      return dist > eraseRadius
    }
    if (shape.type === 'rect') {
      const cx = shape.x + shape.width / 2
      const cy = shape.y + shape.height / 2
      const dx = Math.abs(worldX - cx)
      const dy = Math.abs(worldY - cy)
      return dx > Math.abs(shape.width) / 2 + eraseRadius || dy > Math.abs(shape.height) / 2 + eraseRadius
    }
    if (shape.type === 'circle') {
      const dx = worldX - shape.cx
      const dy = worldY - shape.cy
      const dist = Math.sqrt(dx * dx / (shape.rx * shape.rx) + dy * dy / (shape.ry * shape.ry))
      return dist > 1 + eraseRadius / Math.min(Math.abs(shape.rx), Math.abs(shape.ry))
    }
    if (shape.type === 'text') {
      const lines = shape.text.split('\n')
      const textW = Math.max(...lines.map(l => l.length * shape.fontSize * 0.6))
      const textH = lines.length * shape.fontSize * 1.4
      const cx = shape.x + textW / 2
      const cy = shape.y + textH / 2
      const dx = Math.abs(worldX - cx)
      const dy = Math.abs(worldY - cy)
      return dx > textW / 2 + eraseRadius || dy > textH / 2 + eraseRadius
    }
    return true
  })
}

const pointToLineDistance = (px: number, py: number, a: Point, b: Point): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) {
    return Math.sqrt((px - a.x) ** 2 + (py - a.y) ** 2)
  }
  let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const cx = a.x + t * dx
  const cy = a.y + t * dy
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
}

const handleMouseDown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('.text-input-overlay')) return

  const rect = (canvasContainerRef.value as HTMLElement).getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  screenMousePos.x = sx
  screenMousePos.y = sy

  const world = screenToWorld(sx, sy)
  mousePos.x = world.x
  mousePos.y = world.y

  if (e.button === 1 || (e.button === 0 && spacePressed.value)) {
    isPanning.value = true
    panStart.x = sx - offset.x
    panStart.y = sy - offset.y
    return
  }

  if (e.button !== 0) return

  if (currentTool.value === 'text') {
    textInsertPos.x = world.x
    textInsertPos.y = world.y
    textInputValue.value = ''
    textInputVisible.value = true
    nextTick(() => {
      textInputRef.value?.focus()
    })
    return
  }

  if (currentTool.value === 'select') {
    return
  }

  isDrawing.value = true

  const base = {
    id: generateId(),
    strokeColor: strokeColor.value,
    strokeWidth: lineWidth.value,
    fillColor: fillColor.value,
    fillEnabled: fillEnabled.value
  }

  switch (currentTool.value) {
    case 'pen':
      currentShape.value = { ...base, type: 'pen', points: [{ x: world.x, y: world.y }] }
      break
    case 'eraser':
      eraseAt(world.x, world.y)
      redrawCanvas()
      break
    case 'line':
    case 'arrow':
      currentShape.value = {
        ...base,
        type: currentTool.value,
        start: { x: world.x, y: world.y },
        end: { x: world.x, y: world.y }
      }
      break
    case 'rect':
      currentShape.value = { ...base, type: 'rect', x: world.x, y: world.y, width: 0, height: 0 }
      break
    case 'circle':
      currentShape.value = { ...base, type: 'circle', cx: world.x, cy: world.y, rx: 0, ry: 0 }
      break
  }
}

const handleMouseMove = (e: MouseEvent) => {
  const rect = (canvasContainerRef.value as HTMLElement).getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  screenMousePos.x = sx
  screenMousePos.y = sy

  const world = screenToWorld(sx, sy)
  mousePos.x = world.x
  mousePos.y = world.y

  if (isPanning.value) {
    offset.x = sx - panStart.x
    offset.y = sy - panStart.y
    drawGrid()
    redrawCanvas()
    return
  }

  if (currentTool.value === 'eraser' && e.buttons === 1) {
    eraseAt(world.x, world.y)
    redrawCanvas()
    return
  }

  if (!isDrawing.value || !currentShape.value) return

  switch (currentShape.value.type) {
    case 'pen':
      currentShape.value.points.push({ x: world.x, y: world.y })
      drawPreview(currentShape.value)
      break
    case 'line':
    case 'arrow':
      currentShape.value.end = { x: world.x, y: world.y }
      drawPreview(currentShape.value)
      break
    case 'rect':
      currentShape.value.width = world.x - currentShape.value.x
      currentShape.value.height = world.y - currentShape.value.y
      drawPreview(currentShape.value)
      break
    case 'circle':
      currentShape.value.rx = world.x - currentShape.value.cx
      currentShape.value.ry = world.y - currentShape.value.cy
      drawPreview(currentShape.value)
      break
  }
}

const handleMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }

  if (!isDrawing.value || !currentShape.value) {
    isDrawing.value = false
    return
  }

  if (currentTool.value !== 'eraser') {
    shapes.value.push(currentShape.value)
    pushHistory()
  }

  isDrawing.value = false
  currentShape.value = null
  clearPreview()
  redrawCanvas()
}

const handleWheel = (e: WheelEvent) => {
  const rect = (canvasContainerRef.value as HTMLElement).getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top

  const delta = -e.deltaY
  const zoomFactor = delta > 0 ? 1.1 : 1 / 1.1
  const newScale = Math.max(0.1, Math.min(5, scale.value * zoomFactor))

  const worldBefore = screenToWorld(sx, sy)
  scale.value = newScale
  const worldAfter = screenToWorld(sx, sy)

  offset.x += (worldAfter.x - worldBefore.x) * scale.value
  offset.y += (worldAfter.y - worldBefore.y) * scale.value

  drawGrid()
  redrawCanvas()
}

const zoomIn = () => {
  scale.value = Math.min(5, scale.value * 1.2)
  drawGrid()
  redrawCanvas()
}

const zoomOut = () => {
  scale.value = Math.max(0.1, scale.value / 1.2)
  drawGrid()
  redrawCanvas()
}

const resetView = () => {
  scale.value = 1
  offset.x = 0
  offset.y = 0
  drawGrid()
  redrawCanvas()
}

const pushHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(JSON.parse(JSON.stringify(shapes.value)))
  historyIndex.value = history.value.length - 1
  if (history.value.length > 100) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    shapes.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    redrawCanvas()
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    shapes.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    redrawCanvas()
  }
}

const clearCanvas = async () => {
  try {
    await ElMessageBox.confirm('确定要清空画布吗？此操作可以通过撤销恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    shapes.value = []
    pushHistory()
    redrawCanvas()
    ElMessage.success('画布已清空')
  } catch {
    // user cancelled
  }
}

const handleTextBlur = () => {
  nextTick(() => {
    if (document.activeElement === textInputRef.value) return
    if (textInputVisible.value) {
      commitText()
    }
  })
}

const handleTextEnter = () => {
  commitText()
}

const commitText = () => {
  if (textInputValue.value.trim()) {
    const textShape: TextShape = {
      id: generateId(),
      type: 'text',
      x: textInsertPos.x,
      y: textInsertPos.y,
      text: textInputValue.value,
      fontSize: fontSize.value,
      strokeColor: strokeColor.value,
      strokeWidth: 1,
      fillEnabled: false
    }
    shapes.value.push(textShape)
    pushHistory()
    redrawCanvas()
  }
  textInputVisible.value = false
  textInputValue.value = ''
}

const cancelTextInput = () => {
  textInputVisible.value = false
  textInputValue.value = ''
}

const exportPNG = () => {
  if (shapes.value.length === 0) {
    ElMessage.warning('画布为空，无法导出')
    return
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  shapes.value.forEach(shape => {
    switch (shape.type) {
      case 'pen':
        shape.points.forEach(p => {
          minX = Math.min(minX, p.x)
          minY = Math.min(minY, p.y)
          maxX = Math.max(maxX, p.x)
          maxY = Math.max(maxY, p.y)
        })
        break
      case 'line':
      case 'arrow':
        minX = Math.min(minX, shape.start.x, shape.end.x)
        minY = Math.min(minY, shape.start.y, shape.end.y)
        maxX = Math.max(maxX, shape.start.x, shape.end.x)
        maxY = Math.max(maxY, shape.start.y, shape.end.y)
        break
      case 'rect':
        minX = Math.min(minX, shape.x, shape.x + shape.width)
        minY = Math.min(minY, shape.y, shape.y + shape.height)
        maxX = Math.max(maxX, shape.x, shape.x + shape.width)
        maxY = Math.max(maxY, shape.y, shape.y + shape.height)
        break
      case 'circle':
        minX = Math.min(minX, shape.cx - Math.abs(shape.rx))
        minY = Math.min(minY, shape.cy - Math.abs(shape.ry))
        maxX = Math.max(maxX, shape.cx + Math.abs(shape.rx))
        maxY = Math.max(maxY, shape.cy + Math.abs(shape.ry))
        break
      case 'text':
        const lines = shape.text.split('\n')
        const textW = Math.max(...lines.map(l => l.length * shape.fontSize * 0.6))
        const textH = lines.length * shape.fontSize * 1.4
        minX = Math.min(minX, shape.x)
        minY = Math.min(minY, shape.y)
        maxX = Math.max(maxX, shape.x + textW)
        maxY = Math.max(maxY, shape.y + textH)
        break
    }
  })

  const padding = 40
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  const exportScale = 2
  const w = Math.round((maxX - minX) * exportScale)
  const h = Math.round((maxY - minY) * exportScale)

  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = w
  tmpCanvas.height = h
  const ctx = tmpCanvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.scale(exportScale, exportScale)
  ctx.translate(-minX, -minY)

  const savedOffset = { ...offset }
  const savedScale = scale.value
  offset.x = -minX
  scale.value = 1

  shapes.value.forEach(shape => renderShape(ctx, shape))

  offset.x = savedOffset.x
  offset.y = savedOffset.y
  scale.value = savedScale

  const link = document.createElement('a')
  link.download = `whiteboard-${Date.now()}.png`
  link.href = tmpCanvas.toDataURL('image/png')
  link.click()
  ElMessage.success('导出成功')
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    spacePressed.value = true
  }
  if (e.ctrlKey || e.metaKey) {
    if (e.code === 'KeyZ') {
      e.preventDefault()
      undo()
      return
    } else if (e.code === 'KeyY') {
      e.preventDefault()
      redo()
      return
    }
  }
  if (e.code === 'Slash' && e.shiftKey) {
    e.preventDefault()
    showShortcutHelp.value = true
    return
  }
  if (textInputVisible.value) return
  switch (e.code) {
    case 'KeyV':
      setTool('select')
      break
    case 'KeyP':
      setTool('pen')
      break
    case 'KeyE':
      setTool('eraser')
      break
    case 'KeyL':
      setTool('line')
      break
    case 'KeyA':
      setTool('arrow')
      break
    case 'KeyR':
      setTool('rect')
      break
    case 'KeyC':
      setTool('circle')
      break
    case 'KeyT':
      setTool('text')
      break
    case 'Equal':
    case 'NumpadAdd':
      zoomIn()
      break
    case 'Minus':
    case 'NumpadSubtract':
      zoomOut()
      break
    case 'Digit0':
    case 'Numpad0':
      resetView()
      break
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    spacePressed.value = false
  }
}

const handleResize = () => {
  drawGrid()
  redrawCanvas()
}

onMounted(() => {
  nextTick(() => {
    const container = canvasContainerRef.value
    if (container) {
      offset.x = container.clientWidth / 2
      offset.y = container.clientHeight / 2
    }
    drawGrid()
    redrawCanvas()
  })
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px);
  background: #fafafa;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-right {
  margin-left: auto;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
}

.line-width-control {
  display: flex;
  align-items: center;
}

.line-width-preview {
  background: #303133;
  border-radius: 50%;
}

.line-width-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.line-dot {
  background: #303133;
  border-radius: 50%;
  flex-shrink: 0;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: crosshair;
}

.grid-canvas,
.draw-canvas,
.preview-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.preview-canvas {
  z-index: 2;
}

.draw-canvas {
  z-index: 1;
}

.grid-canvas {
  z-index: 0;
}

.text-input-overlay {
  position: absolute;
  z-index: 10;
  pointer-events: auto;
}

.text-input {
  border: 2px solid #165DFF;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 8px;
  min-width: 120px;
  min-height: 32px;
  resize: both;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.text-input-hint {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  white-space: nowrap;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 6px 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-hint {
  margin-left: auto;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kbd-hint {
  cursor: pointer;
  margin: 0 2px;
}

.kbd-hint:hover {
  background-color: #ecf5ff !important;
  color: #165DFF !important;
}

.tool-btn-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.shortcut-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
  line-height: 16px;
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(22, 93, 255, 0.4);
  z-index: 1;
  pointer-events: none;
  letter-spacing: 0.3px;
}

.shortcut-badge.shortcut-combo {
  font-size: 8px;
  padding: 0 3px;
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
  box-shadow: 0 1px 3px rgba(114, 46, 209, 0.4);
}

.shortcut-badge.shortcut-simple {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  box-shadow: 0 1px 3px rgba(82, 196, 26, 0.4);
}

.scale-btn {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-weight: 600;
  min-width: 60px;
}

.shortcut-dialog :deep(.el-dialog__body) {
  padding: 0 20px 10px;
}

.shortcut-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shortcut-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.shortcut-row span:last-child {
  font-size: 13px;
  color: #606266;
}

.kbd {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 28px;
  height: 26px;
  padding: 0 8px;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #d0d7de;
  border-bottom-width: 2px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  line-height: 1;
  white-space: nowrap;
}

.kbd span {
  font-size: 11px;
}

.kbd + .kbd {
  margin-left: 2px;
}
</style>
