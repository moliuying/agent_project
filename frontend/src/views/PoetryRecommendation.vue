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

    <el-card class="inspiration-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#eb2f96">
            <MagicStick />
          </el-icon>
          <span>灵感发现</span>
          <el-tag size="small" type="danger" effect="light" style="margin-left: auto">
            小众佳作 · 拓展视野
          </el-tag>
          <el-button size="small" type="primary" link :icon="Refresh" @click="loadInspiration">
            换一批
          </el-button>
        </div>
      </template>
      <p class="inspiration-tip">
        从 400+ 首诗词中随机发掘冷门佳作与小众作者的作品，每首都附有创作灵感解读，助你突破名篇束缚，寻找新的表达角度。
      </p>
      <div class="inspiration-grid" v-loading="inspirationLoading">
        <div
          v-for="poem in inspirationPoems"
          :key="poem.id"
          class="inspiration-card-item"
          @click="viewPoem(poem)"
        >
          <div class="inspiration-card-header">
            <h4 class="inspiration-poem-title">{{ poem.title }}</h4>
            <el-tag size="small" effect="dark" :type="fameTagType(poem.fameLevel)">
              {{ fameLabel(poem.fameLevel) }}
            </el-tag>
          </div>
          <div class="inspiration-poem-meta">
            <el-tag size="small" type="warning" effect="light">{{ poem.dynasty }}</el-tag>
            <span class="inspiration-author">{{ poem.author }}</span>
            <el-tag size="small" type="info" effect="plain">{{ categoryNames[poem.category] }}</el-tag>
          </div>
          <div class="inspiration-poem-text">
            <p v-for="(line, li) in poem.content.split('\n').slice(0, 2)" :key="li" class="inspiration-line">
              {{ line }}
            </p>
            <span v-if="poem.content.split('\n').length > 2" class="inspiration-ellipsis">……</span>
          </div>
          <div class="inspiration-poem-tags">
            <el-tag v-for="t in poem.tags.slice(0, 3)" :key="t" size="small" effect="plain">{{ t }}</el-tag>
          </div>
          <div v-if="poem.inspiration" class="inspiration-poem-inspire">
            <el-icon :size="14" color="#eb2f96"><MagicStick /></el-icon>
            <span>{{ poem.inspiration.slice(0, 50) }}{{ poem.inspiration.length > 50 ? '…' : '' }}</span>
          </div>
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
        <div class="fame-filter">
          <span class="fame-filter-label">作品范围：</span>
          <el-radio-group v-model="fameMode" size="default" @change="handleFameChange">
            <el-radio-button value="all">全部作品</el-radio-button>
            <el-radio-button value="classic">经典名篇</el-radio-button>
            <el-radio-button value="hidden">冷门佳作</el-radio-button>
            <el-radio-button value="niche">小众深度</el-radio-button>
          </el-radio-group>
          <el-tooltip
            content="经典名篇：家喻户晓的作品（适合入门）；冷门佳作：有一定文学价值但流传不广；小众深度：小众作者或深度作品（适合进阶用户）"
            placement="top"
          >
            <el-icon class="fame-help"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
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
                  <el-tag
                    size="small"
                    :type="fameTagType(poem.fameLevel)"
                    effect="dark"
                  >
                    {{ fameLabel(poem.fameLevel) }}
                  </el-tag>
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

            <div class="poem-expand-hint" v-if="poem.translation || poem.appreciation || poem.inspiration">
              <span>{{ expandedPoem === poem.id ? '收起详情' : '点击展开译文、赏析与灵感' }}</span>
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
              <div class="detail-section inspiration-section" v-if="poem.inspiration">
                <h4 class="detail-title inspiration-title">
                  <el-icon><MagicStick /></el-icon>
                  创作灵感
                </h4>
                <p class="detail-text">{{ poem.inspiration }}</p>
              </div>
              <div class="related-tools">
                <el-button
                  size="small"
                  type="primary"
                  plain
                  :icon="Connection"
                  @click.stop="showRelatedTheme(poem)"
                >
                  同题异构
                </el-button>
                <el-tooltip content="点击诗中的关键词或输入意象，探索相关作品">
                  <el-button
                    size="small"
                    type="warning"
                    plain
                    :icon="Share"
                    @click.stop="imageryPromptPoem = poem; showImageryDialog = true"
                  >
                    意象联想
                  </el-button>
                </el-tooltip>
              </div>
              <div class="related-list" v-if="relatedThemePoems.length > 0 && relatedThemeFor === poem.id">
                <el-divider content-position="left">同题异构 · 相似主题作品</el-divider>
                <div class="related-grid">
                  <div
                    v-for="rp in relatedThemePoems"
                    :key="rp.id"
                    class="related-item"
                    @click.stop="viewPoem(rp)"
                  >
                    <div class="related-title">{{ rp.title }}</div>
                    <div class="related-meta">
                      <el-tag size="small" type="warning" effect="light">{{ rp.dynasty }}</el-tag>
                      <span>{{ rp.author }}</span>
                      <el-tag size="small" effect="plain" :type="fameTagType(rp.fameLevel)">{{ fameLabel(rp.fameLevel) }}</el-tag>
                    </div>
                    <p class="related-preview">{{ rp.content.split('\n')[0].slice(0, 18) }}...</p>
                  </div>
                </div>
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
            <el-tag
              size="small"
              effect="plain"
              :type="fameTagType(poem.fameLevel)"
            >
              {{ fameLabel(poem.fameLevel) }}
            </el-tag>
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

    <el-dialog
      v-model="showImageryDialog"
      title="意象联想"
      width="720px"
      destroy-on-close
    >
      <div v-if="imageryPromptPoem" class="imagery-source">
        <span class="imagery-source-label">当前诗词：</span>
        <el-tag size="small" type="warning">{{ imageryPromptPoem.dynasty }}</el-tag>
        <strong>{{ imageryPromptPoem.author }}</strong>
        <span>·</span>
        <em>{{ imageryPromptPoem.title }}</em>
      </div>
      <div class="imagery-search-row">
        <el-input
          v-model="imageryKeyword"
          placeholder="输入意象关键词，如：月亮、梅花、雨、酒、雁、梧桐..."
          clearable
          size="large"
          @keyup.enter="searchImagery"
        >
          <template #append>
            <el-button type="primary" :icon="Search" :loading="imageryLoading" @click="searchImagery">
              联想
            </el-button>
          </template>
        </el-input>
      </div>
      <p class="imagery-tip">
        💡 意象是诗词的灵魂。常见意象：月、梅、柳、雁、蝉、梧桐、芭蕉、夕阳、流水、落花、酒、剑、笛、雁门、阑干、东篱、长亭…
      </p>
      <div v-loading="imageryLoading" class="imagery-result">
        <el-empty v-if="!imageryLoading && imageryResults.length === 0" description="输入意象关键词探索相关作品" />
        <div v-else class="imagery-grid">
          <div
            v-for="p in imageryResults"
            :key="p.id"
            class="imagery-item"
            @click="viewPoem(p); showImageryDialog = false"
          >
            <div class="imagery-item-title">{{ p.title }}</div>
            <div class="imagery-item-meta">
              <el-tag size="small" type="warning" effect="light">{{ p.dynasty }}</el-tag>
              <span>{{ p.author }}</span>
              <el-tag size="small" effect="plain" :type="fameTagType(p.fameLevel)">{{ fameLabel(p.fameLevel) }}</el-tag>
            </div>
            <p class="imagery-item-preview">{{ p.content.split('\n')[0].slice(0, 20) }}…</p>
          </div>
        </div>
      </div>
    </el-dialog>
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
  Grid,
  QuestionFilled,
  MagicStick,
  Refresh,
  Connection,
  Share
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
const fameMode = ref<'all' | 'classic' | 'hidden' | 'niche'>('all')

const inspirationPoems = ref<Poem[]>([])
const inspirationLoading = ref(false)

const relatedThemePoems = ref<Poem[]>([])
const relatedThemeFor = ref<number | null>(null)

const showImageryDialog = ref(false)
const imageryPromptPoem = ref<Poem | null>(null)
const imageryKeyword = ref('')
const imageryResults = ref<Poem[]>([])
const imageryLoading = ref(false)

const fameRange = computed<[number, number]>(() => {
  switch (fameMode.value) {
    case 'classic':
      return [4, 5]
    case 'hidden':
      return [2, 3]
    case 'niche':
      return [1, 2]
    default:
      return [1, 5]
  }
})

const fameLabel = (level: number): string => {
  if (level >= 5) return '经典'
  if (level >= 4) return '名篇'
  if (level >= 3) return '佳作'
  if (level >= 2) return '冷门'
  return '小众'
}

const fameTagType = (level: number): '' | 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  if (level >= 5) return 'danger'
  if (level >= 4) return 'warning'
  if (level >= 3) return 'success'
  if (level >= 2) return 'info'
  return 'primary'
}

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
  const [minFame, maxFame] = fameRange.value
  list = list.filter(p => p.fameLevel >= minFame && p.fameLevel <= maxFame)

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
    const [minFame, maxFame] = fameRange.value
    const res = await poetryApi.recommend(query.value.trim(), 8, minFame, maxFame)
    results.value = res.data
    if (results.value.length === 0) {
      ElMessage.info('未找到匹配的诗词，试试其他描述或扩大作品范围')
    }
  } catch (e) {
    ElMessage.error('推荐失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleFameChange = () => {
  if (query.value.trim()) {
    handleSearch()
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

const loadInspiration = async () => {
  inspirationLoading.value = true
  try {
    const res = await poetryApi.getInspiration(6)
    inspirationPoems.value = res.data
  } catch (e) {
    ElMessage.error('获取灵感推荐失败')
  } finally {
    inspirationLoading.value = false
  }
}

const showRelatedTheme = async (poem: Poem) => {
  if (relatedThemeFor.value === poem.id && relatedThemePoems.value.length > 0) {
    relatedThemeFor.value = null
    relatedThemePoems.value = []
    return
  }
  try {
    const res = await poetryApi.getRelatedByTheme(poem.id, 5)
    relatedThemePoems.value = res.data
    relatedThemeFor.value = poem.id
    if (res.data.length === 0) {
      ElMessage.info('暂未找到同题异构的作品')
    }
  } catch (e) {
    ElMessage.error('获取同题作品失败')
  }
}

const searchImagery = async () => {
  if (!imageryKeyword.value.trim()) {
    ElMessage.warning('请输入意象关键词')
    return
  }
  imageryLoading.value = true
  try {
    const res = await poetryApi.getRelatedByImagery(imageryKeyword.value.trim(), 12)
    imageryResults.value = res.data
    if (res.data.length === 0) {
      ElMessage.info('未找到包含该意象的诗词，试试其他关键词')
    }
  } catch (e) {
    ElMessage.error('意象联想失败')
  } finally {
    imageryLoading.value = false
  }
}

onMounted(async () => {
  try {
    const [tagsRes, dynastiesRes, poemsRes, inspRes] = await Promise.all([
      poetryApi.getQuickTags(),
      poetryApi.getDynasties(),
      poetryApi.getAll(),
      poetryApi.getInspiration(6)
    ])
    quickTags.value = tagsRes.data
    dynasties.value = dynastiesRes.data
    allPoems.value = poemsRes.data
    browseTotal.value = poemsRes.data.length
    inspirationPoems.value = inspRes.data
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
.browse-card,
.inspiration-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  width: 100%;
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

.fame-filter {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.fame-filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.fame-help {
  color: #909399;
  cursor: help;
  font-size: 16px;
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

.inspiration-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #fff5f7 0%, #faf5ff 100%);
}

.inspiration-tip {
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.inspiration-card-item {
  padding: 18px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #fce7f3;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.inspiration-card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(235, 47, 150, 0.12);
  border-color: #eb2f96;
}

.inspiration-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.inspiration-poem-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #831843;
}

.inspiration-poem-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.inspiration-author {
  font-weight: 500;
}

.inspiration-poem-text {
  margin-bottom: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fff1f2 0%, #faf5ff 100%);
  border-radius: 6px;
  border-left: 3px solid #eb2f96;
}

.inspiration-line {
  margin: 0;
  font-size: 15px;
  color: #1f2937;
  line-height: 1.9;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.inspiration-ellipsis {
  color: #9ca3af;
  font-size: 13px;
}

.inspiration-poem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.inspiration-poem-inspire {
  margin-top: auto;
  padding: 10px 12px;
  background: #fdf2f8;
  border-radius: 6px;
  font-size: 13px;
  color: #9d174d;
  line-height: 1.6;
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.related-tools {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #e5e7eb;
}

.inspiration-title,
.inspiration-section .detail-title {
  color: #eb2f96;
}

.related-list {
  margin-top: 16px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.related-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  border-color: #165DFF;
  background: #eff6ff;
  transform: translateY(-2px);
}

.related-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.related-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.related-preview {
  margin: 0;
  font-size: 12px;
  color: #4b5563;
  font-family: 'Noto Serif SC', serif;
  line-height: 1.5;
}

.imagery-source {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fff7ed;
  border-radius: 8px;
  font-size: 14px;
  color: #92400e;
}

.imagery-source-label {
  margin-right: 4px;
  color: #78350f;
  font-weight: 500;
}

.imagery-search-row {
  margin-bottom: 10px;
}

.imagery-tip {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.imagery-result {
  min-height: 120px;
}

.imagery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.imagery-item {
  padding: 12px 14px;
  background: linear-gradient(135deg, #fefce8 0%, #fff7ed 100%);
  border-radius: 8px;
  border: 1px solid #fde68a;
  cursor: pointer;
  transition: all 0.2s;
}

.imagery-item:hover {
  transform: translateY(-2px);
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.imagery-item-title {
  font-size: 16px;
  font-weight: 600;
  color: #78350f;
  margin-bottom: 6px;
}

.imagery-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #78716c;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.imagery-item-preview {
  margin: 0;
  font-size: 13px;
  color: #44403c;
  font-family: 'Noto Serif SC', serif;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .browse-poem-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .inspiration-grid {
    grid-template-columns: 1fr;
  }

  .imagery-grid {
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
