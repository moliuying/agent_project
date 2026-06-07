<template>
  <div class="ws-debugger">
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>WebSocket 调试工具</span>
          <el-tag size="small" type="primary">实时连接 · 消息收发</el-tag>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="feature-item">
            <el-icon :size="18" color="#67c23a"><CircleCheck /></el-icon>
            <div>
              <div class="feature-title">快速连接</div>
              <div class="feature-desc">输入 WebSocket 地址即可建立连接，支持 ws:// 和 wss:// 协议</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="feature-item">
            <el-icon :size="18" color="#409eff"><Position /></el-icon>
            <div>
              <div class="feature-title">实时收发</div>
              <div class="feature-desc">即时发送消息并查看服务端响应，支持连接状态监控</div>
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
          <el-tag size="small" type="info" class="header-tag">
            {{ messages.length }} 条消息
          </el-tag>
        </div>
      </template>

      <el-row :gutter="16" class="debug-content">
        <el-col :span="14" class="messages-col">
          <div class="messages-header">
            <div class="messages-title">
              <el-icon><Tickets /></el-icon>
              <span>消息记录</span>
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
            :class="{ 'is-empty': messages.length === 0 }"
          >
            <div v-if="messages.length === 0" class="messages-empty">
              <el-icon :size="48" color="#c0c4cc"><ChatLineSquare /></el-icon>
              <p>暂无消息记录</p>
              <p class="empty-hint">连接成功后，发送和接收的消息将显示在这里</p>
            </div>
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="message-item"
              :class="`msg-${msg.type}`"
            >
              <div class="message-header">
                <el-tag
                  size="small"
                  :type="getMessageTagType(msg.type)"
                  effect="dark"
                  class="msg-type-tag"
                >
                  <el-icon :size="11">
                    <component :is="getMessageIcon(msg.type)" />
                  </el-icon>
                  {{ getMessageLabel(msg.type) }}
                </el-tag>
                <span class="message-time">{{ msg.time }}</span>
                <el-button
                  v-if="msg.type === 'message' || msg.type === 'send'"
                  size="small"
                  text
                  type="primary"
                  class="msg-copy-btn"
                  @click="copyMessage(msg.content)"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <div class="message-content">
                <pre v-if="msg.type !== 'system'"><code>{{ msg.content }}</code></pre>
                <span v-else class="system-text">{{ msg.content }}</span>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="10" class="send-col">
          <div class="send-header">
            <div class="send-title">
              <el-icon><Promotion /></el-icon>
              <span>发送消息</span>
            </div>
            <el-switch
              v-model="formatJson"
              active-text="格式化 JSON"
              inactive-text="纯文本"
              size="small"
            />
          </div>
          <el-input
            v-model="messageToSend"
            type="textarea"
            :rows="10"
            placeholder="请输入要发送的消息内容...&#10;&#10;支持发送任意文本内容。&#10;如果开启「格式化 JSON」，发送前会自动美化 JSON 格式。"
            resize="vertical"
            class="send-textarea"
            :disabled="!isConnected"
            @keydown.ctrl.enter="sendMessage"
          />
          <div class="send-actions">
            <div class="send-tips">
              <el-icon :size="12" color="#909399"><InfoFilled /></el-icon>
              <span>按 Ctrl + Enter 快速发送</span>
            </div>
            <el-button-group>
              <el-button
                @click="loadJsonTemplate"
                :disabled="!isConnected"
              >
                <el-icon><Document /></el-icon>
                JSON 示例
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
                :disabled="!isConnected || !messageToSend.trim()"
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
        <el-col :span="8">
          <div class="tip-item">
            <div class="tip-icon tip-icon-blue">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">建立连接</div>
              <p>输入完整的 WebSocket 地址（以 ws:// 或 wss:// 开头），点击「连接」按钮建立长连接。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="tip-item">
            <div class="tip-icon tip-icon-green">
              <el-icon><Promotion /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">发送消息</div>
              <p>在右侧输入框中输入消息内容，支持任意文本格式。按 Ctrl + Enter 可快速发送。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="tip-item">
            <div class="tip-icon tip-icon-orange">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">查看响应</div>
              <p>服务端返回的消息会实时显示在左侧消息记录区，可区分发送、接收和系统消息。</p>
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
  Position,
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
  Edit,
  Bell,
  Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

type MessageType = 'send' | 'message' | 'system' | 'error'

interface MessageRecord {
  type: MessageType
  content: string
  time: string
}

interface PresetUrl {
  name: string
  url: string
}

interface QuickMessage {
  label: string
  content: string
}

const wsUrl = ref('')
const messageToSend = ref('')
const messages = ref<MessageRecord[]>([])
const isConnected = ref(false)
const isConnecting = ref(false)
const autoScroll = ref(true)
const formatJson = ref(true)

const messagesContainer = ref<HTMLElement>()

let ws: WebSocket | null = null

const presetUrls: PresetUrl[] = [
  { name: 'Postman Echo', url: 'wss://ws.postman-echo.com/raw' },
  { name: 'WebSocket 测试', url: 'wss://echo.websocket.org' }
]

const quickMessages: QuickMessage[] = [
  { label: 'Ping', content: 'ping' },
  { label: '问候', content: '{"type":"hello","message":"你好，服务端"}' },
  { label: '订阅', content: '{"action":"subscribe","channel":"test"}' },
  { label: '心跳', content: '{"type":"heartbeat","timestamp":' + Date.now() + '}' }
]

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

const addMessage = (type: MessageType, content: string) => {
  messages.value.push({
    type,
    content,
    time: formatTime(new Date())
  })
  if (autoScroll.value) {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
}

const getMessageTagType = (type: MessageType): 'success' | 'primary' | 'info' | 'danger' => {
  const map: Record<MessageType, 'success' | 'primary' | 'info' | 'danger'> = {
    send: 'primary',
    message: 'success',
    system: 'info',
    error: 'danger'
  }
  return map[type]
}

const getMessageIcon = (type: MessageType) => {
  const map: Record<MessageType, any> = {
    send: Promotion,
    message: Bell,
    system: InfoFilled,
    error: Warning
  }
  return map[type]
}

const getMessageLabel = (type: MessageType): string => {
  const map: Record<MessageType, string> = {
    send: '发送',
    message: '接收',
    system: '系统',
    error: '错误'
  }
  return map[type]
}

const tryFormatJson = (text: string): string => {
  if (!formatJson.value) return text
  try {
    const parsed = JSON.parse(text)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return text
  }
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
      let content = event.data
      if (typeof content === 'string') {
        content = tryFormatJson(content)
      }
      addMessage('message', content)
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
  if (!isConnected.value || !ws) {
    ElMessage.warning('请先建立 WebSocket 连接')
    return
  }
  const content = messageToSend.value
  if (!content.trim()) {
    ElMessage.warning('请输入要发送的消息')
    return
  }

  const displayContent = tryFormatJson(content)

  try {
    ws.send(content)
    addMessage('send', displayContent)
    if (!keepSendContent.value) {
      messageToSend.value = ''
    }
  } catch (error: any) {
    addMessage('error', `发送失败：${error.message || error}`)
    ElMessage.error('消息发送失败')
  }
}

const keepSendContent = ref(false)

const clearMessages = () => {
  messages.value = []
  ElMessage.success('已清空消息记录')
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
  ElMessage.success('已重置')
}

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const exportMessages = () => {
  if (messages.value.length === 0) return
  const lines = messages.value.map(m => `[${m.time}] [${getMessageLabel(m.type)}]\n${m.content}\n`).join('\n')
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

const loadJsonTemplate = () => {
  messageToSend.value = JSON.stringify({
    type: 'message',
    data: {
      id: 1,
      content: 'Hello WebSocket'
    },
    timestamp: Date.now()
  }, null, 2)
}

const loadQuickMessage = (qm: QuickMessage) => {
  if (!isConnected.value) return
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
  max-width: 1400px;
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

.header-tag {
  margin-left: auto;
  font-weight: normal;
}

.debug-content {
  min-height: 500px;
}

.messages-col,
.send-col {
  display: flex;
  flex-direction: column;
}

.messages-header,
.send-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.messages-title,
.send-title {
  display: flex;
  align-items: center;
  gap: 6px;
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
  min-height: 420px;
  max-height: 600px;
  overflow-y: auto;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.message-item.msg-send {
  border-left: 4px solid #165DFF;
  background: linear-gradient(90deg, #ecf5ff 0%, #fff 100%);
}

.message-item.msg-message {
  border-left: 4px solid #67c23a;
  background: linear-gradient(90deg, #f0f9eb 0%, #fff 100%);
}

.message-item.msg-system {
  border-left: 4px solid #909399;
  background: linear-gradient(90deg, #f4f4f5 0%, #fff 100%);
}

.message-item.msg-error {
  border-left: 4px solid #f56c6c;
  background: linear-gradient(90deg, #fef0f0 0%, #fff 100%);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.msg-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
}

.msg-copy-btn {
  margin-left: auto;
  padding: 0 4px;
}

.message-content {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}

.message-content pre {
  margin: 0;
  padding: 12px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.message-content pre code {
  font-family: inherit;
}

.system-text {
  font-size: 13px;
  color: #606266;
  font-style: italic;
}

.send-textarea :deep(.el-textarea__inner) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
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
