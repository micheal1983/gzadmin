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

// 表单数据
const form = ref({
  name: '',
  model_id: '',
  remark: ''
})

// 初始化数据
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

// === 统一函数名：handleEdit ===
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

// === 统一函数名：handleAdd ===
const handleAdd = () => {
  isEdit.value = false
  form.value = { name: '', model_id: models.value[0]?.id || '', remark: '' }
  showModal.value = true
}

// 提交表单 (包含自动关闭和刷新)
const onSubmit = async () => {
  try {
    const res = isEdit.value
        ? await channelApi.update(currentId.value, form.value)
        : await channelApi.add(form.value)

    const isSuccess = Number(res.code) === 200 ||
        (res.msg && (res.msg.includes('成功') || res.msg.includes('完成')))

    if (isSuccess) {
      alert(isEdit.value ? '修改成功' : '添加成功')
      showModal.value = false
      initData() // 自动刷新列表
    } else {
      alert('操作未成功: ' + (res.msg || '未知错误'))
    }
  } catch (err) {
    alert('提交失败，请检查网络或后端配置')
  }
}

// === 统一函数名：handleDelete ===
const handleDelete = async (id) => {
  if (!confirm('确定删除该频道吗？')) return
  try {
    const res = await channelApi.delete(id)
    if (Number(res.code) === 200 || (res.msg && res.msg.includes('成功'))) {
      initData()
    } else {
      alert('删除失败：' + res.msg)
    }
  } catch (err) {
    alert('请求异常')
  }
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
        <th>频道名称</th>
        <th>所属模型</th>
        <th>备注</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading">
        <td colspan="5" style="text-align: center; padding: 20px; color: #999;">
          数据加载中，请稍候...
        </td>
      </tr>

      <template v-else-if="list.length > 0">
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>
            {{ models.find(m => m.id === item.model_id)?.remark || '未知模型' }}
          </td>
          <td>{{ item.remark }}</td>
          <td>
            <button @click="handleEdit(item)">编辑</button>
            <button class="text-red" @click="handleDelete(item.id)">删除</button>
          </td>
        </tr>
      </template>

      <tr v-else>
        <td colspan="5" style="text-align: center; padding: 20px; color: #999;">
          暂无频道数据
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-mask">
      <div class="modal-content">
        <h3>{{ isEdit ? '修改频道' : '新增频道' }}</h3>
        <div class="form-item">
          <label>频道名称:</label>
          <input v-model="form.name" />
        </div>
        <div class="form-item">
          <label>所属模型:</label>
          <select v-model="form.model_id">
            <option v-for="m in models" :key="m.id" :value="m.id">
              {{ m.remark }}
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
.channel-page { padding: 20px; background: #fff; min-height: 100vh; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; color: #333; }
.text-red { color: #ff4d4f; border: none; background: none; cursor: pointer; margin-left: 10px; }
.btn-add { background: #535bf2; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }

.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-content { background: white; padding: 30px; border-radius: 8px; width: 400px; color: #333; }
.form-item { margin-bottom: 15px; }
.form-item label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-item input, .form-item select, .form-item textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.modal-btns { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-confirm { background: #535bf2; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; }
</style>