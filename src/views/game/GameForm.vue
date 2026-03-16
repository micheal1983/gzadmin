<script setup>
import { ref, onMounted, computed, shallowRef, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { gameApi } from '../../api/baseModel'
import { channelApi } from '../../api/channel'
import { parseExtInfo } from '../../utils/format'
import CommonUpload from '../../components/UploadImage.vue'

// --- 引入 WangEditor ---
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const gameId = route.params.id
const isEdit = computed(() => !!gameId)

const MODEL_ID = 5

// === WangEditor 配置 ===
const editorRef = shallowRef()
const toolbarConfig = { excludeKeys: ['uploadImage', 'uploadVideo'] }
const editorConfig = { placeholder: t('gameForm.contentPlaceholder') }

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
}

const form = ref({
  title: '',
  channel_id: '',
  author: '',
  content: '',
  cover: '',
  status: 1,
  is_recommend: 0,
  is_new: 0
})

const channels = ref([])

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
      const res = await gameApi.getDetail(gameId)
      if (res && res.code === 200) {
        const data = res.data
        const infoObj = parseExtInfo(data.info)

        form.value = {
          title: data.name,
          channel_id: data.channel_id,
          author: infoObj.author || 'Admin',
          content: infoObj.content || '',
          cover: infoObj.cover || '',
          status: Number(data.status),
          is_recommend: infoObj.is_recommend || 0,
          is_new: infoObj.is_new || 0
        }
      }
    }
  } catch (err) {
    console.error(t('gameForm.error.initFailed'), err)
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!form.value.title.trim()) return alert(t('gameForm.validation.nameRequired'))
  if (!form.value.channel_id) return alert(t('gameForm.validation.channelRequired'))

  try {
    const infoJson = JSON.stringify({
      author: form.value.author,
      content: form.value.content,
      cover: form.value.cover,
      is_recommend: form.value.is_recommend,
      is_new: form.value.is_new
    })

    const submitData = {
      title: form.value.title,
      status: form.value.status,
      channel_id: form.value.channel_id,
      info: infoJson
    }

    let res;
    if (isEdit.value) {
      res = await gameApi.update(gameId, submitData)
    } else {
      res = await gameApi.add(submitData)
    }

    if (res.code === 200) {
      alert(t('gameForm.success.save'))
      router.back()
    } else {
      alert(t('gameForm.error.saveFailed') + (res.msg || t('gameForm.error.unknownError')))
    }
  } catch (err) {
    alert(t('gameForm.error.requestError'))
  }
}

onMounted(initData)
</script>

<template>
  <div class="article-form">
    <div class="header">
      <h2>{{ isEdit ? t('gameForm.editTitle') : t('gameForm.addTitle') }}</h2>
      <button class="btn-back" @click="router.back()">{{ t('gameForm.back') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('gameForm.loading') }}</div>

    <div v-else class="form-container">

      <div class="form-item">
        <label>{{ t('gameForm.gameName') }} <span class="required">*</span></label>
        <div class="form-content">
          <input v-model="form.title" :placeholder="t('gameForm.namePlaceholder')" />
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('gameForm.channel') }} <span class="required">*</span></label>
        <div class="form-content">
          <select v-model="form.channel_id" class="form-select">
            <option disabled value="">{{ t('gameForm.selectChannel') }}</option>
            <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.remark || c.name }}</option>
          </select>
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('gameForm.cover') }}</label>
        <div class="form-content">
          <CommonUpload v-model="form.cover" />
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('gameForm.specialAttr') }}</label>
        <div class="form-content checkbox-group">
          <label class="check-label">
            <input type="checkbox" v-model="form.is_recommend" :true-value="1" :false-value="0" /> {{ t('gameForm.isRecommend') }}
          </label>
          <label class="check-label">
            <input type="checkbox" v-model="form.is_new" :true-value="1" :false-value="0" /> {{ t('gameForm.isNew') }}
          </label>
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('gameForm.content') }}</label>
        <div class="form-content editor-container">
          <Toolbar
              class="editor-toolbar"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
          />
          <Editor
              class="editor-content"
              style="height: 400px; overflow-y: hidden;"
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
          />
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('gameForm.status') }}</label>
        <div class="form-content radio-group">
          <label class="radio-label">
            <input type="radio" :value="1" v-model="form.status" /> {{ t('gameForm.show') }}
          </label>
          <label class="radio-label">
            <input type="radio" :value="2" v-model="form.status" /> {{ t('gameForm.hide') }}
          </label>
        </div>
      </div>

      <div class="footer">
        <button class="btn-save" @click="onSubmit">{{ t('gameForm.save') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保持与文章编辑页一致的白底容器 */
.article-form {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* 增加一点阴影，让它更有层次感 */
  text-align: left; /* 🌟 强制容器内文字左对齐 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 15px;
}

.header h2 { margin: 0; color: #333; font-size: 24px; }

.btn-back {
  padding: 6px 15px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.btn-back:hover { color: #535bf2; border-color: #535bf2; }

/* === 垂直布局核心样式 === */
.form-item {
  display: flex;
  flex-direction: column; /* 🌟 强制上下排列 */
  margin-bottom: 24px;
  text-align: left;
}

/* 🌟 标题 Label 样式修正 */
.form-item > label {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  display: block;
  width: 100%;
}

.form-content {
  width: 100%;
}

/* 🌟 核心：统一 Input 和 Select 的高度与样式 */
.form-content input[type="text"],
.form-content input:not([type]),
.form-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  height: 42px; /* 🌟 固定高度，保证与文章页一致 */
  transition: all 0.3s;
  color: #333;
  background-color: #ffffff;
}

.form-content input:focus,
.form-select:focus {
  border-color: #535bf2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(83, 91, 242, 0.1);
}

.form-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23999' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }

.required { color: #ff4d4f; margin-left: 2px; }

/* --- 复选框 & 单选框布局 --- */
.radio-group, .checkbox-group {
  display: flex;
  gap: 30px;
  padding: 5px 0;
}

.radio-label, .check-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  margin: 0;
  font-weight: normal;
  width: auto !important; /* 🌟 覆盖全局宽度 */
}

/* --- 编辑器样式 --- */
.editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}
.editor-toolbar {
  border-bottom: 1px solid #d9d9d9;
  background-color: #fafafa;
}
.editor-content {
  background-color: #ffffff;
  text-align: left;
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
}

.loading {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

/* GameForm.vue 的 style scoped */

/* 🌟 调整上传框的容器尺寸 */
:deep(.upload-area) {
  width: 140px !important;   /* 宽度 */
  height: 174px !important;  /* 高度 (140 * 426 / 342) */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 🌟 调整预览图片的填充方式 */
:deep(.upload-area img) {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持竖版比例填充 */
}
</style>