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

        <div class="prompt-preview">
          <div class="prompt-label">
            <el-icon :size="14"><EditPen /></el-icon>
            <span>正向提示词</span>
          </div>
          <div class="prompt-text">{{ prompt.prompt }}</div>
        </div>

        <div v-if="prompt.negativePrompt" class="prompt-preview negative">
          <div class="prompt-label">
            <el-icon :size="14"><Close /></el-icon>
            <span>反向提示词</span>
          </div>
          <div class="prompt-text">{{ prompt.negativePrompt }}</div>
        </div>

        <div class="card-footer">
          <div class="prompt-model">
            <el-icon :size="14" color="#909399"><Cpu /></el-icon>
            <span>{{ prompt.model || '通用模型' }}</span>
          </div>
          <div class="copy-actions">
            <el-button size="small" type="primary" plain @click="copyPrompt(prompt.prompt, '正向提示词')">
              <el-icon><DocumentCopy /></el-icon>
              复制正向
            </el-button>
            <el-button
              v-if="prompt.negativePrompt"
              size="small"
              type="danger"
              plain
              @click="copyPrompt(prompt.negativePrompt, '反向提示词')"
            >
              <el-icon><DocumentCopy /></el-icon>
              复制反向
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
              size="small"
              type="success"
              @click="copyPrompt(currentDetail.prompt, '正向提示词')"
            >
              <el-icon><DocumentCopy /></el-icon>
              一键复制
            </el-button>
          </div>
          <div class="prompt-block positive">
            {{ currentDetail.prompt }}
          </div>
        </div>

        <div v-if="currentDetail.negativePrompt" class="detail-section">
          <div class="section-title">
            <el-icon :size="16" color="#f56c6c"><Close /></el-icon>
            <span>反向提示词 (Negative Prompt)</span>
            <el-button
              size="small"
              type="danger"
              @click="copyPrompt(currentDetail.negativePrompt, '反向提示词')"
            >
              <el-icon><DocumentCopy /></el-icon>
              一键复制
            </el-button>
          </div>
          <div class="prompt-block negative">
            {{ currentDetail.negativePrompt }}
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
  Cherry
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
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-left: 3px solid #67c23a;
}

.prompt-preview.negative {
  border-left-color: #f56c6c;
}

.prompt-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  margin-bottom: 6px;
}

.prompt-text {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  word-break: break-all;
  white-space: pre-wrap;
}

.prompt-block.positive {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.prompt-block.negative {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  color: #f56c6c;
  border: 1px solid #fde2e2;
}
</style>
