<script setup>
import {ref, onMounted} from 'vue'
import axios from 'axios'

// 1. 定义响应式数据
const articles = ref([])
const loading = ref(true)

// 2. 获取接口数据
const fetchArticles = async () => {
  try {
    const token = localStorage.getItem('token')
    // 调用 TP5 接口（假设路径为 /api/article/index）
    const res = await axios.get('https://tp5-5wz8.onrender.com/api/article/index', {
      headers: {'Authorization': `Bearer ${token}`} // 如果接口需要鉴权
    })

    if (res.data.code === 200) {
      articles.value = res.data.data
    } else {
      alert(res.data.msg || '获取列表失败')
    }
  } catch (error) {
    console.error('获取文章列表出错:', error)
  } finally {
    loading.value = false
  }
}

// 3. 页面加载完成后立即执行
onMounted(() => {
  fetchArticles()
})

// 4. 删除逻辑示例
const deleteArticle = (id) => {
  if (confirm('确定要删除吗？')) {
    // 调用删除接口...
    console.log('删除文章ID:', id)
  }
}
</script>

<template>
  <div class="article-list">
    <div class="page-header">
      <h2>文章列表</h2>
      <button class="btn-add" @click="$router.push({ name: 'ArticleAdd' })">新增文章</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else class="data-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>标题</th>
        <th>作者</th>
        <th>发布时间</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in articles" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.author }}</td>
        <td>{{ item.create_time }}</td>
        <td>
          <button @click="$router.push({ name: 'ArticleEdit', params: { id: item.id } })">
            编辑
          </button>
          <button class="btn-delete" @click="deleteArticle(item.id)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.article-list {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  border-bottom: 1px solid #eee;
  padding: 12px 15px;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  color: #333;
}

.data-table tr:hover {
  background-color: #fcfcfc;
}

/* 按钮样式 */
.btn-add {
  background: #535bf2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  color: #535bf2;
  border: none;
  background: none;
  cursor: pointer;
  margin-right: 10px;
}

.btn-delete {
  color: #ff4d4f;
  border: none;
  background: none;
  cursor: pointer;
}
</style>