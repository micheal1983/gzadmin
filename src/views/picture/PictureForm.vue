<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pictureApi } from '../../api/baseModel.js'
import { channelApi } from '../../api/channel'
import CommonUpload from '../../components/UploadImage.vue'
import { getFullUrl } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const currentId = route.params.id
const isEdit = computed(() => !!currentId)

const MODEL_ID = 4 // 🌟 修复: 图片库的模型 ID 是 4

const form = ref({
  title: '',
  channel_id: '',
  cover: '', // 图片路径
  url: '',   // (可选) 点击图片要跳转的外链
  status: 1
})

const channels = ref([])

// 计算当前选中的频道英文名，用于动态拼接图片预览路径
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
          console.error('解析 info 失败', e)
        }

        form.value = {
          title: data.name, // 后端叫 name，表单绑定的叫 title
          channel_id: data.channel_id,
          cover: infoObj.cover || '',
          url: infoObj.url || '',
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
  if (!form.value.title.trim()) return alert('图片标题不能为空')
  if (!form.value.channel_id) return alert('请选择所属图集')
  if (!form.value.cover) return alert('请上传图片文件')

  try {
    // 组装 info 字段 (图片库通常只需要封面和链接)
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
  <div class="picture-form">
    <div class="header">
      <h2>{{ isEdit ? '编辑图片' : '上传新图' }}</h2>
      <button class="btn-back" @click="router.back()">返回列表</button>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>

    <div v-else class="form-container">

      <div class="form-item">
        <label>图片标题 <span class="required">*</span></label>
        <div class="form-content">
          <input v-model="form.title" type="text" placeholder="例如：2026年首页轮播图-1"/>
        </div>
      </div>

      <div class="form-item">
        <label>所属图集分类 <span class="required">*</span></label>
        <div class="form-content">
          <select v-model="form.channel_id" class="form-select">
            <option disabled value="">请选择图集</option>
            <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.remark }} ({{ c.name }})</option>
          </select>
        </div>
      </div>

      <div class="form-item">
        <label>高清图片 <span class="required">*</span></label>
        <div class="form-content upload-container">
          <CommonUpload
              v-model="form.cover"
              modelName="picture"
              :channelName="currentChannelName"
              :previewUrl="getFullUrl(form.cover, 'picture', currentChannelName)"
          />
          <div class="hint">支持自动分类上传到 Cloudflare R2 (picture/{{ currentChannelName }}/)</div>
        </div>
      </div>

      <div class="form-item">
        <label>点击跳转链接 (可选)</label>
        <div class="form-content">
          <input v-model="form.url" type="text" placeholder="例如: https://example.com"/>
          <div class="hint">如果图片用于前端轮播展示，用户点击图片时跳转的网址</div>
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