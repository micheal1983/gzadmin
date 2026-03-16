<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const userInfo = ref(null)
const router = useRouter()
const { t, locale } = useI18n()

onMounted(() => {
  console.log(localStorage.getItem('userinfo'))
  userInfo.value = JSON.parse(localStorage.getItem('userinfo'))
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const toggleLanguage = (event) => {
  const selectedLang = event.target.value
  locale.value = selectedLang
  localStorage.setItem('lang', selectedLang)
}
</script>

<template>
  <header class="top-header">
    <div class="right-user">
      <div class="language-switch">
        <select @change="toggleLanguage" :value="locale">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>

      <template v-if="userInfo">
        <div class="user-profile">
          <div class="avatar">
            {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
          </div>
          <span class="welcome-text">
            {{ t('topbar.welcome') }}，<strong>{{ userInfo.username }}</strong>
          </span>
          <span class="user-id">ID: {{ userInfo.uid }}</span>
        </div>
        <div class="divider"></div>

        <div class="logout-btn" @click="handleLogout">
          <span class="material-icons">logout</span>
          <span class="logout-text">{{ t('topbar.logout') }}</span>
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
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid #f0f2f5;
  box-sizing: border-box;
  text-align: left;
}

.right-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-switch select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  outline: none;
  cursor: pointer;
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