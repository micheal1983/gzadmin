# GAMEZONE CMS 管理后台

GAMEZONE CMS 是一个基于 **Vue 3** + **Vite** 开发的现代化系统管理后台。提供游戏管理、文章管理、图片库管理、频道配置以及用户权限管理等功能。

## 🚀 技术栈概览

本项目采用当前前端主流技术栈：

- **核心框架**: [Vue 3](https://vuejs.org/) (使用 `<script setup>` 组合式 API)
- **构建工具**: [Vite](https://vitejs.dev/) (极速的开发和构建体验)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/)
- **网络请求**: [Axios](https://axios-http.com/)
- **多语言支持**: [Vue I18n 9](https://kazupon.github.io/vue-i18n/)
- **富文本编辑器**: [WangEditor](https://www.wangeditor.com/) (`@wangeditor/editor-for-vue`)
- **Token 解析**: `jwt-decode`

## 📁 目录结构说明

```text
gzadmin/
├── public/                 # 静态资源 (打包时直接复制)
├── src/                    # 源代码目录
│   ├── api/                # API 接口管理
│   │   ├── baseModel.js    # 基础模型 API (如 user, article, game, picture 统一封装)
│   │   └── channel.js      # 频道及模型 API
│   ├── assets/             # 静态资源 (图片、字体等)
│   ├── components/         # 全局通用组件
│   │   ├── Left.vue        # 左侧边栏导航
│   │   ├── Top.vue         # 顶部导航栏 (包含用户信息、多语言切换)
│   │   └── UploadImage.vue # 通用图片上传组件
│   ├── layouts/            # 布局组件
│   │   └── MainLayout.vue  # 主体后台布局 (左右/上下分栏)
│   ├── locales/            # 多语言翻译文件
│   │   ├── en.json         # 英文包
│   │   └── zh.json         # 中文包
│   ├── router/             # 路由配置
│   ├── utils/              # 工具函数
│   │   └── format.js       # 数据格式化、URL拼接等工具
│   ├── views/              # 页面视图级组件
│   │   ├── article/        # 文章模块 (列表、表单)
│   │   ├── channel/        # 频道模块
│   │   ├── game/           # 游戏模块
│   │   ├── picture/        # 图库模块
│   │   ├── user/           # 用户模块
│   │   ├── Home.vue        # 首页看板
│   │   └── Login.vue       # 登录页
│   ├── App.vue             # 根组件
│   ├── i18n.js             # 国际化配置文件
│   └── main.js             # 入口文件 (挂载 Vue 实例、插件、拦截器)
├── .env                    # 环境变量配置
├── package.json            # 项目依赖配置
└── vite.config.js          # Vite 构建配置
```

## 🛠️ 核心开发规范

### 1. 路由与菜单配置

所有的页面路由都在 `src/router/index.js` 中定义。如果你需要添加一个新页面：

1. 在 `src/views/` 下对应的业务模块中创建 `.vue` 文件。
2. 在 `src/router/index.js` 中引入并配置路由记录。
3. 如果需要显示在左侧菜单，前往 `src/components/Left.vue` 中添加对应的 `<router-link>`，并确保包裹在多语言 `t('...')` 方法中。

### 2. API 请求规范

本项目对 API 请求进行了封装，统一存放在 `src/api/` 目录下。

*   **统一拦截器**: `src/main.js` 中配置了 Axios 拦截器，所有请求会自动在 Headers 附带 Token，所有 401 响应会自动清理缓存并跳回登录页。
*   **基础模型工厂 (`baseModel.js`)**: 项目采用了一个通用的增删改查工厂函数 `createApi(modelName)`。对于标准的内容模型（文章、游戏、图片等），只需调用工厂函数即可生成对应的 CRUD 接口：
    ```javascript
    // api/baseModel.js
    export const articleApi = createApi('article') // 自动拥有 getList, getDetail, add, update, del 方法
    ```
*   **如何调用**:
    ```javascript
    import { articleApi } from '@/api/baseModel'

    // 获取列表
    const res = await articleApi.getList({ page: 1, limit: 10 })
    ```

### 3. 多语言 (I18n) 规范

本项目已实现中英双语切换，默认从 `localStorage.getItem('lang')` 读取。

*   **新增词条**: 当你添加新页面或新提示语时，**不要**在 `.vue` 文件中写死中文。请前往 `src/locales/zh.json` 和 `src/locales/en.json` 中添加对应的键值对。
*   **在组件中使用**:
    ```html
    <script setup>
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
    </script>

    <template>
      <!-- 在模板中直接使用 t() -->
      <button>{{ t('moduleName.buttonText') }}</button>
    </template>
    ```

### 4. 图片处理与拼接规范

后台接口通常只返回图片的相对路径（例如 `1771749217415-1.jpg`）。前端显示时需要拼接完整域名和目录。

*   **使用 `getFullUrl` 函数**: 请统一引入 `src/utils/format.js` 中的 `getFullUrl` 方法。
    ```javascript
    import { getFullUrl } from '@/utils/format'

    // 基础拼接 (默认根目录)
    const url = getFullUrl(item.cover)

    // 携带模型和频道目录拼接
    // 示例: 拼接管理员头像路径
    const adminAvatar = getFullUrl(userInfo.cover, 'User', 'admin')
    ```
*   **JSON 扩展字段 (`info`) 解析**: 后端通常将额外数据（如 cover、author、富文本内容等）存储在 JSON 格式的 `info` 字段中。解析时请使用容错机制或 `utils/format.js` 提供的解析工具，避免 JSON 解析报错导致页面白屏。

### 5. 通用上传组件

涉及到图片上传（封面、海报等），请统一使用 `src/components/UploadImage.vue` 组件。

```html
<script setup>
import CommonUpload from '@/components/UploadImage.vue'
</script>

<template>
  <CommonUpload
      v-model="form.cover"
      modelName="article"
      :channelName="currentChannelName"
  />
</template>
```

### 6. 权限控制

简单的模块级权限（如“系统管理”、“频道配置”仅管理员可见），目前通过判断用户的 `channel_id` 实现。

```javascript
// src/components/Left.vue 示例
const isAdmin = ref(false)

onMounted(() => {
  const cid = JSON.parse(localStorage.getItem('userinfo')).channel_id
  isAdmin.value = (cid === 1) // 1 代表管理员
})
```

## 📦 本地开发与构建

### 安装依赖
```bash
npm install
```

### 本地运行
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```
打包后生成的静态文件存放于 `dist/` 目录中，可直接部署到 Nginx、Cloudflare Pages 或其他静态托管服务中。

---
> *© 2026 GameZone CMS. All Rights Reserved.*
