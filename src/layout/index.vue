<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon size="24" color="#ff9c00" style="margin-right: 8px;"><Bowl /></el-icon>
        <span>家庭厨房</span>
      </div>
      <el-menu
          router
          :default-active="$route.path"
          background-color="#ffffff"
          text-color="#606266"
          active-text-color="#ff9c00"
          class="kitchen-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>厨房概览</span>
        </el-menu-item>
        <el-menu-item index="/dish">
          <el-icon><Food /></el-icon>
          <span>菜谱管理</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><List /></el-icon>
          <span>点餐订单</span>
        </el-menu-item>
        <el-menu-item index="/feedback">
          <el-icon><ChatDotSquare /></el-icon>
          <span>食客反馈</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
          <span style="color: #999;">欢迎回来，</span>
          <span style="font-weight: bold; color: #ff9c00;">主厨大人 👨‍🍳</span>
        </div>
        <el-dropdown>
          <div class="avatar-wrapper">
            <el-avatar size="small" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">Admin</span>
            <el-icon><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出厨房</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const handleLogout = () => {
  localStorage.removeItem('adminToken')
  ElMessage.success('休息一下吧，主厨！')
  router.push('/login')
}
</script>

<style scoped>
.layout-container { height: 100vh; }

/* 侧边栏美化 */
.aside {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  z-index: 10;
}
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #4a4a4a;
  letter-spacing: 1px;
  border-bottom: 1px dashed #eee;
}
.kitchen-menu {
  border-right: none;
  padding-top: 10px;
}
/* 菜单项悬停效果 */
:deep(.el-menu-item:hover) {
  background-color: #fff5e6 !important;
  color: #ff9c00 !important;
}
:deep(.el-menu-item.is-active) {
  background-color: #fff5e6 !important;
  border-right: 3px solid #ff9c00;
}

/* 头部美化 */
.header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}
.username { font-size: 14px; font-weight: 600; }

/* 内容区背景 */
.main-content {
  background-color: #fdfbf7; /* 米色背景 */
  padding: 20px;
}
</style>
