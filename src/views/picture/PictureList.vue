<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { pictureApi } from '../../api/baseModel.js'
import { channelApi } from '../../api/channel'
import { getFullUrl } from '../../utils/format'

const { t } = useI18n()
const router = useRouter()
const MODEL_ID = 4 // 🌟 修复: 图片模型 ID 是 4

const pictures = ref([]) // 🌟 变量名改为 pictures
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

// 🌟 修复: 缓存 Key 改为 pictureListState，避免与文章列表冲突
watch([() => searchForm.value.channelId, () => searchForm.value.keyword, currentPage], () => {
  sessionStorage.setItem('pictureListState', JSON.stringify({
    channelId: searchForm.value.channelId,
    keyword: searchForm.value.keyword,
    currentPage: currentPage.value
  }))
})

const parseInfo = (info) => {
  if (!info) return { cover: '', url: '' }
  try {
    let obj = typeof info === 'string' ? JSON.parse(info) : info
    if (typeof obj === 'string') obj = JSON.parse(obj)
    return { cover: obj.cover || '', url: obj.url || '' } // 图片通常只需要封面和外链
  } catch (e) {
    return { cover: '', url: '' }
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString()
}

const getChannelName = (channelId) => {
  const channel = channels.value.find(c => c.id == channelId)
  return channel ? channel.name : 'gallery' // 🌟 默认目录改为 gallery
}

const getChannelRemark = (channelId) => {
  const channel = channels.value.find(c => c.id == channelId)
  return channel ? channel.remark : t('pictureList.uncategorized')
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

const fetchPictures = async () => {
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

    const res = await pictureApi.getList(params)

    if (res.code === 200) {
      pictures.value = res.data?.data || res.data || []
      total.value = res.total || res.data?.total || 0
    } else {
      alert(res.msg || t('pictureList.fetchListError'))
    }
  } catch (error) {
    console.error('获取图片列表出错:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchPictures()
}

const handleReset = () => {
  searchForm.value.keyword = ''
  searchForm.value.channelId = ''
  currentPage.value = 1
  fetchPictures()
}

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchPictures()
  }
}

const handleDelete = async (id) => {
  if (confirm(t('pictureList.deleteConfirm'))) {
    try {
      const res = await pictureApi.del(id)
      if (res.code === 200) {
        if (pictures.value.length === 1 && currentPage.value > 1) {
          currentPage.value -= 1
        }
        await fetchPictures()
      } else {
        alert(t('pictureList.backendError') + res.msg)
      }
    } catch (error) {
      alert(t('pictureList.deleteError'))
    }
  }
}

onMounted(() => {
  const savedState = sessionStorage.getItem('pictureListState')
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
    fetchPictures()
  })
})
</script>

<template>
  <div class="picture-list">
    <div class="page-header">
      <h2>{{ t('pictureList.title') }}</h2>

      <div class="header-actions">
        <input
            type="text"
            v-model="searchForm.keyword"
            class="search-input"
            :placeholder="t('pictureList.searchPlaceholder')"
            @keyup.enter="handleSearch"
        />

        <select
            v-model="searchForm.channelId"
            class="channel-select"
            @change="handleSearch"
        >
          <option value="">{{ t('pictureList.allChannels') }}</option>
          <option
              v-for="channel in channels"
              :key="channel.id"
              :value="channel.id"
          >
            {{ channel.remark }}
          </option>
        </select>

        <button class="btn-search" @click="handleSearch">{{ t('pictureList.search') }}</button>
        <button class="btn-reset" @click="handleReset">{{ t('pictureList.reset') }}</button>
        <button class="btn-add" @click="router.push({ name: 'PictureAdd' })">{{ t('pictureList.addPicture') }}</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th width="80">{{ t('pictureList.id') }}</th>
        <th width="160">{{ t('pictureList.preview') }}</th>
        <th>{{ t('pictureList.pictureTitle') }}</th>
        <th width="120">{{ t('pictureList.channel') }}</th>
        <th width="100">{{ t('pictureList.status') }}</th>
        <th width="150">{{ t('pictureList.uploadTime') }}</th>
        <th width="180">{{ t('pictureList.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="7" class="loading-state">{{ t('pictureList.loading') }}</td>
      </tr>
      <template v-else-if="pictures?.length > 0">
        <tr v-for="item in pictures" :key="item.id">
          <td>{{ item.id }}</td>

          <td>
            <div class="cover-wrapper">
              <img
                  v-if="parseInfo(item.info).cover"
                  :src="getFullUrl(parseInfo(item.info).cover, 'picture', getChannelName(item.channel_id))"
                  class="cover-img"
              />
              <div v-else class="cover-placeholder">{{ t('pictureList.noImage') }}</div>
            </div>
          </td>

          <td><strong>{{ item.name }}</strong></td>
          <td>
            <span class="channel-tag">{{ getChannelRemark(item.channel_id) }}</span>
          </td>
          <td>
              <span :class="['status-tag', item.status == 1 ? 'status-show' : 'status-hide']">
                {{ item.status == 1 ? t('pictureList.show') : t('pictureList.hide') }}
              </span>
          </td>
          <td>{{ formatTime(item.create_time) }}</td>
          <td>
            <button class="btn-edit" @click="router.push({ name: 'PictureEdit', params: { id: item.id } })">
              {{ t('pictureList.edit') }}
            </button>
            <button class="btn-delete" @click="handleDelete(item.id)">
              {{ t('pictureList.delete') }}
            </button>
          </td>
        </tr>
      </template>
      <tr v-else>
        <td colspan="7" class="empty-text">{{ t('pictureList.noPictures') }}</td>
      </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="total > 0">
      <span class="page-info">{{ t('pictureList.pageInfo', { total, current: currentPage, totalPages }) }}</span>
      <div class="page-buttons">
        <button
            :disabled="currentPage === 1"
            @click="handlePageChange(currentPage - 1)"
        >
          {{ t('pictureList.prevPage') }}
        </button>

        <button
            :disabled="currentPage === totalPages"
            @click="handlePageChange(currentPage + 1)"
        >
          {{ t('pictureList.nextPage') }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 保持原有结构，仅优化图片预览尺寸 */
.picture-list {
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

.search-input::placeholder {
  color: #bfbfbf;
}

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

.channel-select:focus {
  border-color: #535bf2;
}

.btn-search {
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-search:hover {
  color: #535bf2;
  border-color: #535bf2;
}

.btn-reset {
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reset:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-add {
  background: #535bf2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-add:hover {
  background: #4349d8;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

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

/* 🌟 核心优化：图片库的缩略图放大为 120x68 (约16:9比例) */
.cover-wrapper {
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  font-size: 11px;
  color: #bfbfbf;
}

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
</style>