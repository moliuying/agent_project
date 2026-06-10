<template>
  <div class="home-page">
    <el-card class="welcome-card" shadow="never">
      <div class="hero-section">
        <div class="hero-content">
          <h1>在线工具平台</h1>
          <p class="hero-desc">精选 {{ totalTools }} 款实用小工具，助力高效工作与生活</p>
          <el-input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索工具名称、功能描述或标签..."
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <el-tabs
      v-model="activeCategory"
      class="category-tabs"
      type="card"
      stretch
      @tab-change="handleCategoryChange"
    >
      <el-tab-pane label="全部" name="all">
        <template #label>
          <span class="tab-label">
            <el-icon><Menu /></el-icon>
            <span>全部</span>
            <el-tag size="small" type="info" effect="plain">{{ totalTools }}</el-tag>
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane
        v-for="category in toolCategories"
        :key="category.id"
        :label="category.name"
        :name="category.id"
      >
        <template #label>
          <span class="tab-label">
            <el-icon :color="category.color"><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
            <el-tag size="small" type="info" effect="plain">{{ category.tools.length }}</el-tag>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div v-if="searchKeyword" class="search-result-header">
      <el-alert
        :title="'搜索 \"' + searchKeyword + '\" 找到 ' + filteredTools.length + ' 个工具'"
        type="success"
        :closable="false"
        show-icon
      />
    </div>

    <template v-else>
      <div v-if="activeCategory === 'all' && hotTools.length > 0" class="hot-section">
        <div class="section-header">
          <h3>
            <el-icon color="#f56c6c"><HotWater /></el-icon>
            热门推荐
          </h3>
          <span class="section-count">{{ hotTools.length }} 个常用工具</span>
        </div>
        <div class="hot-tools-grid">
          <el-card
            v-for="tool in hotTools"
            :key="tool.path"
            shadow="hover"
            class="hot-tool-card"
            @click="navigateTo(tool.path)"
          >
            <div class="hot-badge">HOT</div>
            <div class="tool-icon" :style="{ backgroundColor: tool.color + '15' }">
              <el-icon :size="32" :color="tool.color">
                <component :is="tool.icon" />
              </el-icon>
            </div>
            <div class="tool-info">
              <h4>{{ tool.name }}</h4>
              <p>{{ tool.description }}</p>
              <div class="hot-tool-stats">
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ tool.rating }}
                </span>
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ formatUsageCount(tool.usageCount) }}次
                </span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div v-if="activeCategory !== 'all'" class="category-info">
        <div class="category-info-content">
          <el-icon :size="32" :color="currentCategory?.color">
            <component :is="currentCategory?.icon" />
          </el-icon>
          <div>
            <h3>{{ currentCategory?.name }}</h3>
            <p>{{ currentCategory?.description }}</p>
          </div>
        </div>
        <div v-if="currentCategory?.subTags && currentCategory.subTags.length > 0" class="sub-tags">
          <el-tag
            :effect="activeSubTag === 'all' ? 'dark' : 'plain'"
            type="primary"
            class="sub-tag"
            @click="activeSubTag = 'all'"
          >
            全部
          </el-tag>
          <el-tag
            v-for="tag in currentCategory?.subTags"
            :key="tag"
            :effect="activeSubTag === tag ? 'dark' : 'plain'"
            type="primary"
            class="sub-tag"
            @click="activeSubTag = tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </template>

    <div v-if="filteredTools.length > 0" class="sort-filter-bar">
      <div class="sort-options">
        <span class="sort-label">排序：</span>
        <el-radio-group v-model="sortType" size="small">
          <el-radio-button value="hot">综合热度</el-radio-button>
          <el-radio-button value="rating">评分最高</el-radio-button>
          <el-radio-button value="usage">使用最多</el-radio-button>
          <el-radio-button value="name">名称排序</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-stats">
        <span>共 <b>{{ filteredTools.length }}</b> 个工具</span>
        <span v-if="excellentCount > 0" class="stat excellent">
          <el-icon color="#f56c6c"><Medal /></el-icon>
          精选 {{ excellentCount }}
        </span>
        <span v-if="goodCount > 0" class="stat good">
          <el-icon color="#e6a23c"><CircleCheck /></el-icon>
          优质 {{ goodCount }}
        </span>
      </div>
    </div>

    <template v-if="filteredTools.length > 0">
      <div v-if="excellentTools.length > 0 && sortType === 'hot'" class="quality-section excellent-section">
        <div class="quality-section-header">
          <div class="quality-title">
            <el-tag type="danger" effect="dark" size="large" round>精选推荐</el-tag>
            <span class="quality-desc">经过用户验证的高质量工具，体验优秀</span>
          </div>
          <span class="quality-count">{{ excellentTools.length }} 款</span>
        </div>
        <div class="tools-grid">
          <el-card
            v-for="tool in excellentTools"
            :key="tool.path"
            shadow="hover"
            class="tool-card excellent-card"
            @click="navigateTo(tool.path)"
          >
            <div class="quality-badge excellent">精选</div>
            <div class="tool-icon" :style="{ backgroundColor: tool.color + '15' }">
              <el-icon :size="36" :color="tool.color">
                <component :is="tool.icon" />
              </el-icon>
            </div>
            <div class="tool-info">
              <div class="tool-title-row">
                <h4>{{ tool.name }}</h4>
                <el-tag v-if="tool.hot" type="danger" size="small" effect="dark" class="hot-tag">
                  HOT
                </el-tag>
              </div>
              <p>{{ tool.description }}</p>
              <div class="tool-meta">
                <div class="tool-stats">
                  <span class="stat-item">
                    <el-icon color="#f56c6c"><Star /></el-icon>
                    {{ tool.rating }}
                  </span>
                  <span class="stat-item">
                    <el-icon color="#67c23a"><View /></el-icon>
                    {{ formatUsageCount(tool.usageCount) }}
                  </span>
                </div>
                <div class="tool-tags">
                  <el-tag
                    v-for="tag in tool.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    effect="plain"
                    class="tool-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="tool-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-card>
        </div>
      </div>

      <div v-if="goodTools.length > 0 && sortType === 'hot'" class="quality-section good-section">
        <div class="quality-section-header">
          <div class="quality-title">
            <el-tag type="warning" effect="dark" size="large" round>优质工具</el-tag>
            <span class="quality-desc">口碑良好，功能稳定可靠</span>
          </div>
          <span class="quality-count">{{ goodTools.length }} 款</span>
        </div>
        <div class="tools-grid">
          <el-card
            v-for="tool in goodTools"
            :key="tool.path"
            shadow="hover"
            class="tool-card good-card"
            @click="navigateTo(tool.path)"
          >
            <div class="quality-badge good">优质</div>
            <div class="tool-icon" :style="{ backgroundColor: tool.color + '15' }">
              <el-icon :size="36" :color="tool.color">
                <component :is="tool.icon" />
              </el-icon>
            </div>
            <div class="tool-info">
              <div class="tool-title-row">
                <h4>{{ tool.name }}</h4>
                <el-tag v-if="tool.hot" type="danger" size="small" effect="dark" class="hot-tag">
                  HOT
                </el-tag>
              </div>
              <p>{{ tool.description }}</p>
              <div class="tool-meta">
                <div class="tool-stats">
                  <span class="stat-item">
                    <el-icon color="#f56c6c"><Star /></el-icon>
                    {{ tool.rating }}
                  </span>
                  <span class="stat-item">
                    <el-icon color="#67c23a"><View /></el-icon>
                    {{ formatUsageCount(tool.usageCount) }}
                  </span>
                </div>
                <div class="tool-tags">
                  <el-tag
                    v-for="tag in tool.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    effect="plain"
                    class="tool-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="tool-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-card>
        </div>
      </div>

      <div
        v-for="group in groupedTools"
        :key="group.letter"
        class="letter-group"
      >
        <div class="letter-header" @click="toggleGroup(group.letter)">
          <el-icon
            class="collapse-icon"
            :class="{ collapsed: collapsedGroups.includes(group.letter) }"
          >
            <ArrowDown />
          </el-icon>
          <span class="letter">{{ group.letter }}</span>
          <span class="group-count">{{ group.tools.length }} 个工具</span>
          <div class="letter-divider"></div>
        </div>
        <div v-show="!collapsedGroups.includes(group.letter)" class="tools-grid">
          <el-card
            v-for="tool in (sortType === 'hot' ? normalTools : group.tools)"
            :key="tool.path"
            shadow="hover"
            class="tool-card"
            @click="navigateTo(tool.path)"
          >
            <div
              v-if="tool.qualityLevel !== 'normal'"
              class="quality-badge"
              :class="tool.qualityLevel"
            >
              {{ getQualityBadge(tool.qualityLevel).text }}
            </div>
            <div class="tool-icon" :style="{ backgroundColor: tool.color + '15' }">
              <el-icon :size="36" :color="tool.color">
                <component :is="tool.icon" />
              </el-icon>
            </div>
            <div class="tool-info">
              <div class="tool-title-row">
                <h4>{{ tool.name }}</h4>
                <el-tag v-if="tool.hot" type="danger" size="small" effect="dark" class="hot-tag">
                  HOT
                </el-tag>
              </div>
              <p>{{ tool.description }}</p>
              <div class="tool-meta">
                <div class="tool-stats">
                  <span class="stat-item">
                    <el-icon color="#f56c6c"><Star /></el-icon>
                    {{ tool.rating }}
                  </span>
                  <span class="stat-item">
                    <el-icon color="#67c23a"><View /></el-icon>
                    {{ formatUsageCount(tool.usageCount) }}
                  </span>
                </div>
                <div class="tool-tags">
                  <el-tag
                    v-for="tag in tool.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    effect="plain"
                    class="tool-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="tool-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-card>
        </div>
      </div>
    </template>

    <el-empty
      v-else
      description="暂无匹配的工具"
      class="empty-state"
    >
      <el-button type="primary" @click="resetFilters">重置筛选</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  ArrowRight,
  ArrowDown,
  HotWater,
  Star,
  User,
  View,
  Medal,
  CircleCheck
} from '@element-plus/icons-vue'
import {
  toolCategories,
  getAllTools,
  getHotTools,
  searchTools,
  getCategoryById,
  getToolsByCategoryAndTag,
  getFirstLetter,
  sortTools,
  getQualityBadge,
  formatUsageCount,
  type ToolItem,
  type SortType
} from '@/data/tools'

interface ToolGroup {
  letter: string
  tools: ToolItem[]
}

const router = useRouter()
const searchKeyword = ref('')
const activeCategory = ref('all')
const activeSubTag = ref('all')
const sortType = ref<SortType>('hot')
const collapsedGroups = ref<string[]>([])

const totalTools = computed(() => getAllTools().length)
const hotTools = computed(() => sortTools(getHotTools(), 'hot').slice(0, 8))
const currentCategory = computed(() => getCategoryById(activeCategory.value))

const baseFilteredTools = computed((): ToolItem[] => {
  if (searchKeyword.value) {
    return searchTools(searchKeyword.value)
  }
  if (activeCategory.value === 'all') {
    return getAllTools()
  }
  return getToolsByCategoryAndTag(activeCategory.value, activeSubTag.value)
})

const filteredTools = computed((): ToolItem[] => {
  return sortTools(baseFilteredTools.value, sortType.value)
})

const excellentTools = computed(() =>
  filteredTools.value.filter(t => t.qualityLevel === 'excellent')
)
const goodTools = computed(() =>
  filteredTools.value.filter(t => t.qualityLevel === 'good')
)
const normalTools = computed(() =>
  filteredTools.value.filter(t => t.qualityLevel === 'normal')
)

const excellentCount = computed(() =>
  baseFilteredTools.value.filter(t => t.qualityLevel === 'excellent').length
)
const goodCount = computed(() =>
  baseFilteredTools.value.filter(t => t.qualityLevel === 'good').length
)

const groupedTools = computed((): ToolGroup[] => {
  if (sortType.value === 'hot') {
    return normalTools.value.length > 0
      ? [{ letter: '其他工具', tools: normalTools.value }]
      : []
  }
  const groups = new Map<string, ToolItem[]>()
  filteredTools.value.forEach(tool => {
    const letter = getFirstLetter(tool.name)
    if (!groups.has(letter)) {
      groups.set(letter, [])
    }
    groups.get(letter)!.push(tool)
  })
  return Array.from(groups.entries())
    .map(([letter, tools]) => ({ letter, tools }))
    .sort((a, b) => a.letter.localeCompare(b.letter, 'zh-CN'))
})

const toggleGroup = (letter: string) => {
  const idx = collapsedGroups.value.indexOf(letter)
  if (idx > -1) {
    collapsedGroups.value.splice(idx, 1)
  } else {
    collapsedGroups.value.push(letter)
  }
}

const handleCategoryChange = () => {
  activeSubTag.value = 'all'
  collapsedGroups.value = []
}

watch(searchKeyword, () => {
  collapsedGroups.value = []
})

const navigateTo = (path: string) => {
  router.push(path)
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeCategory.value = 'all'
  activeSubTag.value = 'all'
  sortType.value = 'hot'
}
</script>

<style scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-card {
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-card :deep(.el-card__body) {
  padding: 0;
}

.hero-section {
  padding: 36px 40px;
  text-align: center;
  color: #fff;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-content h1 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 600;
  color: #fff;
}

.hero-desc {
  margin: 0 0 20px;
  font-size: 14px;
  opacity: 0.9;
}

.search-input {
  max-width: 480px;
  margin: 0 auto;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 6px 16px;
}

.category-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 0 12px;
}

.category-tabs :deep(.el-tabs__header) {
  margin: 0;
  border: none;
}

.category-tabs :deep(.el-tabs__nav) {
  gap: 4px;
  border: none;
}

.category-tabs :deep(.el-tabs__item) {
  border: none !important;
  background: transparent !important;
  padding: 0 14px;
  height: 46px;
}

.category-tabs :deep(.el-tabs__item.is-active) {
  background: #f5f7fa !important;
  border-bottom: 2px solid #165DFF !important;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.tab-label .el-tag {
  margin-left: 4px;
}

.search-result-header {
  margin-bottom: -4px;
}

.hot-section {
  background: #fff;
  border-radius: 8px;
  padding: 18px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #303133;
}

.section-count {
  font-size: 13px;
  color: #909399;
}

.hot-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.hot-tool-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ffe4e4;
  background: linear-gradient(135deg, #fff9f9 0%, #fff 100%);
  position: relative;
  overflow: hidden;
}

.hot-tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(245, 108, 108, 0.15);
}

.hot-tool-card :deep(.el-card__body) {
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hot-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #f56c6c, #eb2f96);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 10px 2px 12px;
  border-bottom-left-radius: 10px;
  letter-spacing: 1px;
}

.hot-tool-card .tool-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hot-tool-card .tool-info {
  flex: 1;
  min-width: 0;
}

.hot-tool-card .tool-info h4 {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.hot-tool-card .tool-info p {
  margin: 0 0 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-tool-stats {
  display: flex;
  gap: 12px;
}

.hot-tool-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #606266;
}

.hot-tool-stats .stat-item .el-icon {
  font-size: 12px;
  color: #e6a23c;
}

.category-info {
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px 0;
}

.category-info-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-info-content h3 {
  margin: 0 0 4px;
  font-size: 17px;
  color: #303133;
}

.category-info-content p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.sub-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 0 18px;
  margin-top: 4px;
  border-top: 1px solid #f0f2f5;
}

.sub-tag {
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.sort-filter-bar {
  background: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-label {
  font-size: 13px;
  color: #606266;
}

.filter-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
}

.filter-stats b {
  color: #165DFF;
  font-weight: 600;
}

.filter-stats .stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
}

.filter-stats .stat.excellent {
  color: #f56c6c;
}

.filter-stats .stat.good {
  color: #e6a23c;
}

.quality-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px 20px;
}

.quality-section.excellent-section {
  background: linear-gradient(180deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffe4e4;
}

.quality-section.good-section {
  background: linear-gradient(180deg, #fffbf0 0%, #fff 100%);
  border: 1px solid #faecd8;
}

.quality-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.quality-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quality-desc {
  font-size: 12px;
  color: #909399;
}

.quality-count {
  font-size: 12px;
  color: #909399;
}

.letter-group {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.letter-header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  gap: 10px;
}

.letter-header:hover {
  background-color: #fafbfc;
}

.collapse-icon {
  transition: transform 0.3s;
  color: #909399;
  font-size: 12px;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.letter {
  font-size: 14px;
  font-weight: 600;
  color: #165DFF;
  min-width: 56px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  border-radius: 6px;
  padding: 0 10px;
}

.group-count {
  font-size: 12px;
  color: #909399;
}

.letter-divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, #ebeef5, transparent);
  margin-left: 8px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  padding: 0 20px 20px;
}

.tool-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  border-color: #dcdfe6;
}

.tool-card.excellent-card {
  border: 1px solid #ffd1d1;
  background: linear-gradient(135deg, #fffafa 0%, #fff 100%);
}

.tool-card.good-card {
  border: 1px solid #faecd8;
  background: linear-gradient(135deg, #fffcf5 0%, #fff 100%);
}

.tool-card :deep(.el-card__body) {
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.quality-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.quality-badge.excellent {
  background: linear-gradient(135deg, #f56c6c, #eb2f96);
  color: #fff;
}

.quality-badge.good {
  background: linear-gradient(135deg, #e6a23c, #f0a020);
  color: #fff;
}

.tool-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tool-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.hot-tag {
  padding: 0 5px;
  height: 16px;
  font-size: 10px;
  line-height: 14px;
}

.tool-info p {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.tool-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tool-stats {
  display: flex;
  gap: 10px;
}

.tool-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #606266;
}

.tool-stats .stat-item .el-icon {
  font-size: 12px;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tool-tag {
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 16px;
  border-color: #e4e7ed;
}

.tool-arrow {
  color: #c0c4cc;
  flex-shrink: 0;
  transition: all 0.3s;
}

.tool-card:hover .tool-arrow {
  color: #165DFF;
  transform: translateX(4px);
}

.empty-state {
  background: #fff;
  border-radius: 8px;
  padding: 60px 0;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 24px 16px;
  }

  .hero-content h1 {
    font-size: 20px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    padding: 0 12px 16px;
  }

  .hot-tools-grid {
    grid-template-columns: 1fr;
  }

  .tab-label span {
    display: none;
  }

  .letter-header {
    padding: 10px 14px;
  }

  .sort-filter-bar {
    padding: 10px 14px;
  }

  .filter-stats {
    display: none;
  }
}
</style>
