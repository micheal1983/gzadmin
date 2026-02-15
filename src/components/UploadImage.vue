<template>
  <div class="upload-box">
    <h3>图片上传</h3>
    <div
        class="drop-area"
        @click="$refs.fileInput.click()"
        :class="{ 'is-loading': loading }"
    >
      <p v-if="!loading">点击选择图片</p>
      <p v-else>正在上传...</p>
      <input
          type="file"
          ref="fileInput"
          @change="handleFile"
          accept="image/*"
          style="display: none"
      />
    </div>

    <div v-if="uploadedFile" class="result">
      ✅ 已保存到 R2: {{ uploadedFile }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadImage',
  data() {
    return {
      loading: false,
      uploadedFile: ''
    }
  },
  methods: {
    async handleFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.loading = true;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.success) {
          this.uploadedFile = data.fileName;
          alert('上传成功！');
        } else {
          alert('失败：' + data.error);
        }
      } catch (err) {
        alert('上传出错');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.drop-area {
  border: 2px dashed #42b983;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  border-radius: 10px;
}
.is-loading { opacity: 0.5; cursor: not-allowed; }
.result { margin-top: 15px; color: #2c3e50; font-weight: bold; }
</style>