<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>今日订单</span>
              <el-tag type="success">日</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.todayOrders }}</div>
            <div class="compare">
              较昨日 <span class="up">-- <el-icon><Top /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>总销售额</span>
              <el-tag type="warning">总</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">¥{{ stats.totalSales }}</div>
            <div class="compare">
              较上月 <span class="up">-- <el-icon><Top /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>在售菜品</span>
              <el-tag>总</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.dishCount }}</div>
            <div class="compare">
              本周新增 <span class="down">-- <el-icon><Plus /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>注册用户</span>
              <el-tag type="danger">总</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ stats.userCount }}</div>
            <div class="compare">
              较上周 <span class="up">-- <el-icon><Top /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户列表和图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>注册用户列表</span>
            </div>
          </template>
          <el-table :data="userList" style="width: 100%" height="350">
            <el-table-column prop="avatarUrl" label="头像" width="80">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              </template>
            </el-table-column>
            <el-table-column prop="nickname" label="昵称" width="120" />
            <el-table-column prop="createTime" label="注册时间">
              <template #default="scope">
                {{ formatTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" width="120">
               <template #default="scope">{{ scope.row.phone || '-' }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>近七日营业额趋势</span>
            </div>
          </template>
          <div ref="salesChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getOrderList } from '@/api/order'
import { getUserList } from '@/api/user'
import { getRecipeList } from '@/api/recipe' // 假设有这个API，如果没有就先写死

// 统计数据
const stats = reactive({
  todayOrders: 0,
  totalSales: 0,
  dishCount: 0,
  userCount: 0
})

const userList = ref([])

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  return timeStr.replace('T', ' ').substring(0, 19)
}

// 获取数据
const fetchData = async () => {
  try {
    // 1. 获取订单列表
    const orderRes = await getOrderList()
    if (orderRes.code === 200) {
      const orders = orderRes.data
      
      // 计算今日订单
      const today = new Date().toISOString().split('T')[0]
      stats.todayOrders = orders.filter(o => o.createTime && o.createTime.startsWith(today)).length
      
      // 计算总销售额 (只算已完成的？这里先算所有的有效订单，排除已取消)
      // 状态: 0-待完成 1-已完成 2-已取消
      const validOrders = orders.filter(o => o.status !== 2)
      stats.totalSales = validOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)
      
      // 更新图表数据 (简单模拟，实际应该按日期聚合)
      updateChart(orders)
    }

    // 2. 获取用户列表
    const userRes = await getUserList()
    if (userRes.code === 200) {
      userList.value = userRes.data
      stats.userCount = userRes.data.length
    }

    // 3. 获取菜品数量 (如果有API)
    // const recipeRes = await getRecipeList()
    // if (recipeRes.code === 200) stats.dishCount = recipeRes.data.total
    stats.dishCount = 12 // 暂时写死或后续对接

  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  }
}

// 图表实例
const salesChartRef = ref(null)
let salesChart = null

const initChart = () => {
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [{
        name: '营业额',
        type: 'line',
        smooth: true,
        data: [0, 0, 0, 0, 0, 0, 0], // 初始数据
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#409EFF' }
      }]
    }
    salesChart.setOption(option)
  }
}

const updateChart = (orders) => {
    // 这里简单模拟一下数据更新，实际需要复杂的日期聚合逻辑
    // 暂时保持静态展示，或者随机生成一些波动
    if(salesChart) {
        salesChart.setOption({
            series: [{
                data: [120, 200, 150, 80, 70, 110, 130] // 模拟数据
            }]
        })
    }
}

// 响应式调整图表大小
const handleResize = () => {
  salesChart && salesChart.resize()
}

onMounted(() => {
  initChart()
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (salesChart) {
    salesChart.dispose()
  }
})
</script>

<style scoped>
.dashboard-container { padding: 0; }

/* 卡片样式升级 */
.data-card {
  border: none;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s;
  cursor: pointer;
}
.data-card:hover {
  transform: translateY(-5px);
}

/* 为四个卡片定义不同的渐变背景 */
.el-col:nth-child(1) .data-card {
  background: linear-gradient(135deg, #fff5e6 0%, #fff 100%);
  border-left: 5px solid #ff9c00;
}
.el-col:nth-child(2) .data-card {
  background: linear-gradient(135deg, #e6fffb 0%, #fff 100%);
  border-left: 5px solid #13c2c2;
}
.el-col:nth-child(3) .data-card {
  background: linear-gradient(135deg, #e6f7ff 0%, #fff 100%);
  border-left: 5px solid #1890ff;
}
.el-col:nth-child(4) .data-card {
  background: linear-gradient(135deg, #fff1f0 0%, #fff 100%);
  border-left: 5px solid #f5222d;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-weight: 600;
}

.number {
  font-size: 32px;
  font-weight: 800;
  color: #333;
  margin: 15px 0;
  font-family: 'Arial', sans-serif;
}

/* 图表卡片 */
.el-card {
  margin-bottom: 20px;
}
</style>

