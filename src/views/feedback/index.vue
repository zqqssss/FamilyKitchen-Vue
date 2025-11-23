<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 20px;">
      <el-select v-model="queryParams.type" placeholder="反馈类型" clearable style="width: 150px; margin-right: 10px;">
        <el-option label="口味问题" value="口味问题" />
        <el-option label="服务态度" value="服务态度" />
        <el-option label="环境卫生" value="环境卫生" />
        <el-option label="新菜建议" value="新菜建议" />
        <el-option label="其他" value="其他" />
      </el-select>
      <el-select v-model="queryParams.status" placeholder="处理状态" clearable style="width: 150px; margin-right: 10px;">
        <el-option label="待处理" :value="0" />
        <el-option label="已处理" :value="1" />
      </el-select>
      <el-button type="primary" @click="fetchData">查询</el-button>
    </div>

    <el-table :data="tableData" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="phone" label="联系电话" width="120" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag>{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="反馈内容" show-overflow-tooltip />
      <el-table-column label="图片凭证" width="100">
        <template #default="scope">
          <el-image
              v-if="scope.row.images && scope.row.images.length > 0"
              style="width: 50px; height: 50px"
              :src="scope.row.images[0]"
              :preview-src-list="scope.row.images"
              fit="cover"
              preview-teleported
          />
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '已处理' : '待处理' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button
              v-if="scope.row.status === 0"
              size="small"
              type="primary"
              @click="handleReply(scope.row)"
          >处理</el-button>
          <el-button
              v-else
              size="small"
              type="info"
              @click="handleView(scope.row)"
          >查看</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户">{{ currentRow.userName }} ({{ currentRow.phone }})</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag>{{ currentRow.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          {{ currentRow.content }}
        </el-descriptions-item>
        <el-descriptions-item label="图片">
          <div style="display: flex; gap: 10px;">
            <el-image
                v-for="(img, idx) in currentRow.images"
                :key="idx"
                style="width: 100px; height: 100px"
                :src="img"
                :preview-src-list="currentRow.images"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px;" v-if="currentRow.status === 0">
        <el-input
            v-model="replyContent"
            :rows="4"
            type="textarea"
            placeholder="请输入处理结果或回复内容..."
        />
      </div>
      <div style="margin-top: 20px;" v-else>
        <el-alert title="已处理回复" type="success" :closable="false">
          {{ currentRow.reply || '已标记为已处理' }}
        </el-alert>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" v-if="currentRow.status === 0" @click="submitReply">确认处理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref({})
const replyContent = ref('')

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  type: '',
  status: ''
})

// 模拟数据
const mockData = [
  {
    id: 1,
    userName: '刘十三',
    phone: '13800138000',
    type: '口味问题',
    content: '今天的红烧肉有点太咸了，希望下次注意一下。',
    images: ['https://via.placeholder.com/200'],
    status: 0,
    createTime: '2025-11-23 10:00:00',
    reply: ''
  },
  {
    id: 2,
    userName: '王二',
    phone: '13900139000',
    type: '新菜建议',
    content: '希望能增加一些辣的菜品，比如水煮肉片。',
    images: [],
    status: 1,
    createTime: '2025-11-22 14:30:00',
    reply: '感谢您的建议，我们会在下周更新菜单时考虑加入。'
  }
]

const fetchData = () => {
  loading.value = true
  // 对接后端: axios.get('/api/feedback/page', { params: queryParams })
  setTimeout(() => {
    tableData.value = mockData.filter(item => {
      // 简单的模拟筛选逻辑
      if(queryParams.type && item.type !== queryParams.type) return false;
      if(queryParams.status !== '' && item.status !== queryParams.status) return false;
      return true;
    })
    total.value = tableData.value.length
    loading.value = false
  }, 500)
}

const handleReply = (row) => {
  dialogTitle.value = '反馈处理'
  currentRow.value = { ...row }
  replyContent.value = ''
  dialogVisible.value = true
}

const handleView = (row) => {
  dialogTitle.value = '反馈详情'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const submitReply = () => {
  if (!replyContent.value) {
    ElMessage.warning('请输入处理结果')
    return
  }
  // 对接后端: axios.post('/api/feedback/reply', { id: currentRow.value.id, reply: replyContent.value })
  console.log('回复内容:', replyContent.value)

  ElMessage.success('处理成功')
  dialogVisible.value = false

  // 前端模拟更新状态
  const index = mockData.findIndex(item => item.id === currentRow.value.id)
  if(index !== -1) {
    mockData[index].status = 1
    mockData[index].reply = replyContent.value
  }

  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.app-container { padding: 20px; }
</style>
