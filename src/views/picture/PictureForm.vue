<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { pictureApi } from '../../api/baseModel.js'
import { channelApi } from '../../api/channel'
import CommonUpload from '../../components/UploadImage.vue'
import { getFullUrl } from '../../utils/format'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const currentId = route.params.id
const isEdit = computed(() => !!currentId)

const MODEL_ID = 4

const form = ref({
  title: '',
  channel_id: '',
  cover: '',
  url: '',
  status: 1
})

const channels = ref([])

const currentChannelName = computed(() => {
  if (!channels.value.length || !form.value.channel_id) return 'gallery'
  const ch = channels.value.find(c => c.id === form.value.channel_id)
  return ch ? ch.name : 'gallery'
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

    if (isEdit.value) {
      const res = await pictureApi.getDetail(currentId)
      if (res && res.code === 200) {
        const data = res.data
        let infoObj = { cover: '', url: '' }

        try {
          if (data.info) {
            let parsed = typeof data.info === 'string' ? JSON.parse(data.info) : data.info
            if (typeof parsed === 'string') parsed = JSON.parse(parsed)
            infoObj = parsed
          }
        } catch (e) {
          console.error(t('pictureForm.error.parseError'), e)
        }

        form.value = {
          title: data.name,
          channel_id: data.channel_id,
          cover: infoObj.cover || '',
          url: infoObj.url || '',
          status: Number(data.status)
        }
      }
    }
  } catch (err) {
    console.error(t('pictureForm.error.initFailed'), err)
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!form.value.title.trim()) return alert(t('pictureForm.validation.titleRequired'))
  if (!form.value.channel_id) return alert(t('pictureForm.validation.channelRequired'))
  if (!form.value.cover) return alert(t('pictureForm.validation.coverRequired'))

  try {
    const infoJson = JSON.stringify({
      cover: form.value.cover,
      url: form.value.url
    })

    const submitData = {
      name: form.value.title,
      status: form.value.status,
      channel_id: form.value.channel_id,
      info: infoJson
    }

    let res;
    if (isEdit.value) {
      res = await pictureApi.update(currentId, submitData)
    } else {
      res = await pictureApi.add(submitData)
    }

    if (res.code === 200) {
      alert(isEdit.value ? t('pictureForm.success.edit') : t('pictureForm.success.add'))
      router.back()
    } else {
      alert(res.msg || t('pictureForm.error.saveFailed'))
    }
  } catch (err) {
    console.error(err)
    alert(t('pictureForm.error.requestError'))
  }
}

onMounted(initData)
</script>

<template>
  <div class="picture-form">
    <div class="header">
      <h2>{{ isEdit ? t('pictureForm.editTitle') : t('pictureForm.addTitle') }}</h2>
      <button class="btn-back" @click="router.back()">{{ t('pictureForm.back') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('pictureForm.loading') }}</div>

    <div v-else class="form-container">

      <div class="form-item">
        <label>{{ t('pictureForm.pictureTitle') }} <span class="required">*</span></label>
        <div class="form-content">
          <input v-model="form.title" type="text" :placeholder="t('pictureForm.titlePlaceholder')"/>
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('pictureForm.channel') }} <span class="required">*</span></label>
        <div class="form-content">
          <select v-model="form.channel_id" class="form-select">
            <option disabled value="">{{ t('pictureForm.selectChannel') }}</option>
            <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.remark }} ({{ c.name }})</option>
          </select>
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('pictureForm.cover') }} <span class="required">*</span></label>
        <div class="form-content upload-container">
          <CommonUpload
              v-model="form.cover"
              modelName="picture"
              :channelName="currentChannelName"
              :previewUrl="getFullUrl(form.cover, 'picture', currentChannelName)"
          />
          <div class="hint">{{ t('pictureForm.uploadHint') }} (picture/{{ currentChannelName }}/)</div>
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('pictureForm.url') }}</label>
        <div class="form-content">
          <input v-model="form.url" type="text" :placeholder="t('pictureForm.urlPlaceholder')"/>
          <div class="hint">{{ t('pictureForm.urlHint') }}</div>
        </div>
      </div>

      <div class="form-item">
        <label>{{ t('pictureForm.status') }}</label>
        <div class="form-content radio-group">
          <label class="radio-label">
            <input type="radio" :value="1" v-model="form.status"/> {{ t('pictureForm.show') }}
          </label>
          <label class="radio-label">
            <input type="radio" :value="0" v-model="form.status"/> {{ t('pictureForm.hide') }}
          </label>
        </div>
      </div>

      <div class="footer">
        <button class="btn-save" @click="onSubmit">{{ t('pictureForm.save') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.picture-form {
  padding: 30px;
  max-width: 800px;
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

.form-content input[type="text"], .form-select {
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

/* 🌟 专门给图片库放大一下上传框的样式 */
.upload-container :deep(.upload-area) {
  width: 260px !important;
  height: 146px !important; /* 近似 16:9 */
  background: #fafafa;
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