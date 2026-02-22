<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { articleApi } from '../../api/baseModel.js'
import { channelApi } from '../../api/channel'
import { getFullUrl } from '../../utils/format'

const router = useRouter()
const MODEL_ID = 2 // 🌟 修复: 保持和表单一致，文章模型ID通常是1 (你在表单里改成了1)

const articles = ref([])
const loading = ref(true)
const channels = ref([])

const searchForm = ref({
  channelId: '',
  keyword: ''
})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1
})

watch([() => searchForm.value.channelId, () => searchForm.value.keyword, currentPage], () => {
  sessionStorage.setItem('articleListState', JSON.stringify({
    channelId: searchForm.value.channelId,
    keyword: searchForm.value.keyword,
    currentPage: currentPage.value
  }))
})

const parseInfo = (info) => {
  if (!info) return {author: 'Admin', content: '', cover: ''}
  try {
    let obj = typeof info === 'string' ? JSON.parse(info) : info
    if (typeof obj === 'string') obj = JSON.parse(obj)
    return { author: obj.author || 'Admin', content: obj.content || '', cover: obj.cover || '' }
  } catch (e) {
    return { author: 'Admin', content: String(info), cover: '' }
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString()
}

// 🌟 新增：获取频道英文标识，用于拼接图片路径
const getChannelName = (channelId) => {
  const channel = channels.value.find(c => c.id == channelId)
  return channel ? channel.name : 'news' // 默认 fallback
}

// 🌟 修改：原有的 getChannelName 改为获取中文备注
const getChannelRemark = (channelId) => {
  const channel = channels.value.find(c => c.id == channelId)
  return channel ? channel.remark : '未分类'
}

const fetchChannels = async () => {
  try {
    const res = await channelApi.getList()
    if (res.code === 200) {
      channels.value = res.data.filter(c => c.model_id == MODEL_ID)
    }
  } catch (error) {
    console.error('获取频道列表出错:', error)
  }
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    if (searchForm.value.channelId) {
      params.channel_id = searchForm.value.channelId
    }
    if (searchForm.value.keyword) {
      params.keyword = searchForm.value.keyword.trim()
    }

    const res = await articleApi.getList(params)

    if (res.code === 200) {
      // 🌟 修复：增加兜底，防止 res.data 为 undefined 导致 length 报错
      articles.value = res.data?.data || res.data || []
      total.value = res.total || res.data?.total || 0
    } else {
      alert(res.msg || '获取列表失败')
    }
  } catch (error) {
    console.error('获取文章列表出错:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchArticles()
}

const handleReset = () => {
  searchForm.value.keyword = ''
  searchForm.value.channelId = ''
  currentPage.value = 1
  fetchArticles()
}

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchArticles()
  }
}

const handleDelete = async (id) => {
  if (confirm('确定要删除这篇文章吗？')) {
    try {
      const res = await articleApi.del(id)
      if (res.code === 200) {
        alert('删除成功')
        if (articles.value.length === 1 && currentPage.value > 1) {
          currentPage.value -= 1
        }
        await fetchArticles()
      } else {
        alert('后端提示：' + res.msg)
      }
    } catch (error) {
      alert('删除操作异常')
    }
  }
}

onMounted(() => {
  const savedState = sessionStorage.getItem('articleListState')
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      searchForm.value.channelId = state.channelId || ''
      searchForm.value.keyword = state.keyword || ''
      currentPage.value = state.currentPage || 1
    } catch (e) {
      console.error('读取缓存状态失败', e)
    }
  }

  fetchChannels().then(() => {
    fetchArticles()
  })
})
</script>

<template>
  <div class="article-list">
    <div class="page-header">
      <h2>文章管理</h2>

      <div class="header-actions">
        <input
            type="text"
            v-model="searchForm.keyword"
            class="search-input"
            placeholder="搜索文章标题..."
            @keyup.enter="handleSearch"
        />

        <select
            v-model="searchForm.channelId"
            class="channel-select"
            @change="handleSearch"
        >
          <option value="">全部栏目</option>
          <option
              v-for="channel in channels"
              :key="channel.id"
              :value="channel.id"
          >
            {{ channel.remark }}
          </option>
        </select>

        <button class="btn-search" @click="handleSearch">搜索</button>
        <button class="btn-reset" @click="handleReset">重置</button>
        <button class="btn-add" @click="router.push({ name: 'ArticleAdd' })">新增文章</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th width="80">ID</th>
        <th width="120">封面</th>
        <th>文章标题</th>
        <th width="120">栏目</th>
        <th width="100">状态</th>
        <th width="120">作者</th>
        <th width="150">发布时间</th>
        <th width="180">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="8" class="loading-state">数据加载中...</td>
      </tr>
      <template v-else-if="articles?.length > 0">
        <tr v-for="item in articles" :key="item.id">
          <td>{{ item.id }}</td>

          <td>
            <div class="cover-wrapper">
              <img
                  v-if="parseInfo(item.info).cover"
                  :src="getFullUrl(parseInfo(item.info).cover, 'article', getChannelName(item.channel_id))"
                  class="cover-img"
              />
              <div v-else class="cover-placeholder">暂无图片</div>
            </div>
          </td>

          <td><strong>{{ item.name }}</strong></td>
          <td>
            <span class="channel-tag">{{ getChannelRemark(item.channel_id) }}</span>
          </td>
          <td>
              <span :class="['status-tag', item.status == 1 ? 'status-show' : 'status-hide']">
                {{ item.status == 1 ? '显示' : '隐藏' }}
              </span>
          </td>
          <td style="color: #666;">{{ parseInfo(item.info).author }}</td>
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
      </template>
      <tr v-else>
        <td colspan="8" class="empty-text">未找到符合条件的文章</td>
      </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="total > 0">
      <span class="page-info">共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页</span>
      <div class="page-buttons">
        <button
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
        >
          上一页
        </button>

        <button
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 样式部分完全保留你的原样，无需改动 */
.article-list { background: #fff; padding: 20px; border-radius: 8px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f0f2f5; padding-bottom: 15px; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.search-input { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; outline: none; font-size: 14px; width: 200px; transition: all 0.3s; background-color: #ffffff; color: #333; }
.search-input::placeholder { color: #bfbfbf; }
.search-input:focus { border-color: #535bf2; box-shadow: 0 0 0 2px rgba(83, 91, 242, 0.1); background-color: #ffffff; }
.channel-select { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; outline: none; background-color: white; color: #333; cursor: pointer; }
.channel-select option { color: #333; background-color: white; }
.channel-select:focus { border-color: #535bf2; }
.btn-search { background: #fff; color: #333; border: 1px solid #d9d9d9; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
.btn-search:hover { color: #535bf2; border-color: #535bf2; }
.btn-reset { background: #fff; color: #666; border: 1px solid #d9d9d9; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
.btn-reset:hover { color: #ff4d4f; border-color: #ff4d4f; }
.btn-add { background: #535bf2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-add:hover { background: #4349d8; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; vertical-align: middle; }
.data-table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
.cover-wrapper { width: 80px; height: 40px; border-radius: 4px; overflow: hidden; background-color: #f5f5f5; border: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: center; }
.cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-placeholder { font-size: 11px; color: #bfbfbf; }
.channel-tag { background: #f0f2f5; color: #595959; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-show { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.status-hide { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
.btn-edit { color: #535bf2; border: 1px solid #535bf2; background: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px; }
.btn-delete { color: #ff4d4f; border: 1px solid #ff4d4f; background: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; }
.loading-state, .empty-text { text-align: center; padding: 40px; color: #999; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
.page-info { color: #666; font-size: 14px; }
.page-buttons { display: flex; gap: 10px; }
.page-buttons button { padding: 6px 15px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; cursor: pointer; color: #333; }
.page-buttons button:hover:not(:disabled) { border-color: #535bf2; color: #535bf2; }
.page-buttons button:disabled { background: #f5f5f5; color: #b8b8b8; cursor: not-allowed; }
</style>