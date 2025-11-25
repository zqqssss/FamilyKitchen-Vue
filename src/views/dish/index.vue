<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
          v-model="queryParams.title"
          placeholder="搜索菜品名称"
          style="width: 200px;"
          clearable
          @clear="fetchData"
          @keyup.enter="fetchData"
      />

      <el-select
          v-model="queryParams.category"
          placeholder="选择分类"
          clearable
          style="width: 150px;"
          @change="fetchData"
      >
        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>



      <el-button type="primary" @click="fetchData">
        <el-icon style="margin-right: 5px"><Search /></el-icon>查询
      </el-button>
      <el-button type="success" @click="handleAdd">
        <el-icon style="margin-right: 5px"><Plus /></el-icon>新增菜谱
      </el-button>
    </div>

    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />

      <el-table-column label="封面图" width="120" align="center">
        <template #default="scope">
          <el-image
              style="width: 80px; height: 80px; border-radius: 8px;"
              :src="scope.row.coverImage"
              :preview-src-list="[scope.row.coverImage]"
              fit="cover"
              preview-teleported
          >
            <template #error>
              <div class="image-slot"><el-icon><Picture /></el-icon></div>
            </template>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="菜品名称" width="180" />

      <el-table-column prop="category" label="分类" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getCategoryType(scope.row.category)" effect="light" round>
            {{ getCategoryLabel(scope.row.category) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 新增价格列 -->
      <el-table-column prop="price" label="价格（元）" width="120" align="center">
        <template #default="scope">
          {{ scope.row.price || 0.00 }}
        </template>
      </el-table-column>

      <el-table-column prop="description" label="简介" show-overflow-tooltip />

      <el-table-column prop="createTime" label="创建时间" width="180" align="center">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" link @click="handleEdit(scope.row)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button size="small" type="danger" link @click="handleDelete(scope.row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        class="pagination-container"
        background
        layout="total, prev, pager, next, jumper"
        :total="total"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        @current-change="fetchData"
    />

    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        destroy-on-close
        :close-on-click-modal="false"
    >
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">

        <el-form-item label="菜品名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入菜品名称 (如: 红烧肉)" />
        </el-form-item>

        <el-form-item label="菜品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%;">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 新增价格输入框 -->
        <el-form-item label="菜品价格" prop="price">
          <el-input
              v-model="form.price"
              placeholder="请输入菜品价格 (如: 28.88)"
              type="number"
              step="0.01"
              min="0"
              style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="封面图片" prop="coverImage">
          <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              name="image"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="tips">支持 JPG/PNG，大小不超过 5MB</div>
        </el-form-item>

        <el-form-item label="菜品简介" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              rows="4"
              placeholder="描述一下这道菜的口感、特色或做法..."
          />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecipePage, addRecipe, updateRecipe, deleteRecipe } from '@/api/recipe'

// === 配置项 ===
// 图片上传地址 (对应 RecipeController 中的 @PostMapping("/upload"))
const uploadUrl = '/api/recipe/upload'

// 分类映射 (对应后端的 RecipeCategory 枚举)
const categoryOptions = [
  { value: 1, label: '肉菜', type: 'danger' },
  { value: 2, label: '素菜', type: 'success' },
  { value: 3, label: '青菜', type: 'success' },
  { value: 4, label: '主食', type: 'warning' },
  { value: 5, label: '甜品', type: 'primary' },
  { value: 6, label: '汤羹', type: 'info' }
]

// === 响应式变量 ===
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  title: '',
  category: null
})

// 表单对象
const form = reactive({
  id: null,
  title: '',
  category: null,
  coverImage: '',
  description: '',
  price: 0 // 新增价格
})

// 表单校验规则
const rules = {
  title: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择菜品分类', trigger: 'change' }],
  coverImage: [{ required: true, message: '请上传封面图片', trigger: 'change' }],
  // 新增价格校验
  price: [
    { required: true, message: '请输入菜品价格', trigger: 'blur' },
    // 优化1：用 validator 自定义校验，兼容字符串/数字类型
    {
      validator: (rule, value, callback) => {
        // 转换为数字（空值/非数字会转为NaN）
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          callback(new Error('价格必须是大于等于0的数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// === 方法 ===

// 格式化时间 (简单处理，建议用 dayjs)
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ')
}

// 获取分类名称
const getCategoryLabel = (val) => {
  const item = categoryOptions.find(opt => opt.value === val)
  return item ? item.label : val
}

// 获取分类 Tag 颜色
const getCategoryType = (val) => {
  const item = categoryOptions.find(opt => opt.value === val)
  return item ? item.type : ''
}

// 1. 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRecipePage(queryParams)
    // 后端返回的 Result<Page<Recipe>>，res 已经是 data 部分了
    // 具体取决于你的 request.js 拦截器怎么写的，通常 res.records 是列表
    if (res && res.records) {
      tableData.value = res.records
      total.value = res.total
    } else {
      // 兼容另一种可能结构 (直接返回 Page 对象)
      tableData.value = res.records || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

// 2. 打开新增
const handleAdd = () => {
  dialogTitle.value = '新增菜谱'
  Object.assign(form, { id: null, title: '', category: null, coverImage: '', description: '' })
  dialogVisible.value = true
  // 等待 DOM 更新后重置校验
  setTimeout(() => {
    if(formRef.value) formRef.value.clearValidate()
  }, 0)
}

// 3. 打开编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑菜谱'
  // 浅拷贝数据到 form
  Object.assign(form, {
    id: row.id,
    title: row.title,
    category: row.category, // 注意：如果后端返回的是中文"肉菜"，这里可能需要转换回数字
    coverImage: row.coverImage,
    description: row.description
  })
  dialogVisible.value = true
}

// 4. 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除菜品 "${row.title}" 吗?`, '温馨提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRecipe(row.id)
      ElMessage.success('删除成功')
      fetchData() // 刷新列表
    } catch (error) {
      console.error(error)
    }
  })
}

// 5. 上传成功回调
const handleAvatarSuccess = (res) => {
  // res 是后端 Result<String> 的 json
  // 根据 request.js 拦截情况，可能直接是 data，也可能是完整对象
  // 假设后端标准返回: { code: 200, data: "http://...", message: "success" }
  // 而 el-upload 默认不会走 axios 拦截器，所以拿到的是原始 response

  if (res.code === 200) {
    form.coverImage = res.data // 赋值 URL
    ElMessage.success('图片上传成功')
    // 手动触发一下校验，消除红色警告
    if(formRef.value) formRef.value.validateField('coverImage')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

// 上传前校验
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('图片格式必须为 JPG 或 PNG!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 6. 提交保存
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.id) {
          await updateRecipe(form)
          ElMessage.success('修改成功')
        } else {
          await addRecipe(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>

/* 价格列样式 */
:deep(.el-table-column--price) {
  color: #e6a23c; /* 橙色突出价格 */
  font-weight: 600;
}
/* 整体容器样式：增加阴影和圆角 */
.app-container {
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 顶部筛选栏 */
.filter-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
}

/* 分页栏靠右 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 图片上传器美化 */
.avatar-uploader {
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  background-color: #fbfbfb;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
  background-color: #f5f7fa;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.tips {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
}
</style>
