<template>
  <div class="poetry-recommendation">
    <el-card class="guide-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#722ed1">
            <Reading />
          </el-icon>
          <span>功能说明</span>
        </div>
      </template>
      <div class="guide-content">
        <p>描述你当前的心情、场景或需求（如"送别朋友"、"秋天思念"），我们将为你推荐匹配的诗词，帮助你在写文章、发朋友圈、表达情感时快速找到合适的诗句。</p>
        <el-divider content-position="left">快速选择</el-divider>
        <div class="quick-tags">
          <el-tag
            v-for="tag in quickTags"
            :key="tag.label"
            size="large"
            effect="light"
            class="quick-tag"
            :type="tagTypeMap[tag.label] || 'info'"
            @click="applyQuickTag(tag.label)"
            :effect="selectedQuickTag === tag.label ? 'dark' : 'light'"
          >
            {{ tag.label }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#165DFF">
            <Search />
          </el-icon>
          <span>诗词推荐</span>
        </div>
      </template>

      <div class="search-section">
        <el-input
          v-model="query"
          size="large"
          placeholder="描述你的心情、场景或需求，如：送别朋友、秋天思念、中秋望月..."
          clearable
          @keyup.enter="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Edit /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" :icon="Search" :loading="loading" @click="handleSearch">
              推荐诗词
            </el-button>
          </template>
        </el-input>
      </div>
    </el-card>

    <el-card v-loading="loading" class="result-card" v-if="results.length > 0 || loading">
      <template #header>
        <div class="card-header">
          <div class="result-title">
            <el-icon :size="20" color="#67c23a">
              <Collection />
            </el-icon>
            <span>推荐结果</span>
            <el-tag v-if="results.length > 0" size="small" type="success">
              共 {{ results.length }} 首
            </el-tag>
          </div>
        </div>
      </template>

      <div class="poem-list">
        <div
          v-for="(poem, index) in results"
          :key="poem.id"
          class="poem-item"
          :class="{ expanded: expandedPoem === poem.id }"
        >
          <div class="poem-rank">
            {{ index + 1 }}
          </div>
          <div class="poem-content-wrapper" @click="toggleExpand(poem.id)">
            <div class="poem-header">
              <div class="poem-title-row">
                <h3 class="poem-title">{{ poem.title }}</h3>
                <div class="poem-meta">
                  <el-tag size="small" type="warning">{{ poem.dynasty }}</el-tag>
                  <span class="poem-author">{{ poem.author }}</span>
                  <el-tag size="small" type="info">{{ categoryNames[poem.category] }}</el-tag>
                </div>
              </div>
              <div class="poem-tags" v-if="poem.matchReasons && poem.matchReasons.length > 0">
                <el-tag
                  v-for="(reason, idx) in poem.matchReasons.slice(0, 3)"
                  :key="idx"
                  size="small"
                  type="success"
                  effect="light"
                  class="match-tag"
                >
                  {{ reason }}
                </el-tag>
              </div>
            </div>

            <div class="poem-text">
              <p
                v-for="(line, lineIdx) in poem.content.split('\n')"
                :key="lineIdx"
                class="poem-line"
              >
                {{ line }}
              </p>
            </div>

            <div class="poem-expand-hint" v-if="poem.translation || poem.appreciation">
              <span>{{ expandedPoem === poem.id ? '收起详情' : '点击展开译文与赏析' }}</span>
              <el-icon :class="{ rotated: expandedPoem === poem.id }">
                <ArrowDown />
              </el-icon>
            </div>

            <div class="poem-detail" v-show="expandedPoem === poem.id">
              <el-divider />
              <div class="poem-tags-full">
                <span class="tags-label">标签：</span>
                <el-tag
                  v-for="tag in poem.tags"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="poem-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="detail-section" v-if="poem.translation">
                <h4 class="detail-title">
                  <el-icon><Document /></el-icon>
                  译文
                </h4>
                <p class="detail-text">{{ poem.translation }}</p>
              </div>
              <div class="detail-section" v-if="poem.appreciation">
                <h4 class="detail-title">
                  <el-icon><Star /></el-icon>
                  赏析
                </h4>
                <p class="detail-text">{{ poem.appreciation }}</p>
              </div>
            </div>
          </div>

          <div class="poem-actions">
            <el-button
              type="primary"
              link
              :icon="CopyDocument"
              @click.stop="copyPoem(poem)"
            >
              复制诗词
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && results.length === 0" description="暂无推荐结果，请尝试其他描述" />
    </el-card>

    <el-card class="browse-card" v-if="!loading && results.length === 0">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#eb2f96">
            <Grid />
          </el-icon>
          <span>诗词库浏览</span>
        </div>
      </template>

      <el-row :gutter="16" class="filter-row">
        <el-col :span="6">
          <el-select
            v-model="filterDynasty"
            placeholder="选择朝代"
            clearable
            @change="handleFilterChange"
            style="width: 100%"
          >
            <el-option
              v-for="d in dynasties"
              :key="d"
              :label="d"
              :value="d"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterCategory"
            placeholder="选择体裁"
            clearable
            @change="handleFilterChange"
            style="width: 100%"
          >
            <el-option
              v-for="(name, key) in categoryNames"
              :key="key"
              :label="name"
              :value="key"
            />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model="filterAuthor"
            placeholder="搜索诗人或关键词..."
            clearable
            @change="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <div class="browse-poem-grid">
        <div
          v-for="poem in browseList"
          :key="poem.id"
          class="browse-poem-card"
          @click="viewPoem(poem)"
        >
          <div class="browse-poem-title">{{ poem.title }}</div>
          <div class="browse-poem-meta">
            <el-tag size="small" type="warning" effect="light">{{ poem.dynasty }}</el-tag>
            <span>{{ poem.author }}</span>
          </div>
          <p class="browse-poem-preview">
            {{ poem.content.split('\n')[0].slice(0, 15) }}{{ poem.content.length > 15 ? '...' : '' }}
          </p>
          <div class="browse-poem-tags">
            <el-tag
              v-for="tag in poem.tags.slice(0, 3)"
              :key="tag"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-pagination
        v-if="browseTotal > pageSize"
        class="browse-pagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="browseTotal"
        :page-sizes="[8, 16, 32]"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="handleFilterChange"
        @current-change="handleFilterChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Reading,
  Search,
  Edit,
  Collection,
  ArrowDown,
  Document,
  Star,
  CopyDocument,
  Grid
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { poetryApi, type ScoredPoem, type Poem, type QuickTag } from '@/api/poetryRecommendation'

const loading = ref(false)
const query = ref('')
const results = ref<ScoredPoem[]>([])
const quickTags = ref<QuickTag[]>([])
const dynasties = ref<string[]>([])
const expandedPoem = ref<number | null>(null)

const filterDynasty = ref('')
const filterCategory = ref('')
const filterAuthor = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const allPoems = ref<Poem[]>([])

const selectedQuickTag = ref('')

const tagTypeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
  '送别朋友': 'primary',
  '秋天思念': 'warning',
  '春天写景': 'success',
  '爱情相思': 'danger',
  '中秋节': 'info',
  '思乡之情': 'primary',
  '励志进取': 'success',
  '山水田园': 'success',
  '母爱情深': 'danger',
  '忧国忧民': 'warning',
  '边塞豪情': 'primary',
  '孤独寂寞': 'info'
}

const categoryNames: Record<string, string> = {
  poem: '诗',
  ci: '词',
  song: '曲',
  fu: '赋'
}

const browseList = computed(() => {
  let list = [...allPoems.value]

  if (filterDynasty.value) {
    list = list.filter(p => p.dynasty === filterDynasty.value)
  }
  if (filterCategory.value) {
    list = list.filter(p => p.category === filterCategory.value)
  }
  if (filterAuthor.value) {
    const k = filterAuthor.value.toLowerCase()
    list = list.filter(p =>
      p.author.toLowerCase().includes(k) ||
      p.title.toLowerCase().includes(k) ||
      p.content.toLowerCase().includes(k)
    )
  }

  browseTotal.value = list.length
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const browseTotal = ref(0)

const applyQuickTag = (label: string) => {
  selectedQuickTag.value = label
  query.value = label
  handleSearch()
}

const handleSearch = async () => {
  if (!query.value.trim()) {
    ElMessage.warning('请输入心情、场景或需求描述')
    return
  }
  loading.value = true
  try {
    const res = await poetryApi.recommend(query.value.trim(), 6)
    results.value = res.data
    if (results.value.length === 0) {
      ElMessage.info('未找到匹配的诗词，试试其他描述')
    }
  } catch (e) {
    ElMessage.error('推荐失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const toggleExpand = (id: number) => {
  expandedPoem.value = expandedPoem.value === id ? null : id
}

const copyPoem = async (poem: Poem) => {
  const text = `${poem.title}\n【${poem.dynasty}】${poem.author}\n${poem.content}`
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const viewPoem = (poem: Poem) => {
  query.value = poem.title
  results.value = [{ ...poem, score: 100, matchReasons: ['从诗词库中选择'] }]
  expandedPoem.value = poem.id
}

const handleFilterChange = () => {
  currentPage.value = 1
}

onMounted(async () => {
  try {
    const [tagsRes, dynastiesRes, poemsRes] = await Promise.all([
      poetryApi.getQuickTags(),
      poetryApi.getDynasties(),
      poetryApi.getAll()
    ])
    quickTags.value = tagsRes.data
    dynasties.value = dynastiesRes.data
    allPoems.value = poemsRes.data
    browseTotal.value = poemsRes.data.length
  } catch (e) {
    console.error('初始化失败', e)
  }
})
</script>

<style scoped>
.poetry-recommendation {
  max-width: 1100px;
  margin: 0 auto;
}

.guide-card,
.search-card,
.result-card,
.browse-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.guide-content p {
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
  padding: 6px 14px;
  font-size: 14px;
}

.quick-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-input {
  max-width: 100%;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-title .el-tag {
  margin-left: 8px;
}

.poem-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.poem-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: 12px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.poem-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.poem-item.expanded {
  background: linear-gradient(135deg, #f0f5ff 0%, #fafbfc 100%);
}

.poem-rank {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #165DFF 0%, #4080ff 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.poem-content-wrapper {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.poem-header {
  margin-bottom: 12px;
}

.poem-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.poem-title {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
  font-weight: bold;
}

.poem-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.poem-author {
  font-size: 14px;
  color: #606266;
}

.poem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.match-tag {
  background: #f0f9eb;
}

.poem-text {
  margin: 12px 0;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border-left: 4px solid #165DFF;
}

.poem-line {
  margin: 0;
  font-size: 18px;
  line-height: 2.2;
  color: #1f2937;
  letter-spacing: 2px;
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
}

.poem-expand-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  transition: all 0.3s;
}

.poem-expand-hint .el-icon {
  transition: transform 0.3s;
}

.poem-expand-hint .el-icon.rotated {
  transform: rotate(180deg);
}

.poem-detail {
  margin-top: 12px;
}

.poem-tags-full {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.tags-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.poem-tag {
  margin-right: 4px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  font-size: 15px;
  color: #165DFF;
  font-weight: 600;
}

.detail-text {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.8;
  padding-left: 22px;
}

.poem-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.filter-row {
  margin-bottom: 24px;
}

.browse-poem-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.browse-poem-card {
  padding: 16px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: 10px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.25s;
}

.browse-poem-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: #165DFF;
}

.browse-poem-title {
  font-size: 17px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.browse-poem-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #606266;
}

.browse-poem-preview {
  margin: 0 0 10px;
  font-size: 13px;
  color: #4b5563;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  line-height: 1.6;
}

.browse-poem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.browse-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .browse-poem-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .poem-item {
    flex-direction: column;
  }

  .poem-actions {
    align-items: flex-start;
  }
}
</style>
