<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '../../api/article'
import { channelApi } from '../../api/channel'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const articleId = route.params.id
const isEdit = computed(() => !!articleId)

const form = ref({
  title: '',
  channel_id: 1,
  author: 'Admin',
  content: '',
  cover: '',
  status: 1
})

const channels = ref([])

const initData = async () => {
  loading.value = true
  try {
    const chRes = await channelApi.getList()
    if (chRes && chRes.code === 200) channels.value = chRes.data

    if (isEdit.value) {
      const res = await articleApi.getDetail(articleId)
      if (res && res.code === 200) {
        const data = res.data
        console.log("数据库数据："+data.info)
        let infoObj = { author: 'Admin', content: '', cover: '' }
        try {
          if (data.info) {
            // 解析数据库中的 JSON 字符串
            infoObj = typeof data.info === 'string' ? JSON.parse(data.info) : data.info
            console.log("解析后的info对象：", infoObj)
          }
        } catch (e) {
          infoObj.content = data.info || ''
        }

        form.value = {
          title: data.name,
          channel_id: data.channel_id,
          author: infoObj.author || 'Admin',
          content: infoObj.content || '',
          cover: infoObj.cover || '',
          // 修复回显：确保 status 是数字类型，否则 radio 无法选中
          status: Number(data.status)
        }
      }
    }
  } catch (err) {
    console.error('初始化失败:', err)
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!form.value.title) return alert('标题不能为空')

  try {
    // 1. 在组件内部打包好完整的 info 字段
    const infoJson = JSON.stringify({
      author: form.value.author,
      content: form.value.content,
      cover: form.value.cover
    })

    // 2. 构造符合 API 预期的 data 对象
    const submitData = {
      title: form.value.title,
      status: form.value.status,
      channel_id: form.value.channel_id,
      info: infoJson // 传打包好的字符串
    }

    let res;
    if (isEdit.value) {
      res = await articleApi.update(articleId, submitData)
    } else {
      res = await articleApi.add(submitData)
    }

    if (res.code === 200 || (res.msg && res.msg.includes('完成'))) {
      alert('保存成功')
      await router.push({name: 'ArticleList'})
    } else {
      alert('保存失败: ' + res.msg)
    }
  } catch (err) {
    alert('请求异常')
  }
}

onMounted(initData)
</script>

<template>
  <div class="article-form">
    <div class="header">
      <h2>{{ isEdit ? '编辑文章' : '新增文章' }}</h2>
      <button @click="router.back()">返回</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="form-container">
      <div class="form-item">
        <label>文章标题:</label>
        <input v-model="form.title" />
      </div>

      <div class="form-row">
        <div class="form-item flex-1">
          <label>作者:</label>
          <input v-model="form.author" />
        </div>
        <div class="form-item flex-2">
          <label>封面图片 URL:</label>
          <input v-model="form.cover" />
        </div>
      </div>

      <div class="form-item">
        <label>正文内容:</label>
        <textarea v-model="form.content" rows="15"></textarea>
      </div>

      <div class="form-item">
        <label>显示状态:</label>
        <div class="radio-group">
          <label><input type="radio" :value="1" v-model="form.status" /> 显示</label>
          <label><input type="radio" :value="2" v-model="form.status" /> 隐藏</label>
        </div>
      </div>

      <div class="footer">
        <button class="btn-save" @click="onSubmit">提交保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-form { padding: 20px; max-width: 800px; margin: 0 auto; background: #fff; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.form-item { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-item label { font-weight: bold; margin-bottom: 5px; }
.form-item input, .form-item textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
.form-row { display: flex; gap: 20px; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.radio-group { display: flex; gap: 20px; padding: 10px 0; }
.btn-save { padding: 10px 40px; background: #535bf2; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
</style>