<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 1. 使用 reactive 定义表单数据
const form = reactive({
  username: '',
  password: ''
})

// 2. 点击提交事件
const onSubmit = async () => {
  if (!form.username || !form.password) {
    alert('请填写完整信息')
    return
  }

  try {
    // 调用后端 TP5 接口
    const res = await axios.post('https://tp5-5wz8.onrender.com/api/user/login', form)

    if (res.data.code === 200) {
      // 3. 存储 Token (这里的 res.data.data.token 是你后端返回的)
      localStorage.setItem('token', res.data.data.token)

      alert('登录成功！')

      // 4. 跳转到首页
      router.push('/home')
    } else {
      alert(res.data.msg || '登录失败')
    }
  } catch (error) {
    console.error('请求出错:', error)
    alert('服务器响应错误')
  }
}
</script>

<template>
  <div class="login-box">
    <h2>系统登录</h2>
    <input v-model="form.username" type="text" placeholder="请输入用户名" />
    <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="onSubmit" />
    <button @click="onSubmit">登录</button>
  </div>
</template>
