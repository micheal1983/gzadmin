<script setup>
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
// 1. 引入封装好的 API 模块
import {articleApi} from '../../api/article'

const router = useRouter()
const articles = ref([])
const loading = ref(true)

// 2. 辅助处理函数
const parseInfo = (info) => {
  if (!info) return {author: 'Admin', content: '', cover: ''}
  try {
    // 处理双重转义逻辑
    let obj = typeof info === 'string' ? JSON.parse(info) : info
    if (typeof obj === 'string') obj = JSON.parse(obj)

    return {
      author: obj.author || 'Admin',
      content: obj.content || '',
      cover: obj.cover || ''
    }
  } catch (e) {
    return {author: 'Admin', content: String(info), cover: ''}
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString()
}

// 3. 获取接口数据：改为调用 getAll
const fetchArticles = async () => {
  loading.value = true
  try {
    // 使用全局封装的请求，自动处理 BaseURL 和 Token
    const res = await articleApi.getList()

    if (res.code === 200) {
      articles.value = res.data
    } else {
      alert(res.msg || '获取列表失败')
    }
  } catch (error) {
    console.error('获取文章列表出错:', error)
  } finally {
    loading.value = false
  }
}

// 4. 删除逻辑
const handleDelete = async (id) => {
  if (confirm('确定要删除这篇文章吗？')) {
    try {
      const res = await articleApi.del(id)
      if (res.code === 200) {
        alert('删除成功')
        articles.value = articles.value.filter(item => item.id !== id);
        await fetchArticles() // 刷新列表

        // 强制浏览器刷新整个页面，跳过 Vue 的所有机制
        window.location.reload();
      } else {
        alert('后端提示：' + res.msg)
      }
    } catch (error) {
      alert('删除操作异常')
    }
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="article-list">
    <div class="page-header">
      <h2>文章管理 (全部状态)</h2>
      <button class="btn-add" @click="router.push({ name: 'ArticleAdd' })">新增文章</button>
    </div>

    <div v-if="loading" class="loading-state">数据加载中...</div>

    <table v-else class="data-table">
      <thead>
      <tr>
        <th width="80">ID</th>
        <th>标题</th>
        <th width="100">状态</th>
        <th width="120">作者</th>
        <th width="150">发布时间</th>
        <th width="180">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in articles" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>
            <span :class="['status-tag', item.status == 1 ? 'status-show' : 'status-hide']">
              {{ item.status == 1 ? '显示' : '隐藏' }}
            </span>
        </td>
        <td>{{ parseInfo(item.info).author }}</td>
        <td>{{ formatTime(item.create_time) }}</td>
        <td>
          <button class="btn-edit" @click="router.push({ name: 'ArticleEdit', params: { id: item.id } })">
            编辑
          </button>
          <button class="btn-delete" @click="handleDelete(item.id)">
            删除
          </button>
        </td>
      </tr>
      <tr v-if="articles.length === 0">
        <td colspan="6" class="empty-text">暂无数据</td>
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
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 15px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  border-bottom: 1px solid #eee;
  padding: 12px;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

/* 状态标签样式 */
.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-show {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-hide {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.btn-add {
  background: #535bf2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-edit {
  color: #535bf2;
  border: 1px solid #535bf2;
  background: white;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.btn-delete {
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  background: white;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.loading-state, .empty-text {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>