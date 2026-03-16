<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { channelApi } from '../../api/channel'

const { t } = useI18n()
const list = ref([])
const models = ref([])
const loading = ref(true)

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({ name: '', model_id: '', remark: '' })

const initData = async () => {
  loading.value = true
  try {
    const [cRes, mRes] = await Promise.all([
      channelApi.getList(),
      channelApi.getModels()
    ])
    if (cRes.code === 200) list.value = cRes.data
    if (mRes.code === 200) models.value = mRes.data
  } catch (err) {
    console.error(t('channelList.error.loadFailed'), err)
  } finally {
    loading.value = false
  }
}

const handleEdit = (item) => {
  isEdit.value = true
  currentId.value = item.id
  form.value = { name: item.name, model_id: item.model_id, remark: item.remark }
  showModal.value = true
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { name: '', model_id: models.value[0]?.id || '', remark: '' }
  showModal.value = true
}

const onSubmit = async () => {
  try {
    const res = isEdit.value
        ? await channelApi.update(currentId.value, form.value)
        : await channelApi.add(form.value)

    if (res.code === 200 || (res.msg && res.msg.includes('成功'))) {
      alert(isEdit.value ? t('channelList.success.edit') : t('channelList.success.add'))
      showModal.value = false
      initData()
    } else {
      alert(t('channelList.error.opFailed') + (res.msg || t('channelList.error.unknownError')))
    }
  } catch (err) {
    alert(t('channelList.error.submitFailed'))
  }
}

const handleDelete = async (id) => {
  if (!confirm(t('channelList.deleteConfirm'))) return
  try {
    const res = await channelApi.delete(id)
    if (res.code === 200 || (res.msg && res.msg.includes('成功'))) {
      initData()
    }
  } catch (err) {
    alert(t('channelList.error.requestError'))
  }
}

onMounted(initData)
</script>

<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>{{ t('channelList.title') }} <small style="color: #999; font-size: 14px; margin-left: 8px;">(Channels)</small></h2>
      <button class="btn-primary" @click="handleAdd">{{ t('channelList.addChannel') }}</button>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th width="80">{{ t('channelList.id') }}</th>
        <th>{{ t('channelList.channelName') }}</th>
        <th>{{ t('channelList.model') }}</th>
        <th>{{ t('channelList.remark') }}</th>
        <th width="180">{{ t('channelList.actions') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="5" class="empty-state">{{ t('channelList.loading') }}</td>
      </tr>
      <template v-else-if="list.length > 0">
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.id }}</td>
          <td><strong>{{ item.name }}</strong></td>
          <td>
              <span class="model-tag">
                {{ models.find(m => m.id === item.model_id)?.remark || t('channelList.unknown') }}
              </span>
          </td>
          <td style="color: #666;">{{ item.remark || '-' }}</td>
          <td>
            <button class="btn-edit" @click="handleEdit(item)">{{ t('channelList.edit') }}</button>
            <button class="btn-delete" @click="handleDelete(item.id)">{{ t('channelList.delete') }}</button>
          </td>
        </tr>
      </template>
      <tr v-else>
        <td colspan="5" class="empty-state">{{ t('channelList.noData') }}</td>
      </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-mask">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? t('channelList.editModalTitle') : t('channelList.addModalTitle') }}</h3>
          <span class="close-btn" @click="showModal = false">&times;</span>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>{{ t('channelList.nameLabel') }} <span class="required">*</span></label>
            <input v-model="form.name" :placeholder="t('channelList.namePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ t('channelList.modelLabel') }} <span class="required">*</span></label>
            <select v-model="form.model_id">
              <option v-for="m in models" :key="m.id" :value="m.id">{{ m.remark }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('channelList.remarkLabel') }}</label>
            <textarea v-model="form.remark" rows="3" :placeholder="t('channelList.remarkPlaceholder')"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showModal = false">{{ t('channelList.cancel') }}</button>
          <button class="btn-primary" @click="onSubmit">{{ t('channelList.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state { text-align: center; padding: 40px; color: #999; }
.model-tag { background: #e6f7ff; color: #1890ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #91d5ff; }

/* 弹窗专用样式 */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; border-radius: 8px; width: 450px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.modal-header { padding: 16px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 18px; color: #333; }
.close-btn { cursor: pointer; font-size: 24px; color: #999; }
.modal-body { padding: 24px 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #d9d9d9; border-radius: 6px; outline: none; }
.form-group input:focus { border-color: #535bf2; }
.modal-footer { padding: 16px 20px; border-top: 1px solid #eee; text-align: right; background: #f8f9fa; }
.btn-cancel { background: #fff; border: 1px solid #d9d9d9; color: #666; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 12px; }
.required { color: #ff4d4f; }
</style>