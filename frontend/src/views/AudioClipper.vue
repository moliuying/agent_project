<template>
  <div class="audio-clipper">
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
        <el-step title="上传音频" description="支持 MP3、WAV、OGG 等常见音频格式" />
        <el-step title="查看波形" description="上传后自动生成音频波形图，便于定位" />
        <el-step title="选择片段" description="拖动左右两侧的标记线，设置起止位置" />
        <el-step title="预览播放" description="点击播放按钮，试听所选片段效果" />
        <el-step title="裁剪下载" description="确认无误后，点击导出下载裁剪结果" />
      </el-steps>
    </el-card>

    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <UploadFilled />
          </el-icon>
          <span>上传音频</span>
        </div>
      </template>

      <el-upload
        class="audio-uploader"
        drag
        :show-file-list="false"
        :auto-upload="false"
        accept="audio/*"
        :on-change="handleFileChange"
      >
        <el-icon class="uploader-icon"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将音频文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 MP3、WAV、OGG、M4A、FLAC 等格式，建议文件大小不超过 100MB
          </div>
        </template>
      </el-upload>

      <div v-if="audioFile" class="file-info">
        <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
        <span class="file-name">{{ audioFile.name }}</span>
        <span class="file-size">({{ formatFileSize(audioFile.size) }})</span>
        <span class="file-duration">时长: {{ formatTime(audioDuration) }}</span>
      </div>
    </el-card>

    <el-card v-if="audioBuffer" class="waveform-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>波形编辑</span>
          <el-tag v-if="audioDuration" size="small" type="info" class="header-tag">
            总时长 {{ formatTime(audioDuration) }}
          </el-tag>
        </div>
      </template>

      <div class="waveform-container" ref="waveformContainerRef">
        <canvas
          ref="waveformCanvasRef"
          class="waveform-canvas"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @mouseleave="handleCanvasMouseUp"
        />
        <div
          class="selection-overlay"
          :style="selectionOverlayStyle"
        />
        <div
          v-if="!isPlayingSelection"
          class="playhead"
          :style="playheadStyle"
        />
        <div
          class="handle handle-start"
          :style="startHandleStyle"
          @mousedown="startHandleDrag('start', $event)"
        >
          <div class="handle-bar" />
          <el-icon class="handle-icon"><DArrowLeft /></el-icon>
        </div>
        <div
          class="handle handle-end"
          :style="endHandleStyle"
          @mousedown="startHandleDrag('end', $event)"
        >
          <div class="handle-bar" />
          <el-icon class="handle-icon"><DArrowRight /></el-icon>
        </div>
      </div>

      <div class="time-display">
        <div class="time-item">
          <span class="time-label">起始时间</span>
          <el-input-number
            v-model="startTimeInput"
            :min="0"
            :max="audioDuration"
            :step="0.1"
            :precision="2"
            :controls="false"
            size="small"
            @change="onStartTimeInputChange"
          />
          <span class="time-unit">秒</span>
          <el-tag size="small" type="primary">{{ formatTime(startTime) }}</el-tag>
        </div>
        <div class="time-item">
          <span class="time-label">结束时间</span>
          <el-input-number
            v-model="endTimeInput"
            :min="0"
            :max="audioDuration"
            :step="0.1"
            :precision="2"
            :controls="false"
            size="small"
            @change="onEndTimeInputChange"
          />
          <span class="time-unit">秒</span>
          <el-tag size="small" type="danger">{{ formatTime(endTime) }}</el-tag>
        </div>
        <div class="time-item">
          <span class="time-label">片段时长</span>
          <el-tag size="large" type="success" effect="dark">{{ formatTime(selectionDuration) }}</el-tag>
        </div>
      </div>

      <div class="controls">
        <el-button-group>
          <el-button :icon="isPlaying ? VideoPause : VideoPlay" :type="isPlaying ? 'warning' : 'primary'" @click="togglePlay" :disabled="!audioBuffer">
            {{ isPlaying ? '暂停' : '播放全部' }}
          </el-button>
          <el-button :icon="isPlayingSelection ? VideoPause : VideoPlay" :type="isPlayingSelection ? 'warning' : 'success'" @click="togglePlaySelection" :disabled="!audioBuffer">
            {{ isPlayingSelection ? '暂停' : '播放片段' }}
          </el-button>
          <el-button :icon="RefreshRight" @click="stopPlayback" :disabled="!audioBuffer">
            停止
          </el-button>
        </el-button-group>

        <el-button type="primary" :icon="Download" size="large" @click="exportClip" :disabled="!audioBuffer || isExporting" :loading="isExporting">
          {{ isExporting ? '导出中...' : '导出并下载' }}
        </el-button>
      </div>

      <el-card v-if="audioUrl" class="preview-card" shadow="never">
        <div class="preview-title">
          <el-icon color="#165DFF"><Headset /></el-icon>
          <span>快速预览（原生播放器）</span>
        </div>
        <audio ref="nativeAudioRef" :src="audioUrl" controls class="native-audio" />
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  UploadFilled,
  InfoFilled,
  DataLine,
  CircleCheckFilled,
  VideoPlay,
  VideoPause,
  RefreshRight,
  Download,
  Headset,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const waveformCanvasRef = ref<HTMLCanvasElement | null>(null)
const waveformContainerRef = ref<HTMLElement | null>(null)
const nativeAudioRef = ref<HTMLAudioElement | null>(null)

const audioFile = ref<File | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)
const audioDuration = ref(0)
const audioUrl = ref<string>('')

const startTime = ref(0)
const endTime = ref(0)
const startTimeInput = ref(0)
const endTimeInput = ref(0)

const isPlaying = ref(false)
const isPlayingSelection = ref(false)
const isExporting = ref(false)
const currentPlaybackTime = ref(0)

let audioContext: AudioContext | null = null
let sourceNode: AudioBufferSourceNode | null = null
let animationFrameId: number | null = null
let dragType: 'start' | 'end' | null = null
let canvasWidth = 0
let canvasHeight = 0

const selectionDuration = computed(() => Math.max(0, endTime.value - startTime.value))

const waveformData = computed(() => {
  if (!audioBuffer.value) return []
  const buffer = audioBuffer.value
  const rawData = buffer.getChannelData(0)
  const samples = 1000
  const blockSize = Math.floor(rawData.length / samples)
  const filteredData: number[] = []
  for (let i = 0; i < samples; i++) {
    let sum = 0
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[i * blockSize + j])
    }
    filteredData.push(sum / blockSize)
  }
  const maxVal = Math.max(...filteredData)
  return filteredData.map(v => v / maxVal)
})

const playheadStyle = computed(() => {
  if (!audioDuration.value) return { display: 'none' }
  const percent = (currentPlaybackTime.value / audioDuration.value) * 100
  return {
    left: `${percent}%`,
    display: 'block'
  }
})

const selectionOverlayStyle = computed(() => {
  if (!audioDuration.value) return { display: 'none' }
  const leftPercent = (startTime.value / audioDuration.value) * 100
  const widthPercent = ((endTime.value - startTime.value) / audioDuration.value) * 100
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    display: 'block'
  }
})

const startHandleStyle = computed(() => {
  if (!audioDuration.value) return { display: 'none' }
  const percent = (startTime.value / audioDuration.value) * 100
  return {
    left: `calc(${percent}% - 10px)`,
    display: 'flex'
  }
})

const endHandleStyle = computed(() => {
  if (!audioDuration.value) return { display: 'none' }
  const percent = (endTime.value / audioDuration.value) * 100
  return {
    left: `calc(${percent}% - 10px)`,
    display: 'flex'
  }
})

const initAudioContext = () => {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    audioContext = new AudioCtx()
  }
  return audioContext
}

const handleFileChange = async (file: { raw: File }) => {
  const rawFile = file.raw
  if (!rawFile.type.startsWith('audio/')) {
    ElMessage.error('请上传音频文件')
    return
  }

  stopPlayback()
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }

  audioFile.value = rawFile
  audioUrl.value = URL.createObjectURL(rawFile)

  try {
    const ctx = initAudioContext()
    const arrayBuffer = await rawFile.arrayBuffer()
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0))
    audioBuffer.value = decoded
    audioDuration.value = decoded.duration
    startTime.value = 0
    endTime.value = decoded.duration
    startTimeInput.value = 0
    endTimeInput.value = Number(decoded.duration.toFixed(2))

    await nextTick()
    drawWaveform()
    ElMessage.success('音频加载成功')
  } catch (error) {
    console.error('Failed to decode audio:', error)
    ElMessage.error('音频解码失败，请尝试其他格式')
  }
}

const drawWaveform = () => {
  const canvas = waveformCanvasRef.value
  const container = waveformContainerRef.value
  if (!canvas || !container) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  canvasWidth = container.clientWidth
  canvasHeight = container.clientHeight

  canvas.width = canvasWidth * dpr
  canvas.height = canvasHeight * dpr
  canvas.style.width = `${canvasWidth}px`
  canvas.style.height = `${canvasHeight}px`
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const data = waveformData.value
  if (data.length === 0) return

  const barWidth = canvasWidth / data.length
  const centerY = canvasHeight / 2

  ctx.fillStyle = '#c0c4cc'
  for (let i = 0; i < data.length; i++) {
    const x = i * barWidth
    const barHeight = data[i] * (canvasHeight * 0.8)
    const y = centerY - barHeight / 2
    ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight)
  }

  const gridLines = 5
  ctx.strokeStyle = 'rgba(220, 223, 230, 0.5)'
  ctx.lineWidth = 1
  for (let i = 1; i < gridLines; i++) {
    const y = (canvasHeight / gridLines) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
    ctx.stroke()
  }
}

const getTimeFromMouseX = (clientX: number): number => {
  const canvas = waveformCanvasRef.value
  if (!canvas || !audioDuration.value) return 0
  const rect = canvas.getBoundingClientRect()
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const percent = x / rect.width
  return percent * audioDuration.value
}

const startHandleDrag = (type: 'start' | 'end', e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  dragType = type
}

const handleCanvasMouseDown = (e: MouseEvent) => {
  if (dragType) return
  const time = getTimeFromMouseX(e.clientX)
  if (audioBuffer.value) {
    currentPlaybackTime.value = time
  }
}

const handleCanvasMouseMove = (e: MouseEvent) => {
  if (dragType === 'start') {
    const time = Math.min(getTimeFromMouseX(e.clientX), endTime.value - 0.1)
    startTime.value = Math.max(0, time)
    startTimeInput.value = Number(startTime.value.toFixed(2))
  } else if (dragType === 'end') {
    const time = Math.max(getTimeFromMouseX(e.clientX), startTime.value + 0.1)
    endTime.value = Math.min(audioDuration.value, time)
    endTimeInput.value = Number(endTime.value.toFixed(2))
  }
}

const handleCanvasMouseUp = () => {
  dragType = null
}

const onStartTimeInputChange = (val: number) => {
  if (val >= endTime.value) {
    val = endTime.value - 0.1
    startTimeInput.value = Number(val.toFixed(2))
  }
  startTime.value = Math.max(0, val)
}

const onEndTimeInputChange = (val: number) => {
  if (val <= startTime.value) {
    val = startTime.value + 0.1
    endTimeInput.value = Number(val.toFixed(2))
  }
  endTime.value = Math.min(audioDuration.value, val)
}

const stopPlayback = () => {
  if (sourceNode) {
    try { sourceNode.stop() } catch (e) {}
    sourceNode.disconnect()
    sourceNode = null
  }
  isPlaying.value = false
  isPlayingSelection.value = false
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

const updatePlayhead = () => {
  if (!sourceNode || !audioContext) return
  const ctx = audioContext
  const elapsed = ctx.currentTime - (sourceNode as any)._startTime
  const startOffset = (sourceNode as any)._startOffset || 0
  const duration = (sourceNode as any)._duration || audioDuration.value

  if (elapsed < duration) {
    currentPlaybackTime.value = startOffset + elapsed
    animationFrameId = requestAnimationFrame(updatePlayhead)
  } else {
    currentPlaybackTime.value = startOffset + duration
    stopPlayback()
  }
}

const togglePlay = () => {
  if (isPlaying.value || isPlayingSelection.value) {
    stopPlayback()
    return
  }
  if (!audioBuffer.value || !audioContext) return

  const ctx = audioContext
  const source = ctx.createBufferSource()
  source.buffer = audioBuffer.value
  source.connect(ctx.destination)
  const offset = currentPlaybackTime.value >= audioDuration.value ? 0 : currentPlaybackTime.value
  ;(source as any)._startTime = ctx.currentTime
  ;(source as any)._startOffset = offset
  ;(source as any)._duration = audioDuration.value - offset
  source.start(0, offset)
  sourceNode = source
  isPlaying.value = true

  source.onended = () => {
    isPlaying.value = false
  }

  updatePlayhead()
}

const togglePlaySelection = () => {
  if (isPlaying.value || isPlayingSelection.value) {
    stopPlayback()
    return
  }
  if (!audioBuffer.value || !audioContext) return

  const ctx = audioContext
  const source = ctx.createBufferSource()
  source.buffer = audioBuffer.value
  source.connect(ctx.destination)
  const duration = endTime.value - startTime.value
  ;(source as any)._startTime = ctx.currentTime
  ;(source as any)._startOffset = startTime.value
  ;(source as any)._duration = duration
  source.start(0, startTime.value, duration)
  sourceNode = source
  isPlayingSelection.value = true
  currentPlaybackTime.value = startTime.value

  source.onended = () => {
    isPlayingSelection.value = false
  }

  updatePlayhead()
}

const audioBufferToWav = (buffer: AudioBuffer, start: number, end: number): Blob => {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const startSample = Math.floor(start * sampleRate)
  const endSample = Math.floor(end * sampleRate)
  const length = endSample - startSample

  const result = new AudioBuffer({
    length,
    numberOfChannels: numChannels,
    sampleRate
  })

  for (let ch = 0; ch < numChannels; ch++) {
    const sourceData = buffer.getChannelData(ch)
    const destData = result.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      destData[i] = sourceData[startSample + i]
    }
  }

  const interleaved = new Float32Array(length * numChannels)
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = result.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      interleaved[i * numChannels + ch] = channelData[i]
    }
  }

  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = length * blockAlign
  const bufferSize = 44 + dataSize

  const arrayBuffer = new ArrayBuffer(bufferSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
    offset += 2
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

const exportClip = async () => {
  if (!audioBuffer.value) {
    ElMessage.warning('请先上传音频文件')
    return
  }
  if (selectionDuration.value < 0.1) {
    ElMessage.warning('选择的片段太短，至少需要 0.1 秒')
    return
  }

  try {
    await ElMessageBox.confirm(
      `即将导出从 ${formatTime(startTime.value)} 到 ${formatTime(endTime.value)} 的片段，时长 ${formatTime(selectionDuration.value)}。是否继续？`,
      '确认导出',
      {
        confirmButtonText: '确认导出',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
  } catch {
    return
  }

  isExporting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    const wavBlob = audioBufferToWav(audioBuffer.value, startTime.value, endTime.value)

    const originalName = audioFile.value?.name || 'audio'
    const baseName = originalName.replace(/\.[^/.]+$/, '')
    const fileName = `${baseName}_clip_${formatTimeForFile(startTime.value)}-${formatTimeForFile(endTime.value)}.wav`

    const url = URL.createObjectURL(wavBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success(`导出成功：${fileName}`)
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00.00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds - mins * 60
  const wholeSecs = Math.floor(secs)
  const ms = Math.floor((secs - wholeSecs) * 100)
  return `${String(mins).padStart(2, '0')}:${String(wholeSecs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
}

const formatTimeForFile = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '0'
  return seconds.toFixed(2).replace('.', '_')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const handleResize = () => {
  if (audioBuffer.value) {
    drawWaveform()
  }
}

watch(startTime, (val) => {
  startTimeInput.value = Number(val.toFixed(2))
})

watch(endTime, (val) => {
  endTimeInput.value = Number(val.toFixed(2))
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  stopPlayback()
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.audio-clipper {
  max-width: 1100px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
}

.upload-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.audio-uploader :deep(.el-upload-dragger) {
  padding: 40px 20px;
}

.uploader-icon {
  font-size: 67px;
  color: #c0c4cc;
  margin: 10px 0 16px;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
}

.el-upload__text em {
  color: #165DFF;
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
}

.file-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f9eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.file-name {
  font-weight: 500;
  color: #303133;
}

.file-size,
.file-duration {
  color: #67c23a;
  font-size: 13px;
}

.waveform-card {
  margin-bottom: 24px;
}

.waveform-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.waveform-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.selection-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(22, 93, 255, 0.15);
  border-left: 2px solid #165DFF;
  border-right: 2px solid #165DFF;
  pointer-events: none;
  z-index: 2;
}

.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #f56c6c;
  pointer-events: none;
  z-index: 3;
  box-shadow: 0 0 4px rgba(245, 108, 108, 0.6);
}

.playhead::before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  width: 10px;
  height: 10px;
  background: #f56c6c;
  border-radius: 50%;
}

.handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  z-index: 4;
}

.handle-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #e6a23c;
  box-shadow: 0 0 6px rgba(230, 162, 60, 0.6);
}

.handle-icon {
  position: relative;
  z-index: 1;
  color: #fff;
  font-size: 12px;
  background: #e6a23c;
  padding: 4px 2px;
  border-radius: 4px;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
  flex-wrap: wrap;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 240px;
}

.time-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.time-unit {
  font-size: 13px;
  color: #909399;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.preview-card {
  margin-top: 20px;
  background: #f5f7fa;
}

.preview-card :deep(.el-card__body) {
  padding: 16px;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: #303133;
}

.native-audio {
  width: 100%;
}
</style>
