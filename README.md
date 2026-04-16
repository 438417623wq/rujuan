# 入卷 AIRP - AI Interactive Roleplay Novel

AI 驱动的互动式小说平台。核心特色：**「构建世界观 → 定制状态栏 → 开始冒险」** 一站式体验。

用户与 AI 协作设计世界观、角色档案和实时状态面板，然后在沉浸式 RP 中推进剧情，状态栏实时追踪角色状态、物品、任务等。

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

## 快速开始

### 环境要求

- Python 3.8+（本地模式无需安装任何依赖）

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
