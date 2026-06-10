<template>
  <div class="electric-guitar">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <InfoFilled />
          </el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <div class="guide-content">
        <div class="guide-item">
          <el-icon class="guide-icon"><Mouse /></el-icon>
          <span><strong>鼠标点击</strong>：点击任意品丝位置即可弹奏对应音符</span>
        </div>
        <div class="guide-item">
          <el-icon class="guide-icon"><Keyboard /></el-icon>
          <span><strong>键盘快捷键</strong>：1-6 键对应 6 根弦的空弦音，Q-P、A-L、Z-M 对应各品位</span>
        </div>
        <div class="guide-item">
          <el-icon class="guide-icon"><MagicStick /></el-icon>
          <span><strong>预设和弦</strong>：点击下方和弦按钮可一键弹奏常用和弦</span>
        </div>
      </div>
    </el-card>

    <el-card class="guitar-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#e6a23c">
            <Headset />
          </el-icon>
          <span>电吉他</span>
          <div class="header-controls">
            <el-switch
              v-model="distortionEnabled"
              active-text="失真效果"
              inactive-text="清音"
              inline-prompt
            />
            <el-slider
              v-model="volume"
              class="volume-slider"
              :min="0"
              :max="100"
              show-input
              size="small"
              :width="150"
            />
          </div>
        </div>
      </template>

      <div class="guitar-container">
        <div class="guitar-headstock">
          <div class="tuning-pegs">
            <div v-for="i in 6" :key="i" class="tuning-peg"></div>
          </div>
        </div>

        <div class="guitar-neck">
          <div class="fret-numbers">
            <span v-for="fret in fretCount" :key="fret" class="fret-number">
              {{ fret }}
            </span>
          </div>

          <div class="frets-container">
            <div
              v-for="(string, stringIdx) in guitarStrings"
              :key="stringIdx"
              class="string-row"
            >
              <div
                class="string-line"
                :class="{ active: activeStrings[stringIdx], vibrating: vibratingStrings[stringIdx] }"
                :style="{ top: `${(stringIdx + 0.5) * (100 / 6)}%` }"
              ></div>

              <div
                v-for="fret in fretCount + 1"
                :key="fret"
                class="fret-cell"
                :class="{
                  'fret-zero': fret === 1,
                  'string-active': activeFret[stringIdx] === fret - 1,
                  highlight: isHighlighted(stringIdx, fret - 1)
                }"
                @mousedown="playNote(stringIdx, fret - 1)"
                @mouseenter="isMouseDown && playNote(stringIdx, fret - 1)"
              >
                <div v-if="fret > 1" class="fret-wire"></div>
                <div v-if="isFretMarker(fret - 1)" class="fret-marker"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="guitar-body">
          <div class="pickup"></div>
          <div class="bridge"></div>
        </div>
      </div>

      <div class="chord-section">
        <div class="chord-section-title">常用和弦</div>
        <div class="chord-buttons">
          <el-button
            v-for="chord in presetChords"
            :key="chord.name"
            type="primary"
            size="large"
            @mousedown="playChord(chord)"
          >
            {{ chord.name }}
          </el-button>
        </div>
      </div>

      <div class="note-display">
        <el-tag size="large" :type="currentNote ? 'success' : 'info'" class="current-note-tag">
          当前音符：{{ currentNote || '--' }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

interface GuitarString {
  baseFreq: number
  noteName: string
  keyboardKey: string
}

interface ChordData {
  name: string
  frets: number[]
}

const volume = ref(70)
const distortionEnabled = ref(false)
const currentNote = ref('')
const isMouseDown = ref(false)
const activeFret = reactive<number[]>([-1, -1, -1, -1, -1, -1])
const activeStrings = reactive<boolean[]>([false, false, false, false, false, false])
const vibratingStrings = reactive<boolean[]>([false, false, false, false, false, false])

const fretCount = 12

const guitarStrings: GuitarString[] = [
  { baseFreq: 82.41, noteName: 'E2', keyboardKey: '6' },
  { baseFreq: 110.0, noteName: 'A2', keyboardKey: '5' },
  { baseFreq: 146.83, noteName: 'D3', keyboardKey: '4' },
  { baseFreq: 196.0, noteName: 'G3', keyboardKey: '3' },
  { baseFreq: 246.94, noteName: 'B3', keyboardKey: '2' },
  { baseFreq: 329.63, noteName: 'E4', keyboardKey: '1' }
]

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const presetChords: ChordData[] = [
  { name: 'C', frets: [-1, 3, 2, 0, 1, 0] },
  { name: 'D', frets: [-1, -1, 0, 2, 3, 2] },
  { name: 'E', frets: [0, 2, 2, 1, 0, 0] },
  { name: 'G', frets: [3, 2, 0, 0, 0, 3] },
  { name: 'A', frets: [-1, 0, 2, 2, 2, 0] },
  { name: 'Am', frets: [-1, 0, 2, 2, 1, 0] },
  { name: 'Em', frets: [0, 2, 2, 0, 0, 0] },
  { name: 'F', frets: [1, 3, 3, 2, 1, 1] }
]

const keyboardMap: Record<string, { stringIdx: number; fret: number }> = {}

function initKeyboardMap() {
  const keysRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
  const keysRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
  const keysRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm']

  for (let i = 0; i < keysRow1.length && i <= fretCount; i++) {
    keyboardMap[keysRow1[i]] = { stringIdx: 0, fret: i + 1 }
  }
  for (let i = 0; i < keysRow2.length && i <= fretCount; i++) {
    keyboardMap[keysRow2[i]] = { stringIdx: 2, fret: i }
  }
  for (let i = 0; i < keysRow3.length && i <= fretCount; i++) {
    keyboardMap[keysRow3[i]] = { stringIdx: 4, fret: i }
  }

  guitarStrings.forEach((str, idx) => {
    keyboardMap[str.keyboardKey] = { stringIdx: idx, fret: 0 }
  })
}

let audioContext: AudioContext | null = null

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

function getNoteName(frequency: number): string {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69
  const noteIndex = Math.round(noteNum) % 12
  const octave = Math.floor(Math.round(noteNum) / 12) - 1
  return noteNames[noteIndex] + octave
}

function getFrequency(stringIdx: number, fret: number): number {
  return guitarStrings[stringIdx].baseFreq * Math.pow(2, fret / 12)
}

function playNote(stringIdx: number, fret: number) {
  if (fret < 0) return
  initAudio()
  if (!audioContext) return

  const freq = getFrequency(stringIdx, fret)
  const now = audioContext.currentTime
  const gainValue = volume.value / 100

  activeStrings[stringIdx] = true
  vibratingStrings[stringIdx] = true
  activeFret[stringIdx] = fret
  currentNote.value = getNoteName(freq)

  setTimeout(() => {
    vibratingStrings[stringIdx] = false
  }, 200)

  const oscillator1 = audioContext.createOscillator()
  const oscillator2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  const filterNode = audioContext.createBiquadFilter()

  oscillator1.type = 'sawtooth'
  oscillator1.frequency.setValueAtTime(freq, now)

  oscillator2.type = 'square'
  oscillator2.frequency.setValueAtTime(freq * 2, now)

  filterNode.type = distortionEnabled.value ? 'lowpass' : 'bandpass'
  filterNode.frequency.setValueAtTime(distortionEnabled.value ? 2000 : 3000, now)
  filterNode.Q.setValueAtTime(2, now)

  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(gainValue * 0.5, now + 0.005)
  gainNode.gain.exponentialRampToValueAtTime(gainValue * 0.3, now + 0.1)
  gainNode.gain.exponentialRampToValueAtTime(gainValue * 0.15, now + 0.5)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5)

  oscillator1.connect(filterNode)
  oscillator2.connect(filterNode)
  filterNode.connect(gainNode)

  if (distortionEnabled.value) {
    const distortion = audioContext.createWaveShaper()
    distortion.curve = makeDistortionCurve(50)
    distortion.oversample = '4x'
    gainNode.connect(distortion)
    distortion.connect(audioContext.destination)
  } else {
    gainNode.connect(audioContext.destination)
  }

  oscillator1.start(now)
  oscillator2.start(now)
  oscillator1.stop(now + 2.5)
  oscillator2.stop(now + 2.5)

  setTimeout(() => {
    activeStrings[stringIdx] = false
    if (activeFret[stringIdx] === fret) {
      activeFret[stringIdx] = -1
    }
  }, 300)
}

function makeDistortionCurve(amount: number): Float32Array {
  const k = typeof amount === 'number' ? amount : 50
  const nSamples = 44100
  const curve = new Float32Array(nSamples)
  const deg = Math.PI / 180
  for (let i = 0; i < nSamples; i++) {
    const x = (i * 2) / nSamples - 1
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
  }
  return curve
}

function playChord(chord: ChordData) {
  chord.frets.forEach((fret, stringIdx) => {
    if (fret >= 0) {
      setTimeout(() => playNote(stringIdx, fret), stringIdx * 30)
    }
  })
}

function isFretMarker(fret: number): boolean {
  return [3, 5, 7, 9].includes(fret)
}

function isHighlighted(stringIdx: number, fret: number): boolean {
  return activeFret[stringIdx] === fret
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return
  const key = e.key.toLowerCase()
  const mapping = keyboardMap[key]
  if (mapping) {
    e.preventDefault()
    playNote(mapping.stringIdx, mapping.fret)
  }
}

function handleMouseDown() {
  isMouseDown.value = true
}

function handleMouseUp() {
  isMouseDown.value = false
}

onMounted(() => {
  initKeyboardMap()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.electric-guitar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.header-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.volume-slider {
  display: flex;
  align-items: center;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}

.guide-icon {
  color: #165DFF;
  font-size: 18px;
}

.guitar-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.guitar-card :deep(.el-card__header) {
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.guitar-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

.guitar-container {
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg, #3d2817 0%, #2a1810 50%, #1a0f08 100%);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.guitar-headstock {
  width: 120px;
  background: linear-gradient(180deg, #4a3520 0%, #2d1f14 100%);
  border-right: 3px solid #8b6914;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.tuning-pegs {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tuning-peg {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d4af37, #b8860b);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 2px solid #8b6914;
}

.guitar-neck {
  flex: 1;
  background: linear-gradient(180deg, #5c3a1e 0%, #3d2514 100%);
  position: relative;
  min-height: 450px;
}

.fret-numbers {
  display: flex;
  padding: 0 0 0 40px;
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.fret-number {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.frets-container {
  position: relative;
  padding: 20px 0;
  height: calc(100% - 30px);
}

.string-row {
  position: relative;
  height: calc(100% / 6);
  display: flex;
}

.string-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #c0c0c0, #e8e8e8, #a0a0a0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  z-index: 2;
  transition: all 0.1s;
}

.string-row:nth-child(1) .string-line { height: 5px; }
.string-row:nth-child(2) .string-line { height: 4.5px; }
.string-row:nth-child(3) .string-line { height: 4px; }
.string-row:nth-child(4) .string-line { height: 3.5px; }
.string-row:nth-child(5) .string-line { height: 3px; }
.string-row:nth-child(6) .string-line { height: 2.5px; }

.string-line.active {
  background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.4);
}

.string-line.vibrating {
  animation: vibrate 0.1s ease-in-out infinite;
}

@keyframes vibrate {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-3px); }
  75% { transform: translateY(3px); }
}

.fret-cell {
  flex: 1;
  position: relative;
  border-right: 1px solid transparent;
  cursor: pointer;
  transition: background 0.1s;
}

.fret-cell:hover {
  background: rgba(255, 255, 255, 0.05);
}

.fret-cell.fret-zero {
  flex: 0.3;
  min-width: 40px;
  background: linear-gradient(90deg, #2a1810 0%, rgba(42, 24, 16, 0.5) 100%);
  border-right: 4px solid #f0f0f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.fret-cell.string-active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd700, #ff8c00);
  box-shadow: 0 4px 15px rgba(255, 140, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  z-index: 3;
  animation: pressDown 0.2s ease-out;
}

.fret-cell.highlight {
  background: rgba(255, 215, 0, 0.15);
}

@keyframes pressDown {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.fret-wire {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #e8e8e8, #c0c0c0, #a0a0a0);
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.3);
}

.fret-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #e0e0e0 100%);
  opacity: 0.6;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.guitar-body {
  width: 200px;
  background: linear-gradient(180deg, #4a2c0a 0%, #2d1808 50%, #1a0f04 100%);
  border-radius: 0 50px 50px 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  box-shadow: inset 5px 0 15px rgba(0, 0, 0, 0.3);
}

.pickup {
  width: 120px;
  height: 40px;
  background: linear-gradient(180deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
  border-radius: 6px;
  border: 2px solid #8b6914;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  position: relative;
}

.pickup::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10px;
  right: 10px;
  height: 4px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #d4af37, #ffd700, #d4af37);
  border-radius: 2px;
}

.bridge {
  width: 140px;
  height: 50px;
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 4px;
  border: 2px solid #8b6914;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
}

.chord-section {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chord-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.chord-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.note-display {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.current-note-tag {
  font-size: 16px;
  padding: 8px 20px;
}
</style>
