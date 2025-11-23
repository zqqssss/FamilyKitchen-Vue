<template>
  <div class="login-container">
    <div class="login-content">
      <div class="left-panel">
        <div class="welcome-text">
          <h1>Family Kitchen</h1>
          <p>唯有爱与美食不可辜负 ❤️</p>
        </div>
      </div>

      <div class="right-panel">
        <div class="login-box">
          <h2 class="title">主厨登录</h2>
          <el-form :model="form" size="large">
            <el-form-item>
              <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading" round>
                开始烹饪
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ... (逻辑代码保持不变，与之前一致) ...
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const handleLogin = () => {
  loading.value = true
  setTimeout(() => {
    if (form.username === 'admin' && form.password === '123456') {
      localStorage.setItem('adminToken', 'mock-token')
      ElMessage.success('欢迎回来，开始准备美食吧！')
      router.push('/')
    } else {
      ElMessage.error('账号或密码错误')
    }
    loading.value = false
  }, 1000)
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100%;
  /* 找一张温馨的厨房图片作为背景 */
  background-image: url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-content {
  width: 800px;
  height: 500px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #ff9c00 0%, #ffc048 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
}

.welcome-text h1 { font-size: 32px; margin-bottom: 10px; font-weight: 800; }
.welcome-text p { font-size: 16px; opacity: 0.9; }

.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-box { width: 100%; max-width: 300px; }
.title { text-align: center; margin-bottom: 30px; color: #333; font-weight: 700; }
.login-btn { width: 100%; font-size: 16px; letter-spacing: 2px; }
</style>
