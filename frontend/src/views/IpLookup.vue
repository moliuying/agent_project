<template>
  <div class="ip-lookup">
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
        <el-step title="输入IP或域名" description="输入单个IP地址或域名进行查询" />
        <el-step title="批量查询" description="支持批量查询（每行一个，最多50个）" />
        <el-step title="查看结果" description="获取归属地、运营商、时区等详细信息" />
      </el-steps>
    </el-card>

    <el-card class="lookup-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Location />
          </el-icon>
          <span>IP地址查询</span>
          <el-tag size="small" type="info" class="header-tag">支持IP和域名查询</el-tag>
        </div>
      </template>

      <div class="query-mode-switch">
        <el-radio-group v-model="queryMode" size="default">
          <el-radio-button label="single">
            <el-icon><Search /></el-icon>
            <span>单个查询</span>
          </el-radio-button>
          <el-radio-button label="batch">
            <el-icon><List /></el-icon>
            <span>批量查询</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="input-section" v-if="queryMode === 'single'">
        <div class="input-header">
          <span class="input-label">IP地址 / 域名</span>
          <el-tooltip content="支持IPv4、IPv6及域名格式" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="input-row">
          <el-input
            v-model="singleInput"
            placeholder="请输入IP地址或域名，例如：8.8.8.8 或 google.com"
            class="input-field"
            clearable
            @keyup.enter="handleSingleLookup"
          >
            <template #prefix>
              <el-icon><Monitor /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" :loading="loading" @click="handleSingleLookup">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="getMyIp">
            <el-icon><User /></el-icon>
            <span>查询本机</span>
          </el-button>
        </div>
        <div class="quick-examples">
          <span class="example-label">快捷示例：</span>
          <el-tag
            v-for="example in quickExamples"
            :key="example"
            size="small"
            class="example-tag"
            effect="plain"
            @click="singleInput = example"
          >
            {{ example }}
          </el-tag>
        </div>
      </div>

      <div class="input-section" v-else>
        <div class="input-header">
          <span class="input-label">批量输入（每行一个）</span>
          <el-tooltip content="支持IP和域名混合，最多50个" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <el-input
          v-model="batchInput"
          type="textarea"
          :rows="8"
          placeholder="请输入IP地址或域名，每行一个，例如：&#10;8.8.8.8&#10;google.com&#10;1.1.1.1"
          resize="vertical"
          class="text-input"
        />
        <div class="batch-actions">
          <div class="batch-info">
            <el-tag size="small" :type="batchItems.length > 50 ? 'danger' : 'info'">
              已输入 {{ batchItems.length }} 项
            </el-tag>
            <span class="batch-tip" v-if="batchItems.length > 50">
              单次最多查询50个，将自动截取前50个
            </span>
          </div>
          <el-button-group>
            <el-button @click="clearBatch">
              <el-icon><Delete /></el-icon>
              <span>清空</span>
            </el-button>
            <el-button @click="pasteFromClipboard">
              <el-icon><Document /></el-icon>
              <span>粘贴</span>
            </el-button>
            <el-button type="primary" :loading="loading" @click="handleBatchLookup">
              <el-icon><Search /></el-icon>
              <span>批量查询</span>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </el-card>

    <el-card v-if="singleResult" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>查询结果</span>
          <el-tag size="small" :type="singleResult.isLocal ? 'warning' : 'success'" class="header-tag">
            {{ singleResult.isLocal ? '内网地址' : '公网地址' }}
          </el-tag>
          <el-button size="small" text class="copy-btn" @click="copyResult(singleResult)">
            <el-icon><CopyDocument /></el-icon>
            <span>复制结果</span>
          </el-button>
        </div>
      </template>

      <div class="result-content">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="result-item primary">
              <div class="result-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <div class="result-info">
                <div class="result-label">IP地址</div>
                <div class="result-value">{{ singleResult.ip }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="result-item success">
              <div class="result-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="result-info">
                <div class="result-label">归属地</div>
                <div class="result-value">
                  {{ formatLocation(singleResult) }}
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <el-row :gutter="16">
          <el-col :span="8">
            <div class="info-item">
              <div class="info-label">国家/地区</div>
              <div class="info-value">
                {{ singleResult.country || '未知' }}
                <span class="info-sub" v-if="singleResult.countryCode">
                  ({{ singleResult.countryCode }})
                </span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <div class="info-label">省份/州</div>
              <div class="info-value">{{ singleResult.regionName || singleResult.region || '未知' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <div class="info-label">城市</div>
              <div class="info-value">{{ singleResult.city || '未知' }}</div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="16" class="info-row">
          <el-col :span="8">
            <div class="info-item">
              <div class="info-label">邮编</div>
              <div class="info-value">{{ singleResult.zip || '未知' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <div class="info-label">时区</div>
              <div class="info-value">{{ singleResult.timezone || '未知' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <div class="info-label">经纬度</div>
              <div class="info-value">
                {{ singleResult.latitude && singleResult.longitude 
                  ? `${singleResult.latitude}, ${singleResult.longitude}` 
                  : '未知' }}
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <el-row :gutter="16">
          <el-col :span="12">
            <div class="info-item highlight">
              <div class="info-label">运营商 (ISP)</div>
              <div class="info-value">{{ singleResult.isp || '未知' }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item highlight">
              <div class="info-label">组织 (ORG)</div>
              <div class="info-value">{{ singleResult.org || '未知' }}</div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="16" class="info-row">
          <el-col :span="24">
            <div class="info-item">
              <div class="info-label">AS号</div>
              <div class="info-value mono-font">{{ singleResult.as || '未知' }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card v-if="batchResults.length > 0" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataLine />
          </el-icon>
          <span>批量查询结果</span>
          <el-tag size="small" type="success" class="header-tag">
            共 {{ batchResults.length }} 条
          </el-tag>
          <el-button size="small" text class="copy-btn" @click="copyBatchResults">
            <el-icon><CopyDocument /></el-icon>
            <span>复制全部</span>
          </el-button>
        </div>
      </template>

      <div class="batch-table-wrapper">
        <el-table
          :data="batchResults"
          stripe
          border
          style="width: 100%"
          :max-height="500"
        >
          <el-table-column prop="ip" label="IP/域名" width="160">
            <template #default="{ row }">
              <span class="mono-font">{{ row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="归属地" min-width="180">
            <template #default="{ row }">
              <span>{{ formatLocation(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="city" label="城市" width="100" />
          <el-table-column prop="isp" label="运营商" min-width="160" />
          <el-table-column prop="org" label="组织" min-width="160" />
          <el-table-column prop="timezone" label="时区" width="180" />
          <el-table-column label="类型" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="row.isLocal ? 'warning' : (row.countryCode === 'ERR' ? 'danger' : 'success')">
                {{ row.countryCode === 'ERR' ? '失败' : (row.isLocal ? '内网' : '公网') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="copyResult(row)">
                复制
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card v-if="history.length > 0" class="history-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Clock />
          </el-icon>
          <span>查询历史</span>
          <el-button size="small" text type="danger" @click="clearHistory">
            清空记录
          </el-button>
        </div>
      </template>

      <div class="history-list">
        <div class="history-item" v-for="(item, index) in displayHistory" :key="index">
          <div class="history-main">
            <span class="history-ip mono-font">{{ item.ip }}</span>
            <span class="history-location">{{ formatLocation(item.result) }}</span>
            <el-tag size="small" :type="item.result.isLocal ? 'warning' : 'success'">
              {{ item.result.isLocal ? '内网' : '公网' }}
            </el-tag>
          </div>
          <div class="history-meta">
            <span class="history-time">{{ formatTime(item.time) }}</span>
          </div>
          <div class="history-actions">
            <el-button size="small" text @click="loadHistoryItem(item)">
              <el-icon><Refresh /></el-icon>
              <span>查看</span>
            </el-button>
          </div>
        </div>
      </div>
      <div class="history-footer" v-if="history.length > 20">
        <el-button text size="small" @click="showAllHistory = !showAllHistory">
          {{ showAllHistory ? '收起' : `查看全部 ${history.length} 条记录` }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Location,
  InfoFilled,
  Search,
  List,
  Monitor,
  QuestionFilled,
  User,
  Delete,
  Document,
  DataLine,
  CopyDocument,
  Clock,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ipLookupApi, type IpLookupResult } from '@/api/ipLookup'

interface HistoryItem {
  ip: string
  result: IpLookupResult
  time: string
}

const STORAGE_KEY = 'ip_lookup_history'

const queryMode = ref<'single' | 'batch'>('single')
const singleInput = ref('')
const batchInput = ref('')
const loading = ref(false)
const singleResult = ref<IpLookupResult | null>(null)
const batchResults = ref<IpLookupResult[]>([])
const history = ref<HistoryItem[]>([])
const showAllHistory = ref(false)

const quickExamples = [
  '8.8.8.8',
  '1.1.1.1',
  'google.com',
  'baidu.com',
  '192.168.1.1'
]

const batchItems = computed(() => {
  return batchInput.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

const displayHistory = computed(() => {
  const reversed = history.value.slice().reverse()
  if (showAllHistory.value) {
    return reversed
  }
  return reversed.slice(0, 20)
})

const formatLocation = (result: IpLookupResult) => {
  const parts = [result.country, result.regionName || result.region, result.city]
  return parts.filter(p => p && p !== '未知').join(' / ') || '未知'
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadHistoryFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

const addToHistory = (result: IpLookupResult) => {
  const exists = history.value.findIndex(h => h.ip === result.ip)
  if (exists > -1) {
    history.value.splice(exists, 1)
  }
  
  history.value.push({
    ip: result.ip,
    result,
    time: new Date().toISOString()
  })
  
  if (history.value.length > 100) {
    history.value = history.value.slice(-100)
  }
  
  saveHistory()
}

const handleSingleLookup = async () => {
  if (!singleInput.value.trim()) {
    ElMessage.warning('请输入IP地址或域名')
    return
  }
  
  loading.value = true
  singleResult.value = null
  batchResults.value = []
  
  try {
    const { data } = await ipLookupApi.lookup(singleInput.value.trim())
    singleResult.value = data
    addToHistory(data)
    ElMessage.success('查询成功')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleBatchLookup = async () => {
  const items = batchItems.value
  if (items.length === 0) {
    ElMessage.warning('请输入至少一个IP地址或域名')
    return
  }
  
  if (items.length > 50) {
    ElMessage.warning(`输入了 ${items.length} 项，将仅查询前 50 项`)
  }
  
  loading.value = true
  singleResult.value = null
  batchResults.value = []
  
  try {
    const lookupItems = items.slice(0, 50)
    const { data } = await ipLookupApi.batchLookup(lookupItems)
    batchResults.value = data
    
    data.forEach(r => {
      if (r.countryCode !== 'ERR') {
        addToHistory(r)
      }
    })
    
    const successCount = data.filter(r => r.countryCode !== 'ERR').length
    ElMessage.success(`查询完成，成功 ${successCount} 条，失败 ${data.length - successCount} 条`)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '批量查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getMyIp = async () => {
  loading.value = true
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    singleInput.value = data.ip
    ElMessage.success(`已获取本机IP: ${data.ip}`)
  } catch {
    ElMessage.warning('无法自动获取本机IP，请手动输入')
  } finally {
    loading.value = false
  }
}

const clearBatch = () => {
  batchInput.value = ''
  batchResults.value = []
  ElMessage.success('已清空')
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      batchInput.value += (batchInput.value ? '\n' : '') + text
      ElMessage.success('已从剪贴板粘贴')
    } else {
      ElMessage.warning('剪贴板为空')
    }
  } catch {
    ElMessage.error('无法访问剪贴板，请手动粘贴')
  }
}

const copyResult = (result: IpLookupResult) => {
  const text = `【IP查询结果】
IP地址：${result.ip}
归属地：${formatLocation(result)}
国家：${result.country || '未知'} (${result.countryCode || '-'})
省份：${result.regionName || result.region || '未知'}
城市：${result.city || '未知'}
邮编：${result.zip || '未知'}
时区：${result.timezone || '未知'}
经纬度：${result.latitude && result.longitude ? `${result.latitude}, ${result.longitude}` : '未知'}
运营商：${result.isp || '未知'}
组织：${result.org || '未知'}
AS号：${result.as || '未知'}
类型：${result.isLocal ? '内网地址' : '公网地址'}`
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('结果已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const copyBatchResults = () => {
  const lines = batchResults.value.map(r => 
    `${r.ip}\t${formatLocation(r)}\t${r.city || ''}\t${r.isp || ''}\t${r.org || ''}\t${r.timezone || ''}`
  )
  const header = 'IP/域名\t归属地\t城市\t运营商\t组织\t时区'
  const text = [header, ...lines].join('\n')
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('批量结果已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const loadHistoryItem = (item: HistoryItem) => {
  queryMode.value = 'single'
  singleInput.value = item.ip
  singleResult.value = item.result
  batchResults.value = []
  ElMessage.success('已载入历史记录')
}

const clearHistory = () => {
  history.value = []
  saveHistory()
  ElMessage.success('历史记录已清空')
}

onMounted(() => {
  loadHistoryFromStorage()
})
</script>

<style scoped>
.ip-lookup {
  max-width: 1000px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
}

.lookup-card {
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

.copy-btn {
  margin-left: auto;
}

.query-mode-switch {
  margin-bottom: 24px;
}

.query-mode-switch :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-section {
  margin-bottom: 8px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.help-icon {
  color: #909399;
  cursor: help;
  font-size: 16px;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-field {
  flex: 1;
}

.quick-examples {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.example-label {
  font-size: 13px;
  color: #909399;
}

.example-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.example-tag:hover {
  color: #165DFF;
  border-color: #165DFF;
}

.text-input :deep(.el-textarea__inner) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-tip {
  font-size: 12px;
  color: #f56c6c;
}

.result-card {
  margin-bottom: 24px;
}

.result-content {
  padding: 4px 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.result-item.primary {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border: 1px solid #b3d8ff;
}

.result-item.success {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border: 1px solid #c2e7b0;
}

.result-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  flex-shrink: 0;
}

.result-item.primary .result-icon {
  background: linear-gradient(135deg, #409eff, #165DFF);
}

.result-item.success .result-icon {
  background: linear-gradient(135deg, #67c23a, #529e2e);
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.result-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  word-break: break-all;
}

.info-row {
  margin-top: 0;
}

.info-item {
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.info-item.highlight {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}

.info-sub {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  margin-left: 4px;
}

.mono-font {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.batch-table-wrapper {
  overflow-x: auto;
}

.batch-table-wrapper :deep(.el-table) {
  font-size: 13px;
}

.history-card {
  margin-bottom: 24px;
}

.history-card .card-header {
  justify-content: space-between;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #ebeef5;
  gap: 16px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.history-ip {
  font-weight: 600;
  color: #165DFF;
  min-width: 140px;
}

.history-location {
  font-size: 13px;
  color: #606266;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  display: flex;
  align-items: center;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.history-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
