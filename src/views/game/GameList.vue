<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {gameApi} from "../../api/baseModel.js";
import { channelApi } from '../../api/channel'
import {getFullUrl, parseExtInfo} from '../../utils/format'

const { t } = useI18n()
const router = useRouter()
const MODEL_ID = 5 // 🌟 改为游戏模型的 ID
const api = gameApi // 🌟 使用游戏 API

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

const getChannelName = (channelId) => {
  const channel = channels.value.find(c => c.id == channelId)
  return channel ? channel.name : t('gameList.uncategorized')
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

    const res = await gameApi.getList(params)

    if (res.code === 200) {
      articles.value = res.data
      total.value = res.total || 0
    } else {
      alert(res.msg || t('gameList.fetchListError'))
    }
  } catch (error) {
    console.error('获取游戏列表出错:', error)
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
  if (confirm(t('gameList.deleteConfirm'))) {
    try {
      // 🌟 核心：这里必须调用 gameApi
      const res = await gameApi.del(id)
      if (res.code === 200) {
        alert(t('gameList.deleteSuccess'))
        await fetchArticles() // 重新加载列表（这里的函数名虽然叫fetchArticles但不影响逻辑）
      } else {
        alert(res.msg || t('gameList.deleteFailed'))
      }
    } catch (error) {
      alert(t('gameList.deleteError'))
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
      <h2>{{ t('gameList.title') }}</h2>

      <div class="header-actions">
        <input
            type="text"
            v-model="searchForm.keyword"
            class="search-input"
            :placeholder="t('gameList.searchPlaceholder')"
            @keyup.enter="handleSearch"
        />

        <select
            v-model="searchForm.channelId"
            class="channel-select"
            @change="handleSearch"
        >
          <option value="">{{ t('gameList.allChannels') }}</option>
          <option
              v-for="channel in channels"
              :key="channel.id"
              :value="channel.id"
          >
            {{ channel.name }}
          </option>
        </select>

        <button class="btn-search" @click="handleSearch">{{ t('gameList.search') }}</button>
        <button class="btn-reset" @click="handleReset">{{ t('gameList.reset') }}</button>
        <button class="btn-add" @click="router.push({ name: 'GameAdd' })">{{ t('gameList.addGame') }}</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">{{ t('gameList.loading') }}</div>

    <table v-else class="data-table">
      <thead>
      <tr>
        <th width="80">{{ t('gameList.id') }}</th>
        <th width="120">{{ t('gameList.cover') }}</th>
        <th>{{ t('gameList.gameTitle') }}</th>
        <th width="120">{{ t('gameList.channel') }}</th>
        <th width="100">{{ t('gameList.status') }}</th>
        <th width="120">{{ t('gameList.operator') }}</th>
        <th width="150">{{ t('gameList.publishTime') }}</th>
        <th width="180">{{ t('gameList.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in articles" :key="item.id">
        <td>{{ item.id }}</td>

        <td>
          <div class="game-poster-wrapper">
            <div class="poster-tags">
              <span v-if="parseExtInfo(item.info).is_new" class="mini-tag tag-n">N</span>
              <span v-if="parseExtInfo(item.info).is_recommend" class="mini-tag tag-h">H</span>
            </div>

            <img
                v-if="parseExtInfo(item.info).cover"
                :src="getFullUrl(parseExtInfo(item.info).cover)"
                class="poster-img"
            />
            <div v-else class="poster-none">{{ t('gameList.noPoster') }}</div>
          </div>
        </td>

        <td>{{ item.name }}</td>
        <td>
          <span class="channel-tag">{{ getChannelName(item.channel_id) }}</span>
        </td>
        <td>
            <span :class="['status-tag', item.status == 1 ? 'status-show' : 'status-hide']">
              {{ item.status == 1 ? t('gameList.show') : t('gameList.hide') }}
            </span>
        </td>
        <td>{{ parseInfo(item.info).author }}</td>
        <td>{{ formatTime(item.create_time) }}</td>
        <td>
          <button class="btn-edit" @click="router.push({ name: 'GameEdit', params: { id: item.id } })">
            {{ t('gameList.edit') }}
          </button>
          <button class="btn-delete" @click="handleDelete(item.id)">
            {{ t('gameList.delete') }}
          </button>
        </td>
      </tr>
      <tr v-if="articles.length === 0">
        <td colspan="8" class="empty-text">{{ t('gameList.noGames') }}</td>
      </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="total > 0">
      <span class="page-info">{{ t('gameList.pageInfo', { total, current: currentPage, totalPages }) }}</span>
      <div class="page-buttons">
        <button
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
        >
          {{ t('gameList.prevPage') }}
        </button>

        <button
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
        >
          {{ t('gameList.nextPage') }}
        </button>
      </div>
    </div>

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  width: 200px;
  transition: all 0.3s;
  background-color: #ffffff;
  color: #333;
}

.search-input::placeholder { color: #bfbfbf; }

.search-input:focus {
  border-color: #535bf2;
  box-shadow: 0 0 0 2px rgba(83, 91, 242, 0.1);
  background-color: #ffffff;
}

.channel-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  background-color: white;
  color: #333;
  cursor: pointer;
}

.channel-select option {
  color: #333;
  background-color: white;
}

.channel-select:focus { border-color: #535bf2; }

.btn-search {
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-search:hover { color: #535bf2; border-color: #535bf2; }

.btn-reset {
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-reset:hover { color: #ff4d4f; border-color: #ff4d4f; }

.btn-add {
  background: #535bf2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-add:hover { background: #4349d8; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

/* 保证表格内容垂直居中，让文字和图片对齐更美观 */
.data-table th, .data-table td {
  border-bottom: 1px solid #eee;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

/* === 封面缩略图样式 (核心) === */
.cover-wrapper {
  width: 80px;      /* 宽度 */
  height: 40px;     /* 高度 (严格的 2:1 比例) */
  border-radius: 4px;
  overflow: hidden; /* 切割圆角外部内容 */
  background-color: #f5f5f5; /* 占位背景色 */
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片等比例填满容器不被挤压变形 */
  display: block;
}

.cover-placeholder {
  font-size: 11px;
  color: #bfbfbf;
}
/* ======================== */

.channel-tag {
  background: #f0f2f5;
  color: #595959;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

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

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.page-info {
  color: #666;
  font-size: 14px;
}

.page-buttons {
  display: flex;
  gap: 10px;
}

.page-buttons button {
  padding: 6px 15px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}

.page-buttons button:hover:not(:disabled) {
  border-color: #535bf2;
  color: #535bf2;
}

.page-buttons button:disabled {
  background: #f5f5f5;
  color: #b8b8b8;
  cursor: not-allowed;
}

/* 针对游戏列表的竖版比例优化 */
.game-cover {
  width: 60px;       /* 宽度缩小 */
  height: 75px;      /* 高度增加，保持约 1:1.24 的比例 */
  border-radius: 4px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 🌟 核心：确保竖版图片等比例裁剪填满，不拉伸 */
}

/* 🌟 海报外层容器 */
.game-poster-wrapper {
  width: 50px;
  height: 65px; /* 保持竖版比例 */
  background: #f8f9fa;
  border-radius: 4px;
  position: relative; /* 🌟 必须设为相对定位，供标签定位使用 */
  overflow: hidden;
  border: 1px solid #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证海报不拉伸 */
}

/* 🌟 悬浮标签基础样式 */
.poster-tags {
  position: absolute;
  top: 2px;
  left: 2px;
  display: flex;
  flex-direction: column; /* 标签纵向排列 */
  gap: 2px;
  z-index: 10;
}

.mini-tag {
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
  color: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* 🌟 新游标签：绿色背景 N */
.tag-n {
  background-color: #52c41a; /* 绿色 */
}

/* 🌟 推荐标签：红色背景 H */
.tag-h {
  background-color: #ff4d4f; /* 红色 */
}

.poster-none {
  font-size: 10px;
  color: #ccc;
}
</style>