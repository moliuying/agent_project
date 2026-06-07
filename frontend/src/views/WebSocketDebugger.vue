<template>
  <div class="ws-debugger">
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>WebSocket 调试工具</span>
          <el-tag size="small" type="primary">实时连接 · 消息收发 · 双向调试</el-tag>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="feature-item">
            <el-icon :size="18" color="#67c23a"><CircleCheck /></el-icon>
            <div>
              <div class="feature-title">方向区分</div>
              <div class="feature-desc">发送消息右对齐、接收消息左对齐，气泡布局一目了然</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <el-icon :size="18" color="#409eff"><Grid /></el-icon>
            <div>
              <div class="feature-title">类型标识</div>
              <div class="feature-desc">自动识别文本/JSON/二进制消息，标签 + 颜色双重区分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <el-icon :size="18" color="#e6a23c"><Search /></el-icon>
            <div>
              <div class="feature-title">搜索过滤</div>
              <div class="feature-desc">按方向、类型、关键词快速筛选定位目标消息</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="connection-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Link />
          </el-icon>
          <span>连接配置</span>
          <el-tag
            size="small"
            :type="statusTagType"
            effect="dark"
            class="status-tag"
          >
            <span class="status-dot" :class="statusDotClass"></span>
            {{ statusText }}
          </el-tag>
        </div>
      </template>

      <el-form :inline="true" class="connection-form">
        <el-form-item label="服务地址" class="url-form-item">
          <el-input
            v-model="wsUrl"
            placeholder="ws://localhost:8080 或 wss://example.com"
            :disabled="isConnected || isConnecting"
            clearable
            class="url-input"
          >
            <template #prefix>
              <el-icon><Connection /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="!isConnected && !isConnecting"
            type="primary"
            :disabled="!wsUrl.trim()"
            @click="connect"
          >
            <el-icon><Connection /></el-icon>
            连接
          </el-button>
          <el-button
            v-else-if="isConnecting"
            type="warning"
            loading
            disabled
          >
            连接中...
          </el-button>
          <el-button
            v-else
            type="danger"
            @click="disconnect"
          >
            <el-icon><Close /></el-icon>
            断开连接
          </el-button>
          <el-button @click="clearAll" :disabled="isConnected || isConnecting">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="preset-urls" v-if="presetUrls.length > 0">
        <span class="preset-label">快速连接：</span>
        <el-tag
          v-for="preset in presetUrls"
          :key="preset.url"
          class="preset-tag"
          effect="plain"
          :type="isConnected || isConnecting ? 'info' : 'primary'"
          :disabled="isConnected || isConnecting"
          @click="selectPreset(preset.url)"
        >
          {{ preset.name }}
        </el-tag>
      </div>
    </el-card>

    <el-card class="debug-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <ChatDotRound />
          </el-icon>
          <span>消息调试</span>
          <div class="header-stats">
            <el-tag size="small" type="primary" effect="plain">
              <el-icon :size="11"><Top /></el-icon>
              发送 {{ stats.send }}
            </el-tag>
            <el-tag size="small" type="success" effect="plain">
              <el-icon :size="11"><Bottom /></el-icon>
              接收 {{ stats.receive }}
            </el-tag>
            <el-tag size="small" type="info" effect="plain">共 {{ messages.length }} 条</el-tag>
          </div>
        </div>
      </template>

      <el-row :gutter="16" class="debug-content">
        <el-col :span="16" class="messages-col">
          <div class="messages-toolbar">
            <div class="filter-group">
              <el-radio-group v-model="filterDirection" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="send">发送</el-radio-button>
                <el-radio-button label="receive">接收</el-radio-button>
                <el-radio-button label="system">系统</el-radio-button>
              </el-radio-group>
              <el-radio-group v-model="filterContentType" size="small">
                <el-radio-button label="all">全部类型</el-radio-button>
                <el-radio-button label="text">文本</el-radio-button>
                <el-radio-button label="json">JSON</el-radio-button>
                <el-radio-button label="binary">二进制</el-radio-button>
              </el-radio-group>
            </div>
            <div class="search-group">
              <el-input
                v-model="searchKeyword"
                size="small"
                placeholder="搜索消息内容..."
                clearable
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <div class="messages-subheader">
            <div class="messages-title">
              <el-icon><Tickets /></el-icon>
              <span>消息记录</span>
              <el-tag v-if="filteredMessages.length !== messages.length" size="small" type="warning" effect="light">
                筛选后 {{ filteredMessages.length }} 条
              </el-tag>
            </div>
            <div class="messages-actions">
              <el-switch
                v-model="autoScroll"
                active-text="自动滚动"
                inactive-text="手动"
                size="small"
              />
              <el-button
                size="small"
                text
                type="danger"
                :disabled="messages.length === 0"
                @click="clearMessages"
              >
                <el-icon><Delete /></el-icon>
                清空记录
              </el-button>
              <el-button
                size="small"
                text
                type="primary"
                :disabled="messages.length === 0"
                @click="exportMessages"
              >
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>

          <div
            ref="messagesContainer"
            class="messages-container"
            :class="{ 'is-empty': filteredMessages.length === 0 }"
          >
            <div v-if="filteredMessages.length === 0" class="messages-empty">
              <el-icon :size="48" color="#c0c4cc"><ChatLineSquare /></el-icon>
              <p>{{ messages.length === 0 ? '暂无消息记录' : '没有匹配的消息' }}</p>
              <p class="empty-hint">
                {{ messages.length === 0 ? '连接成功后，发送和接收的消息将显示在这里' : '请调整筛选条件或搜索关键词' }}
              </p>
            </div>

            <div
              v-for="msg in filteredMessages"
              :key="msg.id"
              class="message-item"
              :class="[
                `msg-${msg.type}`,
                `dir-${msg.direction}`
              ]"
            >
              <div class="message-bubble" :class="`bubble-${msg.type}`">
                <div class="bubble-header">
                  <div class="bubble-meta">
                    <span class="msg-seq">#{{ msg.seq }}</span>
                    <el-tag
                      size="small"
                      :type="getDirectionTagType(msg.direction)"
                      effect="dark"
                      class="direction-tag"
                    >
                      <el-icon :size="10">
                        <component :is="getDirectionIcon(msg.direction)" />
                      </el-icon>
                      {{ getDirectionLabel(msg.direction) }}
                    </el-tag>
                    <el-tag
                      v-if="msg.contentType"
                      size="small"
                      :type="getContentTypeTagType(msg.contentType)"
                      effect="plain"
                      class="content-type-tag"
                    >
                      <el-icon :size="10">
                        <component :is="getContentTypeIcon(msg.contentType)" />
                      </el-icon>
                      {{ getContentTypeLabel(msg.contentType) }}
                    </el-tag>
                    <el-tag
                      v-if="msg.size !== undefined"
                      size="small"
                      type="info"
                      effect="light"
                      class="size-tag"
                    >
                      <el-icon :size="10"><Files /></el-icon>
                      {{ formatBytes(msg.size) }}
                    </el-tag>
                  </div>
                  <div class="bubble-actions">
                    <span class="message-time">{{ msg.time }}</span>
                    <el-dropdown
                      v-if="msg.type !== 'system' && msg.type !== 'error'"
                      trigger="click"
                      @command="(cmd: string) => handleMsgAction(cmd, msg)"
                    >
                      <el-button size="small" text type="primary" class="msg-more-btn">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="copy">
                            <el-icon><CopyDocument /></el-icon>复制内容
                          </el-dropdown-item>
                          <el-dropdown-item command="copyRaw" v-if="msg.contentType === 'binary'">
                            <el-icon><Document /></el-icon>复制原始数据
                          </el-dropdown-item>
                          <el-dropdown-item command="download" v-if="msg.contentType === 'binary'">
                            <el-icon><Download /></el-icon>下载为文件
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <div class="bubble-content">
                  <span v-if="msg.type === 'system'" class="system-text">
                    <el-icon :size="12"><InfoFilled /></el-icon>
                    {{ msg.content }}
                  </span>
                  <span v-else-if="msg.type === 'error'" class="error-text">
                    <el-icon :size="12"><WarningFilled /></el-icon>
                    {{ msg.content }}
                  </span>
                  <template v-else-if="msg.contentType === 'binary'">
                    <div class="binary-preview">
                      <div class="binary-info">
                        <el-icon :size="14" color="#e6a23c"><Files /></el-icon>
                        <span>二进制数据，共 {{ formatBytes(msg.size || 0) }}</span>
                      </div>
                      <div class="binary-hex">
                        <pre><code>{{ msg.binaryPreview || '(无法预览)' }}</code></pre>
                      </div>
                      <div class="binary-actions">
                        <el-button size="small" @click="downloadBinary(msg)">
                          <el-icon><Download /></el-icon>下载文件
                        </el-button>
                        <el-button size="small" @click="copyBinary(msg)">
                          <el-icon><CopyDocument /></el-icon>复制十六进制
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <pre v-else class="text-content" :class="{ 'json-content': msg.contentType === 'json' }">
<code v-html="highlightJson(msg.content)"></code></pre>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="8" class="send-col">
          <div class="send-header">
            <div class="send-title">
              <el-icon><Promotion /></el-icon>
              <span>发送消息</span>
            </div>
            <el-radio-group v-model="sendFormat" size="small">
              <el-radio-button label="text">文本</el-radio-button>
              <el-radio-button label="json">JSON</el-radio-button>
              <el-radio-button label="hex">十六进制</el-radio-button>
            </el-radio-group>
          </div>

          <div class="send-format-tip" :class="`tip-${sendFormat}`">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ sendFormatTip }}</span>
          </div>

          <el-input
            v-model="messageToSend"
            type="textarea"
            :rows="sendFormat === 'hex' ? 8 : 10"
            :placeholder="sendPlaceholder"
            resize="vertical"
            class="send-textarea"
            :disabled="!isConnected"
            @keydown.ctrl.enter="sendMessage"
          />

          <div class="send-info" v-if="sendFormat === 'hex' && messageToSend.trim()">
            <el-tag size="small" :type="hexValid ? 'success' : 'danger'" effect="light">
              {{ hexValid ? `有效十六进制 · ${hexByteCount} 字节` : '十六进制格式无效' }}
            </el-tag>
          </div>
          <div class="send-info" v-else-if="sendFormat === 'json' && messageToSend.trim()">
            <el-tag size="small" :type="jsonValid ? 'success' : 'danger'" effect="light">
              {{ jsonValid ? 'JSON 格式正确' : 'JSON 格式错误' }}
            </el-tag>
          </div>
          <div class="send-info" v-else-if="messageToSend.trim()">
            <el-tag size="small" type="info" effect="light">
              {{ new Blob([messageToSend]).size }} 字节
            </el-tag>
          </div>

          <div class="send-actions">
            <div class="send-tips">
              <el-icon :size="12" color="#909399"><InfoFilled /></el-icon>
              <span>按 Ctrl + Enter 快速发送</span>
            </div>
            <el-button-group>
              <el-button
                @click="loadTemplate"
                :disabled="!isConnected"
              >
                <el-icon><Document /></el-icon>
                {{ sendFormat === 'json' ? 'JSON 示例' : sendFormat === 'hex' ? '十六进制示例' : '文本示例' }}
              </el-button>
              <el-button
                @click="clearSendInput"
                :disabled="!messageToSend"
              >
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
              <el-button
                type="primary"
                :disabled="!canSend"
                @click="sendMessage"
              >
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
            </el-button-group>
          </div>

          <div class="quick-messages" v-if="quickMessages.length > 0">
            <div class="quick-title">
              <el-icon :size="14"><Lightning /></el-icon>
              <span>快捷消息</span>
            </div>
            <div class="quick-list">
              <el-tag
                v-for="(qm, idx) in quickMessages"
                :key="idx"
                class="quick-tag"
                effect="plain"
                :type="isConnected ? 'primary' : 'info'"
                :disabled="!isConnected"
                @click="loadQuickMessage(qm)"
              >
                {{ qm.label }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="tips-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#e6a23c">
            <WarningFilled />
          </el-icon>
          <span>使用说明</span>
        </div>
      </template>
      <el-row :gutter="16" class="tips-grid">
        <el-col :span="6">
          <div class="tip-item">
            <div class="tip-icon tip-icon-blue">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">建立连接</div>
              <p>输入 ws:// 或 wss:// 地址建立 WebSocket 长连接。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="tip-item">
            <div class="tip-icon tip-icon-green">
              <el-icon><Promotion /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">发送消息</div>
              <p>支持文本、JSON、十六进制三种格式发送，Ctrl+Enter 快捷发送。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="tip-item">
            <div class="tip-icon tip-icon-purple">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">查看响应</div>
              <p>左侧气泡区分方向，发送右对齐、接收左对齐，自动识别消息类型。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="tip-item">
            <div class="tip-icon tip-icon-orange">
              <el-icon><Search /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">筛选搜索</div>
              <p>按方向、消息类型快速筛选，或输入关键词精准搜索定位。</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import {
  DataLine,
  CircleCheck,
  Grid,
  Search,
  Link,
  Connection,
  Close,
  RefreshLeft,
  ChatDotRound,
  Tickets,
  Delete,
  Download,
  ChatLineSquare,
  CopyDocument,
  Promotion,
  InfoFilled,
  Document,
  Lightning,
  WarningFilled,
  Warning,
  Bell,
  MoreFilled,
  Files,
  Top,
  Bottom,
  Position
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type MessageType = 'send' | 'message' | 'system' | 'error'
type MessageDirection = 'send' | 'receive' | 'system'
type ContentType = 'text' | 'json' | 'binary'
type SendFormat = 'text' | 'json' | 'hex'
type FilterDirection = 'all' | 'send' | 'receive' | 'system'
type FilterContentType = 'all' | 'text' | 'json' | 'binary'

interface MessageRecord {
  id: string
  seq: number
  type: MessageType
  direction: MessageDirection
  contentType?: ContentType
  content: string
  rawData?: ArrayBuffer | Blob | Uint8Array
  binaryPreview?: string
  size?: number
  time: string
}

interface PresetUrl {
  name: string
  url: string
}

interface QuickMessage {
  label: string
  content: string
  format: SendFormat
}

const wsUrl = ref('')
const messageToSend = ref('')
const messages = ref<MessageRecord[]>([])
const isConnected = ref(false)
const isConnecting = ref(false)
const autoScroll = ref(true)
const sendFormat = ref<SendFormat>('text')
const filterDirection = ref<FilterDirection>('all')
const filterContentType = ref<FilterContentType>('all')
const searchKeyword = ref('')

const messagesContainer = ref<HTMLElement>()
let seqCounter = 0

let ws: WebSocket | null = null

const presetUrls: PresetUrl[] = [
  { name: 'Postman Echo', url: 'wss://ws.postman-echo.com/raw' },
  { name: 'WebSocket 测试', url: 'wss://echo.websocket.org' }
]

const quickMessages: QuickMessage[] = [
  { label: 'Ping', content: 'ping', format: 'text' },
  { label: '问候 JSON', content: '{"type":"hello","message":"你好，服务端"}', format: 'json' },
  { label: '订阅', content: '{"action":"subscribe","channel":"test"}', format: 'json' },
  { label: '心跳', content: '{"type":"heartbeat","timestamp":' + Date.now() + '}', format: 'json' },
  { label: '二进制示例', content: '48656C6C6F20576F726C64', format: 'hex' }
]

const stats = computed(() => ({
  send: messages.value.filter(m => m.direction === 'send').length,
  receive: messages.value.filter(m => m.direction === 'receive').length
}))

const sendFormatTip = computed(() => {
  const map: Record<SendFormat, string> = {
    text: '普通文本格式，支持任意字符串内容',
    json: 'JSON 格式，发送前会自动校验格式正确性',
    hex: '十六进制格式，例如 48656C6C6F（不含 0x 前缀和空格）'
  }
  return map[sendFormat.value]
})

const sendPlaceholder = computed(() => {
  const map: Record<SendFormat, string> = {
    text: '请输入要发送的文本内容...\n\n按 Ctrl + Enter 快速发送',
    json: '请输入 JSON 内容，例如：\n{\n  "type": "message",\n  "data": "hello"\n}\n\n发送前会自动校验格式',
    hex: '请输入十六进制数据，例如：\n48656C6C6F20576F726C64\n\n将作为二进制数据发送'
  }
  return map[sendFormat.value]
})

const hexValid = computed(() => {
  if (!messageToSend.value.trim()) return true
  const clean = messageToSend.value.trim().replace(/\s/g, '')
  return /^[0-9A-Fa-f]*$/.test(clean) && clean.length % 2 === 0
})

const hexByteCount = computed(() => {
  const clean = messageToSend.value.trim().replace(/\s/g, '')
  return clean.length / 2
})

const jsonValid = computed(() => {
  if (!messageToSend.value.trim()) return true
  try {
    JSON.parse(messageToSend.value)
    return true
  } catch {
    return false
  }
})

const canSend = computed(() => {
  if (!isConnected.value || !messageToSend.value.trim()) return false
  if (sendFormat.value === 'hex' && !hexValid.value) return false
  if (sendFormat.value === 'json' && !jsonValid.value) return false
  return true
})

const filteredMessages = computed(() => {
  return messages.value.filter(msg => {
    if (filterDirection.value !== 'all') {
      if (filterDirection.value === 'send' && msg.direction !== 'send') return false
      if (filterDirection.value === 'receive' && msg.direction !== 'receive') return false
      if (filterDirection.value === 'system' && msg.type !== 'system' && msg.type !== 'error') return false
    }
    if (filterContentType.value !== 'all' && msg.contentType !== filterContentType.value) {
      return false
    }
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase()
      if (!msg.content.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

const statusText = computed(() => {
  if (isConnected.value) return '已连接'
  if (isConnecting.value) return '连接中'
  return '未连接'
})

const statusTagType = computed<'success' | 'warning' | 'info' | 'danger'>(() => {
  if (isConnected.value) return 'success'
  if (isConnecting.value) return 'warning'
  return 'info'
})

const statusDotClass = computed(() => {
  if (isConnected.value) return 'status-success'
  if (isConnecting.value) return 'status-warning'
  return 'status-idle'
})

const formatTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date.getMilliseconds().toString().padStart(3, '0')}`
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const detectContentType = (content: string): ContentType => {
  try {
    JSON.parse(content)
    return 'json'
  } catch {
    return 'text'
  }
}

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.trim().replace(/\s/g, '')
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substr(i, 2), 16)
  }
  return bytes
}

const bytesToHex = (bytes: Uint8Array | ArrayBuffer, maxLen = 200): string => {
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes
  const len = Math.min(arr.length, maxLen)
  let hex = ''
  for (let i = 0; i < len; i++) {
    hex += arr[i].toString(16).padStart(2, '0').toUpperCase()
    if ((i + 1) % 16 === 0) hex += '\n'
    else if ((i + 1) % 2 === 0) hex += ' '
  }
  if (arr.length > maxLen) {
    hex += `\n... (共 ${arr.length} 字节，仅显示前 ${maxLen})`
  }
  return hex
}

const arrayBufferToUtf8 = (buf: ArrayBuffer): string | null => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    return null
  }
}

const getBlobSize = async (blob: Blob): Promise<number> => {
  return blob.size
}

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}

const genId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const addMessage = async (
  type: MessageType,
  content: string,
  options?: {
    contentType?: ContentType
    rawData?: ArrayBuffer | Blob | Uint8Array
    size?: number
    binaryPreview?: string
  }
) => {
  seqCounter++
  let direction: MessageDirection = 'system'
  if (type === 'send') direction = 'send'
  else if (type === 'message') direction = 'receive'

  let finalContentType = options?.contentType
  let finalSize = options?.size
  let finalBinaryPreview = options?.binaryPreview
  let finalRawData = options?.rawData

  if (type === 'send' || type === 'message') {
    if (!finalContentType) {
      finalContentType = detectContentType(content)
    }
    if (finalSize === undefined) {
      finalSize = new Blob([content]).size
    }
  }

  const record: MessageRecord = {
    id: genId(),
    seq: seqCounter,
    type,
    direction,
    contentType: finalContentType,
    content,
    rawData: finalRawData,
    binaryPreview: finalBinaryPreview,
    size: finalSize,
    time: formatTime(new Date())
  }

  messages.value.push(record)

  if (autoScroll.value) {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
}

const handleIncomingMessage = async (event: MessageEvent) => {
  const data = event.data

  if (data instanceof Blob) {
    const buf = await blobToArrayBuffer(data)
    const size = data.size
    const text = arrayBufferToUtf8(buf)

    if (text !== null) {
      const formatted = tryFormatJson(text)
      addMessage('message', formatted, {
        contentType: detectContentType(text),
        size
      })
    } else {
      addMessage('message', '[二进制数据]', {
        contentType: 'binary',
        rawData: buf,
        size,
        binaryPreview: bytesToHex(buf)
      })
    }
  } else if (data instanceof ArrayBuffer) {
    const size = data.byteLength
    const text = arrayBufferToUtf8(data)

    if (text !== null) {
      const formatted = tryFormatJson(text)
      addMessage('message', formatted, {
        contentType: detectContentType(text),
        size
      })
    } else {
      addMessage('message', '[二进制数据]', {
        contentType: 'binary',
        rawData: data,
        size,
        binaryPreview: bytesToHex(data)
      })
    }
  } else if (typeof data === 'string') {
    const formatted = tryFormatJson(data)
    addMessage('message', formatted, {
      contentType: detectContentType(data),
      size: new Blob([data]).size
    })
  } else {
    addMessage('message', String(data))
  }
}

const getDirectionTagType = (dir: MessageDirection): 'primary' | 'success' | 'info' => {
  const map: Record<MessageDirection, 'primary' | 'success' | 'info'> = {
    send: 'primary',
    receive: 'success',
    system: 'info'
  }
  return map[dir]
}

const getDirectionIcon = (dir: MessageDirection) => {
  const map: Record<MessageDirection, any> = {
    send: Top,
    receive: Bottom,
    system: InfoFilled
  }
  return map[dir]
}

const getDirectionLabel = (dir: MessageDirection): string => {
  const map: Record<MessageDirection, string> = {
    send: '发送',
    receive: '接收',
    system: '系统'
  }
  return map[dir]
}

const getContentTypeTagType = (t: ContentType): 'success' | 'warning' | 'info' => {
  const map: Record<ContentType, 'success' | 'warning' | 'info'> = {
    text: 'info',
    json: 'success',
    binary: 'warning'
  }
  return map[t]
}

const getContentTypeIcon = (t: ContentType) => {
  const map: Record<ContentType, any> = {
    text: Document,
    json: Grid,
    binary: Files
  }
  return map[t]
}

const getContentTypeLabel = (t: ContentType): string => {
  const map: Record<ContentType, string> = {
    text: '文本',
    json: 'JSON',
    binary: '二进制'
  }
  return map[t]
}

const tryFormatJson = (text: string): string => {
  try {
    const parsed = JSON.parse(text)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return text
  }
}

const highlightJson = (text: string): string => {
  try {
    JSON.parse(text)
    return text
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'json-number'
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string'
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean'
        } else if (/null/.test(match)) {
          cls = 'json-null'
        }
        return `<span class="${cls}">${match}</span>`
      })
  } catch {
    return escapeHtml(text)
  }
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const connect = () => {
  const url = wsUrl.value.trim()
  if (!url) {
    ElMessage.warning('请输入 WebSocket 服务地址')
    return
  }
  if (!/^wss?:\/\//i.test(url)) {
    ElMessage.warning('地址必须以 ws:// 或 wss:// 开头')
    return
  }

  isConnecting.value = true
  addMessage('system', `正在连接到 ${url} ...`)

  try {
    ws = new WebSocket(url)

    ws.onopen = () => {
      isConnecting.value = false
      isConnected.value = true
      addMessage('system', `连接已建立：${url}`)
      ElMessage.success('WebSocket 连接成功')
    }

    ws.onmessage = (event) => {
      handleIncomingMessage(event)
    }

    ws.onerror = (event) => {
      isConnecting.value = false
      isConnected.value = false
      addMessage('error', `连接错误：${event.type || '未知错误'}`)
      ElMessage.error('WebSocket 连接发生错误')
    }

    ws.onclose = (event) => {
      isConnecting.value = false
      isConnected.value = false
      const reason = event.reason || '连接已关闭'
      addMessage('system', `连接已关闭 (code: ${event.code}) - ${reason}`)
      if (ws) {
        ws = null
      }
    }
  } catch (error: any) {
    isConnecting.value = false
    addMessage('error', `创建连接失败：${error.message || error}`)
    ElMessage.error('创建 WebSocket 连接失败')
  }
}

const disconnect = () => {
  if (ws) {
    ws.close(1000, '客户端主动断开')
    ws = null
  }
  isConnected.value = false
  isConnecting.value = false
  ElMessage.info('已断开 WebSocket 连接')
}

const sendMessage = () => {
  if (!canSend.value || !ws) {
    if (!isConnected.value) {
      ElMessage.warning('请先建立 WebSocket 连接')
    }
    return
  }

  const content = messageToSend.value

  try {
    if (sendFormat.value === 'hex') {
      const bytes = hexToBytes(content)
      ws.send(bytes)
      addMessage('send', '[二进制数据]', {
        contentType: 'binary',
        rawData: bytes,
        size: bytes.length,
        binaryPreview: bytesToHex(bytes)
      })
    } else if (sendFormat.value === 'json') {
      const formatted = JSON.stringify(JSON.parse(content), null, 2)
      ws.send(content)
      addMessage('send', formatted, {
        contentType: 'json',
        size: new Blob([content]).size
      })
    } else {
      ws.send(content)
      const displayContent = tryFormatJson(content)
      addMessage('send', displayContent, {
        contentType: detectContentType(content),
        size: new Blob([content]).size
      })
    }
    messageToSend.value = ''
  } catch (error: any) {
    addMessage('error', `发送失败：${error.message || error}`)
    ElMessage.error('消息发送失败')
  }
}

const clearMessages = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有消息记录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    messages.value = []
    seqCounter = 0
    ElMessage.success('已清空消息记录')
  } catch {
    // cancelled
  }
}

const clearSendInput = () => {
  messageToSend.value = ''
}

const clearAll = () => {
  if (isConnected.value || isConnecting.value) {
    disconnect()
  }
  wsUrl.value = ''
  messageToSend.value = ''
  messages.value = []
  seqCounter = 0
  ElMessage.success('已重置')
}

const copyMessage = async (msg: MessageRecord) => {
  let text = msg.content
  if (msg.contentType === 'binary' && msg.rawData) {
    text = msg.binaryPreview || ''
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyBinary = async (msg: MessageRecord) => {
  if (!msg.binaryPreview) return
  try {
    await navigator.clipboard.writeText(msg.binaryPreview)
    ElMessage.success('已复制十六进制数据')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadBinary = (msg: MessageRecord) => {
  if (!msg.rawData) return
  let blob: Blob
  if (msg.rawData instanceof Blob) {
    blob = msg.rawData
  } else if (msg.rawData instanceof ArrayBuffer) {
    blob = new Blob([msg.rawData])
  } else {
    blob = new Blob([msg.rawData])
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ws-binary-${msg.seq}.bin`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('已下载二进制文件')
}

const handleMsgAction = (cmd: string, msg: MessageRecord) => {
  switch (cmd) {
    case 'copy':
      copyMessage(msg)
      break
    case 'copyRaw':
      copyBinary(msg)
      break
    case 'download':
      downloadBinary(msg)
      break
  }
}

const exportMessages = () => {
  if (messages.value.length === 0) return
  const lines = messages.value.map(m => {
    let extra = ''
    if (m.contentType) extra += ` [${getContentTypeLabel(m.contentType)}]`
    if (m.size !== undefined) extra += ` (${formatBytes(m.size)})`
    return `[${m.time}] #${m.seq} [${getDirectionLabel(m.direction)}]${extra}\n${m.content}\n`
  }).join('\n')
  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ws-messages-${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('消息记录已导出')
}

const selectPreset = (url: string) => {
  if (isConnected.value || isConnecting.value) return
  wsUrl.value = url
}

const loadTemplate = () => {
  if (sendFormat.value === 'json') {
    messageToSend.value = JSON.stringify({
      type: 'message',
      data: {
        id: 1,
        content: 'Hello WebSocket'
      },
      timestamp: Date.now()
    }, null, 2)
  } else if (sendFormat.value === 'hex') {
    messageToSend.value = '48656C6C6F 20576F726C64'
  } else {
    messageToSend.value = 'Hello, WebSocket!'
  }
}

const loadQuickMessage = (qm: QuickMessage) => {
  if (!isConnected.value) return
  sendFormat.value = qm.format
  messageToSend.value = qm.content
}

watch(autoScroll, (val) => {
  if (val && messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value!.scrollTop = messagesContainer.value!.scrollHeight
    })
  }
})

onBeforeUnmount(() => {
  if (ws) {
    ws.close(1000, '页面卸载')
    ws = null
  }
})
</script>

<style scoped>
.ws-debugger {
  max-width: 1600px;
  margin: 0 auto;
}

.intro-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.header-stats {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.connection-card {
  margin-bottom: 24px;
}

.status-tag {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.status-success {
  background: #67c23a;
  box-shadow: 0 0 6px #67c23a;
  animation: pulse 2s infinite;
}

.status-dot.status-warning {
  background: #e6a23c;
  box-shadow: 0 0 6px #e6a23c;
  animation: pulse 1s infinite;
}

.status-dot.status-idle {
  background: #909399;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.connection-form {
  margin-bottom: 0;
}

.url-form-item {
  flex: 1;
  min-width: 400px;
}

.url-input {
  width: 100%;
}

.preset-urls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px dashed #ebeef5;
}

.preset-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.preset-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.preset-tag:hover:not(.is-disabled) {
  transform: translateY(-1px);
}

.debug-card {
  margin-bottom: 24px;
}

.debug-content {
  min-height: 500px;
}

.messages-col,
.send-col {
  display: flex;
  flex-direction: column;
}

.messages-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-group {
  flex-shrink: 0;
}

.search-input {
  width: 240px;
}

.messages-subheader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.messages-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.messages-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.messages-container {
  flex: 1;
  min-height: 480px;
  max-height: 650px;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(180deg, #f7f8fa 0%, #f0f2f5 100%);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.messages-container.is-empty {
  justify-content: center;
  align-items: center;
}

.messages-empty {
  text-align: center;
  color: #909399;
}

.messages-empty p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

.messages-empty .empty-hint {
  font-size: 12px;
  color: #c0c4cc;
}

.message-item {
  display: flex;
  width: 100%;
}

.message-item.dir-send {
  justify-content: flex-end;
}

.message-item.dir-receive {
  justify-content: flex-start;
}

.message-item.dir-system {
  justify-content: center;
}

.message-bubble {
  max-width: 85%;
  min-width: 35%;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  flex-wrap: wrap;
}

.message-item.dir-send .bubble-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.message-item.dir-receive .bubble-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.bubble-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.msg-seq {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.message-item.dir-receive .msg-seq,
.message-item.dir-system .msg-seq {
  background: #f0f2f5;
  color: #606266;
}

.direction-tag,
.content-type-tag,
.size-tag {
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.bubble-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
}

.message-item.dir-receive .message-time,
.message-item.dir-system .message-time {
  color: #909399;
}

.msg-more-btn {
  color: rgba(255, 255, 255, 0.85) !important;
  padding: 0 4px;
}

.message-item.dir-receive .msg-more-btn,
.message-item.dir-system .msg-more-btn {
  color: #606266 !important;
}

.bubble-content {
  padding: 12px;
}

.message-item.msg-send .message-bubble {
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  color: #fff;
  border: none;
}

.message-item.msg-message .message-bubble {
  background: #fff;
  border: 1px solid #e4e7ed;
}

.message-item.msg-system .message-bubble,
.message-item.msg-error .message-bubble {
  background: transparent;
  box-shadow: none;
  max-width: 95%;
}

.message-item.msg-system .bubble-header,
.message-item.msg-error .bubble-header {
  display: none;
}

.system-text {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(144, 147, 153, 0.15);
  border-radius: 12px;
  font-size: 12px;
  color: #909399;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.error-text {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(245, 108, 108, 0.12);
  border-radius: 12px;
  font-size: 12px;
  color: #f56c6c;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.text-content {
  margin: 0;
  padding: 0;
  background: transparent;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.message-item.msg-send .text-content {
  color: #fff;
}

.message-item.msg-message .text-content {
  color: #303133;
}

.json-content code {
  font-family: inherit;
}

.message-item.msg-message .json-content :deep(.json-key) {
  color: #c41a16;
}

.message-item.msg-message .json-content :deep(.json-string) {
  color: #1c7c54;
}

.message-item.msg-message .json-content :deep(.json-number) {
  color: #1c00cf;
}

.message-item.msg-message .json-content :deep(.json-boolean) {
  color: #aa0d91;
}

.message-item.msg-message .json-content :deep(.json-null) {
  color: #808080;
}

.message-item.msg-send .text-content :deep(.json-key),
.message-item.msg-send .text-content :deep(.json-string),
.message-item.msg-send .text-content :deep(.json-number),
.message-item.msg-send .text-content :deep(.json-boolean),
.message-item.msg-send .text-content :deep(.json-null) {
  filter: brightness(1.3);
}

.message-item.msg-send .json-content :deep(.json-key) {
  color: #ffd5d5;
}

.message-item.msg-send .json-content :deep(.json-string) {
  color: #d4ffe8;
}

.message-item.msg-send .json-content :deep(.json-number) {
  color: #d6e4ff;
}

.message-item.msg-send .json-content :deep(.json-boolean) {
  color: #ffd4f5;
}

.message-item.msg-send .json-content :deep(.json-null) {
  color: #e4e7ed;
}

.binary-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.binary-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: inherit;
}

.message-item.msg-message .binary-info {
  color: #e6a23c;
}

.binary-hex {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 10px 12px;
}

.binary-hex pre {
  margin: 0;
}

.binary-hex code {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 11px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-all;
}

.binary-actions {
  display: flex;
  gap: 8px;
}

.binary-actions .el-button {
  --el-button-bg-color: rgba(255, 255, 255, 0.15);
  --el-button-border-color: rgba(255, 255, 255, 0.3);
  --el-button-text-color: #fff;
  --el-button-hover-bg-color: rgba(255, 255, 255, 0.25);
  --el-button-hover-text-color: #fff;
  --el-button-hover-border-color: rgba(255, 255, 255, 0.4);
}

.message-item.msg-message .binary-actions .el-button {
  --el-button-bg-color: #f5f7fa;
  --el-button-border-color: #dcdfe6;
  --el-button-text-color: #606266;
  --el-button-hover-bg-color: #ecf5ff;
  --el-button-hover-text-color: #165DFF;
  --el-button-hover-border-color: #165DFF;
}

.send-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.send-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.send-format-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 12px;
}

.send-format-tip.tip-text {
  background: #f4f4f5;
  color: #606266;
}

.send-format-tip.tip-json {
  background: #f0f9eb;
  color: #67c23a;
}

.send-format-tip.tip-hex {
  background: #fdf6ec;
  color: #e6a23c;
}

.send-textarea :deep(.el-textarea__inner) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.send-info {
  margin-top: 8px;
}

.send-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.send-tips {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.quick-messages {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #ebeef5;
}

.quick-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 10px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover:not(.is-disabled) {
  transform: translateY(-1px);
}

.tips-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fdf6ec 0%, #fef9f3 100%);
}

.tips-grid {
  display: flex;
  flex-wrap: wrap;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.tip-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: #fff;
}

.tip-icon-blue {
  background: linear-gradient(135deg, #409eff 0%, #165DFF 100%);
}

.tip-icon-green {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
}

.tip-icon-orange {
  background: linear-gradient(135deg, #ebb563 0%, #e6a23c 100%);
}

.tip-icon-purple {
  background: linear-gradient(135deg, #b37feb 0%, #722ed1 100%);
}

.tip-content {
  flex: 1;
  min-width: 0;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.tip-content p {
  margin: 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}
</style>
