<template>
  <div class="upload-wrapper">
    <div class="upload-area" :class="{ 'loading': loading }" @click="triggerSelect">
      <img v-if="modelValue" :src="fullUrl" class="preview" />
      <div v-else class="placeholder">
        <span class="icon">+</span>
        <p>{{ loading ? '上传中...' : '点击上传封面' }}</p>
      </div>

      <input
          type="file"
          ref="fileInput"
          @change="onFileChange"
          accept="image/*"
          style="display: none"
      />
    </div>

    <div v-if="modelValue" class="file-info">
      <code>{{ modelValue }}</code>
      <button class="btn-del" @click.stop="emit('update:modelValue', '')">移除</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String // 接收文章 form.cover
})

const emit = defineEmits(['update:modelValue'])
const fileInput = ref(null)
const loading = ref(false)

// R2 公网访问前缀 (请根据你的 R2 设置修改)
//const R2_DOMAIN = 'https://pub-2c62c63b2d3a4a479a367f3d7d3eadf6.r2.dev'
const R2_DOMAIN = 'https://image.digidiving.com'

const fullUrl = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.startsWith('http') ? props.modelValue : `${R2_DOMAIN}/${props.modelValue}`
})

const triggerSelect = () => {
  if (!loading.value) fileInput.value.click()
}

const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  loading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    // 这里的路径必须与 functions/api/upload.js 对应
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (res.status === 404) {
      throw new Error('未找到上传接口，请检查是否使用了 wrangler 启动项目')
    }

    const data = await res.json()
    if (data.success) {
      // 这里的 data.fileName 是 R2 保存后的名字
      emit('update:modelValue', data.fileName)
    } else {
      alert('上传失败: ' + data.error)
    }
  } catch (err) {
    alert(err.message || '上传异常')
  } finally {
    loading.value = false
    e.target.value = '' // 清重置 input
  }
}
</script>

<style scoped>
.upload-area {
  width: 180px;
  height: 120px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f9f9f9;
}

.upload-area:hover {
  border-color: #535bf2;
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  color: #999;
  text-align: center;
}

.icon {
  font-size: 24px;
}

.file-info {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.btn-del {
  margin-left: 10px;
  color: #ff4d4f;
  border: none;
  background: none;
  cursor: pointer;
}

.loading {
  opacity: 0.5;
  cursor: wait;
}
</style>