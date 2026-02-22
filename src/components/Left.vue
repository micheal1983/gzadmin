<script setup>
import { ref, onMounted } from 'vue'

// 1. 定义一个响应式的布尔值，默认先不显示
const isAdmin = ref(false)

// 2. 每次侧边栏组件加载时，去精确抓取一次本地缓存
onMounted(() => {
  const cid = JSON.parse(localStorage.getItem('userinfo')).channel_id
  console.log(cid);
  // 判断：如果 channel_id 等于字符串 '1'，就给管理员权限
  isAdmin.value = (cid === 1)
})
</script>

<template>
  <section class="left-container">
    <div class="brand">
      <span class="material-icons">dashboard</span>
      <span class="brand-text">GAMEZONE CMS</span>
    </div>

    <div class="menu-wrapper">
      <ul class="module">
        <li>
          <router-link to="/home" class="item link" active-class="is-active">
            <span class="material-icons">home</span>
            <span class="text">控制台首页</span>
          </router-link>
        </li>
      </ul>

      <ul class="module">
        <li class="item title">游戏管理</li>
        <li>
          <router-link to="/game-add" class="item link" active-class="is-active">
            <span class="material-icons">add_circle_outline</span>
            <span class="text">添加游戏</span>
          </router-link>
        </li>
        <li>
          <router-link to="/game-list" class="item link" active-class="is-active">
            <span class="material-icons">sports_esports</span>
            <span class="text">游戏列表</span>
          </router-link>
        </li>
      </ul>

      <ul class="module">
        <li class="item title">文章管理</li>
        <li>
          <router-link to="/article-add" class="item link" active-class="is-active">
            <span class="material-icons">post_add</span>
            <span class="text">添加文章</span>
          </router-link>
        </li>
        <li>
          <router-link to="/article-list" class="item link" active-class="is-active">
            <span class="material-icons">article</span>
            <span class="text">文章列表</span>
          </router-link>
        </li>
      </ul>

      <ul class="module">
        <li class="item title">图片库管理</li>
        <li>
          <router-link to="/picture-add" class="item link" active-class="is-active">
            <span class="material-icons">add_photo_alternate</span>
            <span class="text">上传图片</span>
          </router-link>
        </li>
        <li>
          <router-link to="/picture-list" class="item link" active-class="is-active">
            <span class="material-icons">photo_library</span>
            <span class="text">图片列表</span>
          </router-link>
        </li>
      </ul>

      <ul class="module">
        <li class="item title">频道配置</li>
        <li>
          <router-link to="/channel-list" class="item link" active-class="is-active">
            <span class="material-icons">settings_input_component</span>
            <span class="text">频道列表</span>
          </router-link>
        </li>
      </ul>



      <ul class="module" v-if="isAdmin">
        <li class="item title">系统管理</li>
        <li>
          <router-link to="/user-list" class="item link" active-class="is-active">
            <span class="material-icons">manage_accounts</span>
            <span class="text">用户与权限</span>
          </router-link>
        </li>
      </ul>


    </div>
  </section>
</template>

<style scoped>
/* 样式保持刚才发给你的那套，非常贴合专业后台感 */
.left-container { width: 100%; height: 100%; background: #1e1e2d; color: #a2a3b7; display: flex; flex-direction: column; }
.brand { height: 64px; display: flex; align-items: center; padding: 0 24px; gap: 12px; background: #1b1b28; color: #fff; border-bottom: 1px solid #2b2b40; }
.brand .material-icons { color: #535bf2; font-size: 24px; }
.brand-text { font-weight: 700; letter-spacing: 1px; font-size: 16px; }
.menu-wrapper { flex: 1; overflow-y: auto; padding: 16px 0; }
ul.module { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; }
ul.module li.title { padding: 8px 24px; font-size: 11px; color: #494b74; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
.link { display: flex; align-items: center; padding: 10px 24px; color: #a2a3b7; text-decoration: none; gap: 12px; margin: 2px 12px; border-radius: 8px; transition: all 0.2s; }
.link:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.is-active { background: #535bf2 !important; color: #fff !important; box-shadow: 0 4px 12px rgba(83, 91, 242, 0.3); }
.material-icons { font-size: 20px; }
</style>