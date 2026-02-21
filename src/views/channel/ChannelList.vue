<script setup>
import { ref, onMounted } from 'vue'
import { channelApi } from '../../api/channel'

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
    console.error('加载失败', err)
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
      alert(isEdit.value ? '修改成功' : '添加成功')
      showModal.value = false
      initData()
    } else {
      alert('操作未成功: ' + (res.msg || '未知错误'))
    }
  } catch (err) {
    alert('提交失败')
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定删除该频道吗？')) return
  try {
    const res = await channelApi.delete(id)
    if (res.code === 200 || (res.msg && res.msg.includes('成功'))) {
      initData()
    }
  } catch (err) {
    alert('请求异常')
  }
}

onMounted(initData)
</script>

<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>频道管理 <small style="color: #999; font-size: 14px; margin-left: 8px;">(Channels)</small></h2>
      <button class="btn-primary" @click="handleAdd">新建频道</button>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th width="80">ID</th>
        <th>频道名称</th>
        <th>所属模型</th>
        <th>备注说明</th>
        <th width="180">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="5" class="empty-state">数据加载中...</td>
      </tr>
      <template v-else-if="list.length > 0">
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.id }}</td>
          <td><strong>{{ item.name }}</strong></td>
          <td>
              <span class="model-tag">
                {{ models.find(m => m.id === item.model_id)?.remark || '未知' }}
              </span>
          </td>
          <td style="color: #666;">{{ item.remark || '-' }}</td>
          <td>
            <button class="btn-edit" @click="handleEdit(item)">编辑</button>
            <button class="btn-delete" @click="handleDelete(item.id)">删除</button>
          </td>
        </tr>
      </template>
      <tr v-else>
        <td colspan="5" class="empty-state">暂无频道数据</td>
      </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-mask">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? '修改频道' : '新建频道' }}</h3>
          <span class="close-btn" @click="showModal = false">&times;</span>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>频道名称 <span class="required">*</span></label>
            <input v-model="form.name" placeholder="请输入英文或拼音标识" />
          </div>
          <div class="form-group">
            <label>对应模型 <span class="required">*</span></label>
            <select v-model="form.model_id">
              <option v-for="m in models" :key="m.id" :value="m.id">{{ m.remark }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注描述</label>
            <textarea v-model="form.remark" rows="3" placeholder="填写该频道的用途描述..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showModal = false">取消</button>
          <button class="btn-primary" @click="onSubmit">确认保存</button>
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