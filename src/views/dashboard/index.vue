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
              较昨日 <span class="up">+10% <el-icon><Top /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>总销售额</span>
              <el-tag type="warning">月</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">¥{{ stats.totalSales }}</div>
            <div class="compare">
              较上月 <span class="up">+15% <el-icon><Top /></el-icon></span>
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
              本周新增 <span class="down">2 <el-icon><Plus /></el-icon></span>
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
              较上周 <span class="up">+5% <el-icon><Top /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>近七日营业额趋势</span>
            </div>
          </template>
          <div ref="salesChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热销菜品排行</span>
            </div>
          </template>
          <el-table :data="hotDishes" style="width: 100%" :show-header="false">
            <el-table-column type="index" width="50" />
            <el-table-column prop="name" label="菜名" />
            <el-table-column prop="sales" label="销量" width="100" align="right">
              <template #default="scope">{{ scope.row.sales }} 份</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 统计数据
const stats = reactive({
  todayOrders: 128,
  totalSales: 45800,
  dishCount: 45,
  userCount: 1203
})

// 热销排行模拟数据
const hotDishes = ref([
  { name: '红烧肉', sales: 320 },
  { name: '宫保鸡丁', sales: 280 },
  { name: '糖醋排骨', sales: 250 },
  { name: '酸辣土豆丝', sales: 190 },
  { name: '玉米排骨汤', sales: 150 },
])

// 图表实例
const salesChartRef = ref(null)
let salesChart = null

const initChart = () => {
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '营业额',
          type: 'line',
          smooth: true,
          data: [1200, 1320, 1010, 1340, 2900, 2300, 2100],
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    }
    salesChart.setOption(option)
  }
}

// 响应式调整图表大小
const handleResize = () => {
  salesChart && salesChart.resize()
}

onMounted(() => {
  // 实际开发中在这里调用 API 获取 stats 和 图表数据
  initChart()
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

