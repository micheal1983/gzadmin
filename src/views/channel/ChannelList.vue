<script setup>
import { ref, onMounted } from 'vue'
import { channelApi } from '../../api/channel'

const list = ref([])
const models = ref([])
const loading = ref(true)

// 弹窗控制
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

// 表单数据，严格对应数据库字段
const form = ref({
  name: '',
  model_id: '',
  remark: ''
})

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    const [channelRes, modelRes] = await Promise.all([
      channelApi.getList(),
      channelApi.getModels()
    ])
    list.value = channelRes.data
    models.value = modelRes.data
  } catch (err) {
    console.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 打开添加弹窗
const handleAdd = () => {
  isEdit.value = false
  form.value = { name: '', model_id: models.value[0]?.id || '', remark: '' }
  showModal.value = true
}

// 打开编辑弹窗
const handleEdit = (item) => {
  isEdit.value = true
  currentId.value = item.id
  form.value = {
    name: item.name,
    model_id: item.model_id,
    remark: item.remark
  }
  showModal.value = true
}

// 提交
const onSubmit = async () => {
  try {
    const res = isEdit.value
        ? await channelApi.update(currentId.value, form.value)
        : await channelApi.add(form.value)

    if (res.code === 200 || res.msg.includes('成功')) {
      showModal.value = false
      initData()
    }
  } catch (err) {
    alert('提交失败')
  }
}

// 删除
const handleDelete = async (id) => {
  if (!confirm('确定删除该频道吗？可能会影响关联的文章或游戏数据。')) return
  try {
    await channelApi.delete(id)
    initData()
  } catch (err) {
    alert('删除失败')
  }
}

// 辅助方法：获取模型名称
const getModelName = (mid) => {
  const model = models.value.find(m => m.id === mid)
  return model ? model.remark || model.name : '未知模型'
}

onMounted(initData)
</script>

<template>
  <div class="channel-page">
    <div class="header">
      <h2>频道管理 (Channels)</h2>
      <button class="btn-add" @click="handleAdd">新建频道</button>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>频道名称 (name)</th>
        <th>所属模型 (model)</th>
        <th>备注 (remark)</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in list" :key="item.id">
        <td>{{ item.id }}</td>
        <td><strong>{{ item.name }}</strong></td>
        <td>{{ getModelName(item.model_id) }}</td>
        <td>{{ item.remark }}</td>
        <td>
          <button @click="handleEdit(item)">编辑</button>
          <button class="text-red" @click="handleDelete(item.id)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-mask">
      <div class="modal-content">
        <h3>{{ isEdit ? '修改频道' : '新增频道' }}</h3>
        <div class="form-item">
          <label>频道标识:</label>
          <input v-model="form.name" placeholder="例如: admin, live..." />
        </div>
        <div class="form-item">
          <label>所属模型:</label>
          <select v-model="form.model_id">
            <option v-for="m in models" :key="m.id" :value="m.id">
              {{ m.remark }} ({{ m.name }})
            </option>
          </select>
        </div>
        <div class="form-item">
          <label>备注说明:</label>
          <textarea v-model="form.remark"></textarea>
        </div>
        <div class="modal-btns">
          <button @click="showModal = false">取消</button>
          <button class="btn-confirm" @click="onSubmit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.channel-page { padding: 20px; background: #fff; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
.text-red { color: #ff4d4f; margin-left: 10px; }
.btn-add { background: #535bf2; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }

/* 弹窗样式 */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal-content { background: white; padding: 30px; border-radius: 8px; width: 400px; }
.form-item { margin-bottom: 15px; }
.form-item label { display: block; margin-bottom: 5px; }
.form-item input, .form-item select, .form-item textarea { width: 100%; padding: 8px; border: 1px solid #ddd; }
.modal-btns { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-confirm { background: #535bf2; color: white; border: none; padding: 8px 20px; cursor: pointer; }
</style>