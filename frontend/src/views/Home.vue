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
            placeholder="搜索工具名称或功能描述..."
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
    >
      <el-tab-pane
        label="全部"
        name="all"
      >
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

    <div v-if="activeCategory !== 'all' && !searchKeyword" class="category-info">
      <div class="category-info-content">
        <el-icon :size="32" :color="currentCategory?.color">
          <component :is="currentCategory?.icon" />
        </el-icon>
        <div>
          <h3>{{ currentCategory?.name }}</h3>
          <p>{{ currentCategory?.description }}</p>
        </div>
      </div>
    </div>

    <div v-if="filteredTools.length > 0" class="tools-grid">
      <el-card
        v-for="tool in filteredTools"
        :key="tool.path"
        shadow="hover"
        class="tool-card"
        @click="navigateTo(tool.path)"
      >
        <div class="tool-icon" :style="{ backgroundColor: tool.color + '15' }">
          <el-icon :size="36" :color="tool.color">
            <component :is="tool.icon" />
          </el-icon>
        </div>
        <div class="tool-info">
          <h4>{{ tool.name }}</h4>
          <p>{{ tool.description }}</p>
        </div>
        <div class="tool-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </el-card>
    </div>

    <el-empty
      v-else
      description="暂无匹配的工具"
      class="empty-state"
    >
      <el-button type="primary" @click="clearSearch">清除搜索</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import {
  toolCategories,
  getAllTools,
  searchTools,
  getCategoryById,
  type ToolItem
} from '@/data/tools'

const router = useRouter()
const searchKeyword = ref('')
const activeCategory = ref('all')

const totalTools = computed(() => getAllTools().length)

const currentCategory = computed(() => getCategoryById(activeCategory.value))

const filteredTools = computed((): ToolItem[] => {
  if (searchKeyword.value) {
    return searchTools(searchKeyword.value)
  }
  if (activeCategory.value === 'all') {
    return getAllTools()
  }
  return currentCategory.value?.tools || []
})

const navigateTo = (path: string) => {
  router.push(path)
}

const clearSearch = () => {
  searchKeyword.value = ''
}
</script>

<style scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-card :deep(.el-card__body) {
  padding: 0;
}

.hero-section {
  padding: 48px 40px;
  text-align: center;
  color: #fff;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-content h1 {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
}

.hero-desc {
  margin: 0 0 28px;
  font-size: 16px;
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
  padding: 0 16px;
  height: 52px;
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
  margin-bottom: 4px;
}

.category-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
}

.category-info-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-info-content h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #303133;
}

.category-info-content p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.tool-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #ebeef5;
  border-radius: 10px;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: #dcdfe6;
}

.tool-card :deep(.el-card__body) {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-icon {
  width: 64px;
  height: 64px;
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

.tool-info h4 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.tool-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
    padding: 32px 20px;
  }

  .hero-content h1 {
    font-size: 24px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .tab-label span {
    display: none;
  }
}
</style>
