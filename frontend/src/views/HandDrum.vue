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
          <span><strong>键盘弹奏</strong>：遵循行业通用惯例 —— <el-tag size="small" type="danger">A=低音</el-tag> <el-tag size="small" type="warning">S=中音</el-tag> <el-tag size="small" type="success">D=高音</el-tag>，从左到右音高递增</span>
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
            <el-slider v-model="bpm" :min="40" :max="200" :disabled="metronomeEnabled" show-input size="small" :width="180" />
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
            <el-slider v-model="volume" :min="0" :max="100" show-input size="small" :width="150" />
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
          <el-tag size="small" type="warning" class="keyboard-tip" effect="dark">
            ⌨️ A→低 S→中 D→高
          </el-tag>
        </div>
      </template>

      <div class="drum-stage">
        <div class="pitch-axis">
          <span class="axis-label axis-low">低</span>
          <div class="axis-arrow">
            <div class="axis-line"></div>
            <div class="axis-head"></div>
          </div>
          <span class="axis-label axis-high">高</span>
          <span class="axis-desc">同行从左到右 · 音高递增</span>
        </div>

        <div class="drum-rows">
          <div class="drum-row row-high">
            <div class="row-label">
              <span class="row-key-hint">Q W E</span>
              <span class="row-name">亮音打击乐</span>
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
                  <span class="drum-emoji">{{ drum.icon }}</span>
                </div>
                <div class="drum-name">{{ drum.name }}</div>
              </div>
            </div>
          </div>

          <div class="drum-row row-mid">
            <div class="row-label">
              <span class="row-key-hint highlight">A S D</span>
              <span class="row-name highlight-text">手鼓核心三音</span>
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
                <div class="pitch-badge" :class="drum.pitchClass">{{ drum.pitchLabel }}</div>
                <div class="drum-visual main">
                  <div class="drum-skin-main">
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
              <span class="row-name">暖音打击乐</span>
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
                  <span class="drum-emoji">{{ drum.icon }}</span>
                </div>
                <div class="drum-name">{{ drum.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="keyboard-diagram">
          <div class="diagram-title">
            <el-icon><Keyboard /></el-icon>
            <span>键盘对照图 · 左低右高</span>
          </div>
          <div class="keyboard-body">
            <div class="kbd-row kbd-row-1">
              <div
                v-for="k in keyboardDiagram.row1"
                :key="k.key"
                class="kbd-key"
                :class="{ active: pressedKeys[k.key], used: k.drum, empty: !k.drum }"
              >
                <span class="kbd-letter">{{ k.key.toUpperCase() }}</span>
                <span class="kbd-label" v-if="k.drum">{{ k.drum }}</span>
              </div>
            </div>
            <div class="kbd-row kbd-row-2">
              <div
                v-for="k in keyboardDiagram.row2"
                :key="k.key"
                class="kbd-key kbd-key-core"
                :class="{ active: pressedKeys[k.key], used: k.drum, empty: !k.drum }"
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
                :class="{ active: pressedKeys[k.key], used: k.drum, empty: !k.drum }"
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
  pitchLabel?: string
  pitchClass?: string
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
  { id: 'rim', name: '边击', key: 'Q', type: 'rim', color: '#909399', colorDark: '#606266', icon: '🥢' },
  { id: 'cowbell', name: '牛铃', key: 'W', type: 'cowbell', color: '#67c23a', colorDark: '#529b2e', icon: '🔔' },
  { id: 'hihat', name: '踩镲', key: 'E', type: 'hihat', color: '#b37feb', colorDark: '#9254de', icon: '💿' }
]

const midRowDrums: DrumPad[] = [
  { id: 'bass', name: '低音 Bass', key: 'A', type: 'bass', color: '#8B4513', colorDark: '#5D2E0C', tech: '掌心击打鼓面中心', pitchLabel: '低', pitchClass: 'pitch-0' },
  { id: 'tone', name: '中音 Tone', key: 'S', type: 'tone', color: '#D2691E', colorDark: '#8B4513', tech: '手指击打鼓面边缘', pitchLabel: '中', pitchClass: 'pitch-1' },
  { id: 'slap', name: '高音 Slap', key: 'D', type: 'slap', color: '#CD853F', colorDark: '#A0522D', tech: '指尖快速弹击鼓边', pitchLabel: '高', pitchClass: 'pitch-2' }
]

const lowRowDrums: DrumPad[] = [
  { id: 'woodblock', name: '木鱼', key: 'Z', type: 'woodblock', color: '#A0522D', colorDark: '#6B3410', icon: '🪵' },
  { id: 'clap', name: '拍手', key: 'X', type: 'clap', color: '#e6a23c', colorDark: '#b88230', icon: '👏' },
  { id: 'shaker', name: '沙锤', key: 'C', type: 'shaker', color: '#f56c6c', colorDark: '#c45656', icon: '🎋' }
]

const allDrums = [...highRowDrums, ...midRowDrums, ...lowRowDrums]

const keyboardMap: Record<string, DrumPad> = {}

const keyboardDiagram = computed(() => {
  const makeRow = (keys: string[], drumMap: Record<string, string>) =>
    keys.map(key => ({ key, drum: drumMap[key] || null }))

  const highMap: Record<string, string> = { q: '边击', w: '牛铃', e: '踩镲' }
  const midMap: Record<string, string> = { a: '低音', s: '中音', d: '高音' }
  const lowMap: Record<string, string> = { z: '木鱼', x: '拍手', c: '沙锤' }

  return {
    row1: makeRow(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], highMap),
    row2: makeRow(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], midMap),
    row3: makeRow(['z', 'x', 'c', 'v', 'b', 'n', 'm'], lowMap)
  }
})

const rhythmPresets: RhythmPreset[] = [
  { name: '基础四拍', description: '入门必练 · 每拍一下低音', pattern: ['B', '-', '-', '-', 'B', '-', '-', '-', 'B', '-', '-', '-', 'B', '-', '-', '-'], bpm: 80 },
  { name: '经典非洲节奏', description: 'Bass-Tone-Slap 组合', pattern: ['B', '-', 'T', 'S', '-', 'T', 'S', '-', 'B', '-', 'T', 'S', '-', 'T', 'S', 'T'], bpm: 100 },
  { name: '摇摆节奏', description: '三连音感觉 · 适合布鲁斯', pattern: ['B', '-', 'T', '-', 'S', 'T', '-', 'S', 'B', '-', 'T', '-', 'S', 'T', 'S', '-'], bpm: 90 },
  { name: '桑巴节奏', description: '热情奔放 · 巴西风格', pattern: ['B', 'S', 'T', 'B', 'S', 'T', 'B', 'S', 'B', 'S', 'T', 'B', 'S', 'T', 'S', 'T'], bpm: 120 },
  { name: '雷鬼节奏', description: '反拍重音 · 牙买加风情', pattern: ['-', 'B', '-', 'S', '-', 'B', '-', 'S', '-', 'B', 'T', 'S', '-', 'B', 'T', 'S'], bpm: 85 },
  { name: '方克节奏', description: '十六分音符 · 律动感强', pattern: ['B', '-', 'S', 'T', 'B', 'S', '-', 'T', 'B', '-', 'S', 'T', '-', 'S', 'T', 'S'], bpm: 110 }
]

function initKeyboardMap() {
  allDrums.forEach(drum => { keyboardMap[drum.key.toLowerCase()] = drum })
}

let audioContext: AudioContext | null = null

function initAudio() {
  if (!audioContext) { audioContext = new (window.AudioContext || (window as any).webkitAudioContext)() }
  if (audioContext.state === 'suspended') { audioContext.resume() }
}

function activatePad(drum: DrumPad) {
  activePads[drum.id] = true
  pressedKeys[drum.key.toLowerCase()] = true
  setTimeout(() => { activePads[drum.id] = false; pressedKeys[drum.key.toLowerCase()] = false }, 150)
}

function playDjembeBass() {
  if (!audioContext) return
  const now = audioContext.currentTime, osc = audioContext.createOscillator(), gain = audioContext.createGain(), filter = audioContext.createBiquadFilter()
  osc.type = 'sine'; osc.frequency.setValueAtTime(90, now); osc.frequency.exponentialRampToValueAtTime(55, now + 0.15)
  filter.type = 'lowpass'; filter.frequency.setValueAtTime(200, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.9, now + 0.005); gain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.1); gain.gain.exponentialRampToValueAtTime(vol * 0.1, now + 0.3); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
  osc.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + 0.5)
}

function playDjembeTone() {
  if (!audioContext) return
  const now = audioContext.currentTime, osc = audioContext.createOscillator(), osc2 = audioContext.createOscillator(), gain = audioContext.createGain(), filter = audioContext.createBiquadFilter()
  osc.type = 'sine'; osc.frequency.setValueAtTime(330, now); osc.frequency.exponentialRampToValueAtTime(260, now + 0.1)
  osc2.type = 'triangle'; osc2.frequency.setValueAtTime(660, now)
  filter.type = 'bandpass'; filter.frequency.setValueAtTime(800, now); filter.Q.setValueAtTime(3, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.003); gain.gain.exponentialRampToValueAtTime(vol * 0.3, now + 0.08); gain.gain.exponentialRampToValueAtTime(vol * 0.08, now + 0.2); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  osc.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc2.start(now); osc.stop(now + 0.35); osc2.stop(now + 0.35)
}

function playDjembeSlap() {
  if (!audioContext) return
  const now = audioContext.currentTime, osc = audioContext.createOscillator(), noise = audioContext.createBufferSource(), noiseGain = audioContext.createGain(), gain = audioContext.createGain(), filter = audioContext.createBiquadFilter(), noiseFilter = audioContext.createBiquadFilter()
  osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(500, now + 0.08)
  const bufferSize = audioContext.sampleRate * 0.1, noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate), data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) { data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2) }
  noise.buffer = noiseBuffer; noiseFilter.type = 'highpass'; noiseFilter.frequency.setValueAtTime(2000, now)
  filter.type = 'bandpass'; filter.frequency.setValueAtTime(1500, now); filter.Q.setValueAtTime(5, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.5, now + 0.002); gain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
  noiseGain.gain.setValueAtTime(vol * 0.3, now); noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  osc.connect(filter); filter.connect(gain); gain.connect(audioContext.destination)
  noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioContext.destination)
  osc.start(now); noise.start(now); osc.stop(now + 0.2); noise.stop(now + 0.1)
}

function playClap() {
  if (!audioContext) return
  const now = audioContext.currentTime, filter = audioContext.createBiquadFilter(), gain = audioContext.createGain()
  const sampleRate = audioContext.sampleRate
  const n1 = audioContext.createBufferSource(), n2 = audioContext.createBufferSource(), n3 = audioContext.createBufferSource()
  function mkBuf(dur: number, dec: number) { const s = sampleRate * dur, b = audioContext!.createBuffer(1, s, sampleRate), d = b.getChannelData(0); for (let i = 0; i < s; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / s, dec); return b }
  n1.buffer = mkBuf(0.01, 2); n2.buffer = mkBuf(0.03, 3); n3.buffer = mkBuf(0.08, 4)
  filter.type = 'bandpass'; filter.frequency.setValueAtTime(1500, now); filter.Q.setValueAtTime(1.5, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.7, now + 0.002); gain.gain.exponentialRampToValueAtTime(vol * 0.3, now + 0.03); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  n1.connect(filter); n2.connect(filter); n3.connect(filter); filter.connect(gain); gain.connect(audioContext.destination)
  n1.start(now); n2.start(now + 0.008); n3.start(now + 0.02); n1.stop(now + 0.05); n2.stop(now + 0.08); n3.stop(now + 0.15)
}

function playRim() {
  if (!audioContext) return
  const now = audioContext.currentTime, osc = audioContext.createOscillator(), gain = audioContext.createGain(), filter = audioContext.createBiquadFilter()
  osc.type = 'square'; osc.frequency.setValueAtTime(2500, now); osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03)
  filter.type = 'highpass'; filter.frequency.setValueAtTime(1000, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.35, now + 0.001); gain.gain.exponentialRampToValueAtTime(vol * 0.1, now + 0.03); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  osc.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + 0.08)
}

function playWoodblock() {
  if (!audioContext) return
  const now = audioContext.currentTime, osc = audioContext.createOscillator(), gain = audioContext.createGain()
  osc.type = 'sine'; osc.frequency.setValueAtTime(900, now); osc.frequency.exponentialRampToValueAtTime(650, now + 0.05)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.001); gain.gain.exponentialRampToValueAtTime(vol * 0.15, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + 0.12)
}

function playCowbell() {
  if (!audioContext) return
  const now = audioContext.currentTime, o1 = audioContext.createOscillator(), o2 = audioContext.createOscillator(), gain = audioContext.createGain(), filter = audioContext.createBiquadFilter()
  o1.type = 'square'; o1.frequency.setValueAtTime(587, now); o2.type = 'square'; o2.frequency.setValueAtTime(831, now)
  filter.type = 'bandpass'; filter.frequency.setValueAtTime(2000, now); filter.Q.setValueAtTime(1, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.4, now + 0.002); gain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.08); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  o1.connect(filter); o2.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); o1.start(now); o2.start(now); o1.stop(now + 0.3); o2.stop(now + 0.3)
}

function playShaker() {
  if (!audioContext) return
  const now = audioContext.currentTime, noise = audioContext.createBufferSource(), filter = audioContext.createBiquadFilter(), gain = audioContext.createGain()
  const sr = audioContext.sampleRate, bs = sr * 0.15, buf = audioContext.createBuffer(1, bs, sr), d = buf.getChannelData(0)
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 6)
  noise.buffer = buf; filter.type = 'highpass'; filter.frequency.setValueAtTime(5000, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.35, now + 0.005); gain.gain.exponentialRampToValueAtTime(vol * 0.1, now + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  noise.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); noise.start(now); noise.stop(now + 0.15)
}

function playHiHat() {
  if (!audioContext) return
  const now = audioContext.currentTime, noise = audioContext.createBufferSource(), filter = audioContext.createBiquadFilter(), gain = audioContext.createGain()
  const sr = audioContext.sampleRate, bs = sr * 0.1, buf = audioContext.createBuffer(1, bs, sr), d = buf.getChannelData(0)
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 3)
  noise.buffer = buf; filter.type = 'highpass'; filter.frequency.setValueAtTime(7000, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.3, now + 0.001); gain.gain.exponentialRampToValueAtTime(vol * 0.08, now + 0.03); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  noise.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); noise.start(now); noise.stop(now + 0.08)
}

function playDrum(drum: DrumPad) {
  initAudio(); activatePad(drum)
  const fn: Record<string, () => void> = { bass: playDjembeBass, tone: playDjembeTone, slap: playDjembeSlap, clap: playClap, rim: playRim, woodblock: playWoodblock, cowbell: playCowbell, shaker: playShaker, hihat: playHiHat }
  fn[drum.type]?.()
}

function playMetronomeClick(isAccent: boolean) {
  if (!audioContext) return
  const now = audioContext.currentTime, osc = audioContext.createOscillator(), gain = audioContext.createGain()
  osc.type = 'sine'; osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now)
  const vol = volume.value / 100
  gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(vol * 0.4, now + 0.005); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + 0.1)
}

function startMetronome() {
  if (metronomeInterval) return
  initAudio(); metronomeEnabled.value = true; currentBeat.value = 0
  const ms = 60000 / bpm.value
  metronomeInterval = window.setInterval(() => { playMetronomeClick(currentBeat.value === 0); currentBeat.value = (currentBeat.value + 1) % beatsPerMeasure.value }, ms)
}

function stopMetronome() { if (metronomeInterval) { clearInterval(metronomeInterval); metronomeInterval = null } metronomeEnabled.value = false; currentBeat.value = 0 }
function toggleMetronome() { metronomeEnabled.value ? stopMetronome() : startMetronome() }
function togglePreset(preset: RhythmPreset) { activePreset.value?.name === preset.name ? stopPreset() : startPreset(preset) }
function getDrumById(id: string) { return allDrums.find(d => d.id === id) }

function startPreset(preset: RhythmPreset) {
  stopPreset(); initAudio(); activePreset.value = preset; presetStep = 0; bpm.value = preset.bpm
  if (!metronomeEnabled.value) startMetronome()
  const stepMs = 60000 / bpm.value / 4
  presetInterval = window.setInterval(() => {
    const beat = preset.pattern[presetStep]
    if (beat === 'B') { const d = getDrumById('bass'); if (d) playDrum(d) }
    else if (beat === 'T') { const d = getDrumById('tone'); if (d) playDrum(d) }
    else if (beat === 'S') { const d = getDrumById('slap'); if (d) playDrum(d) }
    presetStep = (presetStep + 1) % preset.pattern.length
  }, stepMs)
}

function stopPreset() { if (presetInterval) { clearInterval(presetInterval); presetInterval = null } activePreset.value = null; presetStep = 0 }

function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return
  const drum = keyboardMap[e.key.toLowerCase()]
  if (drum) { e.preventDefault(); playDrum(drum) }
}

onMounted(() => { initKeyboardMap(); window.addEventListener('keydown', handleKeyDown) })
onUnmounted(() => { window.removeEventListener('keydown', handleKeyDown); stopMetronome(); stopPreset(); if (audioContext) audioContext.close() })
</script>

<style scoped>
.hand-drum { max-width: 1400px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.card-header { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 16px; }
.header-hint { font-size: 13px; font-weight: 400; color: #67c23a; margin-left: 8px; }
.keyboard-tip { margin-left: auto; font-weight: 700; }
.guide-content { display: flex; flex-direction: column; gap: 12px; }
.guide-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #606266; }
.guide-icon { color: #165DFF; font-size: 18px; }

.metronome-body { display: flex; flex-direction: column; gap: 16px; }
.metronome-beats { display: flex; gap: 12px; justify-content: center; }
.beat-indicator { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; background: #f5f7fa; border: 2px solid #dcdfe6; color: #909399; transition: all 0.1s; }
.beat-indicator.active { background: linear-gradient(145deg, #ffd700, #ffb300); border-color: #e6a23c; color: #604000; box-shadow: 0 0 20px rgba(255, 183, 0, 0.6); transform: scale(1.1); }
.beat-indicator.accent { border-width: 3px; }
.metronome-controls { display: flex; gap: 30px; align-items: center; flex-wrap: wrap; }
.metronome-control-item { display: flex; align-items: center; gap: 10px; }
.control-label { font-size: 14px; color: #606266; font-weight: 600; white-space: nowrap; }
.control-unit { font-size: 13px; color: #909399; }

.preset-card { background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%); }
.preset-body { display: flex; flex-direction: column; gap: 12px; }
.preset-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.preset-item { background: #fff; border: 2px solid #e4e7ed; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.2s; }
.preset-item:hover { border-color: #722ed1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15); }
.preset-item.active { background: linear-gradient(135deg, #722ed1 0%, #9254de 100%); border-color: #722ed1; }
.preset-item.active .preset-name, .preset-item.active .preset-desc { color: #fff; }
.preset-item.active .preset-beat { background: rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.7); }
.preset-item.active .preset-beat.hit { background: #ffd700; color: #604000; }
.preset-name { font-weight: 700; font-size: 15px; color: #303133; margin-bottom: 4px; }
.preset-desc { font-size: 12px; color: #909399; margin-bottom: 10px; }
.preset-visual { display: flex; gap: 3px; }
.preset-beat { flex: 1; min-width: 0; height: 24px; border-radius: 4px; background: #f5f7fa; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #c0c4cc; }
.preset-beat.hit { background: #e1f3d8; color: #529b2e; }
.preset-beat.strong { background: #67c23a; color: #fff; }

.drum-card { background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%); }
.drum-card :deep(.el-card__header) { background: rgba(0, 0, 0, 0.2); color: #fff; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.drum-card :deep(.el-card__body) { background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%); color: #fff; }

.drum-stage { display: flex; flex-direction: column; gap: 20px; }

.pitch-axis { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 8px 0; }
.axis-label { font-size: 14px; font-weight: 800; }
.axis-low { color: #f56c6c; }
.axis-high { color: #67c23a; }
.axis-arrow { display: flex; align-items: center; width: 120px; position: relative; }
.axis-line { width: 100%; height: 3px; background: linear-gradient(90deg, #f56c6c, #e6a23c, #67c23a); border-radius: 2px; }
.axis-head { position: absolute; right: -2px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-top: 7px solid transparent; border-bottom: 7px solid transparent; border-left: 10px solid #67c23a; }
.axis-desc { font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-left: 8px; }

.drum-rows { display: flex; flex-direction: column; gap: 18px; padding: 10px; }
.drum-row { display: flex; align-items: center; gap: 20px; }
.row-label { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 80px; flex-shrink: 0; }
.row-key-hint { font-size: 20px; font-weight: 800; color: #ffd700; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); }
.row-key-hint.highlight { font-size: 24px; text-shadow: 0 0 12px rgba(255, 215, 0, 0.5); }
.row-name { font-size: 12px; color: rgba(255, 255, 255, 0.6); font-weight: 600; }
.row-name.highlight-text { color: #ffd700; font-weight: 700; }
.row-drums { display: flex; gap: 20px; flex: 1; justify-content: center; flex-wrap: wrap; }

.drum-pad { position: relative; min-width: 110px; padding: 16px 14px; background: linear-gradient(180deg, var(--drum-color) 0%, var(--drum-color-dark) 100%); border-radius: 16px; cursor: pointer; transition: all 0.1s ease; user-select: none; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -4px 8px rgba(0, 0, 0, 0.35), 0 6px 16px rgba(0, 0, 0, 0.4); }
.drum-pad:hover { transform: translateY(-2px); box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -4px 8px rgba(0, 0, 0, 0.35), 0 10px 24px rgba(0, 0, 0, 0.5); }
.drum-pad.active { transform: translateY(3px) scale(0.97); box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.7); }
.drum-pad.main-drum { min-width: 140px; padding: 20px 16px; border: 2px solid rgba(255, 215, 0, 0.3); }

.drum-keytag { position: absolute; top: -10px; right: -10px; width: 32px; height: 32px; background: linear-gradient(180deg, #ffffff 0%, #e8eaf0 100%); border: 2px solid var(--drum-color-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #303133; box-shadow: 0 3px 0 #a8abb2, 0 4px 8px rgba(0, 0, 0, 0.25); z-index: 2; }
.drum-keytag.large { width: 40px; height: 40px; font-size: 18px; top: -12px; right: -12px; }
.drum-pad.active .drum-keytag { background: linear-gradient(180deg, #ffd700 0%, #ffb300 100%); color: #604000; box-shadow: 0 1px 0 #b88230, 0 2px 4px rgba(0, 0, 0, 0.25); transform: translateY(2px); }

.pitch-badge { position: absolute; top: -10px; left: -10px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); z-index: 2; }
.pitch-0 { background: linear-gradient(135deg, #f56c6c, #c45656); }
.pitch-1 { background: linear-gradient(135deg, #e6a23c, #b88230); }
.pitch-2 { background: linear-gradient(135deg, #67c23a, #529b2e); }

.drum-visual { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
.drum-visual.main { width: 80px; height: 80px; }
.drum-emoji { font-size: 48px; filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4)); }
.drum-skin-main { width: 100%; height: 100%; position: relative; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255, 250, 240, 0.4), transparent 50%); }
.skin-ring { position: absolute; border-radius: 50%; border: 2px solid rgba(0, 0, 0, 0.25); }
.ring1 { inset: 15%; }
.ring2 { inset: 30%; }
.skin-center { position: absolute; inset: 42%; border-radius: 50%; background: radial-gradient(circle, rgba(0, 0, 0, 0.2), transparent); }

.drum-name { font-size: 15px; font-weight: 700; color: #fff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); }
.drum-tech { font-size: 11px; color: rgba(255, 255, 255, 0.6); font-weight: 500; }
.row-high { opacity: 0.95; }
.row-mid { transform: scale(1.02); transform-origin: center; }
.row-low { opacity: 0.95; }

.keyboard-diagram { background: rgba(0, 0, 0, 0.25); border-radius: 16px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
.diagram-title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; font-weight: 700; color: #ffd700; margin-bottom: 16px; }
.keyboard-body { display: flex; flex-direction: column; gap: 6px; align-items: center; }
.kbd-row { display: flex; gap: 5px; }
.kbd-key { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 50px; height: 56px; background: linear-gradient(180deg, #4a3520 0%, #2a1810 100%); border: 2px solid #1a0f08; border-radius: 8px; padding: 4px 6px; transition: all 0.08s ease; user-select: none; box-shadow: 0 3px 0 #0d0704, 0 4px 8px rgba(0, 0, 0, 0.3); }
.kbd-key.empty { opacity: 0.5; background: linear-gradient(180deg, #3a2818 0%, #1a0f08 100%); }
.kbd-key.used { background: linear-gradient(180deg, #6b4423 0%, #4a2c10 100%); }
.kbd-key.kbd-key-core.used { background: linear-gradient(180deg, #8b5e3c 0%, #5a3518 100%); border-color: rgba(255, 215, 0, 0.3); }
.kbd-key.active { background: linear-gradient(180deg, #ffd700 0%, #e6a23c 100%); border-color: #b88230; box-shadow: 0 1px 0 #8b6914, 0 0 20px rgba(255, 215, 0, 0.7); transform: translateY(2px); }
.kbd-letter { font-size: 14px; font-weight: 800; color: #c9b99a; line-height: 1; }
.kbd-key.used .kbd-letter { color: #fff; }
.kbd-key.active .kbd-letter { color: #604000; }
.kbd-label { font-size: 9px; color: rgba(255, 255, 255, 0.5); margin-top: 3px; font-weight: 600; }
.kbd-key.used .kbd-label { color: #ffd700; }
.kbd-key.active .kbd-label { color: #604000; }
.kbd-row-1 { margin-left: 0; }
.kbd-row-2 { margin-left: 15px; }
.kbd-row-3 { margin-left: 30px; }
</style>
