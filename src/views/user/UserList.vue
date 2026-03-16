<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { userApi } from '../../api/baseModel.js'
import { channelApi } from '../../api/channel'
import { getFullUrl } from '../../utils/format'

// 引入通用上传组件
import CommonUpload from '../../components/UploadImage.vue'

const { t } = useI18n()

// 写死用户模型 ID
const MODEL_ID = 3

const list = ref([])
const allChannels = ref([])
const channels = ref([])
const models = ref([])
const loading = ref(true)

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  password: '',
  channel_id: '',
  status: 1,
  nickname: '',
  remarks: '',
  cover: ''
})

// 解析 JSON 字段
const parseInfo = (info) => {
  if (!info) return { nickname: '', remarks: '', cover: '' }
  try {
    return typeof info === 'string' ? JSON.parse(info) : info
  } catch (e) {
    return { nickname: '', remarks: '', cover: '' }
  }
}

// 动态计算当前选中的频道英文名
const currentChannelName = computed(() => {
  if (!allChannels.value.length || !form.value.channel_id) return 'unknown_channel'
  const ch = allChannels.value.find(c => c.id === form.value.channel_id)
  return ch ? ch.name : 'unknown_channel'
})

// 动态获取当前选中的模型英文名
const currentModelName = computed(() => {
  if (!allChannels.value.length || !form.value.channel_id) return 'unknown_model'
  const ch = allChannels.value.find(c => c.id === form.value.channel_id)
  if (ch) {
    const m = models.value.find(model => model.id === ch.model_id)
    return m ? m.name : 'unknown_model'
  }
  return 'unknown_model'
})

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    const [cRes, uRes, mRes] = await Promise.all([
      channelApi.getList(),
      userApi.getList({ limit: 100 }),
      channelApi.getModels()
    ])

    if (cRes.code === 200) {
      allChannels.value = cRes.data
      channels.value = cRes.data.filter(c => c.model_id == MODEL_ID)
    }

    if (uRes.code === 200) list.value = uRes.data?.data || uRes.data || []
    if (mRes.code === 200) models.value = mRes.data
  } catch (err) {
    console.error('加载失败', err)
  } finally {
    loading.value = false
  }
}

// 打开新增
const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    password: '',
    channel_id: channels.value[0]?.id || '',
    status: 1,
    nickname: '',
    remarks: '',
    cover: ''
  }
  showModal.value = true
}

// 打开编辑
const handleEdit = (item) => {
  isEdit.value = true
  currentId.value = item.id
  const infoData = parseInfo(item.info)
  form.value = {
    name: item.name,
    password: '',
    channel_id: item.channel_id,
    status: Number(item.status),
    nickname: infoData.nickname || '',
    remarks: infoData.remarks || '',
    cover: infoData.cover || ''
  }
  showModal.value = true
}

// 提交表单
const onSubmit = async () => {
  if (!form.value.name) return alert(t('userList.validation.nameRequired'))
  if (!isEdit.value && !form.value.password) return alert(t('userList.validation.passwordRequired'))
  if (!form.value.channel_id) return alert(t('userList.validation.groupRequired'))

  try {
    const infoObj = {
      nickname: form.value.nickname,
      remarks: form.value.remarks,
      cover: form.value.cover
    }

    const submitData = {
      name: form.value.name,
      channel_id: form.value.channel_id,
      status: form.value.status,
      info: JSON.stringify(infoObj)
    }

    if (form.value.password) submitData.password = form.value.password

    const res = isEdit.value ? await userApi.update(currentId.value, submitData) : await userApi.add(submitData)

    if (res.code === 200 || (res.msg && res.msg.includes('成功'))) {
      showModal.value = false
      initData()
    } else {
      alert(t('userList.opFailed') + (res.msg || t('userList.unknownError')))
    }
  } catch (err) {
    alert(t('userList.submitFailed'))
  }
}

// 删除数据
const handleDelete = async (id) => {
  if (!confirm(t('userList.deleteConfirm'))) return
  try {
    const res = await userApi.del(id)
    if (res.code === 200 || (res.msg && res.msg.includes('成功'))) {
      initData()
    } else {
      alert(res.msg || t('userList.deleteFailed'))
    }
  } catch (err) {
    alert(t('userList.requestError'))
  }
}

// 列表获取头像真实路径
const getListAvatarUrl = (item) => {
  const cover = parseInfo(item.info).cover
  if(!cover) return '/default-avatar.png';

  const channel = allChannels.value.find(c => c.id == item.channel_id)
  const channelName = channel ? channel.name : 'unknown_channel'

  const model = channel ? models.value.find(m => m.id == channel.model_id) : null;
  const modelName = model ? model.name : 'unknown_model'

  return getFullUrl(cover, modelName, channelName)
}

onMounted(initData)
</script>

<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>{{ t('userList.manageTitle') }}</h2>
      <button class="btn-primary" @click="handleAdd">{{ t('userList.addAccount') }}</button>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th width="80">{{ t('userList.id') }}</th>
        <th width="60">{{ t('userList.avatar') }}</th>
        <th>{{ t('userList.loginAccount') }}</th>
        <th>{{ t('userList.nickname') }}</th>
        <th>{{ t('userList.group') }}</th>
        <th>{{ t('userList.status') }}</th>
        <th width="180">{{ t('userList.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="7" class="empty-state">{{ t('userList.loading') }}</td>
      </tr>
      <template v-else-if="list.length > 0">
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.id }}</td>
          <td>
            <img :src="getListAvatarUrl(item)" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid #eee;" />
          </td>
          <td><strong>{{ item.name }}</strong></td>
          <td>{{ parseInfo(item.info).nickname || '-' }}</td>
          <td>
            <span class="model-tag">
              {{ allChannels.find(c => c.id === item.channel_id)?.remark || t('userList.unassigned') }}
            </span>
          </td>
          <td>
            <span :class="['status-tag', item.status == 1 ? 'status-active' : 'status-inactive']">
              {{ item.status == 1 ? t('userList.active') : t('userList.inactive') }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="handleEdit(item)">{{ t('userList.edit') }}</button>
            <button class="btn-delete" @click="handleDelete(item.id)" :disabled="item.channel_id == 1">{{ t('userList.delete') }}</button>
          </td>
        </tr>
      </template>
      <tr v-else>
        <td colspan="7" class="empty-state">{{ t('userList.noData') }}</td>
      </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-mask">
      <div class="modal-content" style="width: 500px;">
        <div class="modal-header">
          <h3>{{ isEdit ? t('userList.editAccount') : t('userList.newAccount') }}</h3>
          <span class="close-btn" @click="showModal = false">&times;</span>
        </div>

        <div class="modal-body">

          <div class="form-group" style="display: flex; justify-content: center; margin-bottom: 24px;">
            <CommonUpload
                v-model="form.cover"
                :modelName="currentModelName"
                :channelName="currentChannelName"
                :previewUrl="getFullUrl(form.cover, currentModelName, currentChannelName)"
            />
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>{{ t('userList.loginAccount') }} <span class="required">*</span></label>
              <input v-model="form.name" :placeholder="t('userList.loginAccountPlaceholder')" :disabled="isEdit" />
            </div>
            <div class="form-group half">
              <label>{{ t('userList.password') }} <span v-if="!isEdit" class="required">*</span></label>
              <input v-model="form.password" type="password" :placeholder="isEdit ? t('userList.passwordEditPlaceholder') : t('userList.passwordNewPlaceholder')" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>{{ t('userList.nickname') }}</label>
              <input v-model="form.nickname" :placeholder="t('userList.nicknamePlaceholder')" />
            </div>
            <div class="form-group half">
              <label>{{ t('userList.group') }} <span class="required">*</span></label>
              <select v-model="form.channel_id">
                <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.remark }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('userList.remarks') }}</label>
            <textarea v-model="form.remarks" rows="2" :placeholder="t('userList.remarksPlaceholder')"></textarea>
          </div>

          <div class="form-group">
            <label>{{ t('userList.accountStatus') }}</label>
            <div class="radio-group">
              <label><input type="radio" :value="1" v-model="form.status" /> {{ t('userList.statusActive') }}</label>
              <label style="margin-left: 15px;"><input type="radio" :value="0" v-model="form.status" /> {{ t('userList.statusInactive') }}</label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showModal = false">{{ t('userList.cancel') }}</button>
          <button class="btn-primary" @click="onSubmit">{{ t('userList.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ================= 页面与表格基础 ================= */
.manage-page { background: #fff; padding: 24px; border-radius: 8px; min-height: calc(100vh - 120px); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; color: #333; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th, .data-table td { border-bottom: 1px solid #f0f2f5; padding: 14px 12px; font-size: 14px; color: #333; }
.data-table th { background: #f8f9fa; color: #666; font-weight: 600; }
.empty-state { text-align: center; padding: 40px; color: #999; }

/* 表格内小元素 */
.model-tag { background: #e6f7ff; color: #1890ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #91d5ff; }
.status-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1px solid transparent; }
.status-active { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }
.status-inactive { background: #fff1f0; color: #f5222d; border-color: #ffa39e; }

/* ================= 强制防污染的按钮样式 ================= */
.btn-primary {
  background-color: #535bf2 !important;
  color: #fff !important;
  border: none !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.2s !important;
}
.btn-primary:hover {
  background-color: #4349d8 !important;
}

.btn-edit, .btn-delete {
  padding: 5px 12px !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  margin-right: 8px !important;
  outline: none !important;
  border-style: solid !important;
  border-width: 1px !important;
  display: inline-block !important;
}

.btn-edit {
  background-color: #e6f7ff !important;
  border-color: #91d5ff !important;
  color: #1890ff !important;
}
.btn-edit:hover {
  background-color: #1890ff !important;
  color: #fff !important;
  border-color: #1890ff !important;
}

.btn-delete {
  background-color: #fff1f0 !important;
  border-color: #ffa39e !important;
  color: #ff4d4f !important;
}
.btn-delete:hover:not(:disabled) {
  background-color: #ff4d4f !important;
  color: #fff !important;
  border-color: #ff4d4f !important;
}
.btn-delete:disabled {
  background-color: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: #bfbfbf !important;
  cursor: not-allowed !important;
}

/* ================= 弹窗样式 ================= */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; border-radius: 8px; width: 500px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.modal-header { padding: 16px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 18px; color: #333; }
.close-btn { cursor: pointer; font-size: 24px; color: #999; line-height: 1; }
.close-btn:hover { color: #333; }
.modal-body { padding: 24px 20px; max-height: 70vh; overflow-y: auto; }
.modal-footer { padding: 16px 20px; border-top: 1px solid #eee; text-align: right; background: #f8f9fa; }
.btn-cancel { background: #fff; border: 1px solid #d9d9d9; color: #666; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 12px; transition: 0.2s; }
.btn-cancel:hover { color: #535bf2; border-color: #535bf2; }

/* ================= 表单布局 ================= */
.form-row { display: flex; gap: 16px; }
.form-group { margin-bottom: 20px; }
.half { flex: 1; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #d9d9d9; border-radius: 6px; outline: none; transition: 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #535bf2; }
.form-group input:disabled { background: #f5f5f5; color: #999; }
.required { color: #ff4d4f; }
.radio-group label { font-size: 14px; color: #333; cursor: pointer; }
.radio-group input[type="radio"] { vertical-align: middle; margin-top: -2px; accent-color: #535bf2; }

/* ================= 深度穿透：调整 CommonUpload 尺寸为圆形头像 ================= */
:deep(.upload-area) {
  width: 80px !important;
  height: 80px !important;
  border-radius: 50% !important;
  overflow: hidden;
}
</style>