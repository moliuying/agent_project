<template>
  <div class="code-deobfuscator">
    <el-card class="scope-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataBoard />
          </el-icon>
          <span>支持范围说明</span>
          <el-tag size="small" type="primary">粘贴前请先确认</el-tag>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="14">
          <div class="scope-section">
            <div class="scope-title">
              <el-icon :size="16" color="#165DFF"><Platform /></el-icon>
              <span>支持的编程语言</span>
            </div>
            <div class="language-list">
              <div class="language-item language-primary">
                <span class="language-name">JavaScript</span>
                <el-tag size="small" type="success" effect="dark">完全支持</el-tag>
                <span class="language-desc">eval/Function 包装、字符串编码、变量混淆等</span>
              </div>
              <div class="language-item language-support">
                <span class="language-name">TypeScript</span>
                <el-tag size="small" type="success">部分支持</el-tag>
                <span class="language-desc">编译为 JS 后的混淆代码可还原</span>
              </div>
              <div class="language-item language-support">
                <span class="language-name">HTML / CSS</span>
                <el-tag size="small" type="success">部分支持</el-tag>
                <span class="language-desc">HTML 实体、内联脚本编码可还原</span>
              </div>
              <div class="language-item language-partial">
                <span class="language-name">通用文本编码</span>
                <el-tag size="small" type="success">完全支持</el-tag>
                <span class="language-desc">Base64、Unicode、URL、Hex、HTML 实体编码</span>
              </div>
              <div class="language-item language-unsupport">
                <span class="language-name">Java / Python / C++ 等</span>
                <el-tag size="small" type="info">规划中</el-tag>
                <span class="language-desc">字符串编码类还原可部分支持，其他混淆暂不支持</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="10">
          <div class="scope-section">
            <div class="scope-title">
              <el-icon :size="16" color="#67c23a"><TrendCharts /></el-icon>
              <span>还原程度说明</span>
            </div>
            <div class="level-list">
              <div class="level-item">
                <div class="level-badge level-full">完全还原</div>
                <span>编码类混淆（Base64/Unicode/URL/Hex）可 100% 还原原始代码</span>
              </div>
              <div class="level-item">
                <div class="level-badge level-high">高程度还原</div>
                <span>eval/Function 包装、字符串拼接等可基本还原代码结构</span>
              </div>
              <div class="level-item">
                <div class="level-badge level-partial">部分还原</div>
                <span>变量名混淆、控制流平坦化等需人工辅助分析</span>
              </div>
              <div class="level-item">
                <div class="level-badge level-unsupport">暂不支持</div>
                <span>自定义混淆算法、强加密混淆需专业工具处理</span>
              </div>
            </div>
          </div>
          <div class="quick-tip">
            <el-icon :size="14" color="#e6a23c"><Warning /></el-icon>
            <span>不确定代码能否还原？先粘贴试试，工具会自动告诉你可还原程度</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="quick-demo-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <MagicStick />
          </el-icon>
          <span>快速体验</span>
          <span class="header-sub">点击任意示例一键加载并还原</span>
        </div>
      </template>
      <el-row :gutter="16" class="quick-demo-grid">
        <el-col :span="8" v-for="demo in quickDemos" :key="demo.key">
          <div class="demo-item" @click="loadAndRunSample(demo.type as ObfuscationType)">
            <div class="demo-header">
              <el-tag :type="demo.tagType" effect="dark" size="small">{{ demo.label }}</el-tag>
              <el-tag size="small" type="success" effect="plain">{{ demo.level }}</el-tag>
            </div>
            <div class="demo-before">
              <span class="demo-label">混淆代码：</span>
              <code>{{ demo.shortCode }}</code>
            </div>
            <div class="demo-arrow">
              <el-icon><ArrowDown /></el-icon>
            </div>
            <div class="demo-after">
              <span class="demo-label">还原结果：</span>
              <code class="demo-result">{{ demo.result }}</code>
            </div>
            <div class="demo-action">
              <el-button size="small" type="primary">
                <el-icon><VideoCamera /></el-icon>
                立即体验
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

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
        <el-step title="粘贴代码" description="粘贴经过混淆处理的代码，工具会立即自动检测" />
        <el-step title="查看检测" description="实时查看检测结果：支持的混淆类型和可还原程度" />
        <el-step title="一键还原" description="点击还原按钮，自动迭代多层混淆并展示过程" />
        <el-step title="查看结果" description="复制或下载还原后的代码，查看每一步转换记录" />
      </el-steps>
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
              随机示例
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
              <div class="editor-title">
                <span class="editor-label">混淆代码（输入）</span>
                <el-tooltip v-if="detectedLanguage" :content="`检测到：${detectedLanguage}`" placement="top">
                  <el-tag size="small" type="primary">{{ detectedLanguage }}</el-tag>
                </el-tooltip>
              </div>
              <div class="editor-actions">
                <el-tag v-if="inputCode.trim()" size="small" :type="inputCode.length > 10000 ? 'danger' : 'info'">
                  {{ inputCode.length }} 字符
                </el-tag>
              </div>
            </div>
            <el-input
              v-model="inputCode"
              type="textarea"
              :rows="18"
              placeholder="请粘贴经过混淆处理的代码...&#10;&#10;支持的混淆方式包括：&#10;• eval() / new Function() 包装&#10;• Base64 / Unicode / URL / Hex 编码&#10;• HTML 实体编码&#10;• 字符串拼接拆分&#10;• JSFuck / JJEncode 等"
              resize="vertical"
              class="code-textarea"
              @input="handleInputChange"
            />
            <div v-if="inputCode.trim()" class="detection-panel">
              <div class="detection-header">
                <el-icon :size="16" :color="detectionStatusColor">
                  <component :is="detectionStatusIcon" />
                </el-icon>
                <span class="detection-title">{{ detectionStatusText }}</span>
                <el-tag size="small" :type="detectionLevelType" effect="dark">{{ detectionLevelText }}</el-tag>
              </div>

              <div v-if="detectedTypes.length > 0" class="detection-types">
                <span class="detection-subtitle">检测到的混淆方式：</span>
                <div class="detection-tags">
                  <el-tooltip
                    v-for="(type, idx) in detectedTypesWithInfo"
                    :key="idx"
                    :content="type.description"
                    placement="top"
                  >
                    <el-tag
                      size="small"
                      :type="type.supported ? 'warning' : 'info'"
                      effect="light"
                      class="detected-tag"
                    >
                      {{ type.label }}
                      <el-icon v-if="type.supported" size="12" style="margin-left: 4px">
                        <CircleCheck />
                      </el-icon>
                      <el-icon v-else size="12" style="margin-left: 4px">
                        <Warning />
                      </el-icon>
                    </el-tag>
                  </el-tooltip>
                </div>
              </div>
              <div v-else class="detection-types">
                <span class="detection-subtitle">未检测到常见混淆特征</span>
                <p class="detection-hint">可能是明文代码、使用了自定义混淆算法，或内容不足以判断。可以尝试点击还原按钮查看结果。</p>
              </div>

              <div class="detection-actions">
                <el-button size="small" type="primary" @click="runDeobfuscation">
                  <el-icon><View /></el-icon>
                  立即还原
                </el-button>
                <el-button size="small" @click="clearAll">
                  <el-icon><Delete /></el-icon>
                  重新输入
                </el-button>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="editor-section">
            <div class="editor-header">
              <div class="editor-title">
                <span class="editor-label">还原结果（输出）</span>
                <el-tag v-if="outputCode.trim() && outputCode !== inputCode" size="small" type="success">已还原</el-tag>
                <el-tag v-else-if="outputCode.trim() && outputCode === inputCode" size="small" type="info">无变化</el-tag>
              </div>
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
              :rows="18"
              placeholder="还原后的代码将显示在这里...&#10;&#10;请先在左侧粘贴混淆代码，然后点击「立即还原」按钮。"
              resize="vertical"
              readonly
              class="code-textarea output"
            />
            <div v-if="transformations.length > 0" class="transformations">
              <el-icon :size="14" color="#67c23a"><CircleCheck /></el-icon>
              <span class="transformations-label">
                执行了 {{ transformations.length }} 次还原操作
              </span>
              <el-tag size="small" type="success">
                {{ formatReductionPercent }}% 优化率
              </el-tag>
            </div>
            <div v-else-if="outputCode.trim()" class="transformations transform-info">
              <el-icon :size="14" color="#909399"><InfoFilled /></el-icon>
              <span class="transformations-label">
                输出代码可能已是明文，无需额外转换
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

    <el-card class="obfuscation-types-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Grid />
          </el-icon>
          <span>支持的混淆类型详解</span>
          <el-tag size="small" type="success">点击卡片可加载示例</el-tag>
        </div>
      </template>
      <el-row :gutter="16" class="type-grid">
        <el-col :span="8" v-for="typeInfo in obfuscationTypesInfo" :key="typeInfo.key">
          <div class="type-item type-item-detailed" @click="loadSample(typeInfo.key as ObfuscationType)">
            <div class="type-item-header">
              <div class="type-icon" :style="{ background: typeInfo.color + '20', color: typeInfo.color }">
                <component :is="typeInfo.icon" />
              </div>
              <div class="type-item-title">
                <div class="type-name">{{ typeInfo.label }}</div>
                <div class="type-level">
                  <el-tag size="small" :type="typeInfo.levelType" effect="plain">{{ typeInfo.level }}</el-tag>
                </div>
              </div>
            </div>
            <div class="type-desc">{{ typeInfo.description }}</div>
            <div class="type-example">
              <div class="example-label">示例：</div>
              <code class="example-before">{{ typeInfo.example }}</code>
              <el-icon class="example-arrow"><ArrowRight /></el-icon>
              <code class="example-after">{{ typeInfo.restored }}</code>
            </div>
            <div class="type-action">
              <el-button size="small" type="primary" plain>
                <el-icon><VideoCamera /></el-icon>
                加载示例
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
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
  Money,
  DataBoard,
  Platform,
  TrendCharts,
  VideoCamera,
  ArrowDown,
  ArrowRight
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
  level: string
  levelType: 'success' | 'warning' | 'info' | 'primary'
  example: string
  restored: string
}

interface QuickDemo {
  key: string
  type: ObfuscationType
  label: string
  shortCode: string
  result: string
  level: string
  tagType: 'success' | 'warning' | 'info' | 'primary' | 'danger'
}

const obfuscationTypesInfo: TypeInfo[] = [
  {
    key: 'base64',
    label: 'Base64 编码',
    description: '将代码或字符串使用 Base64 算法编码，常见于简单的代码隐藏',
    icon: PictureFilled,
    color: '#409eff',
    level: '完全还原',
    levelType: 'success',
    example: 'YWxlcnQoJ0hlbGxvJyk=',
    restored: "alert('Hello')"
  },
  {
    key: 'unicode-escape',
    label: 'Unicode 转义',
    description: '字符用 \\uXXXX 格式表示，常用来隐藏中文字符和特殊字符',
    icon: Edit,
    color: '#67c23a',
    level: '完全还原',
    levelType: 'success',
    example: '\\u0061\\u006c\\u0065\\u0072\\u0074',
    restored: 'alert'
  },
  {
    key: 'url-encode',
    label: 'URL 编码',
    description: '百分号编码，每个字符用 %XX 表示，常见于脚本注入代码',
    icon: Link,
    color: '#e6a23c',
    level: '完全还原',
    levelType: 'success',
    example: '%61%6c%65%72%74',
    restored: 'alert'
  },
  {
    key: 'hex-escape',
    label: 'Hex 十六进制转义',
    description: '字符用 \\xXX 十六进制格式表示，常见于混淆脚本代码',
    icon: Histogram,
    color: '#f56c6c',
    level: '完全还原',
    levelType: 'success',
    example: '\\x61\\x6c\\x65\\x72\\x74',
    restored: 'alert'
  },
  {
    key: 'html-entity',
    label: 'HTML 实体编码',
    description: '使用 HTML 实体 &amp; &#123; 等表示字符，常见于网页内联脚本',
    icon: Document,
    color: '#909399',
    level: '完全还原',
    levelType: 'success',
    example: '&#97;&#108;&#101;&#114;&#116;',
    restored: 'alert'
  },
  {
    key: 'js-eval',
    label: 'eval() 包装',
    description: '将代码字符串用 eval() 包裹，执行时才解析运行',
    icon: Cpu,
    color: '#165DFF',
    level: '高度还原',
    levelType: 'primary',
    example: "eval('alert(1)')",
    restored: 'alert(1)'
  },
  {
    key: 'js-function-constructor',
    label: 'Function 构造',
    description: '通过 new Function() 构造函数动态创建并执行代码',
    icon: Tools,
    color: '#722ed1',
    level: '高度还原',
    levelType: 'primary',
    example: "new Function('alert(1)')()",
    restored: 'alert(1)'
  },
  {
    key: 'string-concat',
    label: '字符串拆分拼接',
    description: '将长字符串拆分成多段，用 + 号拼接，增加阅读难度',
    icon: RefreshLeft,
    color: '#13c2c2',
    level: '完全还原',
    levelType: 'success',
    example: "'He' + 'll' + 'o'",
    restored: "'Hello'"
  },
  {
    key: 'array-index-obfuscation',
    label: '数组索引混淆',
    description: '将字符串放入数组，通过索引和计算访问代码元素',
    icon: Money,
    color: '#eb2f96',
    level: '部分还原',
    levelType: 'warning',
    example: '_0xabc[0]',
    restored: '对应数组值'
  },
  {
    key: 'jsfuck',
    label: 'JSFuck 编码',
    description: '仅用 []()!+ 六个字符编写 JavaScript 代码',
    icon: DataLine,
    color: '#fa8c16',
    level: '部分还原',
    levelType: 'warning',
    example: '(!![]+[])[+!+[]]',
    restored: "'a'"
  },
  {
    key: 'jjencode',
    label: 'JJEncode 编码',
    description: '使用大量符号和变量名混淆，代码可读性极低',
    icon: Edit,
    color: '#2f54eb',
    level: '部分还原',
    levelType: 'warning',
    example: 'var _=~[];',
    restored: '解混淆结果'
  },
  {
    key: 'mixed',
    label: '多层混合混淆',
    description: '多种混淆方式叠加使用，如 Base64 + Unicode + eval',
    icon: Grid,
    color: '#8c8c8c',
    level: '自动迭代还原',
    levelType: 'info',
    example: '多层嵌套编码',
    restored: '自动逐层还原'
  }
]

const quickDemos: QuickDemo[] = [
  {
    key: 'unicode',
    type: 'unicode-escape',
    label: 'Unicode 转义',
    shortCode: '\\u0061\\u006c\\u0065\\u0072\\u0074(...)',
    result: "alert('Hello World')",
    level: '完全还原',
    tagType: 'success'
  },
  {
    key: 'base64',
    type: 'base64',
    label: 'Base64 编码',
    shortCode: 'ZXZhbCgnSGVsbG8nKQ==',
    result: "eval('Hello')",
    level: '完全还原',
    tagType: 'success'
  },
  {
    key: 'eval',
    type: 'js-eval',
    label: 'eval 包装',
    shortCode: "eval('alert(\"Hi\")')",
    result: 'alert("Hi")',
    level: '高度还原',
    tagType: 'primary'
  }
]

const inputCode = ref('')
const outputCode = ref('')
const processing = ref(false)
const formatOutput = ref(true)
const transformations = ref<TransformationRecord[]>([])
const detectedTypes = ref<string[]>([])
const detectedLanguage = ref('')

const supportedTypes: ObfuscationType[] = [
  'base64', 'unicode-escape', 'url-encode', 'hex-escape',
  'html-entity', 'js-eval', 'js-function-constructor', 'string-concat'
]

const partiallySupportedTypes: ObfuscationType[] = [
  'array-index-obfuscation', 'jsfuck', 'jjencode'
]

const sampleOptions = computed(() => {
  return obfuscationTypesInfo.map(t => ({
    value: t.key,
    label: `${t.label} - ${t.description}`
  }))
})

const detectedTypesWithInfo = computed(() => {
  return detectedTypes.value.map(typeLabel => {
    const typeKey = obfuscationTypesInfo.find(t => t.label === typeLabel)?.key
    const typeInfo = obfuscationTypesInfo.find(t => t.label === typeLabel)
    let supported = false
    if (typeKey) {
      if (supportedTypes.includes(typeKey as ObfuscationType)) supported = true
      else if (partiallySupportedTypes.includes(typeKey as ObfuscationType)) supported = true
    }
    return {
      label: typeLabel,
      description: typeInfo?.description || '',
      supported
    }
  })
})

const detectionStatusColor = computed(() => {
  if (!inputCode.value.trim()) return '#909399'
  const hasFullSupport = detectedTypes.value.some(t => {
    const key = obfuscationTypesInfo.find(ti => ti.label === t)?.key
    return key && supportedTypes.includes(key as ObfuscationType)
  })
  const hasPartial = detectedTypes.value.some(t => {
    const key = obfuscationTypesInfo.find(ti => ti.label === t)?.key
    return key && partiallySupportedTypes.includes(key as ObfuscationType)
  })
  if (hasFullSupport) return '#67c23a'
  if (hasPartial) return '#e6a23c'
  return '#909399'
})

const detectionStatusIcon = computed(() => {
  if (!inputCode.value.trim()) return InfoFilled
  if (detectedTypes.value.length > 0) return CircleCheck
  return Warning
})

const detectionStatusText = computed(() => {
  if (!inputCode.value.trim()) return '等待输入代码'
  if (detectedTypes.value.length > 0) return `检测到 ${detectedTypes.value.length} 种混淆特征`
  return '未检测到常见混淆特征'
})

const detectionLevelText = computed(() => {
  const hasFull = detectedTypes.value.some(t => {
    const key = obfuscationTypesInfo.find(ti => ti.label === t)?.key
    return key && supportedTypes.includes(key as ObfuscationType)
  })
  const hasPartial = detectedTypes.value.some(t => {
    const key = obfuscationTypesInfo.find(ti => ti.label === t)?.key
    return key && partiallySupportedTypes.includes(key as ObfuscationType)
  })
  if (hasFull && hasPartial) return '混合还原'
  if (hasFull) return '完全还原'
  if (hasPartial) return '部分还原'
  return '待检测'
})

const detectionLevelType = computed(() => {
  const hasFull = detectedTypes.value.some(t => {
    const key = obfuscationTypesInfo.find(ti => ti.label === t)?.key
    return key && supportedTypes.includes(key as ObfuscationType)
  })
  const hasPartial = detectedTypes.value.some(t => {
    const key = obfuscationTypesInfo.find(ti => ti.label === t)?.key
    return key && partiallySupportedTypes.includes(key as ObfuscationType)
  })
  if (hasFull && hasPartial) return 'warning'
  if (hasFull) return 'success'
  if (hasPartial) return 'warning'
  return 'info'
})

const formatReductionPercent = computed(() => {
  if (!inputCode.value.trim() || !outputCode.value.trim()) return 0
  const original = inputCode.value.length
  const result = outputCode.value.length
  const reduction = Math.max(0, Math.round((1 - result / original) * 100))
  return reduction
})

const detectLanguage = (code: string): string => {
  if (!code.trim()) return ''
  const trimmed = code.trim()
  if (/<script[\s>]/i.test(trimmed) || /<html/i.test(trimmed)) return 'HTML'
  if (/<\?php/i.test(trimmed)) return 'PHP'
  if (/^\s*(function|const|let|var|class|import|export)\s/.test(trimmed) ||
      /^\s*eval\s*\(/.test(trimmed) ||
      /\.js['"`]?$/m.test(trimmed)) return 'JavaScript'
  if (/(^|\s)def\s+\w+\s*\(/.test(trimmed) || /^\s*import\s+.+from\s+['"].*\.py/.test(trimmed)) return 'Python'
  if (/^\s*(public|private|protected)\s+(static\s+)?(class|void|int|String)\s/.test(trimmed)) return 'Java'
  if (/[{};]\s*$/.test(trimmed.slice(-5)) && !trimmed.includes('<')) return 'JavaScript'
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0) return '编码文本'
  if (/(%[0-9A-Fa-f]{2}){3,}/.test(trimmed)) return 'URL 编码'
  if (/\\u[0-9a-fA-F]{4}/.test(trimmed)) return 'Unicode 编码'
  return '未知'
}

const handleInputChange = () => {
  if (!inputCode.value.trim()) {
    detectedTypes.value = []
    detectedLanguage.value = ''
    return
  }
  const types = detectObfuscationTypes(inputCode.value)
  detectedTypes.value = types.map(t => getObfuscationLabel(t))
  detectedLanguage.value = detectLanguage(inputCode.value)
}

const loadAndRunSample = (type: ObfuscationType) => {
  const sample = generateSampleObfuscatedCode(type)
  if (sample) {
    inputCode.value = sample
    handleInputChange()
    setTimeout(() => {
      runDeobfuscation()
    }, 200)
  }
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
    ElMessage.success(`检测到 ${detectedTypes.value.length} 种可能的混淆方式，${detectionLevelText.value}`)
  } else {
    ElMessage.info('未检测到常见的混淆特征')
  }
}

const clearAll = () => {
  inputCode.value = ''
  outputCode.value = ''
  transformations.value = []
  detectedTypes.value = []
  detectedLanguage.value = ''
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

.scope-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%);
}

.scope-section {
  margin-bottom: 8px;
}

.scope-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.language-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.language-primary {
  border-left: 4px solid #67c23a;
}

.language-support {
  border-left: 4px solid #409eff;
}

.language-partial {
  border-left: 4px solid #165DFF;
}

.language-unsupport {
  border-left: 4px solid #dcdfe6;
}

.language-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  min-width: 100px;
}

.language-desc {
  font-size: 12px;
  color: #606266;
  flex: 1;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #606266;
}

.level-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  min-width: 70px;
  text-align: center;
}

.level-full {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.level-high {
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
}

.level-partial {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.level-unsupport {
  background: #f4f4f5;
  color: #909399;
  border: 1px solid #e9e9eb;
}

.quick-tip {
  margin-top: 16px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px dashed #e6a23c;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e6a23c;
}

.quick-demo-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%);
}

.header-sub {
  font-size: 13px;
  font-weight: normal;
  color: #606266;
  margin-left: 12px;
}

.quick-demo-grid {
  display: flex;
  flex-wrap: wrap;
}

.demo-item {
  padding: 16px;
  background: #fff;
  border-radius: 10px;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.demo-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #67c23a;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.demo-before,
.demo-after {
  padding: 8px 10px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.demo-after {
  background: #f0f9eb;
}

.demo-label {
  font-size: 11px;
  color: #909399;
  margin-right: 4px;
  font-weight: 500;
}

.demo-before code {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  color: #c0392b;
  word-break: break-all;
  font-size: 11px;
}

.demo-after code {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  color: #27ae60;
  word-break: break-all;
  font-size: 11px;
  font-weight: 600;
}

.demo-arrow {
  text-align: center;
  color: #909399;
  margin: 4px 0;
}

.demo-action {
  margin-top: 10px;
  text-align: right;
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

.type-item-detailed {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.type-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-item-title {
  flex: 1;
}

.type-level {
  margin-top: 2px;
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
  color: #606266;
  margin-top: 2px;
  line-height: 1.5;
}

.type-example {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 11px;
}

.example-label {
  color: #909399;
  font-weight: 500;
}

.example-arrow {
  color: #909399;
}

.example-before,
.example-after {
  font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.example-before {
  background: #fef0f0;
  color: #c0392b;
}

.example-after {
  background: #f0f9eb;
  color: #27ae60;
  font-weight: 600;
}

.type-action {
  text-align: right;
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

.editor-title {
  display: flex;
  align-items: center;
  gap: 8px;
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

.detection-panel {
  margin-top: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.detection-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #ebeef5;
}

.detection-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.detection-types {
  margin-bottom: 12px;
}

.detection-subtitle {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}

.detection-hint {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

.detection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detected-tag {
  margin-right: 0;
}

.detection-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
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
  flex-wrap: wrap;
}

.transform-info {
  background: #f4f4f5;
  border-color: #e9e9eb;
}

.transform-info .transformations-label {
  color: #909399;
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
