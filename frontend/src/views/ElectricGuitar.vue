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
          <span><strong>鼠标点击</strong>：点击指板上任意品位即可弹奏对应音符</span>
        </div>
        <div class="guide-item">
          <el-icon class="guide-icon"><Keyboard /></el-icon>
          <span><strong>键盘弹奏</strong>：指板上的紫色标签标注了对应按键，按一下就能发声</span>
        </div>
        <div class="guide-item">
          <el-icon class="guide-icon"><MagicStick /></el-icon>
          <span><strong>和弦练习</strong>：将鼠标悬停在和弦按钮上可预览指法，点击一键弹奏和弦</span>
        </div>
      </div>
    </el-card>

    <el-card class="practice-card" v-if="practiceMode || progressionMode">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#67c23a">
            <MagicStick />
          </el-icon>
          <span>
            {{ progressionMode && selectedProgression ? selectedProgression.name + ' 练习' : practiceChord ? practiceChord.name + ' 和弦练习' : '练习模式' }}
          </span>
          <el-tag v-if="progressionMode && selectedProgression" size="small" type="warning">
            第 {{ currentProgressionIndex + 1 }}/{{ selectedProgression.chords.length }} 个和弦
          </el-tag>
          <el-button size="small" type="danger" plain @click="progressionMode ? stopProgression() : stopPractice()">
            退出练习
          </el-button>
        </div>
      </template>
      <div class="practice-body">
        <div class="practice-progress">
          <div class="practice-progress-label">
            <span>按键进度</span>
            <span class="practice-progress-count">
              {{ practiceChordPressedCount }} / {{ practiceChordTotalNotes }}
            </span>
          </div>
          <el-progress
            :percentage="practiceChordTotalNotes > 0 ? Math.round(practiceChordPressedCount / practiceChordTotalNotes * 100) : 0"
            :status="practiceChordComplete ? 'success' : undefined"
            :stroke-width="16"
          />
        </div>
        <div v-if="practiceChordComplete" class="practice-complete">
          <el-icon :size="18" color="#67c23a"><CircleCheck /></el-icon>
          <span>太棒了！和弦完整！</span>
          <el-button size="small" type="primary" plain @click="resetPractice()">
            再练一次
          </el-button>
        </div>
        <div v-else class="practice-hint">
          <el-icon :size="16" color="#909399"><InfoFilled /></el-icon>
          <span>请按照上方绿色高亮位置，依次按下所有按键</span>
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
              <el-option :label="2/4" :value="2" />
              <el-option :label="3/4" :value="3" />
              <el-option :label="4/4" :value="4" />
              <el-option :label="6/8" :value="6" />
            </el-select>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="progression-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <DataAnalysis />
          </el-icon>
          <span>和弦进行练习</span>
          <span class="header-hint">跟着节拍器练习常见和弦进行</span>
        </div>
      </template>
      <div class="progression-body">
        <div class="progression-list">
          <div
            v-for="prog in chordProgressions"
            :key="prog.name"
            class="progression-item"
            :class="{ active: selectedProgression?.name === prog.name }"
            @click="startProgression(prog)"
          >
            <div class="progression-name">{{ prog.name }}</div>
            <div class="progression-chords">
              <span v-for="(c, i) in prog.chords" :key="i" class="prog-chord-tag">
                {{ c }}
              </span>
            </div>
            <div class="progression-desc">{{ prog.description }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="chord-reference-card" v-if="hoveredChord">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#f56c6c">
            <View />
          </el-icon>
          <span>{{ hoveredChord.name }} 和弦指法</span>
          <el-tag type="success" size="small" class="chord-tag-hint">鼠标悬停和弦按钮查看</el-tag>
        </div>
      </template>
      <div class="chord-reference-body">
        <div class="chord-diagram-wrapper">
          <div class="chord-diagram">
            <div class="chord-diagram-header">
              <div v-for="str in 6" :key="str" class="chord-top-marker">
                <span v-if="getChordFret(hoveredChord, 6 - str) === -1" class="mute-marker">×</span>
                <span v-else-if="getChordFret(hoveredChord, 6 - str) === 0" class="open-marker">○</span>
              </div>
            </div>
            <div class="chord-diagram-grid">
              <div v-for="fret in 4" :key="fret" class="chord-fret-row">
                <span class="chord-fret-num">{{ getMinChordFret(hoveredChord) + fret - 1 || fret }}</span>
                <div v-for="str in 6" :key="str" class="chord-fret-cell">
                  <div
                    v-if="isChordFingerHere(hoveredChord, 6 - str, getMinChordFret(hoveredChord) + fret - 1)"
                    class="chord-finger-dot"
                  >
                    {{ getChordFinger(hoveredChord, 6 - str) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chord-diagram-labels">
            <div v-for="(str, idx) in reversedStrings" :key="idx" class="chord-string-label">
              {{ str.noteName }}
            </div>
          </div>
        </div>
        <div class="chord-key-info">
          <div class="chord-key-title">键盘按键：</div>
          <div class="chord-key-list">
            <div
              v-for="(note, idx) in getChordKeyNotes(hoveredChord)"
              :key="idx"
              class="chord-key-item"
              :class="{ 'no-key': !note.key }"
            >
              <span class="chord-key-cap" v-if="note.key">{{ note.key.toUpperCase() }}</span>
              <span class="chord-key-cap no-key-cap" v-else>—</span>
              <span class="chord-key-note">{{ note.noteName }}</span>
              <span class="chord-key-fret">{{ note.fret === 0 ? '空弦' : note.fret + '品' }}</span>
            </div>
          </div>
          <div class="chord-play-hint">
            <el-icon><VideoPlay /></el-icon>
            <span>点击和弦按钮即可同时弹奏以上音符</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="keyboard-reference-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <Keyboard />
          </el-icon>
          <span>键盘对应图</span>
          <span class="header-hint" v-if="hoveredChord">（橙色高亮 = {{ hoveredChord.name }} 和弦）</span>
        </div>
      </template>
      <div class="keyboard-reference">
        <div class="keyboard-row">
          <div class="keyboard-label">高音弦<br/><small>(1弦 E)</small></div>
          <div
            v-for="key in keyboardRow1"
            :key="key.key"
            class="key-cap"
            :class="{
              active: pressedKeys[key.key],
              'chord-highlight': isKeyInChord(key.key, hoveredChord)
            }"
          >
            <span class="key-cap-label">{{ key.key.toUpperCase() }}</span>
            <span class="key-cap-note">{{ key.note }}</span>
          </div>
        </div>
        <div class="keyboard-row">
          <div class="keyboard-label">中音弦<br/><small>(4弦 G)</small></div>
          <div
            v-for="key in keyboardRow2"
            :key="key.key"
            class="key-cap"
            :class="{
              active: pressedKeys[key.key],
              'chord-highlight': isKeyInChord(key.key, hoveredChord)
            }"
          >
            <span class="key-cap-label">{{ key.key.toUpperCase() }}</span>
            <span class="key-cap-note">{{ key.note }}</span>
          </div>
        </div>
        <div class="keyboard-row">
          <div class="keyboard-label">低音弦<br/><small>(5弦 A)</small></div>
          <div
            v-for="key in keyboardRow3"
            :key="key.key"
            class="key-cap"
            :class="{
              active: pressedKeys[key.key],
              'chord-highlight': isKeyInChord(key.key, hoveredChord)
            }"
          >
            <span class="key-cap-label">{{ key.key.toUpperCase() }}</span>
            <span class="key-cap-note">{{ key.note }}</span>
          </div>
        </div>
        <div class="keyboard-row">
          <div class="keyboard-label">空弦音</div>
          <div
            v-for="(str, idx) in guitarStrings"
            :key="'open-' + idx"
            class="key-cap key-cap-open"
            :class="{
              active: pressedKeys[str.keyboardKey],
              'chord-highlight': isKeyInChord(str.keyboardKey, hoveredChord)
            }"
          >
            <span class="key-cap-label">{{ str.keyboardKey }}</span>
            <span class="key-cap-note">{{ str.noteName }}</span>
          </div>
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
          <span class="header-hint" v-if="hoveredChord">（绿色高亮 = {{ hoveredChord.name }} 和弦按法）</span>
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
          <div class="string-labels">
            <div
              v-for="(str, idx) in guitarStrings"
              :key="'label-' + idx"
              class="string-label-item"
              :class="{ 'chord-string-active': isStringInChord(idx, hoveredChord) }"
            >
              <div class="tuning-peg"></div>
              <div class="string-label">
                <span class="string-note">{{ str.noteName }}</span>
                <el-tag size="small" class="string-key-tag" type="warning">
                  {{ str.keyboardKey }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="guitar-neck">
          <div class="fret-numbers">
            <span class="fret-number fret-number-zero">空弦</span>
            <span v-for="fret in fretCount" :key="fret" class="fret-number">
              {{ fret }}品
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
                :class="{
                  active: activeStrings[stringIdx],
                  vibrating: vibratingStrings[stringIdx],
                  'chord-active': isStringInChord(stringIdx, hoveredChord)
                }"
                :style="{ top: `${(stringIdx + 0.5) * (100 / 6)}%` }"
              ></div>

              <div
                v-for="fret in fretCount + 1"
                :key="fret"
                class="fret-cell"
                :class="{
                  'fret-zero': fret === 1,
                  'string-active': activeFret[stringIdx] === fret - 1,
                  highlight: isHighlighted(stringIdx, fret - 1),
                  'has-key-label': getKeyLabel(stringIdx, fret - 1),
                  'chord-fret': isChordNote(stringIdx, fret - 1, hoveredChord),
                  'chord-open': fret === 1 && isChordOpen(stringIdx, hoveredChord),
                  'chord-mute': fret === 1 && isChordMute(stringIdx, hoveredChord),
                  'practice-pressed': practiceMode && isNotePressedInPractice(stringIdx, fret - 1)
                }"
                @mousedown="playNote(stringIdx, fret - 1)"
                @mouseenter="isMouseDown && playNote(stringIdx, fret - 1)"
              >
                <div v-if="fret === 1" class="open-string-label">
                  <span v-if="isChordMute(stringIdx, hoveredChord)" class="chord-mute-icon">×</span>
                  <span v-else class="open-string-note">{{ string.noteName }}</span>
                  <el-tag size="small" class="fret-key-tag" type="warning" effect="dark">
                    {{ string.keyboardKey }}
                  </el-tag>
                </div>
                <div v-else class="key-label" v-if="getKeyLabel(stringIdx, fret - 1)">
                  <span class="key-label-text">{{ getKeyLabel(stringIdx, fret - 1) }}</span>
                  <span class="key-label-note">{{ getNoteNameAt(stringIdx, fret - 1) }}</span>
                </div>
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
        <div class="chord-section-title">
          常用和弦
          <span class="chord-subtitle">（悬停查看指法，点击和弦名弹奏，点击演示逐音示范）</span>
        </div>
        <div class="chord-buttons">
          <div
            v-for="chord in presetChords"
            :key="chord.name"
            class="chord-button-wrapper"
            :class="{
              'practice-active': practiceChord?.name === chord.name,
              'demo-active': demonstratingChord?.name === chord.name
            }"
            @mouseenter="!practiceMode && !demonstratingChord && (hoveredChord = chord)"
            @mouseleave="!practiceMode && !demonstratingChord && (hoveredChord = null)"
          >
            <div class="chord-btn-main">
              <el-button
                type="primary"
                size="large"
                class="chord-btn"
                @mousedown.stop="playChord(chord)"
              >
                <span class="chord-btn-name">{{ chord.name }}</span>
              </el-button>
              <el-button
                size="small"
                type="warning"
                class="chord-demo-btn"
                :disabled="!!demonstratingChord"
                @click.stop="demoChord(chord)"
              >
                <el-icon><VideoPlay /></el-icon>
                <span>演示</span>
              </el-button>
            </div>
            <div class="chord-btn-keys">
              <div
                v-for="(note, i) in getChordKeyNotes(chord)"
                :key="i"
                class="chord-btn-key-item"
              >
                <span class="chord-btn-key-cap" :class="{ 'no-key': !note.key }">
                  {{ note.key ? note.key.toUpperCase() : '×' }}
                </span>
                <span class="chord-btn-key-note">{{ note.noteName }}</span>
              </div>
            </div>
            <div class="chord-btn-actions">
              <el-button
                size="small"
                :type="practiceChord?.name === chord.name ? 'success' : 'primary'"
                plain
                class="chord-practice-btn"
                @click.stop="practiceChord?.name === chord.name ? stopPractice() : startPractice(chord)"
              >
                <el-icon><MagicStick /></el-icon>
                <span>{{ practiceChord?.name === chord.name ? '练习中' : '练习' }}</span>
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="demonstratingChord" class="chord-demo-status">
          <el-icon class="demo-icon"><VideoPlay /></el-icon>
          <span>正在演示 <strong>{{ demonstratingChord.name }}</strong> 和弦，逐音播放中...</span>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

interface GuitarString {
  baseFreq: number
  noteName: string
  keyboardKey: string
}

interface ChordData {
  name: string
  frets: number[]
  fingers?: number[]
}

interface KeyInfo {
  key: string
  note: string
}

interface ChordKeyNote {
  key: string | null
  noteName: string
  fret: number
  stringIdx: number
}

interface ChordProgression {
  name: string
  chords: string[]
  description: string
}

const volume = ref(70)
const distortionEnabled = ref(false)
const currentNote = ref('')
const isMouseDown = ref(false)
const hoveredChord = ref<ChordData | null>(null)
const activeFret = reactive<number[]>([-1, -1, -1, -1, -1, -1])
const activeStrings = reactive<boolean[]>([false, false, false, false, false, false])
const vibratingStrings = reactive<boolean[]>([false, false, false, false, false, false])
const pressedKeys = reactive<Record<string, boolean>>({})

const practiceMode = ref(false)
const practiceChord = ref<ChordData | null>(null)
const practicePressedNotes = reactive<Set<string>>(new Set())
const demonstratingChord = ref<ChordData | null>(null)
let demoTimeoutIds: number[] = []

const metronomeEnabled = ref(false)
const bpm = ref(90)
const beatsPerMeasure = ref(4)
const currentBeat = ref(0)
let metronomeInterval: number | null = null

const progressionMode = ref(false)
const chordProgressions: ChordProgression[] = [
  { name: '流行经典进行', chords: ['C', 'G', 'Am', 'F'], description: '流行乐最常用 (I-V-vi-IV)' },
  { name: '悲伤进行', chords: ['Am', 'F', 'C', 'G'], description: '抒情伤感风 (vi-IV-I-V)' },
  { name: '民谣进行', chords: ['G', 'C', 'D', 'Em'], description: '经典民谣 (I-IV-V-vi)' },
  { name: '50年代进行', chords: ['C', 'Am', 'F', 'G'], description: '复古怀旧 (I-vi-IV-V)' }
]
const selectedProgression = ref<ChordProgression | null>(null)
const currentProgressionIndex = ref(0)
const beatsPerChord = ref(4)

const fretCount = 12

const guitarStrings: GuitarString[] = [
  { baseFreq: 82.41, noteName: 'E2', keyboardKey: '6' },
  { baseFreq: 110.0, noteName: 'A2', keyboardKey: '5' },
  { baseFreq: 146.83, noteName: 'D3', keyboardKey: '4' },
  { baseFreq: 196.0, noteName: 'G3', keyboardKey: '3' },
  { baseFreq: 246.94, noteName: 'B3', keyboardKey: '2' },
  { baseFreq: 329.63, noteName: 'E4', keyboardKey: '1' }
]

const reversedStrings = computed(() => [...guitarStrings].reverse())

const practiceChordTotalNotes = computed(() => {
  if (!practiceChord.value) return 0
  return practiceChord.value.frets.filter(f => f >= 0).length
})

const practiceChordPressedCount = computed(() => practicePressedNotes.size)

const practiceChordComplete = computed(() => {
  return practiceChordTotalNotes.value > 0 && practiceChordPressedCount.value >= practiceChordTotalNotes.value
})

const currentProgressionChord = computed(() => {
  if (!selectedProgression.value) return null
  const chordName = selectedProgression.value.chords[currentProgressionIndex.value]
  return presetChords.find(c => c.name === chordName) || null
})

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const presetChords: ChordData[] = [
  { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] }
]

const keyboardMap: Record<string, { stringIdx: number; fret: number }> = {}
const keyLabelMap: Record<string, string> = {}

const keysHigh = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
const keysMid = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
const keysLow = ['z', 'x', 'c', 'v', 'b', 'n', 'm']

const keyboardRow1 = computed<KeyInfo[]>(() => {
  return keysHigh.map((key, i) => {
    const fret = i + 1
    const stringIdx = 5
    return { key, note: getNoteNameAt(stringIdx, fret) }
  })
})

const keyboardRow2 = computed<KeyInfo[]>(() => {
  return keysMid.map((key, i) => {
    const fret = i
    const stringIdx = 3
    return { key, note: getNoteNameAt(stringIdx, fret) }
  })
})

const keyboardRow3 = computed<KeyInfo[]>(() => {
  return keysLow.map((key, i) => {
    const fret = i
    const stringIdx = 1
    return { key, note: getNoteNameAt(stringIdx, fret) }
  })
})

function initKeyboardMap() {
  keysHigh.forEach((key, i) => {
    const fret = i + 1
    const stringIdx = 5
    keyboardMap[key] = { stringIdx, fret }
    keyLabelMap[`${stringIdx}-${fret}`] = key.toUpperCase()
  })
  keysMid.forEach((key, i) => {
    const fret = i
    const stringIdx = 3
    keyboardMap[key] = { stringIdx, fret }
    keyLabelMap[`${stringIdx}-${fret}`] = key.toUpperCase()
  })
  keysLow.forEach((key, i) => {
    const fret = i
    const stringIdx = 1
    keyboardMap[key] = { stringIdx, fret }
    keyLabelMap[`${stringIdx}-${fret}`] = key.toUpperCase()
  })
  guitarStrings.forEach((str, idx) => {
    keyboardMap[str.keyboardKey] = { stringIdx: idx, fret: 0 }
  })
}

function getKeyLabel(stringIdx: number, fret: number): string | null {
  return keyLabelMap[`${stringIdx}-${fret}`] || null
}

function getKeyForPosition(stringIdx: number, fret: number): string | null {
  if (fret === 0) {
    return guitarStrings[stringIdx].keyboardKey
  }
  return keyLabelMap[`${stringIdx}-${fret}`]?.toLowerCase() || null
}

function getNoteNameAt(stringIdx: number, fret: number): string {
  const freq = guitarStrings[stringIdx].baseFreq * Math.pow(2, fret / 12)
  const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69
  const noteIndex = Math.round(noteNum) % 12
  const octave = Math.floor(Math.round(noteNum) / 12) - 1
  return noteNames[noteIndex] + octave
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
  currentNote.value = getNoteNameAt(stringIdx, fret)

  for (const [key, mapping] of Object.entries(keyboardMap)) {
    if (mapping.stringIdx === stringIdx && mapping.fret === fret) {
      pressedKeys[key] = true
      setTimeout(() => { pressedKeys[key] = false }, 200)
    }
  }

  if (practiceMode.value && practiceChord.value) {
    const expectedFret = practiceChord.value.frets[stringIdx]
    if (expectedFret === fret) {
      const noteKey = `${stringIdx}-${fret}`
      practicePressedNotes.add(noteKey)
    }
  }

  setTimeout(() => { vibratingStrings[stringIdx] = false }, 200)

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
      setTimeout(() => playNote(stringIdx, fret), stringIdx * 25)
    }
  })
}

function demoChord(chord: ChordData) {
  stopDemo()
  demonstratingChord.value = chord
  hoveredChord.value = chord

  const noteDelay = 500
  let delay = 0

  chord.frets.forEach((fret, stringIdx) => {
    if (fret >= 0) {
      const timeoutId = window.setTimeout(() => {
        playNote(stringIdx, fret)
      }, delay)
      demoTimeoutIds.push(timeoutId)
      delay += noteDelay
    }
  })

  const finishTimeout = window.setTimeout(() => {
    playChord(chord)
  }, delay)
  demoTimeoutIds.push(finishTimeout)

  const clearTimeout = window.setTimeout(() => {
    demonstratingChord.value = null
    if (!practiceMode.value) {
      hoveredChord.value = null
    }
  }, delay + 1500)
  demoTimeoutIds.push(clearTimeout)
}

function stopDemo() {
  demoTimeoutIds.forEach(id => window.clearTimeout(id))
  demoTimeoutIds = []
  if (!practiceMode.value && !progressionMode.value) {
    demonstratingChord.value = null
    hoveredChord.value = null
  }
}

function isFretMarker(fret: number): boolean {
  return [3, 5, 7, 9].includes(fret)
}

function isHighlighted(stringIdx: number, fret: number): boolean {
  return activeFret[stringIdx] === fret
}

function getChordFret(chord: ChordData, stringIdx: number): number {
  return chord.frets[stringIdx]
}

function getChordFinger(chord: ChordData, stringIdx: number): number {
  return chord.fingers?.[stringIdx] || 0
}

function getMinChordFret(chord: ChordData): number {
  const frets = chord.frets.filter(f => f > 0)
  if (frets.length === 0) return 0
  return Math.min(...frets) > 1 ? Math.min(...frets) : 1
}

function isChordFingerHere(chord: ChordData, stringIdx: number, fret: number): boolean {
  return chord.frets[stringIdx] === fret && fret > 0
}

function isChordNote(stringIdx: number, fret: number, chord: ChordData | null): boolean {
  if (!chord) return false
  return chord.frets[stringIdx] === fret && fret > 0
}

function isChordOpen(stringIdx: number, chord: ChordData | null): boolean {
  if (!chord) return false
  return chord.frets[stringIdx] === 0
}

function isChordMute(stringIdx: number, chord: ChordData | null): boolean {
  if (!chord) return false
  return chord.frets[stringIdx] === -1
}

function isStringInChord(stringIdx: number, chord: ChordData | null): boolean {
  if (!chord) return false
  return chord.frets[stringIdx] >= 0
}

function isKeyInChord(key: string, chord: ChordData | null): boolean {
  if (!chord) return false
  const mapping = keyboardMap[key.toLowerCase()]
  if (!mapping) return false
  return chord.frets[mapping.stringIdx] === mapping.fret
}

function getChordKeys(chord: ChordData): string[] {
  const keys: string[] = []
  chord.frets.forEach((fret, stringIdx) => {
    if (fret >= 0) {
      const k = getKeyForPosition(stringIdx, fret)
      if (k) keys.push(k.toUpperCase())
    }
  })
  return keys
}

function getChordKeyNotes(chord: ChordData): ChordKeyNote[] {
  const result: ChordKeyNote[] = []
  for (let stringIdx = 5; stringIdx >= 0; stringIdx--) {
    const fret = chord.frets[stringIdx]
    if (fret >= 0) {
      result.push({
        key: getKeyForPosition(stringIdx, fret),
        noteName: getNoteNameAt(stringIdx, fret),
        fret,
        stringIdx
      })
    }
  }
  return result
}

function startPractice(chord: ChordData) {
  practiceMode.value = true
  practiceChord.value = chord
  hoveredChord.value = chord
  practicePressedNotes.clear()
}

function resetPractice() {
  practicePressedNotes.clear()
}

function stopPractice() {
  practiceMode.value = false
  practiceChord.value = null
  practicePressedNotes.clear()
  if (!progressionMode.value) {
    hoveredChord.value = null
  }
}

function isNotePressedInPractice(stringIdx: number, fret: number): boolean {
  return practicePressedNotes.has(`${stringIdx}-${fret}`)
}

function playMetronomeClick(isAccent: boolean) {
  if (!audioContext) return
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.4, now + 0.005)
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

    if (progressionMode.value && selectedProgression.value) {
      if (currentBeat.value === 0) {
        const beatInChord = (currentBeat.value + (beatsPerMeasure.value - 1)) % (beatsPerChord.value * beatsPerMeasure.value)
        if (beatInChord === 0) {
          currentProgressionIndex.value = (currentProgressionIndex.value + 1) % selectedProgression.value.chords.length
          const chordName = selectedProgression.value.chords[currentProgressionIndex.value]
          const chord = presetChords.find(c => c.name === chordName)
          if (chord) {
            hoveredChord.value = chord
            practiceChord.value = chord
            practicePressedNotes.clear()
          }
        }
      }
    }
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

function startProgression(progression: ChordProgression) {
  selectedProgression.value = progression
  progressionMode.value = true
  currentProgressionIndex.value = 0
  const chordName = progression.chords[0]
  const chord = presetChords.find(c => c.name === chordName)
  if (chord) {
    practiceChord.value = chord
    hoveredChord.value = chord
    practiceMode.value = true
    practicePressedNotes.clear()
  }
  if (!metronomeEnabled.value) {
    startMetronome()
  }
}

function stopProgression() {
  progressionMode.value = false
  selectedProgression.value = null
  currentProgressionIndex.value = 0
  stopPractice()
  stopMetronome()
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
  stopDemo()
  stopMetronome()
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.electric-guitar {
  max-width: 1500px;
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

.chord-tag-hint {
  margin-left: auto;
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

.chord-reference-card {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 1px solid #fbc4c4;
}

.chord-reference-body {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.chord-diagram-wrapper {
  display: flex;
  gap: 8px;
}

.chord-diagram {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chord-diagram-header {
  display: flex;
  gap: 14px;
  padding: 0 4px 6px;
  margin-bottom: 4px;
}

.chord-top-marker {
  width: 20px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
}

.mute-marker {
  color: #f56c6c;
}

.open-marker {
  color: #67c23a;
  font-size: 14px;
}

.chord-diagram-grid {
  border-top: 3px solid #303133;
}

.chord-fret-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 4px;
  border-bottom: 1px solid #c0c4cc;
  height: 30px;
  position: relative;
}

.chord-fret-row::before {
  content: '';
  position: absolute;
  left: 28px;
  right: 4px;
  top: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(
      to right,
      transparent 0,
      transparent calc(34px * 0 + 10px),
      #d0d3d9 calc(34px * 0 + 10px),
      #d0d3d9 calc(34px * 0 + 11px),
      transparent calc(34px * 0 + 11px),
      transparent calc(34px * 1 + 10px),
      #d0d3d9 calc(34px * 1 + 10px),
      #d0d3d9 calc(34px * 1 + 11px),
      transparent calc(34px * 1 + 11px),
      transparent calc(34px * 2 + 10px),
      #d0d3d9 calc(34px * 2 + 10px),
      #d0d3d9 calc(34px * 2 + 11px),
      transparent calc(34px * 2 + 11px),
      transparent calc(34px * 3 + 10px),
      #d0d3d9 calc(34px * 3 + 10px),
      #d0d3d9 calc(34px * 3 + 11px),
      transparent calc(34px * 3 + 11px),
      transparent calc(34px * 4 + 10px),
      #d0d3d9 calc(34px * 4 + 10px),
      #d0d3d9 calc(34px * 4 + 11px),
      transparent calc(34px * 4 + 11px)
    );
  z-index: 0;
}

.chord-fret-num {
  width: 20px;
  font-size: 11px;
  color: #909399;
  font-weight: 600;
  z-index: 1;
  flex-shrink: 0;
}

.chord-fret-cell {
  width: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.chord-finger-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f56c6c, #e74c3c);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.5);
}

.chord-diagram-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 28px 0 6px;
}

.chord-string-label {
  height: 30px;
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #909399;
  font-weight: 600;
}

.chord-key-info {
  flex: 1;
  min-width: 280px;
}

.chord-key-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.chord-key-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chord-key-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.chord-key-cap {
  min-width: 34px;
  height: 30px;
  background: linear-gradient(180deg, #ffffff, #e8eaf0);
  border: 1px solid #c0c4cc;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #303133;
  box-shadow: 0 2px 0 #a8abb2;
}

.chord-key-cap.no-key-cap {
  background: #f5f7fa;
  color: #c0c4cc;
  border-color: #e4e7ed;
  box-shadow: none;
}

.chord-key-note {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  min-width: 50px;
}

.chord-key-fret {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.chord-play-hint {
  margin-top: 14px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #e1f3d8 0%, #d4edc2 100%);
  border-radius: 6px;
  color: #529b2e;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.keyboard-reference-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}

.keyboard-reference {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.keyboard-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.keyboard-label {
  width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  text-align: right;
  padding-right: 8px;
  flex-shrink: 0;
  line-height: 1.3;
}

.keyboard-label small {
  font-weight: 400;
  color: #909399;
}

.key-cap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 50px;
  background: linear-gradient(180deg, #ffffff 0%, #e8eaf0 100%);
  border: 1px solid #c0c4cc;
  border-radius: 6px;
  box-shadow: 0 2px 0 #a8abb2, 0 3px 6px rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  transition: all 0.08s ease;
  user-select: none;
}

.key-cap.active {
  background: linear-gradient(180deg, #ffd700 0%, #ffb300 100%);
  border-color: #e6a23c;
  box-shadow: 0 1px 0 #b88230, 0 0 15px rgba(255, 183, 0, 0.6);
  transform: translateY(2px);
}

.key-cap.chord-highlight {
  background: linear-gradient(180deg, #e1f3d8 0%, #b3e19d 100%);
  border-color: #67c23a;
  box-shadow: 0 2px 0 #529b2e, 0 0 10px rgba(103, 194, 58, 0.4);
}

.key-cap.chord-highlight.active {
  background: linear-gradient(180deg, #ffd700 0%, #ffb300 100%);
  border-color: #e6a23c;
  box-shadow: 0 1px 0 #b88230, 0 0 20px rgba(255, 183, 0, 0.7);
}

.key-cap-label {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.key-cap.active .key-cap-label {
  color: #604000;
}

.key-cap.chord-highlight .key-cap-label {
  color: #386e1e;
}

.key-cap-note {
  font-size: 10px;
  color: #909399;
  margin-top: 3px;
}

.key-cap.chord-highlight .key-cap-note {
  color: #529b2e;
}

.key-cap-open {
  min-width: 50px;
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
  width: 160px;
  background: linear-gradient(180deg, #4a3520 0%, #2d1f14 100%);
  border-right: 3px solid #8b6914;
  padding: 15px 10px;
  flex-shrink: 0;
}

.string-labels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.string-label-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.string-label-item.chord-string-active {
  background: rgba(103, 194, 58, 0.2);
}

.tuning-peg {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d4af37, #b8860b);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 2px solid #8b6914;
  flex-shrink: 0;
}

.string-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.string-note {
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.string-key-tag {
  align-self: flex-start;
}

.guitar-neck {
  flex: 1;
  background: linear-gradient(180deg, #5c3a1e 0%, #3d2514 100%);
  position: relative;
  min-height: 500px;
}

.fret-numbers {
  display: flex;
  height: 36px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.fret-number {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.fret-number-zero {
  flex: 0.35 !important;
  min-width: 80px;
  color: #ffd700 !important;
  font-size: 12px !important;
}

.frets-container {
  position: relative;
  padding: 10px 0;
  height: calc(100% - 36px);
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
  transition: all 0.15s;
  pointer-events: none;
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

.string-line.chord-active {
  background: linear-gradient(90deg, #8bc34a, #aed581, #8bc34a);
  box-shadow: 0 0 10px rgba(139, 195, 74, 0.6);
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
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fret-cell:hover {
  background: rgba(255, 255, 255, 0.08);
}

.fret-cell.fret-zero {
  flex: 0.35;
  min-width: 80px;
  background: linear-gradient(90deg, #2a1810 0%, rgba(42, 24, 16, 0.6) 100%);
  border-right: 4px solid #f0f0f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.fret-cell.has-key-label {
  background: rgba(114, 46, 209, 0.08);
}

.fret-cell.has-key-label:hover {
  background: rgba(114, 46, 209, 0.18);
}

.fret-cell.chord-fret {
  background: rgba(103, 194, 58, 0.25) !important;
  box-shadow: inset 0 0 12px rgba(103, 194, 58, 0.4);
}

.fret-cell.chord-open {
  background: rgba(103, 194, 58, 0.15) !important;
}

.fret-cell.chord-mute {
  background: rgba(245, 108, 108, 0.15) !important;
}

.fret-cell.string-active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd700, #ff8c00);
  box-shadow: 0 4px 15px rgba(255, 140, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  z-index: 3;
  animation: pressDown 0.2s ease-out;
}

.fret-cell.highlight {
  background: rgba(255, 215, 0, 0.2);
}

@keyframes pressDown {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.open-string-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 4;
  position: relative;
}

.chord-mute-icon {
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
}

.open-string-note {
  font-size: 12px;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.fret-key-tag {
  font-weight: 700 !important;
}

.key-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 4;
  position: relative;
  padding: 3px 6px;
  background: rgba(114, 46, 209, 0.85);
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.key-label-text {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.key-label-note {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
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
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #e0e0e0 100%);
  opacity: 0.5;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.guitar-body {
  width: 180px;
  background: linear-gradient(180deg, #4a2c0a 0%, #2d1808 50%, #1a0f04 100%);
  border-radius: 0 50px 50px 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  box-shadow: inset 5px 0 15px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.pickup {
  width: 110px;
  height: 36px;
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
  width: 130px;
  height: 46px;
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
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.chord-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.chord-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.chord-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
  min-width: 140px;
}

.chord-button-wrapper:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.chord-button-wrapper.practice-active {
  background: rgba(103, 194, 58, 0.15);
  border-color: rgba(103, 194, 58, 0.5);
}

.chord-button-wrapper.demo-active {
  background: rgba(230, 162, 60, 0.2);
  border-color: rgba(230, 162, 60, 0.6);
  animation: demoPulse 1s ease-in-out infinite;
}

@keyframes demoPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(230, 162, 60, 0); }
}

.chord-btn-main {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.chord-btn {
  min-width: 70px;
  font-weight: 700 !important;
}

.chord-btn-name {
  font-size: 18px;
}

.chord-demo-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600 !important;
}

.chord-btn-keys {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.chord-btn-key-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chord-btn-key-cap {
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  background: linear-gradient(180deg, #ffffff 0%, #e8eaf0 100%);
  border: 1px solid #c0c4cc;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 0 #a8abb2;
  flex-shrink: 0;
}

.chord-btn-key-cap.no-key {
  background: linear-gradient(180deg, #f56c6c 0%, #c45656 100%);
  border-color: #a84848;
  color: #fff;
  box-shadow: 0 2px 0 #8b3e3e;
}

.chord-btn-key-note {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.chord-btn-actions {
  display: flex;
  justify-content: center;
}

.chord-practice-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chord-demo-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border: 1px solid #f5dab1;
  border-radius: 8px;
  color: #b88230;
  font-size: 14px;
  font-weight: 500;
}

.chord-demo-status .demo-icon {
  font-size: 20px;
  color: #e6a23c;
}

.chord-demo-status strong {
  color: #8b5a00;
  font-weight: 700;
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
