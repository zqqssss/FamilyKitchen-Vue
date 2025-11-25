<template>
  <div class="order-manage">
    <el-card>
      <!-- 顶部标签页 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="待完成" name="0"></el-tab-pane>
        <el-tab-pane label="已完成" name="1"></el-tab-pane>
        <el-tab-pane label="已取消" name="2"></el-tab-pane>
      </el-tabs>

      <!-- 订单列表 -->
      <el-table
          :data="orderList"
          border
          stripe
          v-loading="loading"
          style="width: 100%">

        <el-table-column prop="orderNo" label="订单号" width="180" />

        <el-table-column prop="consignee" label="联系人" width="100" />

        <el-table-column prop="phone" label="手机号" width="120" />

        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />

        <el-table-column prop="amount" label="金额" width="100">
          <template #default="scope">
            ¥{{ scope.row.amount?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>

        <el-table-column label="菜品" min-width="200">
          <template #default="scope">
            <div class="dish-list">
              <el-tag
                  v-for="item in scope.row.items"
                  :key="item.id"
                  size="small"
                  style="margin: 2px">
                {{ item.name }} x{{ item.quantity }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="下单时间" width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <!-- 待完成状态显示操作按钮 -->
            <div v-if="scope.row.status === 0">
              <el-button
                  type="primary"
                  size="small"
                  @click="handleAccept(scope.row)">
                接单
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  @click="showCancelDialog(scope.row)">
                退回
              </el-button>
            </div>

            <!-- 已取消状态显示取消原因 -->
            <div v-else-if="scope.row.status === 2">
              <el-popover placement="top" width="300" trigger="hover">
                <template #reference>
                  <el-button type="text" size="small">查看原因</el-button>
                </template>
                <div>
                  <p style="margin: 0; color: #909399;">取消原因：</p>
                  <p style="margin: 5px 0 0 0;">{{ scope.row.cancelReason || '无' }}</p>
                </div>
              </el-popover>
            </div>

            <!-- 已完成状态不显示操作 -->
            <span v-else style="color: #67C23A;">已完成</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <el-empty
          v-if="!loading && orderList.length === 0"
          description="暂无订单数据"
      />
    </el-card>

    <!-- 退回原因对话框 -->
    <el-dialog
        v-model="cancelDialogVisible"
        title="订单退回"
        width="500px"
        :close-on-click-modal="false">

      <el-form :model="cancelForm" :rules="cancelRules" ref="cancelFormRef">
        <el-form-item label="退回原因" prop="cancelReason">
          <el-input
              v-model="cancelForm.cancelReason"
              type="textarea"
              :rows="4"
              placeholder="请输入退回原因（必填）"
              maxlength="200"
              show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleCancel" :loading="submitting">
          确认退回
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 数据定义
const activeTab = ref('0')  // 当前标签页（字符串类型，用于 el-tabs）
const orderList = ref([])   // 订单列表
const loading = ref(false)  // 加载状态
const cancelDialogVisible = ref(false)  // 退回对话框
const submitting = ref(false)  // 提交状态
const currentOrder = ref(null)  // 当前操作的订单

// 退回表单
const cancelForm = ref({
  cancelReason: ''
})

const cancelFormRef = ref(null)

// 表单验证规则
const cancelRules = {
  cancelReason: [
    { required: true, message: '请输入退回原因', trigger: 'blur' },
    { min: 5, message: '退回原因至少5个字符', trigger: 'blur' }
  ]
}

// 页面加载时获取数据
onMounted(() => {
  fetchOrderList()
})

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    // 将字符串转为数字传给后端
    const statusParam = activeTab.value === '' ? null : Number(activeTab.value)

    const response = await axios.get('/api/order/list', {
      params: { status: statusParam }
    })

    if (response.data.code === 200) {
      orderList.value = response.data.data || []
    } else {
      ElMessage.error(response.data.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 标签页切换
const handleTabClick = () => {
  fetchOrderList()
}

// 接单操作
const handleAccept = (order) => {
  ElMessageBox.confirm(
      `确认接单【${order.orderNo}】吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      const response = await axios.post(`/api/order/accept/${order.id}`)

      if (response.data.code === 200) {
        ElMessage.success('接单成功')
        fetchOrderList()  // 刷新列表
      } else {
        ElMessage.error(response.data.message || '接单失败')
      }
    } catch (error) {
      console.error('接单失败:', error)
      ElMessage.error('网络错误，请稍后重试')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 显示退回对话框
const showCancelDialog = (order) => {
  currentOrder.value = order
  cancelForm.value.cancelReason = ''
  cancelDialogVisible.value = true

  // 重置表单验证状态
  if (cancelFormRef.value) {
    cancelFormRef.value.clearValidate()
  }
}

// 确认退回
const handleCancel = async () => {
  // 表单验证
  if (!cancelFormRef.value) return

  try {
    const valid = await cancelFormRef.value.validate()
    if (!valid) return

    submitting.value = true

    const response = await axios.post('/api/order/cancel', {
      orderId: currentOrder.value.id,
      cancelReason: cancelForm.value.cancelReason
    })

    if (response.data.code === 200) {
      ElMessage.success('订单已退回')
      cancelDialogVisible.value = false
      fetchOrderList()  // 刷新列表
    } else {
      ElMessage.error(response.data.message || '退回失败')
    }
  } catch (error) {
    console.error('退回订单失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.order-manage {
  padding: 20px;
}

.dish-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
