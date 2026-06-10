<template>
  <div class="hand-drum">
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
          <span><strong>鼠标点击</strong>：点击任意鼓垫即可发声</span>
        </div>
        <div class="guide-item">
          <el-icon class="guide-icon"><Keyboard /></el-icon>
          <span><strong>键盘弹奏</strong>：鼓垫上的字母键就是对应按键，三排鼓对应键盘三排</span>
        </div>
        <div class="guide-item">
          <el-icon class="guide-icon"><MagicStick /></el-icon>
          <span><strong>节奏练习</strong>：开启节拍器，选择预设节奏型跟练</span>
        </div>
      </div>
    </el-card>

    <el-card class="metronome-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" :color="metronomeEnabled ? '#e6a23c' : '#909399'">
            <AlarmClock />
          </el-icon>
          <span>节拍器</span>
          <el-switch
            v-model="metronomeEnabled"
            @change="toggleMetronome"
            active-text="开"
            inactive-text="关"
            inline-prompt
          />
        </div>
      </template>
      <div class="metronome-body">
        <div class="metronome-beats">
          <div
            v-for="i in beatsPerMeasure"
            :key="i"
            class="beat-indicator"
            :class="{
              active: currentBeat === i - 1 && metronomeEnabled,
              accent: i === 1
            }"
          >
            {{ i }}
          </div>
        </div>
        <div class="metronome-controls">
          <div class="metronome-control-item">
            <span class="control-label">速度</span>
            <el-slider
              v-model="bpm"
              :min="40"
              :max="200"
              :disabled="metronomeEnabled"
              show-input
              size="small"
              :width="180"
            />
            <span class="control-unit">BPM</span>
          </div>
          <div class="metronome-control-item">
            <span class="control-label">拍号</span>
            <el-select v-model="beatsPerMeasure" :disabled="metronomeEnabled" size="small" style="width: 100px">
              <el-option label="2/4" :value="2" />
              <el-option label="3/4" :value="3" />
              <el-option label="4/4" :value="4" />
              <el-option label="6/8" :value="6" />
            </el-select>
          </div>
          <div class="metronome-control-item">
            <span class="control-label">音量</span>
            <el-slider
              v-model="volume"
              :min="0"
              :max="100"
              show-input
              size="small"
              :width="150"
            />
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="preset-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <DataAnalysis />
          </el-icon>
          <span>预设节奏型</span>
          <span class="header-hint">点击即可自动演示经典节奏</span>
        </div>
      </template>
      <div class="preset-body">
        <div class="preset-list">
          <div
            v-for="preset in rhythmPresets"
            :key="preset.name"
            class="preset-item"
            :class="{ active: activePreset?.name === preset.name }"
            @click="togglePreset(preset)"
          >
            <div class="preset-name">{{ preset.name }}</div>
            <div class="preset-desc">{{ preset.description }}</div>
            <div class="preset-visual">
              <span
                v-for="(beat, idx) in preset.pattern"
                :key="idx"
                class="preset-beat"
                :class="{ hit: beat !== '-', strong: beat === 'B' }"
              >
                {{ beat === '-' ? '·' : beat }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="drum-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#e6a23c">
            <Headset />
          </el-icon>
          <span>手鼓演奏台</span>
          <span class="header-hint">三排键位 · 一目了然</span>
          <el-tag size="small" type="warning" class="keyboard-tip" effect="dark">
            ⌨️ Q W E / A S D / Z X C
          </el-tag>
        </div>
      </template>

      <div class="drum-stage">
        <div class="drum-rows">
          <div class="drum-row row-high">
            <div class="row-label">
              <span class="row-key-hint">Q W E</span>
              <span class="row-name">高音区</span>
            </div>
            <div class="row-drums">
              <div
                v-for="drum in highRowDrums"
                :key="drum.id"
                class="drum-pad"
                :class="{ active: activePads[drum.id] }"
                :style="{ '--drum-color': drum.color, '--drum-color-dark': drum.colorDark }"
                @mousedown="playDrum(drum)"
                @touchstart.prevent="playDrum(drum)"
              >
                <div class="drum-keytag">{{ drum.key }}</div>
                <div class="drum-visual">
                  <span v-if="drum.icon" class="drum-emoji">{{ drum.icon }}</span>
                  <div v-else class="drum-circle"></div>
                </div>
                <div class="drum-name">{{ drum.name }}</div>
              </div>
            </div>
          </div>

          <div class="drum-row row-mid">
            <div class="row-label">
              <span class="row-key-hint">A S D</span>
              <span class="row-name">主音区</span>
            </div>
            <div class="row-drums">
              <div
                v-for="drum in midRowDrums"
                :key="drum.id"
                class="drum-pad main-drum"
                :class="{ active: activePads[drum.id] }"
                :style="{ '--drum-color': drum.color, '--drum-color-dark': drum.colorDark }"
                @mousedown="playDrum(drum)"
                @touchstart.prevent="playDrum(drum)"
              >
                <div class="drum-keytag large">{{ drum.key }}</div>
                <div class="drum-visual main">
                  <div v-if="drum.icon" class="drum-emoji large">{{ drum.icon }}</div>
                  <div v-else class="drum-skin-main">
                    <div class="skin-ring ring1"></div>
                    <div class="skin-ring ring2"></div>
                    <div class="skin-center"></div>
                  </div>
                </div>
                <div class="drum-name">{{ drum.name }}</div>
                <div class="drum-tech">{{ drum.tech }}</div>
              </div>
            </div>
          </div>

          <div class="drum-row row-low">
            <div class="row-label">
              <span class="row-key-hint">Z X C</span>
              <span class="row-name">低音区</span>
            </div>
            <div class="row-drums">
              <div
                v-for="drum in lowRowDrums"
                :key="drum.id"
                class="drum-pad"
                :class="{ active: activePads[drum.id] }"
                :style="{ '--drum-color': drum.color, '--drum-color-dark': drum.colorDark }"
                @mousedown="playDrum(drum)"
                @touchstart.prevent="playDrum(drum)"
              >
                <div class="drum-keytag">{{ drum.key }}</div>
                <div class="drum-visual">
                  <span v-if="drum.icon" class="drum-emoji">{{ drum.icon }}</span>
                  <div v-else class="drum-circle"></div>
                </div>
                <div class="drum-name">{{ drum.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="keyboard-diagram">
          <div class="diagram-title">
            <el-icon><Keyboard /></el-icon>
            <span>键盘对照图</span>
          </div>
          <div class="keyboard-body">
            <div class="kbd-row kbd-row-1">
              <div
                v-for="k in keyboardDiagram.row1"
                :key="k.key"
                class="kbd-key"
                :class="{
                  active: pressedKeys[k.key],
                  used: k.drum,
                  empty: !k.drum
                }"
              >
                <span class="kbd-letter">{{ k.key.toUpperCase() }}</span>
                <span class="kbd-label" v-if="k.drum">{{ k.drum }}</span>
              </div>
            </div>
            <div class="kbd-row kbd-row-2">
              <div
                v-for="k in keyboardDiagram.row2"
                :key="k.key"
                class="kbd-key"
                :class="{
                  active: pressedKeys[k.key],
                  used: k.drum,
                  empty: !k.drum
                }"
              >
                <span class="kbd-letter">{{ k.key.toUpperCase() }}</span>
                <span class="kbd-label" v-if="k.drum">{{ k.drum }}</span>
              </div>
            </div>
            <div class="kbd-row kbd-row-3">
              <div
                v-for="k in keyboardDiagram.row3"
                :key="k.key"
                class="kbd-key"
                :class="{
                  active: pressedKeys[k.key],
                  used: k.drum,
                  empty: !k.drum
                }"
              >
                <span class="kbd-letter">{{ k.key.toUpperCase() }}</span>
                <span class="kbd-label" v-if="k.drum">{{ k.drum }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

interface DrumPad {
  id: string
  name: string
  key: string
  type: string
  color: string
  colorDark: string
  icon?: string
  tech?: string
}

interface RhythmPreset {
  name: string
  description: string
  pattern: string[]
  bpm: number
}

const volume = ref(75)
const metronomeEnabled = ref(false)
const bpm = ref(100)
const beatsPerMeasure = ref(4)
const currentBeat = ref(0)
let metronomeInterval: number | null = null

const activePads = reactive<Record<string, boolean>>({})
const pressedKeys = reactive<Record<string, boolean>>({})

const activePreset = ref<RhythmPreset | null>(null)
let presetInterval: number | null = null
let presetStep = 0

const highRowDrums: DrumPad[] = [
  { id: 'slap', name: '高音', key: 'Q', type: 'slap', color: '#CD853F', colorDark: '#A0522D', tech: 'Slap' },
  { id: 'rim', name: '边击', key: 'W', type: 'rim', color: '#909399', colorDark: '#606266', icon: '🥢' },
  { id: 'cowbell', name: '牛铃', key: 'E', type: 'cowbell', color: '#67c23a', colorDark: '#529b2e', icon: '🔔' }
]

const midRowDrums: DrumPad[] = [
  { id: 'tone', name: '中音', key: 'A', type: 'tone', color: '#D2691E', colorDark: '#8B4513', tech: 'Tone · 指弹边缘' },
  { id: 'bass', name: '低音', key: 'S', type: 'bass', color: '#8B4513', colorDark: '#5D2E0C', tech: 'Bass · 掌心击打' },
  { id: 'clap', name: '拍手', key: 'D', type: 'clap', color: '#e6a23c', colorDark: '#b88230', icon: '👏' }
]

const lowRowDrums: DrumPad[] = [
  { id: 'woodblock', name: '木鱼', key: 'Z', type: 'woodblock', color: '#A0522D', colorDark: '#6B3410', icon: '🪵' },
  { id: 'shaker', name: '沙锤', key: 'X', type: 'shaker', color: '#f56c6c', colorDark: '#c45656', icon: '🎋' },
  { id: 'hihat', name: '踩镲', key: 'C', type: 'hihat', color: '#b37feb', colorDark: '#9254de', icon: '💿' }
]

const allDrums = [...highRowDrums, ...midRowDrums, ...lowRowDrums]

const keyboardMap: Record<string, DrumPad> = {}

const keyboardDiagram = computed(() => {
  const makeRow = (keys: string[], drumMap: Record<string, string>) =>
    keys.map(key => ({
      key,
      drum: drumMap[key] || null
    }))

  const highMap: Record<string, string> = { q: '高音', w: '边击', e: '牛铃' }
  const midMap: Record<string, string> = { a: '中音', s: '低音', d: '拍手' }
  const lowMap: Record<string, string> = { z: '木鱼', x: '沙锤', c: '踩镲' }

  return {
    row1: makeRow(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], highMap),
    row2: makeRow(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], midMap),
    row3: makeRow(['z', 'x', 'c', 'v', 'b', 'n', 'm'], lowMap)
  }
})

const rhythmPresets: RhythmPreset[] = [
  {
    name: '基础四拍',
    description: '入门必练 · 每拍一下低音',
    pattern: ['B', '-', '-', '-', 'B', '-', '-', '-', 'B', '-', '-', '-', 'B', '-', '-', '-'],
    bpm: 80
  },
  {
    name: '经典非洲节奏',
    description: 'Bass-Tone-Slap 组合',
    pattern: ['B', '-', 'T', 'S', '-', 'T', 'S', '-', 'B', '-', 'T', 'S', '-', 'T', 'S', 'T'],
    bpm: 100
  },
  {
    name: '摇摆节奏',
    description: '三连音感觉 · 适合布鲁斯',
    pattern: ['B', '-', 'T', '-', 'S', 'T', '-', 'S', 'B', '-', 'T', '-', 'S', 'T', 'S', '-'],
    bpm: 90
  },
  {
    name: '桑巴节奏',
    description: '热情奔放 · 巴西风格',
    pattern: ['B', 'S', 'T', 'B', 'S', 'T', 'B', 'S', 'B', 'S', 'T', 'B', 'S', 'T', 'S', 'T'],
    bpm: 120
  },
  {
    name: '雷鬼节奏',
    description: '反拍重音 · 牙买加风情',
    pattern: ['-', 'B', '-', 'S', '-', 'B', '-', 'S', '-', 'B', 'T', 'S', '-', 'B', 'T', 'S'],
    bpm: 85
  },
  {
    name: '方克节奏',
    description: '十六分音符 · 律动感强',
    pattern: ['B', '-', 'S', 'T', 'B', 'S', '-', 'T', 'B', '-', 'S', 'T', '-', 'S', 'T', 'S'],
    bpm: 110
  }
]

function initKeyboardMap() {
  allDrums.forEach(drum => {
    keyboardMap[drum.key.toLowerCase()] = drum
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

function activatePad(drum: DrumPad) {
  activePads[drum.id] = true
  pressedKeys[drum.key.toLowerCase()] = true
  setTimeout(() => {
    activePads[drum.id] = false
    pressedKeys[drum.key.toLowerCase()] = false
  }, 150)
}

function playDjembeBass() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(90, now)
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.15)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(200, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.9, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.1)
  gain.gain.exponentialRampToValueAtTime(vol * 0.1, now + 0.3)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  osc.start(now)
  osc.stop(now + 0.5)
}

function playDjembeTone() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(330, now)
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.1)

  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(660, now)

  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(800, now)
  filter.Q.setValueAtTime(3, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.003)
  gain.gain.exponentialRampToValueAtTime(vol * 0.3, now + 0.08)
  gain.gain.exponentialRampToValueAtTime(vol * 0.08, now + 0.2)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

  osc.connect(filter)
  osc2.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  osc.start(now)
  osc2.start(now)
  osc.stop(now + 0.35)
  osc2.stop(now + 0.35)
}

function playDjembeSlap() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const noise = audioContext.createBufferSource()
  const noiseGain = audioContext.createGain()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  const noiseFilter = audioContext.createBiquadFilter()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.08)

  const bufferSize = audioContext.sampleRate * 0.1
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
  }
  noise.buffer = noiseBuffer

  noiseFilter.type = 'highpass'
  noiseFilter.frequency.setValueAtTime(2000, now)

  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1500, now)
  filter.Q.setValueAtTime(5, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.5, now + 0.002)
  gain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

  noiseGain.gain.setValueAtTime(vol * 0.3, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(audioContext.destination)

  osc.start(now)
  noise.start(now)
  osc.stop(now + 0.2)
  noise.stop(now + 0.1)
}

function playClap() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const noise1 = audioContext.createBufferSource()
  const noise2 = audioContext.createBufferSource()
  const noise3 = audioContext.createBufferSource()
  const filter = audioContext.createBiquadFilter()
  const gain = audioContext.createGain()

  const sampleRate = audioContext.sampleRate
  const bufferSize = sampleRate * 0.08

  function makeNoiseBuffer(duration: number, decay: number) {
    const size = sampleRate * duration
    const buffer = audioContext!.createBuffer(1, size, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < size; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, decay)
    }
    return buffer
  }

  noise1.buffer = makeNoiseBuffer(0.01, 2)
  noise2.buffer = makeNoiseBuffer(0.03, 3)
  noise3.buffer = makeNoiseBuffer(0.08, 4)

  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1500, now)
  filter.Q.setValueAtTime(1.5, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.7, now + 0.002)
  gain.gain.exponentialRampToValueAtTime(vol * 0.3, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  noise1.connect(filter)
  noise2.connect(filter)
  noise3.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  noise1.start(now)
  noise2.start(now + 0.008)
  noise3.start(now + 0.02)
  noise1.stop(now + 0.05)
  noise2.stop(now + 0.08)
  noise3.stop(now + 0.15)
}

function playRim() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  osc.type = 'square'
  osc.frequency.setValueAtTime(2500, now)
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03)

  filter.type = 'highpass'
  filter.frequency.setValueAtTime(1000, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.35, now + 0.001)
  gain.gain.exponentialRampToValueAtTime(vol * 0.1, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  osc.start(now)
  osc.stop(now + 0.08)
}

function playWoodblock() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(900, now)
  osc.frequency.exponentialRampToValueAtTime(650, now + 0.05)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.001)
  gain.gain.exponentialRampToValueAtTime(vol * 0.15, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

  osc.connect(gain)
  gain.connect(audioContext.destination)

  osc.start(now)
  osc.stop(now + 0.12)
}

function playCowbell() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  osc1.type = 'square'
  osc1.frequency.setValueAtTime(587, now)

  osc2.type = 'square'
  osc2.frequency.setValueAtTime(831, now)

  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(2000, now)
  filter.Q.setValueAtTime(1, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.4, now + 0.002)
  gain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc1.connect(filter)
  osc2.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  osc1.start(now)
  osc2.start(now)
  osc1.stop(now + 0.3)
  osc2.stop(now + 0.3)
}

function playShaker() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const noise = audioContext.createBufferSource()
  const filter = audioContext.createBiquadFilter()
  const gain = audioContext.createGain()

  const sampleRate = audioContext.sampleRate
  const bufferSize = sampleRate * 0.15
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 6)
  }
  noise.buffer = buffer

  filter.type = 'highpass'
  filter.frequency.setValueAtTime(5000, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.35, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(vol * 0.1, now + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  noise.start(now)
  noise.stop(now + 0.15)
}

function playHiHat() {
  if (!audioContext) return
  const now = audioContext.currentTime
  const noise = audioContext.createBufferSource()
  const filter = audioContext.createBiquadFilter()
  const gain = audioContext.createGain()

  const sampleRate = audioContext.sampleRate
  const bufferSize = sampleRate * 0.1
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
  }
  noise.buffer = buffer

  filter.type = 'highpass'
  filter.frequency.setValueAtTime(7000, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.3, now + 0.001)
  gain.gain.exponentialRampToValueAtTime(vol * 0.08, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  noise.start(now)
  noise.stop(now + 0.08)
}

function playDrum(drum: DrumPad) {
  initAudio()
  activatePad(drum)

  switch (drum.type) {
    case 'bass':
      playDjembeBass()
      break
    case 'tone':
      playDjembeTone()
      break
    case 'slap':
      playDjembeSlap()
      break
    case 'clap':
      playClap()
      break
    case 'rim':
      playRim()
      break
    case 'woodblock':
      playWoodblock()
      break
    case 'cowbell':
      playCowbell()
      break
    case 'shaker':
      playShaker()
      break
    case 'hihat':
      playHiHat()
      break
  }
}

function playMetronomeClick(isAccent: boolean) {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now)

  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol * 0.4, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  osc.connect(gain)
  gain.connect(audioContext.destination)

  osc.start(now)
  osc.stop(now + 0.1)
}

function startMetronome() {
  if (metronomeInterval) return
  initAudio()
  metronomeEnabled.value = true
  currentBeat.value = 0

  const intervalMs = 60000 / bpm.value
  metronomeInterval = window.setInterval(() => {
    const isAccent = currentBeat.value === 0
    playMetronomeClick(isAccent)
    currentBeat.value = (currentBeat.value + 1) % beatsPerMeasure.value
  }, intervalMs)
}

function stopMetronome() {
  if (metronomeInterval) {
    clearInterval(metronomeInterval)
    metronomeInterval = null
  }
  metronomeEnabled.value = false
  currentBeat.value = 0
}

function toggleMetronome() {
  if (metronomeEnabled.value) {
    stopMetronome()
  } else {
    startMetronome()
  }
}

function togglePreset(preset: RhythmPreset) {
  if (activePreset.value?.name === preset.name) {
    stopPreset()
  } else {
    startPreset(preset)
  }
}

function getDrumById(id: string): DrumPad | undefined {
  return allDrums.find(d => d.id === id)
}

function startPreset(preset: RhythmPreset) {
  stopPreset()
  initAudio()
  activePreset.value = preset
  presetStep = 0

  bpm.value = preset.bpm
  if (!metronomeEnabled.value) {
    startMetronome()
  }

  const stepMs = 60000 / bpm.value / 4
  presetInterval = window.setInterval(() => {
    const beat = preset.pattern[presetStep]
    if (beat === 'B') {
      const drum = getDrumById('bass')
      if (drum) playDrum(drum)
    } else if (beat === 'T') {
      const drum = getDrumById('tone')
      if (drum) playDrum(drum)
    } else if (beat === 'S') {
      const drum = getDrumById('slap')
      if (drum) playDrum(drum)
    }
    presetStep = (presetStep + 1) % preset.pattern.length
  }, stepMs)
}

function stopPreset() {
  if (presetInterval) {
    clearInterval(presetInterval)
    presetInterval = null
  }
  activePreset.value = null
  presetStep = 0
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return
  const key = e.key.toLowerCase()
  const drum = keyboardMap[key]
  if (drum) {
    e.preventDefault()
    playDrum(drum)
  }
}

onMounted(() => {
  initKeyboardMap()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  stopMetronome()
  stopPreset()
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.hand-drum {
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

.header-hint {
  font-size: 13px;
  font-weight: 400;
  color: #67c23a;
  margin-left: 8px;
}

.keyboard-tip {
  margin-left: auto;
  font-weight: 700;
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

.metronome-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metronome-beats {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.beat-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  background: #f5f7fa;
  border: 2px solid #dcdfe6;
  color: #909399;
  transition: all 0.1s;
}

.beat-indicator.active {
  background: linear-gradient(145deg, #ffd700, #ffb300);
  border-color: #e6a23c;
  color: #604000;
  box-shadow: 0 0 20px rgba(255, 183, 0, 0.6);
  transform: scale(1.1);
}

.beat-indicator.accent {
  border-width: 3px;
}

.metronome-controls {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.metronome-control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-size: 14px;
  color: #606266;
  font-weight: 600;
  white-space: nowrap;
}

.control-unit {
  font-size: 13px;
  color: #909399;
}

.preset-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}

.preset-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.preset-item {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-item:hover {
  border-color: #722ed1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
}

.preset-item.active {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
  border-color: #722ed1;
}

.preset-item.active .preset-name,
.preset-item.active .preset-desc {
  color: #fff;
}

.preset-item.active .preset-beat {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.preset-item.active .preset-beat.hit {
  background: #ffd700;
  color: #604000;
}

.preset-name {
  font-weight: 700;
  font-size: 15px;
  color: #303133;
  margin-bottom: 4px;
}

.preset-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.preset-visual {
  display: flex;
  gap: 3px;
}

.preset-beat {
  flex: 1;
  min-width: 0;
  height: 24px;
  border-radius: 4px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #c0c4cc;
}

.preset-beat.hit {
  background: #e1f3d8;
  color: #529b2e;
}

.preset-beat.strong {
  background: #67c23a;
  color: #fff;
}

.drum-card {
  background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%);
}

.drum-card :deep(.el-card__header) {
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drum-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%);
  color: #fff;
}

.drum-stage {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.drum-rows {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 10px;
}

.drum-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.row-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  flex-shrink: 0;
}

.row-key-hint {
  font-size: 20px;
  font-weight: 800;
  color: #ffd700;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.row-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.row-drums {
  display: flex;
  gap: 20px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.drum-pad {
  position: relative;
  min-width: 110px;
  padding: 16px 14px;
  background: linear-gradient(180deg, var(--drum-color) 0%, var(--drum-color-dark) 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.25),
    inset 0 -4px 8px rgba(0, 0, 0, 0.35),
    0 6px 16px rgba(0, 0, 0, 0.4);
}

.drum-pad:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -4px 8px rgba(0, 0, 0, 0.35),
    0 10px 24px rgba(0, 0, 0, 0.5);
}

.drum-pad.active {
  transform: translateY(3px) scale(0.97);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.7);
}

.drum-pad.main-drum {
  min-width: 140px;
  padding: 20px 16px;
}

.drum-keytag {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  background: linear-gradient(180deg, #ffffff 0%, #e8eaf0 100%);
  border: 2px solid var(--drum-color-dark);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #303133;
  box-shadow: 0 3px 0 #a8abb2, 0 4px 8px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.drum-keytag.large {
  width: 40px;
  height: 40px;
  font-size: 18px;
  top: -12px;
  right: -12px;
}

.drum-pad.active .drum-keytag {
  background: linear-gradient(180deg, #ffd700 0%, #ffb300 100%);
  color: #604000;
  box-shadow: 0 1px 0 #b88230, 0 2px 4px rgba(0, 0, 0, 0.25);
  transform: translateY(2px);
}

.drum-visual {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drum-visual.main {
  width: 80px;
  height: 80px;
}

.drum-emoji {
  font-size: 48px;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
}

.drum-emoji.large {
  font-size: 60px;
}

.drum-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%),
              radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%);
  border: 3px solid rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 -4px 8px rgba(0,0,0,0.3),
              inset 0 2px 4px rgba(255,255,255,0.2);
}

.drum-skin-main {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 250, 240, 0.4), transparent 50%);
}

.skin-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
}

.ring1 {
  inset: 15%;
}

.ring2 {
  inset: 30%;
}

.skin-center {
  position: absolute;
  inset: 42%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.2), transparent);
}

.drum-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.drum-tech {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.row-high {
  opacity: 0.95;
}

.row-mid {
  transform: scale(1.02);
  transform-origin: center;
}

.row-low {
  opacity: 0.95;
}

.keyboard-diagram {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.diagram-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 16px;
}

.keyboard-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.kbd-row {
  display: flex;
  gap: 5px;
}

.kbd-key {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 56px;
  background: linear-gradient(180deg, #4a3520 0%, #2a1810 100%);
  border: 2px solid #1a0f08;
  border-radius: 8px;
  padding: 4px 6px;
  transition: all 0.08s ease;
  user-select: none;
  box-shadow: 0 3px 0 #0d0704, 0 4px 8px rgba(0, 0, 0, 0.3);
}

.kbd-key.empty {
  opacity: 0.5;
  background: linear-gradient(180deg, #3a2818 0%, #1a0f08 100%);
}

.kbd-key.used {
  background: linear-gradient(180deg, #6b4423 0%, #4a2c10 100%);
  border-color: #2a1810;
}

.kbd-key.active {
  background: linear-gradient(180deg, #ffd700 0%, #e6a23c 100%);
  border-color: #b88230;
  box-shadow: 0 1px 0 #8b6914, 0 0 20px rgba(255, 215, 0, 0.7);
  transform: translateY(2px);
}

.kbd-letter {
  font-size: 14px;
  font-weight: 800;
  color: #c9b99a;
  line-height: 1;
}

.kbd-key.used .kbd-letter {
  color: #fff;
}

.kbd-key.active .kbd-letter {
  color: #604000;
}

.kbd-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
  font-weight: 600;
}

.kbd-key.used .kbd-label {
  color: #ffd700;
}

.kbd-key.active .kbd-label {
  color: #604000;
}

.kbd-row-1 { margin-left: 0; }
.kbd-row-2 { margin-left: 15px; }
.kbd-row-3 { margin-left: 30px; }
</style>
