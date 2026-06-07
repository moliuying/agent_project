<template>
  <div class="ws-debugger">
    <el-card class="intro-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>WebSocket 调试工具</span>
          <el-tag size="small" type="primary">实时连接 · 请求响应配对 · 高频消息调试</el-tag>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="feature-item">
            <el-icon :size="18" color="#67c23a"><CircleCheck /></el-icon>
            <div>
              <div class="feature-title">气泡布局</div>
              <div class="feature-desc">发送右对齐、接收左对齐，方向一目了然</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <el-icon :size="18" color="#722ed1"><Link /></el-icon>
            <div>
              <div class="feature-title">请求响应配对</div>
              <div class="feature-desc">自动关联请求与响应，计算响应耗时，同色边框标识</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <el-icon :size="18" color="#409eff"><Grid /></el-icon>
            <div>
              <div class="feature-title">类型标识</div>
              <div class="feature-desc">自动识别文本/JSON/二进制，标签颜色双重区分</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <el-icon :size="18" color="#e6a23c"><Search /></el-icon>
            <div>
              <div class="feature-title">搜索过滤</div>
              <div class="feature-desc">按方向/类型/配对状态筛选，关键词精准搜索</div>
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
            <el-tooltip content="已发送消息数" placement="bottom">
              <el-tag size="small" type="primary" effect="plain">
                <el-icon :size="11"><Top /></el-icon>
                {{ stats.send }}
              </el-tag>
            </el-tooltip>
            <el-tooltip content="已接收消息数" placement="bottom">
              <el-tag size="small" type="success" effect="plain">
                <el-icon :size="11"><Bottom /></el-icon>
                {{ stats.receive }}
              </el-tag>
            </el-tooltip>
            <el-tooltip content="已成功配对的请求-响应对" placement="bottom">
              <el-tag size="small" type="warning" effect="plain">
                <el-icon :size="11"><Link /></el-icon>
                {{ stats.paired }}
              </el-tag>
            </el-tooltip>
            <el-tooltip content="平均响应延迟" placement="bottom" v-if="stats.avgLatency > 0">
              <el-tag size="small" type="danger" effect="plain">
                <el-icon :size="11"><Timer /></el-icon>
                {{ formatLatency(stats.avgLatency) }}
              </el-tag>
            </el-tooltip>
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
              <el-radio-group v-model="filterPairStatus" size="small">
                <el-radio-button label="all">全部状态</el-radio-button>
                <el-radio-button label="paired">
                  <el-icon :size="11"><Link /></el-icon>
                  已配对
                </el-radio-button>
                <el-radio-button label="pending">
                  <el-icon :size="11"><Timer /></el-icon>
                  等待响应
                </el-radio-button>
                <el-radio-button label="unpaired">未配对</el-radio-button>
              </el-radio-group>
              <el-switch
                v-model="pairViewMode"
                active-text="配对视图"
                inactive-text="列表视图"
                size="small"
              />
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
              <span>{{ pairViewMode ? '请求-响应对' : '消息记录' }}</span>
              <el-tag v-if="filteredMessages.length !== messages.length" size="small" type="warning" effect="light">
                筛选后 {{ pairViewMode ? pairedGroups.length : filteredMessages.length }} 条
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
            :class="{ 'is-empty': (pairViewMode ? pairedGroups : filteredMessages).length === 0 }"
          >
            <div v-if="(pairViewMode ? pairedGroups : filteredMessages).length === 0" class="messages-empty">
              <el-icon :size="48" color="#c0c4cc"><ChatLineSquare /></el-icon>
              <p>{{ messages.length === 0 ? '暂无消息记录' : '没有匹配的消息' }}</p>
              <p class="empty-hint">
                {{ messages.length === 0 ? '连接成功后，发送和接收的消息将显示在这里' : '请调整筛选条件或搜索关键词' }}
              </p>
            </div>

            <template v-if="!pairViewMode">
              <div
                v-for="msg in filteredMessages"
                :key="msg.id"
                ref="msgRefs"
                class="message-item"
                :class="[
                  `msg-${msg.type}`,
                  `dir-${msg.direction}`,
                  { 'is-highlighted': highlightedMsgId === msg.id, 'is-paired': msg.pairId }
                ]"
                :style="msg.pairId ? { '--pair-color': getPairColor(msg.pairId) } : {}"
                @click="handleMsgClick(msg)"
              >
                <div class="message-bubble" :class="[`bubble-${msg.type}`, { 'bubble-paired': msg.pairId }]">
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
                      <el-tag
                        v-if="msg.direction === 'receive' && msg.latency !== undefined"
                        size="small"
                        :type="getLatencyTagType(msg.latency)"
                        effect="dark"
                        class="latency-tag"
                      >
                        <el-icon :size="10"><Timer /></el-icon>
                        {{ formatLatency(msg.latency) }}
                      </el-tag>
                      <el-tag
                        v-if="msg.direction === 'send' && msg.pendingResponse"
                        size="small"
                        type="warning"
                        effect="dark"
                        class="pending-tag"
                      >
                        <el-icon :size="10" class="spin"><Loading /></el-icon>
                        等待响应
                      </el-tag>
                    </div>
                    <div class="bubble-actions">
                      <span class="message-time">{{ msg.time }}</span>
                      <el-dropdown
                        v-if="msg.type !== 'system' && msg.type !== 'error'"
                        trigger="click"
                        @command="(cmd) => handleMsgAction(cmd, msg)"
                        @click.stop
                      >
                        <el-button size="small" text type="primary" class="msg-more-btn" @click.stop>
                          <el-icon><MoreFilled /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="jumpPair" v-if="msg.pairId">
                              <el-icon><Aim /></el-icon>跳转至{{ msg.direction === 'send' ? '响应' : '请求' }}
                            </el-dropdown-item>
                            <el-dropdown-item command="copy">
                              <el-icon><CopyDocument /></el-icon>复制内容
                            </el-dropdown-item>
                            <el-dropdown-item command="copyRaw" v-if="msg.contentType === 'binary'">
                              <el-icon><Document /></el-icon>复制十六进制
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
                          <el-button size="small" @click.stop="downloadBinary(msg)">
                            <el-icon><Download /></el-icon>下载文件
                          </el-button>
                          <el-button size="small" @click.stop="copyBinary(msg)">
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
            </template>

            <template v-else>
              <div
                v-for="group in pairedGroups"
                :key="group.id"
                class="pair-group"
                :style="{ '--pair-color': getPairColor(group.id) }"
                :class="{ 'is-collapsed': collapsedPairs[group.id] }"
              >
                <div class="pair-header" @click="togglePairCollapse(group.id)">
                  <div class="pair-header-left">
                    <el-icon class="pair-collapse-icon"><ArrowRight /></el-icon>
                    <span class="pair-title">请求-响应对 #{{ group.seq }}</span>
                    <el-tag size="small" type="success" effect="plain">
                      <el-icon :size="11"><CircleCheck /></el-icon>
                      已配对
                    </el-tag>
                    <el-tag size="small" :type="getLatencyTagType(group.latency)" effect="dark">
                      <el-icon :size="11"><Timer /></el-icon>
                      {{ formatLatency(group.latency) }}
                    </el-tag>
                    <el-tag size="small" type="info" effect="plain">
                      <el-icon :size="11"><Files /></el-icon>
                      请求 {{ formatBytes(group.request.size || 0) }} / 响应 {{ formatBytes(group.response.size || 0) }}
                    </el-tag>
                  </div>
                  <div class="pair-header-right">
                    <span class="pair-time">{{ group.request.time }} → {{ group.response.time }}</span>
                    <el-button size="small" text type="primary" @click.stop="expandPairJump(group)">
                      <el-icon><Aim /></el-icon>在列表中定位
                    </el-button>
                  </div>
                </div>
                <div class="pair-content" v-show="!collapsedPairs[group.id]">
                  <div class="message-item dir-send msg-send" @click="handleMsgClick(group.request)">
                    <div class="message-bubble bubble-send">
                      <div class="bubble-header">
                        <div class="bubble-meta">
                          <span class="msg-seq">#{{ group.request.seq }}</span>
                          <el-tag size="small" type="primary" effect="dark" class="direction-tag">
                            <el-icon :size="10"><Top /></el-icon>请求
                          </el-tag>
                          <el-tag v-if="group.request.contentType" size="small" :type="getContentTypeTagType(group.request.contentType)" effect="plain" class="content-type-tag">
                            <el-icon :size="10"><component :is="getContentTypeIcon(group.request.contentType)" /></el-icon>
                            {{ getContentTypeLabel(group.request.contentType) }}
                          </el-tag>
                        </div>
                        <div class="bubble-actions">
                          <span class="message-time">{{ group.request.time }}</span>
                        </div>
                      </div>
                      <div class="bubble-content">
                        <template v-if="group.request.contentType === 'binary'">
                          <div class="binary-info" style="color:#fff">
                            <el-icon :size="14"><Files /></el-icon>
                            <span>二进制数据，{{ formatBytes(group.request.size || 0) }}</span>
                          </div>
                        </template>
                        <pre v-else class="text-content" :class="{ 'json-content': group.request.contentType === 'json' }">
<code v-html="highlightJson(group.request.content)"></code></pre>
                      </div>
                    </div>
                  </div>
                  <div class="pair-arrow">
                    <el-icon><Bottom /></el-icon>
                    <span>{{ formatLatency(group.latency) }}</span>
                  </div>
                  <div class="message-item dir-receive msg-message" @click="handleMsgClick(group.response)">
                    <div class="message-bubble bubble-message">
                      <div class="bubble-header">
                        <div class="bubble-meta">
                          <span class="msg-seq">#{{ group.response.seq }}</span>
                          <el-tag size="small" type="success" effect="dark" class="direction-tag">
                            <el-icon :size="10"><Bottom /></el-icon>响应
                          </el-tag>
                          <el-tag v-if="group.response.contentType" size="small" :type="getContentTypeTagType(group.response.contentType)" effect="plain" class="content-type-tag">
                            <el-icon :size="10"><component :is="getContentTypeIcon(group.response.contentType)" /></el-icon>
                            {{ getContentTypeLabel(group.response.contentType) }}
                          </el-tag>
                        </div>
                        <div class="bubble-actions">
                          <span class="message-time">{{ group.response.time }}</span>
                        </div>
                      </div>
                      <div class="bubble-content">
                        <template v-if="group.response.contentType === 'binary'">
                          <div class="binary-info">
                            <el-icon :size="14" color="#e6a23c"><Files /></el-icon>
                            <span>二进制数据，{{ formatBytes(group.response.size || 0) }}</span>
                          </div>
                        </template>
                        <pre v-else class="text-content" :class="{ 'json-content': group.response.contentType === 'json' }">
<code v-html="highlightJson(group.response.content)"></code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
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

          <div class="pair-settings-card" v-if="stats.paired > 0 || pendingSendIds.length > 0">
            <div class="settings-title">
              <el-icon :size="14" color="#722ed1"><Link /></el-icon>
              <span>配对统计</span>
            </div>
            <div class="settings-grid">
              <div class="stat-item">
                <span class="stat-label">已配对</span>
                <span class="stat-value stat-value-success">{{ stats.paired }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">等待响应</span>
                <span class="stat-value stat-value-warning">{{ pendingSendIds.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均延迟</span>
                <span class="stat-value" :class="stats.avgLatency > 0 ? getLatencyValueClass(stats.avgLatency) : ''">
                  {{ stats.avgLatency > 0 ? formatLatency(stats.avgLatency) : '-' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">配对超时</span>
                <el-input-number v-model="pairTimeoutMs" :min="500" :max="60000" :step="500" size="small" style="width:120px" />
              </div>
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
              <p>支持文本、JSON、十六进制三种格式，Ctrl+Enter 快捷发送。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="tip-item">
            <div class="tip-icon tip-icon-purple">
              <el-icon><Link /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">请求响应配对</div>
              <p>自动将请求与响应配对，显示响应耗时。可切换「配对视图」集中查看。</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="tip-item">
            <div class="tip-icon tip-icon-orange">
              <el-icon><Search /></el-icon>
            </div>
            <div class="tip-content">
              <div class="tip-title">筛选定位</div>
              <p>按方向/类型/配对状态快速筛选，点击气泡可跳转至配对消息。</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount, reactive } from 'vue'
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
  MoreFilled,
  Files,
  Top,
  Bottom,
  Timer,
  Aim,
  ArrowRight,
  Loading
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type MessageType = 'send' | 'message' | 'system' | 'error'
type MessageDirection = 'send' | 'receive' | 'system'
type ContentType = 'text' | 'json' | 'binary'
type SendFormat = 'text' | 'json' | 'hex'
type FilterDirection = 'all' | 'send' | 'receive' | 'system'
type FilterContentType = 'all' | 'text' | 'json' | 'binary'
type FilterPairStatus = 'all' | 'paired' | 'pending' | 'unpaired'

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
  timestamp: number
  requestId?: string | number
  pairId?: string
  latency?: number
  pendingResponse?: boolean
}

interface PairGroup {
  id: string
  seq: number
  request: MessageRecord
  response: MessageRecord
  latency: number
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

const PAIR_COLORS = [
  '#165DFF', '#67c23a', '#e6a23c', '#722ed1',
  '#f56c6c', '#13c2c2', '#eb2f96', '#fa8c16',
  '#2f54eb', '#52c41a', '#faad14', '#a855f7'
]

const wsUrl = ref('')
const messageToSend = ref('')
const messages = ref<MessageRecord[]>([])
const isConnected = ref(false)
const isConnecting = ref(false)
const autoScroll = ref(true)
const sendFormat = ref<SendFormat>('text')
const filterDirection = ref<FilterDirection>('all')
const filterContentType = ref<FilterContentType>('all')
const filterPairStatus = ref<FilterPairStatus>('all')
const searchKeyword = ref('')
const pairViewMode = ref(false)
const highlightedMsgId = ref<string | null>(null)
const pairTimeoutMs = ref(5000)
const collapsedPairs = reactive<Record<string, boolean>>({})

const messagesContainer = ref<HTMLElement>()
const msgRefs = ref<Record<string, HTMLElement>>({})
let seqCounter = 0
let pairSeqCounter = 0
let ws: WebSocket | null = null
const pendingSendIds = ref<string[]>([])
const pairTimers = new Map<string, ReturnType<typeof setTimeout>>()

const presetUrls: PresetUrl[] = [
  { name: 'Postman Echo', url: 'wss://ws.postman-echo.com/raw' },
  { name: 'WebSocket 测试', url: 'wss://echo.websocket.org' }
]

const quickMessages: QuickMessage[] = [
  { label: 'Ping', content: 'ping', format: 'text' },
  { label: '问候 JSON', content: '{"requestId":' + Date.now() + ',"type":"hello","message":"你好"}', format: 'json' },
  { label: '订阅请求', content: '{"requestId":"req_' + Date.now() + '","action":"subscribe","channel":"test"}', format: 'json' },
  { label: '心跳', content: '{"type":"heartbeat","timestamp":' + Date.now() + '}', format: 'json' },
  { label: '二进制示例', content: '48656C6C6F20576F726C64', format: 'hex' }
]

const getPairColor = (pairId: string): string => {
  let hash = 0
  for (let i = 0; i < pairId.length; i++) {
    hash = pairId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PAIR_COLORS[Math.abs(hash) % PAIR_COLORS.length]
}

const stats = computed(() => {
  const pairedMessages = messages.value.filter(m => m.pairId)
  const latencies = messages.value.filter(m => m.latency !== undefined).map(m => m.latency as number)
  return {
    send: messages.value.filter(m => m.direction === 'send').length,
    receive: messages.value.filter(m => m.direction === 'receive').length,
    paired: pairedMessages.length / 2,
    avgLatency: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0
  }
})

const pairedGroups = computed<PairGroup[]>(() => {
  const pairMap = new Map<string, { request?: MessageRecord; response?: MessageRecord }>()
  const seqMap = new Map<string, number>()

  for (const msg of messages.value) {
    if (!msg.pairId) continue
    if (!pairMap.has(msg.pairId)) {
      pairMap.set(msg.pairId, {})
    }
    const entry = pairMap.get(msg.pairId)!
    if (msg.direction === 'send') {
      entry.request = msg
      seqMap.set(msg.pairId, msg.seq)
    } else if (msg.direction === 'receive') {
      entry.response = msg
    }
  }

  const groups: PairGroup[] = []
  for (const [pairId, entry] of pairMap) {
    if (entry.request && entry.response) {
      groups.push({
        id: pairId,
        seq: seqMap.get(pairId) || 0,
        request: entry.request,
        response: entry.response,
        latency: entry.response.latency || 0
      })
    }
  }

  let pairSeq = 0
  groups.sort((a, b) => a.seq - b.seq).forEach(g => { g.seq = ++pairSeq })

  if (filterDirection.value !== 'all' || filterContentType.value !== 'all' || searchKeyword.value.trim()) {
    return groups.filter(g => {
      const kw = searchKeyword.value.trim().toLowerCase()
      if (filterDirection.value === 'send' && !g.request) return false
      if (filterDirection.value === 'receive' && !g.response) return false
      if (filterContentType.value !== 'all') {
        if (g.request?.contentType !== filterContentType.value && g.response?.contentType !== filterContentType.value) {
          return false
        }
      }
      if (kw) {
        if (!g.request?.content.toLowerCase().includes(kw) && !g.response?.content.toLowerCase().includes(kw)) {
          return false
        }
      }
      return true
    })
  }

  return groups
})

const sendFormatTip = computed(() => {
  const map: Record<SendFormat, string> = {
    text: '普通文本格式，支持任意字符串内容',
    json: 'JSON 格式，发送前会自动校验格式正确性，支持 requestId 自动配对',
    hex: '十六进制格式，例如 48656C6C6F（不含 0x 前缀和空格）'
  }
  return map[sendFormat.value]
})

const sendPlaceholder = computed(() => {
  const map: Record<SendFormat, string> = {
    text: '请输入要发送的文本内容...\n\n按 Ctrl + Enter 快速发送',
    json: '请输入 JSON 内容（建议包含 requestId 字段用于自动配对），例如：\n{\n  "requestId": 1,\n  "type": "message",\n  "data": "hello"\n}\n\n发送前会自动校验格式',
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
    if (filterPairStatus.value !== 'all') {
      if (filterPairStatus.value === 'paired' && !msg.pairId) return false
      if (filterPairStatus.value === 'pending' && !msg.pendingResponse) return false
      if (filterPairStatus.value === 'unpaired' && (msg.pairId || msg.type === 'system' || msg.type === 'error')) return false
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

const formatLatency = (ms: number): string => {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

const getLatencyTagType = (ms: number): 'success' | 'warning' | 'danger' => {
  if (ms < 200) return 'success'
  if (ms < 1000) return 'warning'
  return 'danger'
}

const getLatencyValueClass = (ms: number): string => {
  if (ms < 200) return 'stat-value-success'
  if (ms < 1000) return 'stat-value-warning'
  return 'stat-value-danger'
}

const detectContentType = (content: string): ContentType => {
  try {
    JSON.parse(content)
    return 'json'
  } catch {
    return 'text'
  }
}

const extractRequestId = (content: string): string | number | undefined => {
  try {
    const obj = JSON.parse(content)
    if (typeof obj === 'object' && obj !== null) {
      const idKeys = ['requestId', 'reqId', 'msgId', 'messageId', 'id', 'traceId']
      for (const key of idKeys) {
        if (obj[key] !== undefined) {
          return obj[key]
        }
      }
    }
  } catch {
    return undefined
  }
  return undefined
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

const startPairTimeout = (sendMsgId: string) => {
  const timer = setTimeout(() => {
    const msg = messages.value.find(m => m.id === sendMsgId)
    if (msg) {
      msg.pendingResponse = false
    }
    pendingSendIds.value = pendingSendIds.value.filter(id => id !== sendMsgId)
    pairTimers.delete(sendMsgId)
  }, pairTimeoutMs.value)
  pairTimers.set(sendMsgId, timer)
  pendingSendIds.value.push(sendMsgId)
}

const tryPairMessages = (receiveMsg: MessageRecord) => {
  if (pendingSendIds.value.length === 0) return

  if (receiveMsg.requestId !== undefined) {
    for (const sendId of pendingSendIds.value) {
      const sendMsg = messages.value.find(m => m.id === sendId)
      if (sendMsg && sendMsg.requestId === receiveMsg.requestId) {
        doPair(sendMsg, receiveMsg)
        return
      }
    }
  }

  const oldestPendingId = pendingSendIds.value[0]
  const sendMsg = messages.value.find(m => m.id === oldestPendingId)
  if (sendMsg) {
    doPair(sendMsg, receiveMsg)
  }
}

const doPair = (sendMsg: MessageRecord, receiveMsg: MessageRecord) => {
  const pairId = `pair_${sendMsg.id}_${receiveMsg.id}`
  sendMsg.pairId = pairId
  receiveMsg.pairId = pairId
  receiveMsg.latency = receiveMsg.timestamp - sendMsg.timestamp
  sendMsg.pendingResponse = false

  const timer = pairTimers.get(sendMsg.id)
  if (timer) {
    clearTimeout(timer)
    pairTimers.delete(sendMsg.id)
  }
  pendingSendIds.value = pendingSendIds.value.filter(id => id !== sendMsg.id)
}

const addMessage = async (
  type: MessageType,
  content: string,
  options?: {
    contentType?: ContentType
    rawData?: ArrayBuffer | Blob | Uint8Array
    size?: number
    binaryPreview?: string
    requestId?: string | number
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

  const now = Date.now()
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
    time: formatTime(new Date(now)),
    timestamp: now,
    requestId: options?.requestId,
    pendingResponse: type === 'send'
  }

  messages.value.push(record)

  if (type === 'send') {
    startPairTimeout(record.id)
  } else if (type === 'message') {
    tryPairMessages(record)
  }

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
        size,
        requestId: extractRequestId(text)
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
        size,
        requestId: extractRequestId(text)
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
      size: new Blob([data]).size,
      requestId: extractRequestId(data)
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

const handleMsgClick = (msg: MessageRecord) => {
  highlightedMsgId.value = msg.id
  setTimeout(() => {
    highlightedMsgId.value = null
  }, 2000)
}

const togglePairCollapse = (pairId: string) => {
  collapsedPairs[pairId] = !collapsedPairs[pairId]
}

const expandPairJump = (group: PairGroup) => {
  pairViewMode.value = false
  nextTick(() => {
    highlightedMsgId.value = group.request.id
    const el = document.querySelector(`[data-msg-id="${group.request.id}"]`) as HTMLElement
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => { highlightedMsgId.value = null }, 2000)
  })
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
      for (const timer of pairTimers.values()) clearTimeout(timer)
      pairTimers.clear()
      pendingSendIds.value = []
      messages.value.forEach(m => { m.pendingResponse = false })
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
  for (const timer of pairTimers.values()) clearTimeout(timer)
  pairTimers.clear()
  pendingSendIds.value = []
  messages.value.forEach(m => { m.pendingResponse = false })
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
      const rawContent = content
      ws.send(rawContent)
      addMessage('send', formatted, {
        contentType: 'json',
        size: new Blob([rawContent]).size,
        requestId: extractRequestId(rawContent)
      })
    } else {
      ws.send(content)
      const displayContent = tryFormatJson(content)
      addMessage('send', displayContent, {
        contentType: detectContentType(content),
        size: new Blob([content]).size,
        requestId: extractRequestId(content)
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
    pairSeqCounter = 0
    for (const timer of pairTimers.values()) clearTimeout(timer)
    pairTimers.clear()
    pendingSendIds.value = []
    Object.keys(collapsedPairs).forEach(k => { delete collapsedPairs[k] })
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
  pairSeqCounter = 0
  for (const timer of pairTimers.values()) clearTimeout(timer)
  pairTimers.clear()
  pendingSendIds.value = []
  Object.keys(collapsedPairs).forEach(k => { delete collapsedPairs[k] })
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
    case 'jumpPair':
      if (msg.pairId) {
        const pairedMsg = messages.value.find(m => m.pairId === msg.pairId && m.id !== msg.id)
        if (pairedMsg) {
          handleMsgClick(pairedMsg)
          const el = document.querySelector(`.message-item[data-msg-id="${pairedMsg.id}"]`) as HTMLElement
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }
      break
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
    if (m.latency !== undefined) extra += ` <latency:${formatLatency(m.latency)}>`
    if (m.pairId) extra += ` <paired>`
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
      requestId: Date.now(),
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
  for (const timer of pairTimers.values()) clearTimeout(timer)
  pairTimers.clear()
})
</script>

<style scoped>
.ws-debugger {
  max-width: 1700px;
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
  flex-wrap: wrap;
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

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.messages-container {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  min-height: 300px;
}

.messages-container.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #909399;
}

.empty-tip {
  margin-top: 12px;
  font-size: 14px;
}

.message-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-row.row-send {
  justify-content: flex-end;
}

.message-row.row-receive {
  justify-content: flex-start;
}

.message-row.row-system {
  justify-content: center;
}

.message-row.is-highlighted {
  animation: highlight-pulse 1.5s ease-in-out 2;
}

@keyframes highlight-pulse {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(64, 158, 255, 0.1); }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  word-break: break-word;
  border: 2px solid transparent;
}

.bubble-send {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubble-send .message-content {
  color: #fff;
}

.bubble-send .msg-meta {
  color: rgba(255, 255, 255, 0.85);
}

.bubble-receive {
  background: #fff;
  color: #303133;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 4px;
}

.bubble-system {
  background: #f4f4f5;
  color: #909399;
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 16px;
}

.bubble-paired {
  border-width: 3px;
  border-style: solid;
  border-color: var(--pair-color);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
  font-size: 11px;
  opacity: 0.85;
}

.msg-seq {
  font-weight: 600;
  opacity: 0.9;
}

.msg-time {
  font-family: 'SF Mono', Menlo, monospace;
}

.msg-bytes {
  font-family: 'SF Mono', Menlo, monospace;
}

.type-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
}

.latency-tag {
  font-size: 10px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  font-weight: 600;
  font-family: 'SF Mono', Menlo, monospace;
}

.pending-tag {
  font-size: 10px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

.spin {
  display: inline-flex;
  animation: spin-rotate 1s linear infinite;
}

@keyframes spin-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.message-content {
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.json-key { color: #c7254e; }
.json-string { color: #183691; }
.json-number { color: #0086b3; }
.json-boolean { color: #0086b3; }
.json-null { color: #969896; }

.bubble-send .json-key { color: #ffe58f; }
.bubble-send .json-string { color: #bae7ff; }
.bubble-send .json-number { color: #d9f7be; }
.bubble-send .json-boolean { color: #d9f7be; }
.bubble-send .json-null { color: #fff1b8; }

.hex-view {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin-top: 6px;
  overflow-x: auto;
}

.bubble-send .hex-view {
  background: rgba(255, 255, 255, 0.15);
}

.hex-row {
  display: flex;
  gap: 8px;
}

.hex-offset {
  color: #909399;
  min-width: 60px;
}

.hex-bytes {
  letter-spacing: 1px;
  min-width: 240px;
}

.hex-ascii {
  color: #606266;
}

.pair-group {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pair-group.is-collapsed {
  border-radius: 8px;
}

.pair-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f7fa 100%);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.pair-header:hover {
  background: linear-gradient(135deg, #e6f4ff 0%, #ebeef5 100%);
}

.pair-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pair-collapse-icon {
  transition: transform 0.2s ease;
  color: #909399;
}

.pair-group:not(.is-collapsed) .pair-collapse-icon {
  transform: rotate(90deg);
}

.pair-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.pair-time {
  color: #909399;
  font-size: 12px;
  font-family: 'SF Mono', Menlo, monospace;
  margin-right: 12px;
}

.pair-header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pair-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pair-content .message-row {
  margin-bottom: 0;
}

.pair-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 0;
  color: #409eff;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', Menlo, monospace;
}

.pair-settings-card {
  margin-top: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f9f0ff 100%);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #d9ecff;
}

.settings-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.stat-item {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  font-family: 'SF Mono', Menlo, monospace;
}

.stat-value-success {
  color: #67c23a;
}

.stat-value-warning {
  color: #e6a23c;
}

.stat-value-danger {
  color: #f56c6c;
}

.send-card {
  margin-top: 24px;
}

.send-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.send-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.msg-list-container {
  position: relative;
}
</style>