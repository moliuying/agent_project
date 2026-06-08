<template>
  <div class="python-code-samples">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#3772FF">
            <Cpu />
          </el-icon>
          <span>Python 代码示例库</span>
          <el-tag size="small" type="primary" class="header-tag">20+ 可直接运行的代码片段</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="浏览代码片段" description="按分类或关键词查找需要的代码" />
          <el-step title="一键复制" description="复制完整代码到剪贴板" />
          <el-step title="直接运行" description="粘贴到 Python 环境中即可执行" />
        </el-steps>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索标题、标签、描述、代码内容..."
          size="large"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="search-actions">
          <el-button
            :type="showFavoritesOnly ? 'primary' : 'default'"
            @click="showFavoritesOnly = !showFavoritesOnly"
            size="large"
          >
            <el-icon><StarFilled v-if="showFavoritesOnly" /><Star v-else /></el-icon>
            {{ showFavoritesOnly ? '已收藏' : '我的收藏' }}
            <el-badge v-if="favoriteIds.length > 0" :value="favoriteIds.length" :max="99" class="fav-badge" />
          </el-button>
        </div>
      </div>
      <div class="difficulty-filter">
        <span class="filter-label">难度筛选：</span>
        <el-checkbox-group v-model="selectedDifficulties">
          <el-checkbox label="beginner">
            <el-tag size="small" type="success">入门</el-tag>
          </el-checkbox>
          <el-checkbox label="intermediate">
            <el-tag size="small" type="warning">进阶</el-tag>
          </el-checkbox>
          <el-checkbox label="advanced">
            <el-tag size="small" type="danger">高级</el-tag>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </el-card>

    <el-card class="categories-card">
      <template #header>
        <div class="card-header small">
          <el-icon :size="18" color="#165DFF">
            <Menu />
          </el-icon>
          <span>分类筛选</span>
          <el-tag size="small" type="info">共 {{ filteredSamples.length }} 个示例</el-tag>
        </div>
      </template>
      <div class="category-list">
        <el-button
          v-for="cat in pythonCategories"
          :key="cat.key"
          :type="activeCategory === cat.key ? 'primary' : 'default'"
          size="default"
          @click="activeCategory = cat.key"
          class="category-btn"
        >
          <el-icon>
            <component :is="getCategoryIcon(cat.icon)" />
          </el-icon>
          {{ cat.name }}
        </el-button>
      </div>
    </el-card>

    <div class="samples-grid">
      <el-card
        v-for="sample in displayedSamples"
        :key="sample.id"
        class="sample-card"
        shadow="hover"
      >
        <div class="card-top">
          <div class="sample-emoji">{{ sample.previewEmoji || '📝' }}</div>
          <div class="card-actions">
            <el-tooltip :content="isFavorite(sample.id) ? '取消收藏' : '收藏'" placement="top">
              <el-button
                text
                size="small"
                @click="toggleFavorite(sample.id)"
                class="action-btn"
              >
                <el-icon :size="18" :color="isFavorite(sample.id) ? '#f56c6c' : '#909399'">
                  <StarFilled v-if="isFavorite(sample.id)" />
                  <Star v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="查看详情" placement="top">
              <el-button text size="small" @click="showDetail(sample)" class="action-btn">
                <el-icon :size="18" color="#165DFF"><View /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <div class="sample-title-row">
          <h3 class="sample-title">{{ sample.title }}</h3>
          <el-tag
            size="small"
            :type="getDifficultyType(sample.difficulty)"
            effect="light"
          >
            {{ getDifficultyLabel(sample.difficulty) }}
          </el-tag>
        </div>

        <div class="sample-tags">
          <el-tag
            v-for="tag in sample.tags.slice(0, 4)"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <p class="sample-desc">{{ sample.description }}</p>

        <div
          class="code-preview touch-friendly"
          :class="{ 'copying': copyingId === `${sample.id}-code` }"
          @click="copyCodeWithFeedback(sample.code, '代码', `${sample.id}-code`)"
          @touchstart.prevent="handleTouchStart($event, sample.code, '代码', `${sample.id}-code`)"
          @touchend.prevent="handleTouchEnd"
          @touchmove.prevent="handleTouchMove"
        >
          <div class="code-label">
            <el-icon :size="14"><Document /></el-icon>
            <span>Python 代码</span>
            <span class="copy-badge">
              <el-icon :size="12"><DocumentCopy /></el-icon>
              <span>点我复制</span>
            </span>
          </div>
          <div class="code-text">
            <template v-if="copyingId === `${sample.id}-code`">
              <el-icon :size="16" color="#67c23a"><CircleCheckFilled /></el-icon>
              <span class="copied-text">已复制 ✓</span>
            </template>
            <template v-else>
              <pre><code>{{ sample.code.split('\n').slice(0, 10).join('\n') }}{{ sample.code.split('\n').length > 10 ? '\n...' : '' }}</code></pre>
            </template>
          </div>
          <div class="code-copy-cta">
            <el-icon :size="14"><DocumentCopy /></el-icon>
            <span>点击复制全部代码</span>
          </div>
        </div>

        <div class="usecase-box">
          <div class="usecase-label">
            <el-icon :size="14" color="#3772FF"><Promotion /></el-icon>
            <span>使用场景</span>
          </div>
          <p class="usecase-text">{{ sample.useCase }}</p>
        </div>

        <div class="env-box">
          <div class="env-item">
            <el-icon :size="14" color="#16a34a"><Cpu /></el-icon>
            <span class="env-label">Python 版本：</span>
            <span class="env-value">{{ sample.pythonVersion }}</span>
          </div>
          <div class="env-item" v-if="sample.dependencies && sample.dependencies.length > 0">
            <el-icon :size="14" color="#f59e0b"><Box /></el-icon>
            <span class="env-label">依赖：</span>
            <span class="env-value">
              <el-tag
                v-for="dep in sample.dependencies.slice(0, 3)"
                :key="dep"
                size="small"
                type="warning"
                effect="light"
              >
                {{ dep }}
              </el-tag>
              <el-tag v-if="sample.dependencies.length > 3" size="small" effect="plain">
                +{{ sample.dependencies.length - 3 }}
              </el-tag>
            </span>
          </div>
          <div class="env-item" v-if="sample.installCommand">
            <el-icon :size="14" color="#3772FF"><Download /></el-icon>
            <span class="env-label">安装：</span>
            <span class="env-value mono-text">{{ sample.installCommand }}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="sample-category">
            <el-tag size="small" type="primary" effect="light">
              {{ getCategoryName(sample.category) }}
            </el-tag>
          </div>
          <div class="copy-actions">
            <el-button
              size="default"
              type="primary"
              @click.stop="copyCodeWithFeedback(sample.code, '代码', `${sample.id}-code`)"
            >
              <el-icon><DocumentCopy /></el-icon>
              复制代码
            </el-button>
            <el-button
              size="default"
              type="success"
              @click.stop="showDetail(sample)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="filteredSamples.length === 0" class="empty-state">
      <el-icon :size="64" color="#c0c4cc"><Search /></el-icon>
      <p class="empty-text">没有找到匹配的代码示例</p>
      <p class="empty-hint">试试换个关键词或切换分类</p>
      <el-button type="primary" @click="resetFilters">重置筛选</el-button>
    </div>

    <el-pagination
      v-if="filteredSamples.length > pageSize"
      class="pagination"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredSamples.length"
      layout="total, prev, pager, next"
      background
    />

    <el-dialog v-model="detailVisible" width="820px" class="detail-dialog">
      <template #header>
        <div class="dialog-header">
          <span class="dialog-emoji">{{ currentDetail?.previewEmoji || '📝' }}</span>
          <span class="dialog-title">{{ currentDetail?.title }}</span>
          <el-tag
            size="default"
            :type="getDifficultyType(currentDetail?.difficulty)"
            effect="light"
          >
            {{ getDifficultyLabel(currentDetail?.difficulty) }}
          </el-tag>
        </div>
      </template>
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-section">
          <div class="detail-tags">
            <el-tag
              v-for="tag in currentDetail.tags"
              :key="tag"
              size="default"
              type="primary"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
            <el-tag size="default" type="success" effect="light">
              {{ getCategoryName(currentDetail.category) }}
            </el-tag>
          </div>
          <p class="detail-description">{{ currentDetail.description }}</p>
        </div>

        <el-alert
          type="info"
          :closable="false"
          show-icon
          :title="'使用场景：' + currentDetail.useCase"
          class="usecase-alert"
        />

        <el-divider />

        <div class="detail-section">
          <div class="section-title">
            <el-icon :size="16" color="#165DFF"><SetUp /></el-icon>
            <span>运行环境说明</span>
          </div>
          <el-descriptions :column="1" border size="default" class="env-descriptions">
            <el-descriptions-item>
              <template #label>
                <span class="desc-label">
                  <el-icon :size="14" color="#16a34a"><Cpu /></el-icon>
                  Python 版本
                </span>
              </template>
              <span>{{ currentDetail.pythonVersion }}</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentDetail.dependencies && currentDetail.dependencies.length > 0">
              <template #label>
                <span class="desc-label">
                  <el-icon :size="14" color="#f59e0b"><Box /></el-icon>
                  依赖库
                </span>
              </template>
              <div class="deps-list">
                <el-tag
                  v-for="dep in currentDetail.dependencies"
                  :key="dep"
                  size="default"
                  type="warning"
                  effect="light"
                  class="dep-tag"
                >
                  {{ dep }}
                </el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentDetail.installCommand">
              <template #label>
                <span class="desc-label">
                  <el-icon :size="14" color="#3772FF"><Download /></el-icon>
                  安装命令
                </span>
              </template>
              <div
                class="install-cmd touch-friendly"
                @click="copyCodeWithFeedback(currentDetail.installCommand, '安装命令', `${currentDetail.id}-install`)"
                @touchstart.prevent="handleTouchStart($event, currentDetail.installCommand, '安装命令', `${currentDetail.id}-install`)"
                @touchend.prevent="handleTouchEnd"
                @touchmove.prevent="handleTouchMove"
              >
                <code class="cmd-code">{{ currentDetail.installCommand }}</code>
                <el-button link type="primary" size="small">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <span class="desc-label">
                  <el-icon :size="14" color="#7c3aed"><VideoPlay /></el-icon>
                  运行方式
                </span>
              </template>
              <div
                class="install-cmd touch-friendly"
                @click="copyCodeWithFeedback(currentDetail.runCommand, '运行命令', `${currentDetail.id}-run`)"
                @touchstart.prevent="handleTouchStart($event, currentDetail.runCommand, '运行命令', `${currentDetail.id}-run`)"
                @touchend.prevent="handleTouchEnd"
                @touchmove.prevent="handleTouchMove"
              >
                <code class="cmd-code">{{ currentDetail.runCommand }}</code>
                <el-button link type="primary" size="small">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentDetail.notes">
              <template #label>
                <span class="desc-label">
                  <el-icon :size="14" color="#ef4444"><Warning /></el-icon>
                  注意事项
                </span>
              </template>
              <div class="notes-box">
                <el-icon color="#f56c6c" :size="14"><InfoFilled /></el-icon>
                <span>{{ currentDetail.notes }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="section-title">
            <el-icon :size="16" color="#3772FF"><Document /></el-icon>
            <span>Python 代码</span>
            <el-button
              size="default"
              type="primary"
              @click.stop="copyCodeWithFeedback(currentDetail.code, '代码', 'detail-code')"
            >
              <el-icon><DocumentCopy /></el-icon>
              一键复制
            </el-button>
          </div>
          <div
            class="code-block clickable touch-friendly"
            :class="{ 'copying': copyingId === 'detail-code' }"
            @click="copyCodeWithFeedback(currentDetail.code, '代码', 'detail-code')"
            @touchstart.prevent="handleTouchStart($event, currentDetail.code, '代码', 'detail-code')"
            @touchend.prevent="handleTouchEnd"
            @touchmove.prevent="handleTouchMove"
          >
            <template v-if="copyingId === 'detail-code'">
              <el-icon :size="20" color="#67c23a"><CircleCheckFilled /></el-icon>
              <span class="copied-text-large">已复制到剪贴板！</span>
            </template>
            <template v-else>
              <pre><code>{{ currentDetail.code }}</code></pre>
            </template>
            <div class="copy-overlay-hint mobile-visible">
              <el-icon :size="16"><DocumentCopy /></el-icon>
              <span>点击复制</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="currentDetail"
          type="primary"
          @click="toggleFavorite(currentDetail.id)"
        >
          <el-icon>
            <StarFilled v-if="isFavorite(currentDetail.id)" />
            <Star v-else />
          </el-icon>
          {{ isFavorite(currentDetail.id) ? '取消收藏' : '收藏示例' }}
        </el-button>
        <el-button
          v-if="currentDetail"
          type="success"
          size="large"
          @click="copyCodeWithFeedback(currentDetail.code, '代码', 'footer-copy')"
        >
          <el-icon><DocumentCopy /></el-icon>
          一键复制全部代码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Cpu,
  Search,
  Star,
  StarFilled,
  View,
  DocumentCopy,
  Document,
  Menu,
  Collection,
  Notebook,
  EditPen,
  Grid,
  Files,
  Folder,
  Connection,
  Globe,
  DataLine,
  Promotion,
  CircleCheckFilled,
  Box,
  Download,
  VideoPlay,
  Warning,
  SetUp,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  pythonCodeSamples,
  pythonCategories,
  type PythonCodeSample
} from '@/data/pythonCodeSamples'

const FAVORITES_KEY = 'python_code_favorites'

const searchKeyword = ref('')
const activeCategory = ref('all')
const showFavoritesOnly = ref(false)
const selectedDifficulties = ref<string[]>(['beginner', 'intermediate', 'advanced'])
const favoriteIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = 8
const detailVisible = ref(false)
const currentDetail = ref<PythonCodeSample | null>(null)
const copyingId = ref<string | null>(null)
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const isLongPress = ref(false)
const touchStartData = ref<{ text: string; label: string; id: string } | null>(null)

const iconMap: Record<string, any> = {
  Collection,
  Notebook,
  EditPen,
  Grid,
  Files,
  Folder,
  Cpu,
  Connection,
  Globe,
  DataLine,
  Menu
}

const getCategoryIcon = (iconName: string) => {
  return iconMap[iconName] || Cpu
}

const getCategoryName = (key: string) => {
  const cat = pythonCategories.find(c => c.key === key)
  return cat?.name || key
}

const getDifficultyLabel = (difficulty?: string) => {
  switch (difficulty) {
    case 'beginner': return '入门'
    case 'intermediate': return '进阶'
    case 'advanced': return '高级'
    default: return '入门'
  }
}

const getDifficultyType = (difficulty?: string) => {
  switch (difficulty) {
    case 'beginner': return 'success'
    case 'intermediate': return 'warning'
    case 'advanced': return 'danger'
    default: return 'info'
  }
}

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      favoriteIds.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load favorites:', e)
  }
}

const saveFavorites = () => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds.value))
  } catch (e) {
    console.error('Failed to save favorites:', e)
  }
}

onMounted(() => {
  loadFavorites()
})

const isFavorite = (id: number) => favoriteIds.value.includes(id)

const toggleFavorite = (id: number) => {
  const index = favoriteIds.value.indexOf(id)
  if (index > -1) {
    favoriteIds.value.splice(index, 1)
    ElMessage.success('已取消收藏')
  } else {
    favoriteIds.value.push(id)
    ElMessage.success('收藏成功')
  }
  saveFavorites()
}

const filteredSamples = computed(() => {
  let result = pythonCodeSamples

  if (activeCategory.value !== 'all') {
    result = result.filter(s => s.category === activeCategory.value)
  }

  if (selectedDifficulties.value.length > 0 && selectedDifficulties.value.length < 3) {
    result = result.filter(s => selectedDifficulties.value.includes(s.difficulty))
  }

  if (showFavoritesOnly.value) {
    result = result.filter(s => favoriteIds.value.includes(s.id))
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(s =>
      s.title.toLowerCase().includes(keyword) ||
      s.description.toLowerCase().includes(keyword) ||
      s.code.toLowerCase().includes(keyword) ||
      s.useCase.toLowerCase().includes(keyword) ||
      s.tags.some(t => t.toLowerCase().includes(keyword)) ||
      s.pythonVersion.toLowerCase().includes(keyword) ||
      s.dependencies.some(d => d.toLowerCase().includes(keyword)) ||
      (s.installCommand && s.installCommand.toLowerCase().includes(keyword)) ||
      (s.notes && s.notes.toLowerCase().includes(keyword))
    )
  }

  return result
})

const displayedSamples = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSamples.value.slice(start, start + pageSize)
})

const showDetail = (sample: PythonCodeSample) => {
  currentDetail.value = sample
  detailVisible.value = true
}

const copyCode = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label}已复制到剪贴板`)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success(`${label}已复制到剪贴板`)
  }
}

const copyCodeWithFeedback = async (text: string, label: string, id: string) => {
  if (copyingId.value === id) return
  try {
    await navigator.clipboard.writeText(text)
    triggerHapticFeedback()
    copyingId.value = id
    ElMessage.success(`${label}已复制到剪贴板`)
    setTimeout(() => {
      copyingId.value = null
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    triggerHapticFeedback()
    copyingId.value = id
    ElMessage.success(`${label}已复制到剪贴板`)
    setTimeout(() => {
      copyingId.value = null
    }, 2000)
  }
}

const triggerHapticFeedback = () => {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  } catch (e) {
    // 忽略振动 API 不支持的情况
  }
}

const handleTouchStart = (event: TouchEvent, text: string, label: string, id: string) => {
  isLongPress.value = false
  touchStartData.value = { text, label, id }
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    copyCodeWithFeedback(text, label, id)
    triggerHapticFeedback()
  }, 500)
}

const handleTouchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  if (!isLongPress.value && touchStartData.value) {
    copyCodeWithFeedback(
      touchStartData.value.text,
      touchStartData.value.label,
      touchStartData.value.id
    )
  }
  touchStartData.value = null
}

const handleTouchMove = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  isLongPress.value = false
}

const resetFilters = () => {
  searchKeyword.value = ''
  activeCategory.value = 'all'
  showFavoritesOnly.value = false
  selectedDifficulties.value = ['beginner', 'intermediate', 'advanced']
  currentPage.value = 1
}
</script>

<style scoped>
.python-code-samples {
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.card-header.small {
  font-size: 15px;
}

.header-tag {
  margin-left: 12px;
  font-weight: normal;
}

.intro-section {
  margin-bottom: 20px;
}

.intro-steps {
  padding: 10px 0;
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
}

.search-actions {
  flex-shrink: 0;
}

.fav-badge {
  margin-left: 4px;
}

.difficulty-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.categories-card {
  margin-bottom: 20px;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.samples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.sample-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.sample-card:hover {
  transform: translateY(-4px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.sample-emoji {
  font-size: 40px;
  line-height: 1;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 4px;
}

.sample-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sample-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
}

.sample-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.sample-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 14px 0;
}

.code-preview {
  background: #282c34;
  border-radius: 10px;
  padding: 14px 14px 10px;
  margin-bottom: 12px;
  border-left: 4px solid #3772FF;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  -moz-user-select: none;
  -ms-user-select: none;
}

.code-preview.touch-friendly {
  min-height: 60px;
}

.code-preview:hover {
  background: #21252b;
  border-left-color: #2563eb;
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(55, 114, 255, 0.25);
}

.code-preview:active {
  transform: translateX(2px) scale(0.99);
  background: #1c1f24;
}

.code-preview.copying {
  background: linear-gradient(135deg, #282c34 0%, #1c2535 100%);
  border-left-color: #67c23a;
  animation: copyPulse 0.4s ease;
}

@keyframes copyPulse {
  0% { transform: translateX(2px) scale(1); }
  50% { transform: translateX(2px) scale(1.015); }
  100% { transform: translateX(2px) scale(1); }
}

.code-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #abb2bf;
  font-weight: 600;
  margin-bottom: 8px;
}

.copy-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: linear-gradient(135deg, #3772FF 0%, #2563eb 100%);
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.code-text {
  font-family: 'Monaco', 'Menlo', 'Consolas', 'SF Mono', monospace;
  font-size: 12px;
  color: #abb2bf;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  -webkit-user-select: none;
}

.code-text pre {
  margin: 0;
  padding: 0;
  background: transparent;
  overflow: hidden;
}

.code-text code {
  font-family: inherit;
  color: inherit;
  background: transparent;
  padding: 0;
}

.code-preview:not(.copying) .code-text pre {
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.code-copy-cta {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(55, 114, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #3772FF;
}

.copied-text {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

.usecase-box {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.usecase-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #165DFF;
  font-weight: 600;
  margin-bottom: 6px;
}

.usecase-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.env-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #10b981;
}

.env-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 6px;
}

.env-item:last-child {
  margin-bottom: 0;
}

.env-label {
  color: #374151;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

.env-value {
  color: #1f2937;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.mono-text {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  background: rgba(55, 114, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  color: #3772FF;
  font-size: 11px;
  word-break: break-all;
}

.env-descriptions {
  border-radius: 8px;
  overflow: hidden;
}

.desc-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.deps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dep-tag {
  margin: 0 !important;
}

.install-cmd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #1e293b;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.install-cmd:hover {
  background: #0f172a;
  transform: translateX(2px);
}

.install-cmd.touch-friendly {
  min-height: 44px;
  padding: 10px 14px;
}

.cmd-code {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  color: #4ade80;
  font-size: 13px;
  flex: 1;
  word-break: break-all;
  background: transparent;
  padding: 0;
}

.notes-box {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #dc2626;
  line-height: 1.6;
  background: linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%);
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

.notes-box span {
  flex: 1;
  color: #991b1b;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.sample-category {
  display: flex;
  align-items: center;
  gap: 4px;
}

.copy-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.copy-actions .el-button {
  min-height: 36px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin: 16px 0 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: #c0c4cc;
  margin: 0 0 20px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.detail-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-emoji {
  font-size: 32px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-content {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
  margin: 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border-radius: 8px;
}

.usecase-alert {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.section-title .el-button {
  margin-left: auto;
}

.code-block {
  padding: 20px;
  border-radius: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'SF Mono', monospace;
  font-size: 13px;
  line-height: 1.7;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  -moz-user-select: none;
  -ms-user-select: none;
  min-height: 80px;
  background: #282c34;
  color: #abb2bf;
  border: 2px solid #282c34;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  padding: 0;
  background: transparent;
}

.code-block code {
  font-family: inherit;
  color: inherit;
  background: transparent;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-block.clickable {
  cursor: pointer;
  transition: all 0.25s ease;
}

.code-block.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  border-color: #3772FF;
}

.code-block.clickable:active {
  transform: translateY(0) scale(0.995);
}

.code-block.clickable.copying {
  animation: copyPulse 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.copy-overlay-hint {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: opacity 0.25s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: rgba(55, 114, 255, 0.8);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  color: #fff;
}

.copy-overlay-hint.mobile-visible {
  opacity: 0.8;
}

.code-block.clickable:hover .copy-overlay-hint {
  opacity: 1;
}

.copied-text-large {
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-actions {
    width: 100%;
  }

  .search-actions .el-button {
    width: 100%;
    min-height: 44px;
    font-size: 15px;
  }

  .difficulty-filter {
    flex-wrap: wrap;
    gap: 10px;
  }

  .samples-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-list {
    gap: 8px;
  }

  .category-btn {
    flex: 1;
    min-width: calc(33.33% - 8px);
    justify-content: center;
    min-height: 40px;
    font-size: 14px;
  }

  .code-preview {
    padding: 16px;
    border-radius: 12px;
    min-height: 80px;
  }

  .code-preview.touch-friendly {
    min-height: 80px;
  }

  .copy-badge {
    padding: 4px 10px;
    font-size: 12px;
  }

  .code-copy-cta {
    font-size: 13px;
    padding-top: 10px;
    margin-top: 12px;
  }

  .copy-overlay-hint {
    opacity: 0.8;
    font-size: 11px;
    padding: 5px 10px;
  }

  .copy-actions {
    width: 100%;
    gap: 8px;
  }

  .copy-actions .el-button {
    flex: 1;
    min-width: calc(50% - 4px);
    min-height: 44px;
    font-size: 14px;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .sample-category {
    justify-content: center;
  }

  .detail-dialog :deep(.el-dialog) {
    width: 94% !important;
    margin: 2vh auto !important;
    border-radius: 16px;
  }

  .detail-dialog :deep(.el-dialog__footer) {
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    padding: 16px 20px 20px;
  }

  .detail-dialog :deep(.el-dialog__footer) .el-button {
    width: 100%;
    min-height: 48px;
    font-size: 15px;
  }

  .code-block {
    padding: 16px;
    font-size: 12px;
    line-height: 1.6;
    min-height: 100px;
  }

  .section-title {
    flex-wrap: wrap;
    gap: 8px;
  }

  .section-title .el-button {
    margin-left: 0;
    margin-left: auto;
    min-height: 36px;
  }

  .detail-description {
    font-size: 14px;
    line-height: 1.7;
    padding: 14px;
  }

  .env-box {
    padding: 14px;
  }

  .env-item {
    font-size: 13px;
  }

  .install-cmd {
    flex-wrap: wrap;
    min-height: 44px;
  }

  .cmd-code {
    font-size: 12px;
    word-break: break-all;
  }

  .notes-box {
    font-size: 13px;
  }
}
</style>
