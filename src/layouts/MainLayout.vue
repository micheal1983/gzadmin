<script setup>
import Left from "../components/Left.vue";
import Top from "../components/Top.vue";
import Right from "../components/Right.vue"; // 这里的 Right 建议作为内容容器
console.log(localStorage.getItem("token"));
</script>

<template>

  <div class="admin-layout">

    <div class="sidebar">
      <Left/>
    </div>

    <div class="main-wrapper">
      <div class="header-bar">
        <Top/>
      </div>
      <div class="content-body">
        <router-view/>
      </div>
    </div>
  </div>

</template>

<style scoped>
.admin-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #2c3e50;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header-bar {
  height: 44px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 40px;
}

.content-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7f9;
}
</style>