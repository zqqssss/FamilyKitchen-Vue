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
          <el-form :model="form" :rules="rules" ref="formRef" size="large">
            <el-form-item prop="username">
              <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="密码"
                  prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleLogin"
              />
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/login' // 引入刚才定义的API

const router = useRouter()
const loading = ref(false)
const formRef = ref(null) // 获取表单实例

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  // 1. 表单校验
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 2. 调用后端登录接口
        const res = await loginApi(form)

        // 3. 登录成功处理
        // 这里的 res 已经被 request.js 拦截器处理过，直接是 data 部分
        // 如果你的 request.js 返回的是完整 response，则需要 res.data.token

        // 保存 Token (根据你后端的 VO 结构)
        localStorage.setItem('adminToken', res.token)
        localStorage.setItem('adminInfo', JSON.stringify({
          name: res.name,
          username: res.userName
        }))

        ElMessage.success('登录成功，欢迎回来！')

        // 跳转到首页
        router.push('/')

      } catch (error) {
        // 错误已经在 request.js 中统一弹窗处理了，这里可以打印日志
        console.error('登录失败', error)
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单校验失败')
      return false
    }
  })
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
