<template>
  <div class="excel-formula-page">
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
        <el-step title="描述您的问题" description="例如：统计各部门销售总额、根据学号查找姓名" />
        <el-step title="获取智能推荐" description="系统自动分析需求，匹配最适合的Excel函数" />
        <el-step title="查看函数详情" description="了解语法、参数说明和使用场景" />
        <el-step title="复制示例公式" description="一键复制，直接替换单元格引用即可使用" />
      </el-steps>
    </el-card>

    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <DataBoard />
          </el-icon>
          <span>Excel 公式智能查询</span>
          <el-tag size="small" type="success" class="header-tag">内置 30+ 常用函数</el-tag>
        </div>
      </template>

      <div class="search-section">
        <div class="search-label">
          <el-icon color="#606266"><EditPen /></el-icon>
          <span>用自然语言描述您想解决的数据问题：</span>
        </div>
        <div class="search-input-wrap">
          <el-input
            v-model="searchQuery"
            size="large"
            placeholder="例如：统计华东区域销售额大于1000的订单合计、根据产品编码查找价格、计算员工年龄..."
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" :icon="Search" @click="handleSearch" :loading="searching">
                智能匹配
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="quick-scenarios">
          <span class="scenario-label">快速场景：</span>
          <el-tag
            v-for="scene in quickScenarios"
            :key="scene"
            size="small"
            class="scenario-tag"
            @click="applyScenario(scene)"
          >
            {{ scene }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <el-card v-if="recommendation" class="recommend-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#67c23a">
            <MagicStick />
          </el-icon>
          <span>智能推荐方案</span>
          <el-tag size="small" type="success" v-if="recommendation.formulas.length > 0">
            匹配到 {{ recommendation.formulas.length }} 个相关函数
          </el-tag>
        </div>
      </template>

      <el-alert :title="recommendation.explanation" type="info" :closable="false" show-icon class="recommend-alert" />

      <div v-if="recommendation.steps.length > 0" class="steps-section">
        <h4>
          <el-icon color="#165DFF"><List /></el-icon>
          操作建议
        </h4>
        <ol class="steps-list">
          <li v-for="(step, idx) in recommendation.steps" :key="idx">{{ step }}</li>
        </ol>
      </div>
    </el-card>

    <el-card class="categories-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#e6a23c">
            <Grid />
          </el-icon>
          <span>按分类浏览</span>
          <el-tag size="small" type="info">共 {{ totalFormulaCount }} 个函数</el-tag>
        </div>
      </template>

      <el-row :gutter="16" class="category-grid">
        <el-col
          v-for="cat in categories"
          :key="cat.id"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="6"
        >
          <div
            class="category-card"
            :class="{ active: activeCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <div class="category-icon" :style="{ background: getCategoryColor(cat.id) }">
              <el-icon :size="24" color="#fff">
                <component :is="cat.icon" />
              </el-icon>
            </div>
            <div class="category-info">
              <div class="category-name">{{ cat.label }}</div>
              <div class="category-count">{{ cat.count }} 个函数</div>
              <div class="category-desc">{{ cat.description }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="results-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <Document />
          </el-icon>
          <span>{{ resultsTitle }}</span>
          <el-tag v-if="activeCategory" size="small" type="warning" closable @close="clearCategory">
            {{ categories.find(c => c.id === activeCategory)?.label }}
          </el-tag>
        </div>
      </template>

      <el-empty v-if="displayFormulas.length === 0" description="暂无匹配的函数，请尝试其他关键词或分类">
        <template #image>
          <el-icon :size="60" color="#c0c4cc">
            <Search />
          </el-icon>
        </template>
      </el-empty>

      <div v-else class="formula-list">
        <el-collapse v-model="activeFormulas">
          <el-collapse-item
            v-for="formula in displayFormulas"
            :key="formula.id"
            :name="formula.id"
          >
            <template #title>
              <div class="formula-title">
                <el-tag :type="getCategoryTagType(formula.category)" size="small" effect="light">
                  {{ categories.find(c => c.id === formula.category)?.label }}
                </el-tag>
                <span class="formula-name">{{ formula.name }}</span>
                <span class="formula-desc">{{ formula.description }}</span>
              </div>
            </template>

            <div class="formula-detail">
              <div class="detail-section">
                <h5>
                  <el-icon color="#165DFF"><Operation /></el-icon>
                  语法
                </h5>
                <div class="syntax-box">
                  <code>{{ formula.syntax }}</code>
                  <el-button size="small" text type="primary" @click="copyText(formula.syntax)">
                    <el-icon><CopyDocument /></el-icon>
                    复制语法
                  </el-button>
                </div>
              </div>

              <div v-if="formula.arguments.length > 0" class="detail-section">
                <h5>
                  <el-icon color="#67c23a"><Tickets /></el-icon>
                  参数说明
                </h5>
                <el-table :data="formula.arguments" size="small" border>
                  <el-table-column prop="name" label="参数名" width="140">
                    <template #default="{ row }">
                      <code class="param-name">{{ row.name }}</code>
                      <el-tag v-if="row.required" type="danger" size="small" effect="plain">必填</el-tag>
                      <el-tag v-else type="info" size="small" effect="plain">可选</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="说明" />
                </el-table>
              </div>

              <div class="detail-section">
                <h5>
                  <el-icon color="#e6a23c"><Star /></el-icon>
                  示例公式
                </h5>
                <div class="examples-list">
                  <div v-for="(ex, idx) in formula.examples" :key="idx" class="example-item">
                    <div class="example-header">
                      <span class="example-desc">
                        <el-tag size="small" type="info" effect="plain">{{ ex.scenario }}</el-tag>
                        {{ ex.description }}
                      </span>
                      <el-button size="small" type="primary" plain @click="copyText(ex.formula)">
                        <el-icon><CopyDocument /></el-icon>
                        复制公式
                      </el-button>
                    </div>
                    <div class="formula-box">
                      <code class="formula-code">{{ ex.formula }}</code>
                    </div>
                    <div v-if="ex.result" class="example-result">
                      <el-icon color="#67c23a"><CircleCheck /></el-icon>
                      结果示例：{{ ex.result }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="formula.tips.length > 0" class="detail-section">
                <h5>
                  <el-icon color="#f56c6c"><Warning /></el-icon>
                  使用提示
                </h5>
                <ul class="tips-list">
                  <li v-for="(tip, idx) in formula.tips" :key="idx">{{ tip }}</li>
                </ul>
              </div>

              <div v-if="formula.relatedFormulas.length > 0" class="detail-section">
                <h5>
                  <el-icon color="#722ed1"><Link /></el-icon>
                  相关函数
                </h5>
                <div class="related-tags">
                  <el-tag
                    v-for="rel in formula.relatedFormulas"
                    :key="rel"
                    size="small"
                    class="related-tag"
                    @click="jumpToFormula(rel)"
                  >
                    {{ rel }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Search,
  DataBoard,
  InfoFilled,
  MagicStick,
  Grid,
  Document,
  CopyDocument,
  Warning,
  Star,
  Tickets,
  Operation,
  CircleCheck,
  Link,
  List,
  EditPen
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { excelFormulaApi, type ExcelFormula, type FormulaCategory, type RecommendationResult } from '@/api/excelFormula'

const searchQuery = ref('')
const searching = ref(false)
const categories = ref<FormulaCategory[]>([])
const allFormulas = ref<ExcelFormula[]>([])
const displayFormulas = ref<ExcelFormula[]>([])
const activeCategory = ref<string>('')
const activeFormulas = ref<string[]>([])
const recommendation = ref<RecommendationResult | null>(null)

const quickScenarios = [
  '统计各部门销售总额',
  '根据学号查找学生姓名',
  '计算员工年龄',
  '统计成绩大于90分的人数',
  '去除文本中的空格',
  '计算10个工作日后的日期',
  '贷款月供计算',
  '数据按等级分级'
]

const totalFormulaCount = computed(() => allFormulas.value.length)

const resultsTitle = computed(() => {
  if (recommendation.value && searchQuery.value) {
    return `搜索结果："${searchQuery.value}"`
  }
  if (activeCategory.value) {
    return `${categories.value.find(c => c.id === activeCategory.value)?.label} 分类函数`
  }
  return '全部函数'
})

const getCategoryColor = (catId: string): string => {
  const colors: Record<string, string> = {
    math: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    date: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    logical: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    lookup: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    statistical: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    financial: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  }
  return colors[catId] || colors.math
}

const getCategoryTagType = (catId: string): any => {
  const types: Record<string, any> = {
    math: '',
    text: 'danger',
    date: 'primary',
    logical: 'success',
    lookup: 'warning',
    statistical: 'info',
    financial: ''
  }
  return types[catId] || ''
}

const applyScenario = (scene: string) => {
  searchQuery.value = scene
  handleSearch()
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    activeCategory.value = ''
    recommendation.value = null
    displayFormulas.value = allFormulas.value
    return
  }

  searching.value = true
  try {
    const [recRes, searchRes] = await Promise.all([
      excelFormulaApi.recommend(searchQuery.value),
      excelFormulaApi.search(searchQuery.value)
    ])
    recommendation.value = recRes.data
    displayFormulas.value = searchRes.data
    activeCategory.value = ''
    if (displayFormulas.value.length > 0) {
      activeFormulas.value = [displayFormulas.value[0].id]
    }
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

const selectCategory = async (catId: string) => {
  activeCategory.value = catId
  recommendation.value = null
  try {
    const { data } = await excelFormulaApi.getByCategory(catId)
    displayFormulas.value = data
    activeFormulas.value = []
    searchQuery.value = ''
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const clearCategory = () => {
  activeCategory.value = ''
  displayFormulas.value = allFormulas.value
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制到剪贴板')
  }
}

const jumpToFormula = (formulaName: string) => {
  const target = allFormulas.value.find(f =>
    f.name.toLowerCase() === formulaName.toLowerCase() ||
    f.id === formulaName.toLowerCase().replace(/\+/g, '-')
  )
  if (target) {
    searchQuery.value = target.name
    activeCategory.value = ''
    recommendation.value = null
    displayFormulas.value = [target]
    activeFormulas.value = [target.id]
    ElMessage.success(`已找到：${target.name}`)
  } else {
    ElMessage.info(`函数 ${formulaName} 暂未收录`)
  }
}

const loadInitialData = async () => {
  try {
    const [catRes, allRes] = await Promise.all([
      excelFormulaApi.getCategories(),
      excelFormulaApi.getAll()
    ])
    categories.value = catRes.data
    allFormulas.value = allRes.data
    displayFormulas.value = allRes.data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

onMounted(() => {
  loadInitialData()
})
</script>

<style scoped>
.excel-formula-page {
  max-width: 1100px;
  margin: 0 auto;
}

.guide-card {
  margin-bottom: 24px;
}

.guide-steps {
  padding: 10px 0;
}

.search-card {
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

.search-section {
  padding: 10px 0;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.search-input-wrap {
  margin-bottom: 16px;
}

.quick-scenarios {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.scenario-label {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.scenario-tag {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 12px;
}

.scenario-tag:hover {
  background-color: #165DFF;
  color: #fff;
  border-color: #165DFF;
}

.recommend-card {
  margin-bottom: 24px;
}

.recommend-alert {
  margin-bottom: 20px;
  font-size: 14px;
}

.steps-section h4 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #303133;
}

.steps-list {
  margin: 0;
  padding-left: 20px;
}

.steps-list li {
  padding: 6px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.categories-card {
  margin-bottom: 24px;
}

.category-grid {
  margin-top: 10px;
}

.category-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  background: #fff;
  margin-bottom: 16px;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: #e4e7ed;
}

.category-card.active {
  border-color: #165DFF;
  background: #f0f7ff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.category-count {
  font-size: 12px;
  color: #165DFF;
  margin-bottom: 4px;
}

.category-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.results-card {
  margin-bottom: 24px;
}

.formula-list {
  margin-top: 10px;
}

.formula-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.formula-name {
  font-size: 16px;
  font-weight: bold;
  color: #165DFF;
  font-family: 'Consolas', 'Monaco', monospace;
}

.formula-desc {
  font-size: 14px;
  color: #606266;
}

.formula-detail {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h5 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.syntax-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecef 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.syntax-box code {
  font-size: 15px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #165DFF;
  font-weight: 500;
  word-break: break-all;
}

.param-name {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #722ed1;
  margin-right: 6px;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-item {
  padding: 12px 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.example-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.formula-box {
  padding: 10px 14px;
  background: #001529;
  border-radius: 6px;
  overflow-x: auto;
}

.formula-code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: #52c41a;
  white-space: nowrap;
}

.example-result {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #67c23a;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  padding: 5px 0;
  font-size: 13px;
  color: #f56c6c;
  line-height: 1.6;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.related-tag:hover {
  background-color: #722ed1;
  color: #fff;
  border-color: #722ed1;
}

:deep(.el-collapse-item__header) {
  font-size: 15px;
  padding-left: 0;
  padding-right: 0;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: 1px solid #ebeef5;
}
</style>
