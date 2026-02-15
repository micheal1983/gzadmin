<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// 1. 判断模式：是否有 id
const id = route.params.id
const isEdit = computed(() => !!id)

// 2. 表单数据模型
const form = ref({
  title: '',
  author: '',
  content: '',
  status: 1
})

// 3. 如果是编辑模式，初始化获取数据
onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await axios.get(`https://tp5-5wz8.onrender.com/api/article/findById?id=${id}`)
      if (res.data.code === 200) {
        form.value = res.data.data
      }
    } catch (err) {
      console.error('获取详情失败', err)
    }
  }
})

// 4. 提交逻辑
const onSubmit = async () => {
  // 根据模式决定调用哪个接口（add 或 mif）
  const url = isEdit.value
      ? `https://tp5-5wz8.onrender.com/api/article/mif?id=${id}`
      : `https://tp5-5wz8.onrender.com/api/article/add`

  try {
    const res = await axios.post(url, form.value)
    if (res.data.msg.includes('成功') || res.data.msg.includes('完成')) {
      alert(isEdit.value ? '修改成功' : '添加成功')
      router.push({ name: 'ArticleList' }) // 返回列表页
    }
  } catch (err) {
    alert('操作失败，请检查网络或权限')
  }
}
</script>

<template>
  <div class="form-container">
    <h2>{{ isEdit ? '编辑文章' : '新增文章' }}</h2>

    <div class="form-item">
      <label>文章标题：</label>
      <input v-model="form.name" type="text" placeholder="请输入标题" />
    </div>

    <div class="form-item">
      <label>作者名称：</label>
      <input v-model="form.author" type="text" placeholder="请输入作者" />
    </div>

    <div class="form-item">
      <label>文章内容：</label>
      <textarea v-model="form.content" rows="10" placeholder="请输入正文"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-cancel" @click="router.back()">取消</button>
      <button class="btn-submit" @click="onSubmit">
        {{ isEdit ? '保存修改' : '立即发布' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  max-width: 800px;
}
.form-item {
  margin-bottom: 20px;
}
.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
.form-item input, .form-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}
.btn-submit {
  background: #535bf2;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-cancel {
  background: #eee;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
}
</style>