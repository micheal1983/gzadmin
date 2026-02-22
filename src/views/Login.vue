<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
// 🌟 引入我们之前定义的 API 地址配置
import { API_BASE_URL } from '../utils/format'

const router = useRouter()
const loading = ref(false) // 登录状态锁定
const message = ref({ type: '', text: '' }) // 提示信息区域

const form = reactive({
  username: '',
  password: ''
})

const onSubmit = async () => {
  if (loading.value) return // 防止重复点击

  if (!form.username || !form.password) {
    message.value = { type: 'error', text: '请填写完整的账号和密码' }
    return
  }

  loading.value = true
  message.value = { type: 'info', text: '正在验证身份，请稍候...' }

  try {
    // 使用统一的 API 地址
    const res = await axios.post(`${API_BASE_URL}user/login`, form)

    if (res.data.code === 200) {
      //获取token
      localStorage.setItem('token', res.data.data.token)
      localStorage.setItem('username', form.username)

      //解析token
      const decoded = jwtDecode(localStorage.getItem('token'))
      localStorage.setItem('userinfo', JSON.stringify(decoded.data))

      message.value = {type: 'success', text: '登录成功！正在进入系统...'}

      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      loading.value = false
      message.value = {type: 'error', text: res.data.msg || '登录失败，请检查账号密码'}
    }
  } catch (error) {
    loading.value = false

    // 🌟 核心修复：捕获 Axios 的详细错误响应
    if (error.response && error.response.data && error.response.data.msg) {
      // 如果后端传回了具体的 msg（例如：401 账号或密码错误），就显示后端的提示
      message.value = {type: 'error', text: error.response.data.msg}
    } else {
      // 只有在真的断网、服务器宕机（没有 response 时），才显示这句兜底的话
      message.value = {type: 'error', text: '服务器响应异常，请联系管理员'}
    }
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="material-icons">security</span>
        </div>
        <h2>GAMEZONE</h2>
        <p>系统管理后台</p>
      </div>

      <div v-if="message.text" :class="['message-box', message.type]">
        <span class="material-icons">{{ message.type === 'error' ? 'report' : 'info' }}</span>
        {{ message.text }}
      </div>

      <div class="login-form">
        <div class="input-group">
          <span class="material-icons">person</span>
          <input
              v-model="form.username"
              type="text"
              placeholder="用户名"
              :disabled="loading"
          />
        </div>

        <div class="input-group">
          <span class="material-icons">lock</span>
          <input
              v-model="form.password"
              type="password"
              placeholder="密码"
              :disabled="loading"
              @keyup.enter="onSubmit"
          />
        </div>

        <button
            class="btn-login"
            @click="onSubmit"
            :disabled="loading"
        >
          <template v-if="!loading">登录系统</template>
          <template v-else>
            <span class="spinner"></span>
            验证中...
          </template>
        </button>
      </div>

      <div class="login-footer">
        © 2026 GameZone CMS. All Rights Reserved.
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: radial-gradient(#535bf2 0.5px, #f0f2f5 0.5px); /* 点状背景纹理 */
  background-size: 20px 20px;
}

.login-card {
  width: 400px;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  background: #535bf2;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px;
}

.logo .material-icons {
  font-size: 32px;
}

.login-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1e1e2d;
  letter-spacing: 2px;
}

.login-header p {
  margin: 5px 0 0;
  color: #a2a3b7;
  font-size: 14px;
}

/* 🌟 信息提示框样式 */
.message-box {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.message-box.info {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.message-box.error {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.message-box.success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a2a3b7;
  font-size: 20px;
}

.input-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 12px 12px 42px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.input-group input:focus {
  border-color: #535bf2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 91, 242, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #535bf2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-login:hover {
  background: #4349d8;
}

.btn-login:disabled {
  background: #bababa;
  cursor: not-allowed;
}

/* 🌟 加载圆圈动画 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  margin-top: 40px;
  font-size: 12px;
  color: #bfbfbf;
}
</style>