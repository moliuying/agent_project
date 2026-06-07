<template>
  <div class="menu-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <div class="header-buttons">
            <el-button type="success" @click="handleBatchImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增菜单
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        style="width: 100%"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
      >
        <el-table-column prop="name" label="菜单名称" width="200" />
        <el-table-column prop="path" label="路由路径" width="200" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由路径，如 /menu" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择图标">
            <el-option
              v-for="icon in iconList"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <el-icon><component :is="icon" /></el-icon>
              <span style="margin-left: 10px">{{ icon }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuTreeData"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择父级菜单（不选则为顶级菜单）"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="formData.component" placeholder="请输入组件路径，如 views/Menu.vue" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="batchImportVisible"
      title="批量导入菜单"
      width="800px"
      @close="handleBatchImportClose"
    >
      <div class="batch-import-tips">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
        >
          <template #default>
            <p>1. 请按照以下 JSON 格式输入菜单数据</p>
            <p>2. 支持一次导入多个菜单</p>
            <p>3. parentId 为 null 表示顶级菜单</p>
          </template>
        </el-alert>
      </div>
      
      <div class="json-editor-wrapper">
        <el-input
          v-model="batchImportJson"
          type="textarea"
          :rows="15"
          placeholder='请输入 JSON 数据，例如：
[
  {
    "name": "系统管理",
    "path": "/system",
    "icon": "Setting",
    "parentId": null,
    "component": "views/System.vue",
    "sort": 0
  },
  {
    "name": "用户管理",
    "path": "/system/user",
    "icon": "User",
    "parentId": null,
    "component": "views/User.vue",
    "sort": 1
  }
]'
        />
      </div>

      <div class="batch-import-preview" v-if="previewData.length > 0">
        <h4>预览（{{ previewData.length }} 条数据）</h4>
        <el-table :data="previewData" size="small" border max-height="200">
          <el-table-column prop="name" label="菜单名称" width="150" />
          <el-table-column prop="path" label="路由路径" />
          <el-table-column prop="icon" label="图标" width="100" />
          <el-table-column prop="sort" label="排序" width="80" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="batchImportVisible = false">取消</el-button>
        <el-button type="info" @click="handleFormatJson" :disabled="!batchImportJson">
          格式化验证
        </el-button>
        <el-button type="primary" @click="handleBatchImportSubmit" :loading="batchImporting" :disabled="previewData.length === 0">
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { menuApi, type Menu, type CreateMenuDto } from '@/api/menu'

const loading = ref(false)
const tableData = ref<Menu[]>([])
const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.value.id ? '编辑菜单' : '新增菜单'))
const submitting = ref(false)
const formRef = ref<FormInstance>()
const batchImportVisible = ref(false)
const batchImportJson = ref('')
const batchImporting = ref(false)
const previewData = ref<CreateMenuDto[]>([])

const iconList = [
  'Home', 'HomeFilled', 'Menu', 'Setting', 'User', 'Document',
  'Folder', 'Files', 'DataLine', 'PieChart', 'Grid', 'List',
  'Calendar', 'Headset', 'Location', 'Edit', 'Cpu', 'Monitor',
  'Money', 'ChatDotRound', 'Connection', 'DataBoard', 'Platform',
  'TrendCharts', 'MagicStick', 'Search', 'Tools', 'PictureFilled',
  'Link', 'Histogram', 'Promotion', 'ChatLineSquare', 'Tickets',
  'Bell', 'CircleCheck', 'Warning', 'InfoFilled', 'Lightning'
]

const formData = ref<Partial<Menu>>({
  name: '',
  path: '',
  icon: '',
  parentId: null,
  component: '',
  sort: 0
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
}

const menuTreeData = computed(() => {
  const filterMenu = (menu: Menu): any => {
    if (formData.value.id && menu.id === formData.value.id) {
      return null
    }
    const node: any = {
      id: menu.id,
      name: menu.name,
      children: []
    }
    if (menu.children) {
      node.children = menu.children
        .map(filterMenu)
        .filter((item: any) => item !== null)
    }
    return node
  }
  return tableData.value.map(filterMenu).filter(item => item !== null)
})

const fetchMenuList = async () => {
  loading.value = true
  try {
    const { data } = await menuApi.getMenuList()
    tableData.value = data
  } catch (error) {
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  formData.value = {
    name: '',
    path: '',
    icon: 'Menu',
    parentId: null,
    component: '',
    sort: 0
  }
  dialogVisible.value = true
}

const handleEdit = (row: Menu) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: Menu) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await menuApi.deleteMenu(row.id)
    ElMessage.success('删除成功')
    await fetchMenuList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const data: CreateMenuDto = {
        name: formData.value.name!,
        path: formData.value.path!,
        icon: formData.value.icon!,
        parentId: formData.value.parentId || null,
        component: formData.value.component!,
        sort: formData.value.sort || 0
      }
      
      if (formData.value.id) {
        await menuApi.updateMenu(formData.value.id, data)
        ElMessage.success('更新成功')
      } else {
        await menuApi.createMenu(data)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      await fetchMenuList()
    } catch (error) {
      ElMessage.error(formData.value.id ? '更新失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const handleBatchImport = () => {
  batchImportVisible.value = true
  batchImportJson.value = ''
  previewData.value = []
}

const handleBatchImportClose = () => {
  batchImportJson.value = ''
  previewData.value = []
}

const handleFormatJson = () => {
  try {
    const data = JSON.parse(batchImportJson.value)
    if (!Array.isArray(data)) {
      throw new Error('数据格式错误：必须是数组')
    }
    batchImportJson.value = JSON.stringify(data, null, 2)
    previewData.value = data
    ElMessage.success(`格式正确，共 ${data.length} 条数据`)
  } catch (error: any) {
    ElMessage.error(`JSON 格式错误：${error.message}`)
    previewData.value = []
  }
}

const handleBatchImportSubmit = async () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('请先格式化验证数据')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要导入 ${previewData.value.length} 条菜单数据吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  batchImporting.value = true
  try {
    await menuApi.batchImportMenu(previewData.value)
    ElMessage.success('批量导入成功')
    batchImportVisible.value = false
    await fetchMenuList()
  } catch (error) {
    ElMessage.error('批量导入失败')
  } finally {
    batchImporting.value = false
  }
}

onMounted(() => {
  fetchMenuList()
})
</script>

<style scoped>
.menu-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.batch-import-tips {
  margin-bottom: 20px;
}

.batch-import-tips :deep(.el-alert__description p) {
  margin: 5px 0;
  font-size: 13px;
}

.json-editor-wrapper {
  margin-bottom: 20px;
}

.json-editor-wrapper :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.batch-import-preview {
  margin-top: 20px;
}

.batch-import-preview h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}
</style>
