<script setup>
import {ref, onMounted, computed, shallowRef, onBeforeUnmount} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {articleApi} from '../../api/baseModel.js'
import {channelApi} from '../../api/channel'
// 引入升级后的通用上传组件
import CommonUpload from '../../components/UploadImage.vue'
import {getFullUrl} from '../../utils/format'

// --- 引入 WangEditor 富文本 ---
import '@wangeditor/editor/dist/css/style.css'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const articleId = route.params.id
const isEdit = computed(() => !!articleId)

const MODEL_ID = 2 // 🌟 修复: 文章模型 ID 通常是 2asdfasdfas

// === WangEditor 实例与配置 ===
const editorRef = shallowRef()
const toolbarConfig = {
  excludeKeys: [
    'uploadImage',
    'uploadVideo',
  ]
}
const editorConfig = {placeholder: '请输入正文内容...'}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
}
// =============================

const form = ref({
  title: '',
  channel_id: '',
  author: '',
  content: '',
  cover: '',
  status: 1
})

const channels = ref([])

// 🌟 新增：计算当前选中的频道英文名，用于动态拼接图片预览路径
const currentChannelName = computed(() => {
  if (!channels.value.length || !form.value.channel_id) return 'news'
  const ch = channels.value.find(c => c.id === form.value.channel_id)
  return ch ? ch.name : 'news'
})

const initData = async () => {
  loading.value = true
  try {
    const chRes = await channelApi.getList()
    if (chRes && chRes.code === 200) {
      channels.value = chRes.data.filter(c => c.model_id == MODEL_ID)
      if (!isEdit.value && channels.value.length > 0) {
        form.value.channel_id = channels.value[0].id
      }
    }

    if (!isEdit.value) {
      form.value.author = localStorage.getItem('username') || 'Admin'
    } else {
      const res = await articleApi.getDetail(articleId)
      if (res && res.code === 200) {
        const data = res.data
        let infoObj = {author: 'Admin', content: '', cover: ''}

        try {
          if (data.info) {
            let parsed = typeof data.info === 'string' ? JSON.parse(data.info) : data.info
            if (typeof parsed === 'string') parsed = JSON.parse(parsed)
            infoObj = parsed
          }
        } catch (e) {
          infoObj.content = data.info || ''
        }

        form.value = {
          title: data.name, // 后端叫 name，前端表单叫 title
          channel_id: data.channel_id,
          author: infoObj.author || 'Admin',
          content: infoObj.content || '',
          cover: infoObj.cover || '',
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
  if (!form.value.title.trim()) return alert('文章标题不能为空')
  if (!form.value.channel_id) return alert('请选择所属栏目')
  if (!form.value.content) return alert('正文内容不能为空')

  try {
    // 组装 info 字段
    const infoJson = JSON.stringify({
      author: form.value.author,
      content: form.value.content,
      cover: form.value.cover
    })

    // 🌟 修复：必须传 name 给后端，而不是 title
    const submitData = {
      name: form.value.title,
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

    // 🌟 修复：将判断逻辑放入 try 块内，确保正确捕获返回结果
    if (res.code === 200) {
      alert(isEdit.value ? '修改成功' : '添加成功')
      router.back()
    } else {
      alert(res.msg || '保存失败')
    }
  } catch (err) {
    console.error(err)
    alert('请求异常，请检查网络或后端服务')
  }
}

onMounted(initData)
</script>

<template>
  <div class="article-form">
    <div class="header">
      <h2>{{ isEdit ? '编辑文章' : '新增文章' }}</h2>
      <button class="btn-back" @click="router.back()">返回列表</button>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>

    <div v-else class="form-container">

      <div class="form-item">
        <label>文章标题 <span class="required">*</span></label>
        <div class="form-content">
          <input v-model="form.title" type="text" placeholder="请输入文章标题"/>
        </div>
      </div>

      <div class="form-item">
        <label>所属栏目 <span class="required">*</span></label>
        <div class="form-content">
          <select v-model="form.channel_id" class="form-select">
            <option disabled value="">请选择栏目</option>
            <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.remark }} ({{ c.name }})</option>
          </select>
        </div>
      </div>

      <div class="form-item">
        <label>文章封面 (建议横版 2:1)</label>
        <div class="form-content">
          <CommonUpload
              v-model="form.cover"
              modelName="article"
              :channelName="currentChannelName"
              :previewUrl="getFullUrl(form.cover, 'article', currentChannelName)"
          />
          <div class="hint">支持自动分类上传到 Cloudflare R2 (article/{{ currentChannelName }}/)</div>
        </div>
      </div>

      <div class="form-item">
        <label>正文内容 <span class="required">*</span></label>
        <div class="form-content editor-container">
          <Toolbar
              class="editor-toolbar"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
          />
          <Editor
              class="editor-content"
              style="height: 500px; overflow-y: hidden;"
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
          />
        </div>
      </div>

      <div class="form-item">
        <label>显示状态</label>
        <div class="form-content radio-group">
          <label class="radio-label">
            <input type="radio" :value="1" v-model="form.status"/> 显示
          </label>
          <label class="radio-label">
            <input type="radio" :value="0" v-model="form.status"/> 隐藏
          </label>
        </div>
      </div>

      <div class="footer">
        <button class="btn-save" @click="onSubmit">提交保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 这里完全保留了你原有的精美样式设计，未作删减 */
.article-form {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: left;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 15px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.btn-back {
  padding: 6px 15px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.btn-back:hover {
  color: #535bf2;
  border-color: #535bf2;
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.form-item > label {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  text-align: left;
  width: 100%;
  display: block;
}

.form-content {
  width: 100%;
}

.required {
  color: #ff4d4f;
  margin-left: 2px;
}

.form-content input[type="text"], .form-content input:not([type]), .form-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  color: #333;
  background-color: #ffffff;
}

.form-content input:focus, .form-select:focus {
  border-color: #535bf2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 91, 242, 0.1);
}

.form-select {
  cursor: pointer;
}

.form-select option {
  color: #333;
}

.editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
}

.editor-toolbar {
  border-bottom: 1px solid #d9d9d9;
  background-color: #fafafa;
}

.editor-content {
  background-color: #ffffff;
  text-align: left;
}

.radio-group {
  display: flex;
  gap: 30px;
  padding: 5px 0;
}

.radio-label {
  width: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333;
  margin: 0;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.footer {
  margin-top: 40px;
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 25px;
}

.btn-save {
  padding: 12px 60px;
  background: #535bf2;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-save:hover {
  background: #4349d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(83, 91, 242, 0.2);
}

.loading {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>