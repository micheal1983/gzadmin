<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'

const userInfo = ref(null)
const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const decoded = jwtDecode(token)
      userInfo.value = decoded.data
    } catch (error) {
      console.error('Token 解析失败：', error)
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<template>
  <header class="top-header">
    <div class="right-user">
      <template v-if="userInfo">
        <div class="user-profile">
          <div class="avatar">
            {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
          </div>
          <span class="welcome-text">
            欢迎回来，<strong>{{ userInfo.username }}</strong>
          </span>
          <span class="user-id">ID: {{ userInfo.uid }}</span>
        </div>
        <div class="divider"></div>

        <div class="logout-btn" @click="handleLogout">
          <span class="material-icons">logout</span>
          <span class="logout-text">退出登录</span>
        </div>
      </template>
      <div v-else class="loading-user">
        <span class="spinner-small"></span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-header {
  height: 64px;
  background: #ffffff;
  display: flex;
  /* 🌟 核心修复：改为 flex-end，让内容自然靠右，不再产生奇怪的中间空白 */
  justify-content: flex-end;
  align-items: center;
  /* 🌟 设置为你要求的右边距 50px */
  border-bottom: 1px solid #f0f2f5;
  box-sizing: border-box;
  /* 🌟 确保不受全局 center 影响 */
  text-align: left;
}

.right-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 26px;
  height: 26px;
  background: #535bf2;
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.welcome-text { font-size: 13px; color: #213547; }
.user-id { font-size: 11px; color: #a2a3b7; background: #f8f9fa; padding: 1px 5px; border-radius: 3px; }
.divider { width: 1px; height: 16px; background: #eeeeee; margin: 0 4px; }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #ff4d4f;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}

.logout-btn .material-icons {
  font-size: 16px;
  text-decoration: none !important;
}

.logout-btn:hover .logout-text { text-decoration: underline; }
.logout-btn:hover { background: #fff1f0; }

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid #f0f2f5;
  border-top-color: #535bf2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>