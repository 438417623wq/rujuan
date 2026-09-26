# 入卷 AIRP - AI Interactive Roleplay Novel

AI 驱动的互动式小说平台。核心特色：**「构建世界观 → 定制状态栏 → 开始冒险」** 一站式体验。

用户与 AI 协作设计世界观、角色档案和实时状态面板，然后在沉浸式 RP 中推进剧情，状态栏实时追踪角色状态、物品、任务等。

## 原仓库

- GitHub 仓库：https://github.com/rook1ess/rujuan

## 当前仓库

- GitHub 仓库：https://github.com/438417623wq/rujuan

## 与原版不同

1. 修改优化后台运行和通知栏显示
2. 修改了世界书可增加导入，读取世界书来生成设定，勾选世界书条目注入预设
3. 修改了 OpenAI 接口，适配更多的模型连接
4. 修改优化了故事可导入导出

## 功能特性

- **世界观构建**：AI 协助设计故事背景、角色设定、力量体系
- **实时状态栏**：自定义 HTML/CSS 面板，追踪 HP/MP/物品/技能/角色关系等，每轮自动更新
- **摘要系统**：自动生成每轮摘要，长对话不丢失上下文
- **多 API 支持**：Claude / OpenAI / Google AI Studio，支持流式输出
- **预设系统**：可导入 SillyTavern 预设，自定义 prompt 条目
- **数据管理**：本地存储 + 服务器同步，支持导入/导出

## 更新日志

### 2026-07 Anthropic 缓存修复

- 针对 Anthropic 重构消息 block 以适配缓存机制。目前长对话中的缓存表现已与其他模型类似，可显著降低重复输入的 token 消耗；不使用 Claude 的用户无需更新。

### 2026-07 大版本更新

经过大量真实模型测试（Claude / DeepSeek / GPT / Grok 多家对照），修复了一批核心问题：

1. **现在游玩中可以正确添加角色了**——AI 能看到角色模板，新登场人物自动加入状态栏；开局角色也会在创建确认时直接出现在状态栏上
2. **修正了 AI 生成状态栏的可用性**，使创建和 RP 中的行为更加一致——修复了面板自建滚动导致下半部分够不着的问题，修复了血条数值 "0/100/100" 堆叠、进度条卡死的问题
3. **针对 Claude 添加了有限的缓存策略**（只针对 story_setting，架构所限）——其他模型（DeepSeek / GPT / Gemini）的隐式缓存在本架构下表现良好，无需特殊处理；Claude 是因为自身缓存策略过于苛刻（显式标记 + 按块整体判定），只能做局部优化
4. 状态栏更新容错增强：AI 输出 JSON 的常见小错（未转义引号、裸换行）自动修复，不再静默丢失
5. 世界观修改支持全局改名与分批提交；默认预设现在始终跟随最新内置 prompt
6. 时间精确到分钟且每轮推进；角色心理/态度字段保持一句话快照，不堆积长文
7. 优化了摘要系统：引入分代记忆——超长上下文的情况下，对已压缩摘要进行进一步归档，优化长对局中的 token 表现；并强化了摘要合并的鲁棒性（错过自动合并可自行补上，支持手动合并）

## 快速开始

### 环境要求

- Python 3.8+（本地模式无需安装任何依赖）
###更新说明  26/5/17

一、合并上游 v1.7.0
1. 修复聊天消息右上角操作按钮 hover 时容易消失的问题。
2. 调整默认提示词措辞，改为更偏创意表达、沉浸叙事和文学可读性的描述。
3. 增加 JSON 字符串值内部双引号必须转义的提示，减少状态栏初始化时 JSON 生成错误。
4. 移除最小预设中默认禁用的 NSFW 指导项，与上游 v1.7.0 保持一致。

二、小米 MiMo 模型兼容修复
1. 修复使用小米 MiMo 模型时可能连续输出 nullnullnull 的问题。
2. Android 原生流式服务中过滤 JSON null 和字符串 "null"，避免错误拼接进最终回复。
3. 兼容 reasoning_content、reasoning、content、text、output_text 等不同响应字段。
4. 对 reasoning 内容自动包裹 think 标签，普通正文开始时自动关闭。
5. 支持 data: 和 data: 后带空格两种 SSE 格式。
6. 为 MiMo / Xiaomi / mi.com 相关配置补充 api-key 请求头。
7. 为 MiMo 请求添加 thinking: { type: "disabled" }，减少不兼容输出。
8. 前端增加 null 洪泛文本清理兜底，避免异常内容直接显示。

三、设置页修复
1. 修复设置界面右上角缺失保存按钮的问题。
2. 增加保存图标，并同步到 Web 页面和 Android assets 页面。

###更新说明  26/9/26（合并上游 2026-07 更新）

本次把上游 `rook1ess/rujuan` 2026-07 的三批提交合并进来（合并基点 `5cb89c31`，上游 HEAD `038186a`），
Fork 侧的后台运行、世界书、MiMo 兼容、故事导入导出等改动全部保留。

一、合并上游新增
1. 分代摘要记忆：超长对局中对已压缩摘要再做归档，优化长上下文 token 表现。
2. 开局角色实例化（templates + instances）：角色改为模板实例化，开局角色随创建确认直接进入状态栏；
   角色不再写进 schema。
3. 状态栏净化与可用性修复：数值 "0/100/100" 堆叠、进度条卡死、面板自建滚动导致下半部分够不着。
4. Anthropic 缓存优化：按块重组消息以适配 Claude 显式缓存，显著降低重复输入 token 消耗。
5. 状态栏 JSON 容错增强：未转义引号、裸换行自动修复。

二、合并时的人工取舍
1. `applyPatch` 保留 Fork 的嵌套路径能力（resolveParent/assignKey/removeValue），
   并叠加上游的数值强转与旧存档 "45/100" 坏数据归一化。
2. `updateDOM` 保留 Fork 的多元素匹配与变更高亮，并叠加上游的 bar/number 归一化。
3. `buildMessages` 采用上游的「不合并相邻同角色消息」策略（故事设定块才能独立缓存），
   同时保留 Fork 的世界书元数据返回字段。
4. `render` 保留 Fork 的 `BASE_STYLE`，并叠加上游的宿主滚动防护 `hostGuard`。
5. 默认初始化提示词采用上游版本（引入 templates/instances 体系，角色不进 schema），
   Fork 原先写入 schema 的 `characters` 字段随之废弃。
6. OpenAI 流式分支保留 Fork 的 `_openAiStreamChunk`（reasoning/think 包裹、null 过滤），
   并叠加上游的 `finishReason` 与 `_applyUsage` 缓存计费统计。

三、同步与校验
1. 根目录 web 文件已同步到 `android/app/src/main/assets/`。
2. `common.js` / `chat.html` / `settings.html` 内联脚本 / `server.py` / `debug_prompt.py` 语法检查通过。

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/438417623wq/rujuan.git
cd rujuan

# 2. 启动服务器
python3 server.py
```

服务器启动后访问 `http://localhost:8080`。

也可以使用一键启动脚本：

- **macOS / Linux**：`./start.sh`（自动打开浏览器）
- **Windows**：双击 `start.bat`

### 配置 API

启动后进入 **设置** 页面，添加 API 方案：

1. 点击「添加方案」
2. 填入 API 地址和密钥（支持 Claude API / OpenAI 兼容接口 / Google AI Studio）
3. 选择模型，保存

### 开始游戏

1. 回到首页，点击「开始新故事」
2. 输入你想要的故事类型（如「修仙」「校园」「赛博朋克」），或输入「直接开始」随机生成
3. AI 生成世界观和状态栏后，确认进入 RP 阶段
4. 在 RP 中通过输入文字或选择分支推进剧情

## Docker 部署

```bash
docker build -t rujuan .
docker run -p 8080:8080 -v rujuan_data:/app/data rujuan
```

## 局域网访问

启动后，同一局域网内的其他设备可以通过 `http://<你的IP>:8080` 访问。

查看本机 IP：
- **macOS**：`ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**：`ipconfig`
- **Linux**：`ip addr show`

## 项目结构

```
rujuan/
  index.html        # 首页 - 对话列表
  chat.html          # 对话页 - 游戏主界面
  settings.html      # 设置页 - API / 预设 / 数据管理
  common.js          # 共享模块
  server.py          # Python 服务器（零依赖）
  data/              # 运行时数据（自动创建）
```

## 协议

[AGPL-3.0](LICENSE)
