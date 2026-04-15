# 项目结构组成说明

## 1. 项目定位

本项目是一个以 **静态前端 + Python 轻量服务端 + 可选 Android 壳** 组成的互动式小说/RP 应用。

整体可以分成 3 层：

1. **Web 界面层**
   由 `index.html`、`chat.html`、`settings.html`、`login.html` 和 `common.js` 组成，负责页面展示、交互逻辑、Prompt 构建、状态栏解析、摘要管理、数据读写等。
2. **服务端接口层**
   由 `server.py` 提供静态文件服务和 `/api/*` 接口，负责配置读取、会话存储、鉴权、聊天代理转发等。
3. **Android 封装层**
   位于 `android/`，本质上是一个 WebView 容器，把网页应用打包成 APK，并通过 `AndroidBridge` 提供原生存储与导出能力。

---

## 2. 顶层目录说明

### 根目录核心文件

- `index.html`
  应用首页，对话列表页。负责：
  - 展示已有故事/会话
  - 新建故事
  - 导入/导出数据
  - 进入聊天页

- `chat.html`
  核心聊天页。负责：
  - 初始化阶段的世界观构建
  - RP 对话过程
  - 状态栏展示与更新
  - 摘要合并
  - 世界设定查看/编辑
  - 消息编辑、回档、重发等高级功能

- `settings.html`
  设置页。负责：
  - API 配置管理
  - 默认模型与默认配置选择
  - Prompt 预设管理
  - 初始化 Prompt / 总结 Prompt 的编辑
  - 数据导入导出与清空

- `login.html`
  公共模式登录页，仅在服务端开启 `public` 模式时使用。

- `common.js`
  前端公共逻辑中心，是整个 Web App 的“核心模块库”。内部包含：
  - `Config`：运行模式配置读取
  - `Storage`：本地/服务端/原生桥接存储
  - `API`：模型调用与流式输出处理
  - `PromptBuilder`：Prompt 组装与默认模板
  - `Summary`：摘要生成/压缩
  - `MVU`：状态栏初始化、更新、patch、模板实例化
  - `Utils` / `UI`：通用工具与界面组件

- `server.py`
  Python 服务端入口。负责：
  - 静态文件托管
  - `/api/config`
  - `/api/auth/*`
  - `/api/settings`
  - `/api/profiles`
  - `/api/conversations`
  - `/api/chat`
  - `/api/chat/stream`

- `manifest.json`
  Web App Manifest，描述名称、图标、启动路径等，便于 PWA/移动端封装使用。

- `sw.js`
  Service Worker，承担前端离线/PWA 支撑逻辑。

- `start.bat` / `start.sh`
  本地启动脚本，帮助用户快速运行 `server.py` 并打开浏览器。

- `Dockerfile`
  Docker 部署入口，用于容器化运行服务端。

- `requirements.txt`
  Python 依赖列表。

- `README.md`
  项目说明与基础启动文档。

- `debug_prompt.py`
  调试辅助脚本，面向 Prompt/调试场景，不属于主运行链路。

### 静态资源目录

- `assets/`
  页面使用的图片资源，目前包含背景图等。

- `icons/`
  应用图标集合，服务于 PWA 图标、封装图标等场景。

---

## 3. 前端结构拆分

### 3.1 页面职责

#### `index.html`

首页是“会话入口页”，主要承担：

- 加载配置与本地/服务端数据
- 列出历史对话
- 新建对话
- 删除、复制、导出单个对话
- 导出/导入全部数据

它更像一个“会话管理器”。

#### `chat.html`

聊天页是项目的业务核心，承担：

- 初始化阶段：
  - 引导用户构建世界观
  - 让 AI 输出 `story_setting` 与 `mvu_init`
- RP 阶段：
  - 发送消息
  - 接收流式 AI 输出
  - 渲染正文、思维链、分支选项
- 状态同步：
  - 解析 `mvu_update`
  - 更新状态栏 DOM
  - 应用模板实例或 patch
- 内容管理：
  - 自动摘要
  - 摘要压缩
  - 消息编辑/隐藏/重发
  - 世界设定查看与人工修改

它相当于“游戏主界面 + 状态机控制器”。

#### `settings.html`

设置页是“运行参数与创作策略管理台”，主要包括：

- API Profile 管理
- 默认 API / 默认模型设置
- Prompt 预设管理
- 特殊 Prompt 编辑
  - 初始化阶段 Prompt
  - 摘要压缩 Prompt
- 数据管理

它相当于“系统后台”。

#### `login.html`

登录页只在公共模式下启用，用于邀请码/用户名登录，以及 token 检测与跳转。

---

## 4. `common.js` 的核心模块职责

`common.js` 是前端唯一的公共逻辑脚本，承担了绝大部分业务逻辑。按职责可理解为以下几个子系统：

### 4.1 `Config`

用于读取服务端 `/api/config`，判断当前是：

- `local`：本地模式
- `public`：公共模式

该模块会影响登录行为、数据存储方式、是否启用服务端代理等。

### 4.2 `Storage`

统一数据访问层，屏蔽不同运行环境的差异：

- Web 本地模式：优先 `localStorage`
- Web 公共模式：通过 `/api/*` 同步到服务端
- Android 模式：通过 `window.AndroidBridge` 存取原生文件

它管理的数据主要有：

- 设置 `settings`
- API 配置 `apiProfiles`
- 会话索引 `conversations`
- 当前会话缓存 `conv_cache`
- token

### 4.3 `API`

统一封装模型请求逻辑，支持：

- OpenAI
- Claude
- Google AI Studio
- 服务端代理模式

功能包括：

- 非流式发送
- 流式发送
- 模型列表拉取
- 错误分类
- SSE 解析

### 4.4 `PromptBuilder`

负责把各类 Prompt 条目组装成最终请求内容，包含：

- 默认初始化 Prompt
- 默认摘要合并 Prompt
- 默认 Prompt 条目模板
- 预设条目排序与启停
- 把故事设定、摘要、对话历史、状态栏等 Slot 拼接进 Prompt

这是“创作策略引擎”。

### 4.5 `Summary`

负责：

- 抽取消息摘要
- 判断是否触发摘要合并
- 调用模型生成压缩摘要
- 导出 Markdown

这是“长对话记忆压缩层”。

### 4.6 `MVU`

这是状态栏系统的核心，负责：

- 解析 `mvu_init`
- 解析 `mvu_update`
- 解析 `story_setting`
- 解析 `story_setting_patch`
- 渲染状态栏 HTML/CSS
- 应用字段 patch
- 动态角色模板实例化

它是项目里最接近“游戏状态系统”的模块。

### 4.7 `UI` / `Utils`

提供通用能力：

- Toast
- Modal
- Confirm
- 文本转义
- Markdown 渲染
- 文件导出
- 时间格式化

属于前端基础设施。

---

## 5. 服务端结构说明

### 5.1 `server.py` 的角色

`server.py` 继承 `SimpleHTTPRequestHandler`，在一个文件中同时实现：

- 静态资源服务器
- JSON 数据接口
- 鉴权
- 会话持久化
- 上游大模型代理转发

这是一个“单文件后端”。

### 5.2 主要 API

#### 配置与认证

- `GET /api/config`
  返回当前模式、默认 provider、默认 model 等。

- `POST /api/auth/login`
  公共模式登录。

- `GET /api/auth/me`
  校验 token 是否有效。

#### 配置与资料

- `GET/PUT /api/settings`
  读取/保存应用设置。

- `GET/PUT /api/profiles`
  读取/保存 API 配置。

#### 会话数据

- `GET /api/conversations`
  获取会话列表或全部会话数据。

- `GET /api/conversations/:id`
  获取单个会话。

- `PUT /api/conversations/:id`
  保存单个会话。

- `DELETE /api/conversations/:id`
  删除单个会话。

#### 模型转发

- `POST /api/chat`
  非流式聊天代理。

- `POST /api/chat/stream`
  流式聊天代理。

### 5.3 数据存储策略

服务端有两种存储方式：

1. **本地文件模式**
   默认使用 `data/` 目录存放用户数据和会话 JSON。

2. **公共模式 + 数据库**
   当启用 `AIRP_MODE=public` 且配置 `DATABASE_URL` 时，可切换到 PostgreSQL。

因此它兼顾了“本地单机版”和“多用户部署版”。

---

## 6. Android App 结构说明

`android/` 目录是对当前 Web 应用的原生封装层。

### 6.1 工程组成

- `android/settings.gradle`
  Android Gradle 项目定义。

- `android/build.gradle`
  顶层 Gradle 配置。

- `android/app/build.gradle`
  App 模块配置，包含：
  - Android 编译参数
  - 依赖
  - `syncWebAssets` 任务

- `android/gradlew` / `android/gradlew.bat`
  Gradle Wrapper。

### 6.2 `syncWebAssets` 的作用

`android/app/build.gradle` 中定义了 `syncWebAssets`，会在构建前自动把以下 Web 资源同步到 Android assets：

- HTML 页面
- `common.js`
- `manifest.json`
- `sw.js`
- `assets/**`
- `icons/**`

这保证了 Android 包内始终使用当前仓库里的前端版本。

### 6.3 原生入口

#### `MainActivity.java`

作用：

- 启动 WebView
- 通过 `WebViewAssetLoader` 加载本地 assets
- 拦截 `/api/config`，在 Android 中伪造本地模式配置
- 处理文件选择器
- 处理外链跳转
- 注册 `AndroidBridge`

#### `AndroidBridge.java`

作用：

- 提供 `saveData/loadData/deleteData`
  给网页端做原生存储
- 提供 `saveFile`
  把导出文件保存到 Android `Downloads/AIRP`

这使 Android 端可以脱离 `localStorage` 和浏览器下载机制，更稳定地运行。

### 6.4 Android 目录中的构建产物

以下目录/文件属于构建缓存或输出，不属于源码主体：

- `android/.gradle/`
- `android/app/build/`

其中 APK 产物位于：

- `android/app/build/outputs/apk/debug/`

---

## 7. 项目运行链路

### 7.1 Web 本地模式

1. 启动 `server.py`
2. 浏览器打开 `index.html`
3. 前端调用 `/api/config` 得到 `local` 模式
4. 用户在设置页配置 API
5. 聊天页通过 `API` 直接调用模型，或按配置请求代理
6. 会话、设置、摘要、状态栏通过 `Storage` 保存

### 7.2 Web 公共模式

1. 服务端以 `AIRP_MODE=public` 运行
2. 用户先进入 `login.html`
3. token 通过 `/api/auth/*` 校验
4. 会话和设置通过 `/api/*` 存到服务端/数据库
5. 模型请求走服务端代理接口

### 7.3 Android 模式

1. Web 资源被打进 APK 的 assets
2. `MainActivity` 加载本地页面
3. 前端检测到 `window.AndroidBridge`
4. `Storage` 切换到原生文件存储
5. 导出文件通过原生接口写入手机下载目录

---

## 8. 推荐的阅读顺序

如果是第一次接手这个项目，推荐按下面顺序阅读：

1. `README.md`
2. `index.html`
3. `chat.html`
4. `common.js`
5. `settings.html`
6. `server.py`
7. `android/app/src/main/java/com/rujuan/airp/MainActivity.java`
8. `android/app/src/main/java/com/rujuan/airp/AndroidBridge.java`

这样可以先理解产品流程，再理解核心逻辑，最后理解平台封装。

---

## 9. 一句话总结

这个项目本质上是一个：

**以单文件前端页面为界面载体、以 `common.js` 为业务核心、以 `server.py` 为轻后端、并可通过 `android/` 目录封装成 APK 的互动式小说应用。**
