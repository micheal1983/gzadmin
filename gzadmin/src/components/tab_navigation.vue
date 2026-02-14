<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'

const userInfo = ref(null)

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      // 解析 Token
      const decoded = jwtDecode(token)

      // 对应你 TP5 后端 $payload['data'] 里的内容
      // 你后端存的是 uid 和 username
      userInfo.value = decoded.data

      console.log('用户信息：', userInfo.value)
    } catch (error) {
      console.error('Token 解析失败：', error)
    }
  }
})

// 退出登录
const router = useRouter()
const handleLogout = () => {
  // 1. 清除本地存储的 Token
  localStorage.removeItem('token')

  // 2. (可选) 清除其他用户信息，如 localStorage.removeItem('user_info')

  // 3. 提示用户
  alert('已退出登录')

  // 4. 强制跳转回登录页面
  router.push('/login')
}
</script>

<template>
  <div v-if="userInfo">
    欢迎回来，{{ userInfo.username }} (ID: {{ userInfo.uid }})
    [<span class="logout-text" @click="handleLogout">退出登录</span>]
  </div>
  <div v-else>
    正在加载用户信息...
  </div>
</template>

<style scoped>
.logout-text {
  cursor: pointer;    /* 鼠标变成小手 */
  color: #409eff;     /* 给个颜色（比如蓝色） */
}

.logout-text:hover {
  color: #66b1ff;     /* 悬停时变浅，增加交互感 */
  text-decoration: underline; /* 悬停时加下划线 */
}
</style>