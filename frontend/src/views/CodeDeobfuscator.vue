<template>
  <div class="code-deobfuscator">
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
        <el-step title="粘贴代码" description="粘贴经过混淆处理的 JavaScript 或其他编码内容" />
        <el-step title="自动识别" description="工具自动检测混淆方式，支持多种编码类型" />
        <el-step title="还原代码" description="一键还原为可读代码，查看转换过程" />
        <el-step title="复制结果" description="复制还原后的代码，用于审计分析或调试" />
      </el-steps>
    </el-card>

    <el-card class="obfuscation-types-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Grid />
          </el-icon>
          <span>支持的混淆类型</span>
          <el-tag size="small" type="success">持续扩展中</el-tag>
        </div>
      </template>
      <el-row :gutter="16" class="type-grid">
        <el-col :span="6" v-for="typeInfo in obfuscationTypesInfo" :key="typeInfo.key">
          <div class="type-item" @click="loadSample(typeInfo.key as ObfuscationType)">
            <div class="type-icon" :style="{ background: typeInfo.color + '20', color: typeInfo.color }">
              <component :is="typeInfo.icon" />
            </div>
            <div class="type-info">
              <div class="type-name">{{ typeInfo.label }}</div>
              <div class="type-desc">{{ typeInfo.description }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="deobfuscator-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Monitor />
          </el-icon>
          <span>代码反混淆</span>
          <el-tag size="small" type="info" class="header-tag">支持自动迭代多层还原</el-tag>
        </div>
      </template>

      <div class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-label">快捷操作：</span>
          <el-button-group>
            <el-button size="small" @click="clearAll">
              <el-icon><Delete /></el-icon>
              清空内容
            </el-button>
            <el-button size="small" @click="pasteFromClipboard">
              <el-icon><Document /></el-icon>
              粘贴剪贴板
            </el-button>
            <el-button size="small" @click="loadSampleFromDropdown">
              <el-icon><MagicStick /></el-icon>
              加载示例
            </el-button>
          </el-button-group>
        </div>
        <div class="toolbar-right">
          <el-switch
            v-model="formatOutput"
            active-text="格式化"
            inactive-text="原样"
            size="small"
          />
        </div>
      </div>

      <el-row :gutter="16">
        <el-col :span="12">
          <div class="editor-section">
            <div class="editor-header">
              <span class="editor-label">混淆代码</span>
              <div class="editor-actions">
                <el-tag v-if="detectedTypes.length > 0" size="small" type="warning">
                  检测到 {{ detectedTypes.length }} 种混淆
                </el-tag>
                <el-tag v-else-if="inputCode.trim()" size="small" type="info">
                  {{ inputCode.length }} 字符
                </el-tag>
              </div>
            </div>
            <el-input
              v-model="inputCode"
              type="textarea"
              :rows="20"
              placeholder="请粘贴经过混淆处理的代码，例如：eval() 包装、Base64 编码、Unicode 转义、URL 编码、Hex 转义、HTML 实体、JSFuck、JJEncode 等..."
              resize="vertical"
              class="code-textarea"
              @input="handleInputChange"
            />
            <div v-if="detectedTypes.length > 0" class="detected-types">
              <el-icon :size="14" color="#e6a23c"><Warning /></el-icon>
              <span class="detected-label">检测到混淆方式：</span>
              <el-tag
                v-for="(type, idx) in detectedTypes"
                :key="idx"
                size="small"
                type="warning"
                effect="light"
                class="detected-tag"
              >
                {{ type }}
              </el-tag>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="editor-section">
            <div class="editor-header">
              <span class="editor-label">还原结果</span>
              <div class="editor-actions">
                <el-tag v-if="outputCode.trim()" size="small" type="success">
                  {{ outputCode.length }} 字符
                </el-tag>
                <el-button
                  size="small"
                  text
                  type="primary"
                  :disabled="!outputCode.trim()"
                  @click="copyOutput"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
                <el-button
                  size="small"
                  text
                  type="primary"
                  :disabled="!outputCode.trim()"
                  @click="downloadOutput"
                >
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
            <el-input
              v-model="outputCode"
              type="textarea"
              :rows="20"
              placeholder="还原后的代码将显示在这里..."
              resize="vertical"
              readonly
              class="code-textarea output"
            />
            <div v-if="transformations.length > 0" class="transformations">
              <el-icon :size="14" color="#67c23a"><CircleCheck /></el-icon>
              <span class="transformations-label">
                执行了 {{ transformations.length }} 次还原操作
              </span>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          :loading="processing"
          :disabled="!inputCode.trim()"
          @click="runDeobfuscation"
        >
          <el-icon><View /></el-icon>
          {{ processing ? '还原中...' : '一键还原代码' }}
        </el-button>
        <el-button
          size="large"
          :disabled="!inputCode.trim()"
          @click="detectOnly"
        >
          <el-icon><Search /></el-icon>
          仅检测混淆类型
        </el-button>
      </div>
    </el-card>

    <el-card v-if="transformations.length > 0" class="transformations-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Tickets />
          </el-icon>
          <span>还原过程记录</span>
          <el-tag size="small" type="success">{{ transformations.length }} 步</el-tag>
        </div>
      </template>
      <el-timeline class="timeline">
        <el-timeline-item
          v-for="(t, idx) in transformations"
          :key="idx"
          :timestamp="`第 ${idx + 1} 步`"
          placement="top"
          :type="getTransformationType(t.type)"
          :icon="getTransformationIcon(t.type)"
        >
          <el-card shadow="hover" class="transformation-card">
            <div class="transformation-header">
              <el-tag :type="getTransformationType(t.type)" effect="dark" size="small">
                {{ t.type }}
              </el-tag>
              <span class="transformation-desc">{{ t.description }}</span>
            </div>
            <el-descriptions v-if="t.before && t.after" :column="1" size="small" border>
              <el-descriptions-item label="还原前">
                <code class="code-inline">{{ t.before }}</code>
              </el-descriptions-item>
              <el-descriptions-item label="还原后">
                <code class="code-inline">{{ t.after }}</code>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-card class="security-tips-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#e6a23c">
            <WarningFilled />
          </el-icon>
          <span>安全提示</span>
        </div>
      </template>
      <el-alert type="warning" :closable="false" class="security-alert">
        <template #title>
          <strong>请勿直接执行未知来源的代码</strong>
        </template>
        本工具仅用于代码审计学习和合法的逆向分析。反混淆后的代码可能包含恶意逻辑，请在沙箱环境中仔细分析后再决定是否运行。
      </el-alert>
      <el-row :gutter="16" class="tips-grid">
        <el-col :span="8">
          <div class="tip-item">
            <el-icon :size="24" color="#f56c6c"><Lock /></el-icon>
            <div class="tip-content">
              <div class="tip-title">代码审计</div>
              <p class="tip-desc">分析可疑代码逻辑，识别漏洞和风险</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="tip-item">
            <el-icon :size="24" color="#409eff"><Search /></el-icon>
            <div class="tip-content">
              <div class="tip-title">逆向分析</div>
              <p class="tip-desc">理解混淆代码的真实意图和行为</p>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="tip-item">
            <el-icon :size="24" color="#67c23a"><Reading /></el-icon>
            <div class="tip-content">
              <div class="tip-title">学习研究</div>
              <p class="tip-desc">了解常见混淆技术，提升安全意识</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  InfoFilled,
  Grid,
  Monitor,
  Delete,
  Document,
  MagicStick,
  Warning,
  CopyDocument,
  Download,
  View,
  Search,
  Tickets,
  CircleCheck,
  WarningFilled,
  Lock,
  Reading,
  DataLine,
  Edit,
  Link,
  Histogram,
  Cpu,
  Tools,
  PictureFilled,
  RefreshLeft,
  Money
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  deobfuscate,
  detectObfuscationTypes,
  generateSampleObfuscatedCode,
  getObfuscationLabel,
  type TransformationRecord,
  type ObfuscationType
} from '@/utils/deobfuscator'

interface TypeInfo {
  key: string
  label: string
  description: string
  icon: any
  color: string
}

const obfuscationTypesInfo: TypeInfo[] = [
  { key: 'base64', label: 'Base64', description: 'Base64 字符串编码', icon: PictureFilled, color: '#409eff' },
  { key: 'unicode-escape', label: 'Unicode', description: '\\uXXXX 转义序列', icon: Edit, color: '#67c23a' },
  { key: 'url-encode', label: 'URL 编码', description: '%XX 百分号编码', icon: Link, color: '#e6a23c' },
  { key: 'hex-escape', label: 'Hex 转义', description: '\\xXX 十六进制', icon: Histogram, color: '#f56c6c' },
  { key: 'html-entity', label: 'HTML 实体', description: '&amp; &#123; 等', icon: Document, color: '#909399' },
  { key: 'js-eval', label: 'eval 包装', description: 'eval() 包裹代码', icon: Cpu, color: '#165DFF' },
  { key: 'js-function-constructor', label: 'Function', description: 'new Function() 构造', icon: Tools, color: '#722ed1' },
  { key: 'string-concat', label: '字符串拆分', description: '多段 + 拼接字符串', icon: RefreshLeft, color: '#13c2c2' },
  { key: 'array-index-obfuscation', label: '数组索引', description: '通过数组访问代码', icon: Money, color: '#eb2f96' },
  { key: 'jsfuck', label: 'JSFuck', description: '仅用 6 个字符编码', icon: DataLine, color: '#fa8c16' },
  { key: 'jjencode', label: 'JJEncode', description: '符号密集型编码', icon: Edit, color: '#2f54eb' },
  { key: 'mixed', label: '多层混合', description: '多种混淆叠加使用', icon: Grid, color: '#8c8c8c' }
]

const inputCode = ref('')
const outputCode = ref('')
const processing = ref(false)
const formatOutput = ref(true)
const transformations = ref<TransformationRecord[]>([])
const detectedTypes = ref<string[]>([])

const sampleOptions = computed(() => {
  return obfuscationTypesInfo.map(t => ({
    value: t.key,
    label: `${t.label} - ${t.description}`
  }))
})

const handleInputChange = () => {
  if (!inputCode.value.trim()) {
    detectedTypes.value = []
    return
  }
  const types = detectObfuscationTypes(inputCode.value)
  detectedTypes.value = types.map(t => getObfuscationLabel(t))
}

const runDeobfuscation = () => {
  if (!inputCode.value.trim()) {
    ElMessage.warning('请先输入混淆代码')
    return
  }

  processing.value = true

  setTimeout(() => {
    try {
      const result = deobfuscate(inputCode.value, {
        maxIterations: 10,
        formatCode: formatOutput.value
      })

      outputCode.value = result.code
      transformations.value = result.transformations
      detectedTypes.value = result.detectedObfuscationTypes

      if (result.transformations.length > 0) {
        ElMessage.success(`还原完成，执行了 ${result.transformations.length} 次转换`)
      } else if (result.code === inputCode.value) {
        ElMessage.info('未检测到可还原的混淆特征，代码可能已经是明文或使用了不支持的混淆方式')
      } else {
        ElMessage.success('代码格式化完成')
      }
    } catch (error) {
      console.error('Deobfuscation error:', error)
      ElMessage.error('还原过程中发生错误，请检查输入的代码')
    } finally {
      processing.value = false
    }
  }, 100)
}

const detectOnly = () => {
  if (!inputCode.value.trim()) {
    ElMessage.warning('请先输入混淆代码')
    return
  }

  handleInputChange()
  if (detectedTypes.value.length > 0) {
    ElMessage.success(`检测到 ${detectedTypes.value.length} 种可能的混淆方式`)
  } else {
    ElMessage.info('未检测到常见的混淆特征')
  }
}

const clearAll = () => {
  inputCode.value = ''
  outputCode.value = ''
  transformations.value = []
  detectedTypes.value = []
  ElMessage.success('已清空内容')
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      inputCode.value = text
      handleInputChange()
      ElMessage.success('已从剪贴板粘贴')
    } else {
      ElMessage.warning('剪贴板为空')
    }
  } catch (e) {
    ElMessage.error('无法访问剪贴板，请手动粘贴')
  }
}

const loadSample = (type: ObfuscationType) => {
  const sample = generateSampleObfuscatedCode(type)
  if (sample) {
    inputCode.value = sample
    handleInputChange()
    ElMessage.success(`已加载 ${getObfuscationLabel(type)} 示例`)
  }
}

const loadSampleFromDropdown = () => {
  const randomType = obfuscationTypesInfo[
    Math.floor(Math.random() * (obfuscationTypesInfo.length - 1))
  ].key as ObfuscationType
  loadSample(randomType)
}

const copyOutput = async () => {
  if (!outputCode.value.trim()) return
  try {
    await navigator.clipboard.writeText(outputCode.value)
    ElMessage.success('已复制还原结果到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const downloadOutput = () => {
  if (!outputCode.value.trim()) return

  const blob = new Blob([outputCode.value], { type: 'text/javascript;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `deobfuscated_${Date.now()}.js`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('文件已下载')
}

const getTransformationType = (type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    'base64': 'primary',
    'unicode-escape': 'success',
    'url-encode': 'warning',
    'hex-escape': 'danger',
    'html-entity': 'info',
    'js-eval': 'primary',
    'js-function-constructor': 'primary',
    'string-concat': 'success'
  }
  return typeMap[type] || 'info'
}

const getTransformationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'base64': PictureFilled,
    'unicode-escape': Edit,
    'url-encode': Link,
    'hex-escape': Histogram,
    'html-entity': Document,
    'js-eval': Cpu,
    'js-function-constructor': Tools,
    'string-concat': RefreshLeft
  }
  return iconMap[type] || CircleCheck
}
</script>

<style scoped>
.code-deobfuscator {
  max-width: 1400px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
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

.obfuscation-types-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
}

.type-grid {
  display: flex;
  flex-wrap: wrap;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.type-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #165DFF;
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.type-info {
  flex: 1;
  min-width: 0;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.type-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.deobfuscator-card {
  margin-bottom: 24px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.editor-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.editor-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-textarea :deep(.el-textarea__inner) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
  background: #1e1e1e;
  color: #d4d4d4;
  border-color: #3c3c3c;
}

.code-textarea.output :deep(.el-textarea__inner) {
  background: #1e293b;
  color: #e2e8f0;
}

.detected-types {
  margin-top: 12px;
  padding: 12px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.detected-label {
  font-size: 13px;
  color: #e6a23c;
  font-weight: 500;
}

.detected-tag {
  margin-right: 4px;
}

.transformations {
  margin-top: 12px;
  padding: 12px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.transformations-label {
  font-size: 13px;
  color: #67c23a;
  font-weight: 500;
}

.action-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.transformations-card {
  margin-bottom: 24px;
}

.timeline {
  padding: 10px 0;
}

.transformation-card {
  margin-bottom: 8px;
}

.transformation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.transformation-desc {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.code-inline {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  color: #c0392b;
  word-break: break-all;
}

.security-tips-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7cc 100%);
  border: 1px solid #ffe58f;
}

.security-alert {
  margin-bottom: 20px;
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
  border: 1px solid #ffe58f;
  margin-bottom: 16px;
  height: 100%;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.tip-desc {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}
</style>
