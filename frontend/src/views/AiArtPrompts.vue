<template>
  <div class="ai-art-prompts">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" color="#722ed1">
            <MagicStick />
          </el-icon>
          <span>AI 绘画提示词库</span>
          <el-tag size="small" type="success" class="header-tag">快速上手 AI 绘画</el-tag>
        </div>
      </template>
      <div class="intro-section">
        <el-steps :active="0" finish-status="wait" simple class="intro-steps">
          <el-step title="浏览提示词" description="按分类或关键词查找适合的提示词" />
          <el-step title="一键复制" description="复制提示词内容到剪贴板" />
          <el-step title="直接使用" description="粘贴到 AI 绘画工具即可生成作品" />
        </el-steps>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索提示词标题、标签、描述..."
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
    </el-card>

    <el-card class="categories-card">
      <template #header>
        <div class="card-header small">
          <el-icon :size="18" color="#165DFF">
            <Menu />
          </el-icon>
          <span>分类筛选</span>
          <el-tag size="small" type="info">共 {{ filteredPrompts.length }} 个提示词</el-tag>
        </div>
      </template>
      <div class="category-list">
        <el-button
          v-for="cat in promptCategories"
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

    <div class="prompts-grid">
      <el-card
        v-for="prompt in displayedPrompts"
        :key="prompt.id"
        class="prompt-card"
        shadow="hover"
      >
        <div class="card-top">
          <div class="prompt-emoji">{{ prompt.previewEmoji || '🎨' }}</div>
          <div class="card-actions">
            <el-tooltip :content="isFavorite(prompt.id) ? '取消收藏' : '收藏'" placement="top">
              <el-button
                text
                size="small"
                @click="toggleFavorite(prompt.id)"
                class="action-btn"
              >
                <el-icon :size="18" :color="isFavorite(prompt.id) ? '#f56c6c' : '#909399'">
                  <StarFilled v-if="isFavorite(prompt.id)" />
                  <Star v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="查看详情" placement="top">
              <el-button text size="small" @click="showDetail(prompt)" class="action-btn">
                <el-icon :size="18" color="#165DFF"><View /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <h3 class="prompt-title">{{ prompt.title }}</h3>

        <div class="prompt-tags">
          <el-tag
            v-for="tag in prompt.tags.slice(0, 4)"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <p class="prompt-desc">{{ prompt.description }}</p>

        <div
          class="prompt-preview touch-friendly"
          :class="{ 'copying': copyingId === `${prompt.id}-positive` }"
          @click="copyPromptWithFeedback(prompt.prompt, '正向提示词', `${prompt.id}-positive`)"
          @touchstart.prevent="handleTouchStart($event, prompt.prompt, '正向提示词', `${prompt.id}-positive`)"
          @touchend.prevent="handleTouchEnd"
          @touchmove.prevent="handleTouchMove"
        >
          <div class="prompt-label">
            <el-icon :size="14"><EditPen /></el-icon>
            <span>正向提示词</span>
            <span class="copy-badge">
              <el-icon :size="12"><DocumentCopy /></el-icon>
              <span>点我复制</span>
            </span>
          </div>
          <div class="prompt-text">
            <template v-if="copyingId === `${prompt.id}-positive`">
              <el-icon :size="16" color="#67c23a"><CircleCheckFilled /></el-icon>
              <span class="copied-text">已复制 ✓</span>
            </template>
            <template v-else>
              {{ prompt.prompt }}
            </template>
          </div>
          <div class="prompt-copy-cta">
            <el-icon :size="14"><DocumentCopy /></el-icon>
            <span>点击复制全部提示词</span>
          </div>
        </div>

        <div
          v-if="prompt.negativePrompt"
          class="prompt-preview negative touch-friendly"
          :class="{ 'copying': copyingId === `${prompt.id}-negative` }"
          @click="copyPromptWithFeedback(prompt.negativePrompt, '反向提示词', `${prompt.id}-negative`)"
          @touchstart.prevent="handleTouchStart($event, prompt.negativePrompt, '反向提示词', `${prompt.id}-negative`)"
          @touchend.prevent="handleTouchEnd"
          @touchmove.prevent="handleTouchMove"
        >
          <div class="prompt-label">
            <el-icon :size="14"><Close /></el-icon>
            <span>反向提示词</span>
            <span class="copy-badge negative">
              <el-icon :size="12"><DocumentCopy /></el-icon>
              <span>点我复制</span>
            </span>
          </div>
          <div class="prompt-text">
            <template v-if="copyingId === `${prompt.id}-negative`">
              <el-icon :size="16" color="#f56c6c"><CircleCheckFilled /></el-icon>
              <span class="copied-text">已复制 ✓</span>
            </template>
            <template v-else>
              {{ prompt.negativePrompt }}
            </template>
          </div>
          <div class="prompt-copy-cta negative">
            <el-icon :size="14"><DocumentCopy /></el-icon>
            <span>点击复制全部提示词</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="prompt-model">
            <el-icon :size="14" color="#909399"><Cpu /></el-icon>
            <span>{{ prompt.model || '通用模型' }}</span>
          </div>
          <div class="copy-actions">
            <el-button size="default" type="primary" @click.stop="copyPromptWithFeedback(prompt.prompt, '正向提示词', `${prompt.id}-positive`)">
              <el-icon><DocumentCopy /></el-icon>
              复制正向
            </el-button>
            <el-button
              v-if="prompt.negativePrompt"
              size="default"
              type="danger"
              @click.stop="copyPromptWithFeedback(prompt.negativePrompt, '反向提示词', `${prompt.id}-negative`)"
            >
              <el-icon><DocumentCopy /></el-icon>
              复制反向
            </el-button>
            <el-button
              v-if="prompt.negativePrompt"
              size="default"
              type="success"
              @click.stop="copyAllPrompts(prompt)"
            >
              <el-icon><DocumentCopy /></el-icon>
              全部复制
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="filteredPrompts.length === 0" class="empty-state">
      <el-icon :size="64" color="#c0c4cc"><Search /></el-icon>
      <p class="empty-text">没有找到匹配的提示词</p>
      <p class="empty-hint">试试换个关键词或切换分类</p>
      <el-button type="primary" @click="resetFilters">重置筛选</el-button>
    </div>

    <el-pagination
      v-if="filteredPrompts.length > pageSize"
      class="pagination"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredPrompts.length"
      layout="total, prev, pager, next"
      background
    />

    <el-dialog v-model="detailVisible" width="680px" class="detail-dialog">
      <template #header>
        <div class="dialog-header">
          <span class="dialog-emoji">{{ currentDetail?.previewEmoji || '🎨' }}</span>
          <span class="dialog-title">{{ currentDetail?.title }}</span>
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
              <el-icon><Cpu /></el-icon>
              {{ currentDetail.model || '通用模型' }}
            </el-tag>
          </div>
          <p class="detail-description">{{ currentDetail.description }}</p>
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="section-title">
            <el-icon :size="16" color="#67c23a"><EditPen /></el-icon>
            <span>正向提示词 (Positive Prompt)</span>
            <el-button
              size="default"
              type="success"
              @click.stop="copyPromptWithFeedback(currentDetail.prompt, '正向提示词', 'detail-positive')"
            >
              <el-icon><DocumentCopy /></el-icon>
              一键复制
            </el-button>
          </div>
          <div
            class="prompt-block positive clickable touch-friendly"
            :class="{ 'copying': copyingId === 'detail-positive' }"
            @click="copyPromptWithFeedback(currentDetail.prompt, '正向提示词', 'detail-positive')"
            @touchstart.prevent="handleTouchStart($event, currentDetail.prompt, '正向提示词', 'detail-positive')"
            @touchend.prevent="handleTouchEnd"
            @touchmove.prevent="handleTouchMove"
          >
            <template v-if="copyingId === 'detail-positive'">
              <el-icon :size="20" color="#67c23a"><CircleCheckFilled /></el-icon>
              <span class="copied-text-large">已复制到剪贴板！</span>
            </template>
            <template v-else>
              {{ currentDetail.prompt }}
            </template>
            <div class="copy-overlay-hint mobile-visible">
              <el-icon :size="16"><DocumentCopy /></el-icon>
              <span>点击复制</span>
            </div>
          </div>
        </div>

        <div v-if="currentDetail.negativePrompt" class="detail-section">
          <div class="section-title">
            <el-icon :size="16" color="#f56c6c"><Close /></el-icon>
            <span>反向提示词 (Negative Prompt)</span>
            <el-button
              size="default"
              type="danger"
              @click.stop="copyPromptWithFeedback(currentDetail.negativePrompt, '反向提示词', 'detail-negative')"
            >
              <el-icon><DocumentCopy /></el-icon>
              一键复制
            </el-button>
          </div>
          <div
            class="prompt-block negative clickable touch-friendly"
            :class="{ 'copying': copyingId === 'detail-negative' }"
            @click="copyPromptWithFeedback(currentDetail.negativePrompt, '反向提示词', 'detail-negative')"
            @touchstart.prevent="handleTouchStart($event, currentDetail.negativePrompt, '反向提示词', 'detail-negative')"
            @touchend.prevent="handleTouchEnd"
            @touchmove.prevent="handleTouchMove"
          >
            <template v-if="copyingId === 'detail-negative'">
              <el-icon :size="20" color="#f56c6c"><CircleCheckFilled /></el-icon>
              <span class="copied-text-large">已复制到剪贴板！</span>
            </template>
            <template v-else>
              {{ currentDetail.negativePrompt }}
            </template>
            <div class="copy-overlay-hint mobile-visible">
              <el-icon :size="16"><DocumentCopy /></el-icon>
              <span>点击复制</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="section-title">
            <el-icon :size="16" color="#e6a23c"><Warning /></el-icon>
            <span>使用小贴士</span>
          </div>
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="提示词可以灵活修改"
            description="以上提示词仅作为参考，你可以根据具体需求增删关键词，调整描述顺序（越靠前权重越高），或加入风格、画质等修饰词来获得理想效果。"
          />
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
          {{ isFavorite(currentDetail.id) ? '取消收藏' : '收藏提示词' }}
        </el-button>
        <el-button
          v-if="currentDetail && currentDetail.negativePrompt"
          type="success"
          size="large"
          @click="copyAllPrompts(currentDetail)"
        >
          <el-icon><DocumentCopy /></el-icon>
          一键复制全部
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagicStick,
  Search,
  Star,
  StarFilled,
  View,
  DocumentCopy,
  EditPen,
  Close,
  Cpu,
  Warning,
  Menu,
  Collection,
  User,
  Picture,
  Goods,
  OfficeBuilding,
  Cherry,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  aiArtPrompts,
  promptCategories,
  type AiArtPrompt
} from '@/data/aiArtPrompts'

const FAVORITES_KEY = 'ai_art_prompt_favorites'

const searchKeyword = ref('')
const activeCategory = ref('all')
const showFavoritesOnly = ref(false)
const favoriteIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = 12
const detailVisible = ref(false)
const currentDetail = ref<AiArtPrompt | null>(null)
const copyingId = ref<string | null>(null)
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const isLongPress = ref(false)
const touchStartData = ref<{ text: string; label: string; id: string } | null>(null)

const iconMap: Record<string, any> = {
  Collection,
  User,
  Picture,
  MagicStick,
  Cpu,
  Star,
  Goods,
  OfficeBuilding,
  Cherry
}

const getCategoryIcon = (iconName: string) => {
  return iconMap[iconName] || MagicStick
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

const filteredPrompts = computed(() => {
  let result = aiArtPrompts

  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.category === activeCategory.value)
  }

  if (showFavoritesOnly.value) {
    result = result.filter(p => favoriteIds.value.includes(p.id))
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(p =>
      p.title.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      p.prompt.toLowerCase().includes(keyword) ||
      p.tags.some(t => t.toLowerCase().includes(keyword))
    )
  }

  return result
})

const displayedPrompts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPrompts.value.slice(start, start + pageSize)
})

const showDetail = (prompt: AiArtPrompt) => {
  currentDetail.value = prompt
  detailVisible.value = true
}

const copyPrompt = async (text: string, label: string) => {
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

const copyPromptWithFeedback = async (text: string, label: string, id: string) => {
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

const copyAllPrompts = (prompt: AiArtPrompt) => {
  const positiveText = prompt.prompt
  const negativeText = prompt.negativePrompt || ''
  const allText = negativeText
    ? `【正向提示词】\n${positiveText}\n\n【反向提示词】\n${negativeText}`
    : positiveText
  copyPromptWithFeedback(allText, '全部提示词', `${prompt.id}-all`)
}

const handleTouchStart = (event: TouchEvent, text: string, label: string, id: string) => {
  isLongPress.value = false
  touchStartData.value = { text, label, id }
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    copyPromptWithFeedback(text, label, id)
    triggerHapticFeedback()
  }, 500)
}

const handleTouchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  if (!isLongPress.value && touchStartData.value) {
    copyPromptWithFeedback(
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
  currentPage.value = 1
}
</script>

<style scoped>
.ai-art-prompts {
  max-width: 1200px;
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

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.prompt-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.prompt-card:hover {
  transform: translateY(-4px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.prompt-emoji {
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

.prompt-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
}

.prompt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.prompt-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 14px 0;
}

.prompt-preview {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 14px 14px 10px;
  margin-bottom: 10px;
  border-left: 4px solid #67c23a;
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

.prompt-preview.touch-friendly {
  min-height: 60px;
}

.prompt-preview:hover {
  background: #e8f5e9;
  border-left-color: #52c41a;
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.18);
}

.prompt-preview:active {
  transform: translateX(2px) scale(0.99);
  background: #d9edc7;
}

.prompt-preview.copying {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-left-color: #67c23a;
  animation: copyPulse 0.4s ease;
}

.prompt-preview.negative {
  border-left-color: #f56c6c;
}

.prompt-preview.negative:hover {
  background: #fef0f0;
  border-left-color: #f5222d;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.18);
}

.prompt-preview.negative:active {
  background: #ffd6d6;
}

.prompt-preview.negative.copying {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-left-color: #f56c6c;
}

@keyframes copyPulse {
  0% { transform: translateX(2px) scale(1); }
  50% { transform: translateX(2px) scale(1.015); }
  100% { transform: translateX(2px) scale(1); }
}

.prompt-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  font-weight: 600;
  margin-bottom: 8px;
}

.copy-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.copy-badge.negative {
  background: linear-gradient(135deg, #f56c6c 0%, #f5222d 100%);
}

.copy-hint {
  margin-left: auto;
  color: #c0c4cc;
  transition: color 0.2s;
}

.copy-hint-text {
  font-size: 11px;
  color: #c0c4cc;
  margin-left: 2px;
  transition: color 0.2s;
}

.prompt-preview:hover .copy-hint,
.prompt-preview:hover .copy-hint-text {
  color: #67c23a;
}

.prompt-preview.negative:hover .copy-hint,
.prompt-preview.negative:hover .copy-hint-text {
  color: #f56c6c;
}

.prompt-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  -webkit-user-select: none;
}

.prompt-preview:not(.copying) .prompt-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prompt-copy-cta {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(103, 194, 58, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #67c23a;
}

.prompt-copy-cta.negative {
  border-top-color: rgba(245, 108, 108, 0.3);
  color: #f56c6c;
}

.copied-text {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

.prompt-preview.negative .copied-text {
  color: #f56c6c;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.prompt-model {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
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

.prompt-block {
  padding: 20px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.8;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  word-break: break-all;
  white-space: pre-wrap;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  -moz-user-select: none;
  -ms-user-select: none;
  min-height: 80px;
}

.prompt-block.clickable {
  cursor: pointer;
  transition: all 0.25s ease;
}

.prompt-block.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.prompt-block.clickable:active {
  transform: translateY(0) scale(0.995);
}

.prompt-block.clickable.copying {
  animation: copyPulse 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.prompt-block.positive {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  color: #67c23a;
  border: 2px solid #e1f3d8;
}

.prompt-block.positive.clickable:hover {
  background: linear-gradient(135deg, #e1f3d8 0%, #d1edc4 100%);
  border-color: #67c23a;
}

.prompt-block.negative {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  color: #f56c6c;
  border: 2px solid #fde2e2;
}

.prompt-block.negative.clickable:hover {
  background: linear-gradient(135deg, #fde2e2 0%, #fbc4c4 100%);
  border-color: #f56c6c;
}

.copy-overlay-hint {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.25s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.copy-overlay-hint.mobile-visible {
  opacity: 0.6;
}

.prompt-block.clickable:hover .copy-overlay-hint {
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

  .prompts-grid {
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

  .prompt-preview {
    padding: 16px;
    border-radius: 12px;
    min-height: 80px;
  }

  .prompt-preview.touch-friendly {
    min-height: 80px;
  }

  .copy-badge {
    padding: 4px 10px;
    font-size: 12px;
  }

  .prompt-copy-cta {
    font-size: 13px;
    padding-top: 10px;
    margin-top: 12px;
  }

  .copy-overlay-hint {
    opacity: 0.6;
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

  .copy-actions .el-button:last-child {
    flex: 1 1 100%;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .prompt-model {
    justify-content: center;
    font-size: 13px;
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

  .prompt-block {
    padding: 16px;
    font-size: 13px;
    line-height: 1.7;
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
}
</style>
