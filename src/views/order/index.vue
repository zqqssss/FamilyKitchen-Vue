<template>
  <div class="app-container">
    <el-tabs v-model="activeStatus" @tab-click="fetchData">
      <el-tab-pane label="待接单" name="1"></el-tab-pane>
      <el-tab-pane label="制作中" name="2"></el-tab-pane>
      <el-tab-pane label="派送中" name="3"></el-tab-pane>
      <el-tab-pane label="已完成" name="4"></el-tab-pane>
    </el-tabs>

    <el-table :data="tableData" border v-loading="loading">
      <el-table-column prop="id" label="订单号" width="180" />
      <el-table-column prop="consignee" label="联系人" width="120" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column prop="address" label="地址" show-overflow-tooltip />
      <el-table-column prop="amount" label="金额">
        <template #default="scope">¥{{ scope.row.amount }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button v-if="scope.row.status === 1" type="primary" size="small" @click="handleStatus(scope.row, 2)">接单</el-button>
          <el-button v-if="scope.row.status === 2" type="success" size="small" @click="handleStatus(scope.row, 3)">派送</el-button>
          <el-button v-if="scope.row.status === 3" type="warning" size="small" @click="handleStatus(scope.row, 4)">完成</el-button>
          <el-button type="text" size="small">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeStatus = ref('1')
const loading = ref(false)
const tableData = ref([])

const fetchData = () => {
  loading.value = true
  // 模拟请求 axios.get('/api/order/list', { params: { status: activeStatus.value } })
  setTimeout(() => {
    tableData.value = [
      { id: 'ORD20251123001', consignee: '张三', phone: '13800138000', address: '北京市朝阳区...', amount: 88.5, status: parseInt(activeStatus.value), createTime: '2025-11-23 12:00:00' }
    ]
    loading.value = false
  }, 300)
}

const handleStatus = (row, nextStatus) => {
  // axios.put('/api/order/status', { id: row.id, status: nextStatus })
  ElMessage.success('操作成功')
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>