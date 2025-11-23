<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 20px;">
      <el-input v-model="queryParams.name" placeholder="菜品名称" style="width: 200px; margin-right: 10px;" />
      <el-button type="primary" @click="fetchData">查询</el-button>
      <el-button type="success" @click="handleAdd">新增菜品</el-button>
    </div>

    <el-table :data="tableData" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="图片" width="120">
        <template #default="scope">
          <el-image style="width: 80px; height: 80px" :src="scope.row.image" :preview-src-list="[scope.row.image]" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="菜品名称" />
      <el-table-column prop="categoryName" label="分类" />
      <el-table-column prop="price" label="价格">
        <template #default="scope">¥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '上架' : '停售' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        style="margin-top: 20px; text-align: right;"
        background
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="queryParams.page"
        @current-change="fetchData"
    />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="菜品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择">
            <el-option label="热菜" :value="1" />
            <el-option label="凉菜" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/common/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios' // 实际建议封装

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: ''
})

const form = reactive({
  id: null,
  name: '',
  price: 0,
  categoryId: null,
  image: '',
  status: 1
})

// 模拟数据
const mockData = [
  { id: 1, name: '红烧肉', categoryName: '热菜', price: 48, status: 1, image: 'https://via.placeholder.com/100' },
  { id: 2, name: '拍黄瓜', categoryName: '凉菜', price: 12, status: 1, image: 'https://via.placeholder.com/100' },
]

const fetchData = async () => {
  loading.value = true
  // 这里对接你的后端接口: axios.get('/api/dish/page', { params: queryParams })
  setTimeout(() => {
    tableData.value = mockData
    total.value = 2
    loading.value = false
  }, 500)
}

const handleAdd = () => {
  dialogTitle.value = '新增菜品'
  Object.assign(form, { id: null, name: '', price: 0, categoryId: null, image: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑菜品'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该菜品吗?', '提示', { type: 'warning' }).then(() => {
    // 调用删除接口 axios.delete(`/api/dish/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleAvatarSuccess = (res) => {
  // 根据你后端返回的结构，通常是 res.data
  form.image = res.data
}

const submitForm = () => {
  // 调用新增或修改接口
  console.log('提交数据', form)
  dialogVisible.value = false
  ElMessage.success(form.id ? '修改成功' : '新增成功')
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.avatar-uploader .el-upload { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; position: relative; overflow: hidden; }
.avatar-uploader .el-upload:hover { border-color: #409EFF; }
.avatar-uploader-icon { font-size: 28px; color: #8c939d; width: 100px; height: 100px; text-align: center; line-height: 100px; }
.avatar { width: 100px; height: 100px; display: block; }
</style>