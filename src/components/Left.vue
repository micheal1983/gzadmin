<script setup>
// 这里暂时不需要复杂的逻辑，Vue Router 会自动处理跳转
</script>

<template>
  <section class="left-container">

    <ul class="module">
      <li class="item title">后台管理系统</li>
      <li>
        <router-link to="/home" class="item link" active-class="is-active">控制台首页</router-link>
      </li>
    </ul>

    <ul class="module">
      <li class="item title">游戏管理</li>
      <li>
        <router-link to="/game-add" class="item link" active-class="is-active">添加游戏</router-link>
      </li>
      <li>
        <router-link to="/game-list" class="item link" active-class="is-active">游戏列表</router-link>
      </li>
    </ul>

    <ul class="module">
      <li class="item title">文章管理</li>
      <li>
        <router-link to="/article-add" class="item link" active-class="is-active">添加文章</router-link>
      </li>
      <li>
        <router-link to="/article-list" class="item link" active-class="is-active">文章列表</router-link>
      </li>
    </ul>

    <ul class="module">
      <li class="item title">频道管理</li>
      <li>
        <router-link to="/channel-list" class="item link" active-class="is-active">频道列表</router-link>
      </li>
    </ul>

  </section>
</template>

<style scoped>
.left-container {
  width: 100%;
  height: 100%;
  background: #333333;
  color: #ffffff;
  display: flex;
  flex-direction: column;
}

ul.module {
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
  border-bottom: 1px solid #444; /* 模块分割线 */
}

ul.module li.item {
  padding: 12px 20px;
  font-size: 14px;
}

/* 标题样式：灰色背景，不可点击 */
ul.module li.title {
  background: #222222;
  color: #888888;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 链接样式：去掉默认下划线，设置基础颜色 */
.link {
  display: block;
  color: #cccccc;
  text-decoration: none;
  transition: all 0.3s ease;
}

/* 鼠标悬停：变白，背景微亮 */
.link:hover {
  background: #444444;
  color: #ffffff;
}

/* 关键：Vue Router 自动添加的选中样式 */
.is-active {
  background: #535bf2 !important; /* 你的主题色 */
  color: #ffffff !important;
  border-left: 4px solid #ffffff; /* 选中后的左边框指示 */
}
</style>