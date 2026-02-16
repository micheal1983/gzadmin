<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '../../api/article'
import { channelApi } from '../../api/channel'
// 引入通用上传组件
import CommonUpload from '../../components/UploadImage.vue'

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
  cover: '', // 这里将存储 R2 返回的文件名
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
        let infoObj = { author: 'Admin', content: '', cover: '' }
        try {
          if (data.info) {
            // 解析数据库中的 JSON 字符串
            infoObj = typeof data.info === 'string' ? JSON.parse(data.info) : data.info
          }
        } catch (e) {
          infoObj.content = data.info || ''
        }

        form.value = {
          title: data.name,
          channel_id: data.channel_id,
          author: infoObj.author || 'Admin',
          content: infoObj.content || '',
          cover: infoObj.cover || '', // 编辑状态回显图片路径
          status: Number(data.status) // 确保 radio 选中
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
    // 1. 将封面路径连同其他信息打包成 JSON 字符串
    const infoJson = JSON.stringify({
      author: form.value.author,
      content: form.value.content,
      cover: form.value.cover
    })

    const submitData = {
      title: form.value.title,
      status: form.value.status,
      channel_id: form.value.channel_id,
      info: infoJson
    }

    let res;
    if (isEdit.value) {
      res = await articleApi.update(articleId, submitData)
    } else {
      res = await articleApi.add(submitData)
    }

    // 后端已修正返回 code: 200
    if (res.code === 200 || (res.msg && res.msg.includes('成功'))) {
      alert('保存成功')
      await router.push({name: 'ArticleList'})
    } else {
      alert('保存失败: ' + (res.msg || '未知错误'))
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
        <input v-model="form.title" placeholder="请输入标题" />
      </div>

      <div class="form-row">
        <div class="form-item flex-1">
          <label>作者:</label>
          <input v-model="form.author" />
        </div>
        <div class="form-item flex-1">
          <label>文章封面图:</label>
          <CommonUpload v-model="form.cover" />
          <p class="hint">支持上传到 Cloudflare R2</p>
        </div>
      </div>

      <div class="form-item">
        <label>正文内容:</label>
        <textarea v-model="form.content" rows="15" placeholder="支持 HTML 或纯文本"></textarea>
      </div>

      <div class="form-item">
        <label>显示状态:</label>
        <div class="radio-group">
          <label><input type="radio" :value="1" v-model="form.status" /> 显示</label>
          <label><input type="radio" :value="2" v-model="form.status" /> 隐藏</label>
        </div>
      </div>

      <div class="footer">
        <button class="btn-save" @click="onSubmit">提交保存文章</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保持原有样式并微调 */
.article-form { padding: 20px; max-width: 900px; margin: 0 auto; background: #fff; border-radius: 8px; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.form-item { margin-bottom: 20px; display: flex; flex-direction: column; }
.form-item label { font-weight: bold; margin-bottom: 8px; color: #333; }
.form-item input, .form-item textarea { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.form-row { display: flex; gap: 30px; }
.flex-1 { flex: 1; }
.radio-group { display: flex; gap: 30px; padding: 10px 0; }
.footer { margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
.btn-save { padding: 12px 60px; background: #535bf2; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background 0.3s; }
.btn-save:hover { background: #4349d8; }
.hint { font-size: 12px; color: #999; margin-top: 5px; }
</style>