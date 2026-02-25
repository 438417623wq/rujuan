# MVU 状态栏参考模板

> 提取自"道渊 v2.9.9"角色卡，作为 AIRP 状态栏功能的设计参考。

## 架构概览

### 三层设计
1. **AI 输出层** — System Prompt 要求 AI 每次回复末尾输出结构化 XML `<data_block>`
2. **解析层** — 前端用 DOMParser 解析 XML
3. **渲染层** — JS 将数据渲染为游戏风格 UI（进度条、Tab页、卡片等）

### 在 AIRP 中的对应
- 第1层 → MVU System Prompt 指令
- 第2层 → chat.html 中的 XML/JSON 解析
- 第3层 → 气泡内嵌的状态面板 HTML

---

## 第1层：AI 数据输出模板（XML Schema）

```xml
<data_block>
    <!-- === 核心属性 === -->
    <rank>境界</rank>
    <clan>宗门/无/散修</clan>

    <!-- === 数值属性（当前/最大） === -->
    <hp_current>100</hp_current>
    <hp_max>100</hp_max>
    <blood_current>100</blood_current>
    <blood_max>100</blood_max>
    <mp_current>100</mp_current>
    <mp_max>100</mp_max>
    <exp_current>50</exp_current>
    <exp_max>100</exp_max>

    <!-- === 文本属性 === -->
    <san_current>80</san_current>
    <san_max>100</san_max>
    <san_status>神识清明，神念覆盖十里</san_status>
    <luck_status>凡俗气运·无特殊加成</luck_status>
    <spirit_root_status>黄品·火灵根</spirit_root_status>
    <status_effects>无异常</status_effects>

    <!-- === 环境信息 === -->
    <location>青云城·坊市入口</location>
    <time>甲子年三月初五·晴·灵气浓度：普通</time>
    <threat_level>安全</threat_level>

    <!-- === 物品 === -->
    <inventory>下品灵石×50, 辟谷丹×10, 下品法器·铁剑×1</inventory>

    <!-- === 功法列表 === -->
    <skills>
        <skill>
            <name>基础吐纳术</name>
            <type>黄阶下品</type>
            <level>第三层</level>
            <mastery>45</mastery>
            <desc>最基础的修炼法门，引天地灵气入体淬炼经脉</desc>
        </skill>
    </skills>

    <!-- === 道侣/同伴 === -->
    <partners>
        <partner>
            <name>姓名</name>
            <species>种族</species>
            <realm>境界</realm>
            <status>当前状态</status>
            <loyalty>80</loyalty>
            <hp>100</hp>
            <mp>100</mp>
            <personality>性格描述</personality>
            <desc>背景、容貌、衣着</desc>
            <abilities>神通或特殊能力</abilities>
            <thoughts>内心想法</thoughts>
        </partner>
    </partners>

    <!-- === NPC === -->
    <npcs>
        <npc>
            <name>姓名</name>
            <title>称号/身份/宗门</title>
            <realm>境界</realm>
            <relation>50</relation>
            <hp>100</hp>
            <mp>100</mp>
            <desc>背景、年龄、外貌、性格、内心想法</desc>
        </npc>
    </npcs>

    <!-- === 任务/机遇 === -->
    <quests>
        <quest>
            <title>任务标题</title>
            <difficulty>困难</difficulty>
            <goal>任务目标描述</goal>
            <reward>完成奖励</reward>
            <quote>一句与任务相关的引言</quote>
        </quest>
    </quests>

    <!-- === 事件日志 === -->
    <log>最近发生的重要事件（最少50字）</log>
</data_block>
```

---

## 第3层：渲染 UI 结构

### 布局
```
┌──────────────────────────────────────┐
│ ⚜️ 面板                    角色名   │  ← Header
├──────────┬───────────────────────────┤
│ [头像框] │ [概览] [功法] [道侣] ... │  ← Nav Tabs
│ 境界徽章 │                           │
│          │  ┌─────────────────────┐  │
│ HP ████░ │  │ 📍 当前所在         │  │  ← Tab Content
│ 精血████ │  │ 青云城·坊市入口     │  │
│ 灵力████ │  ├─────────────────────┤  │
│ 修为██░░ │  │ ⚠️ 天机推演         │  │
│          │  │ 灵气浓度：普通       │  │
│ 神识: .. │  │ 危机程度：安全       │  │
│ 气运: .. │  ├─────────────────────┤  │
│ 灵根: .. │  │ 🎒 储物袋           │  │
│ 宗门: .. │  │ 灵石×50, 辟谷丹×10  │  │
│ 状态: .. │  └─────────────────────┘  │
└──────────┴───────────────────────────┘
```

### 核心 CSS 变量
```css
:root {
    --accent-blood: #ff4d4d;     /* HP/生命 */
    --accent-mana: #4da6ff;      /* 灵力 */
    --accent-gold: #ffd700;      /* 金色高亮/修为 */
    --accent-exp: #ff9f43;       /* 经验 */
    --accent-san: #2ed573;       /* 神识/好感 */
    --text-main: #f1f2f6;
    --text-dim: #a4b0be;
    --rare-text: #d980fa;        /* 稀有属性文本 */
}
```

### 进度条组件
```html
<div class="stat-row">
    <div class="stat-label">
        <span>生命</span>
        <span>80/100</span>
    </div>
    <div class="progress-bg">
        <div class="progress-fill fill-hp" style="width: 80%"></div>
    </div>
</div>
```

### Tab 切换（6个页面）
| Tab | 内容 |
|-----|------|
| 概览 | 当前所在 + 天机推演(时间/威胁) + 储物袋 |
| 功法 | 功法卡片列表（名称/品阶/层数/熟练度条/描述） |
| 道侣 | 同伴卡片（境界/HP/MP/亲密度条/性格/背景/神通/心声） |
| 人物 | NPC 卡片（境界/HP/MP/好感度条/描述） |
| 机遇 | 任务列表（标题/难度/目标/奖励/引言） |
| 日志 | 最近事件文本 |

---

## 设计要点

1. **AI 只输出数据，不输出 HTML** — 保持 prompt 简洁，渲染逻辑在前端
2. **数值用 0-100 百分比** — 简化 AI 输出和前端渲染（直接映射到 CSS width%）
3. **可选字段** — 没有的字段（如无道侣）直接省略整个标签块
4. **事件日志至少50字** — 保证玩家能回顾最近发生了什么
5. **暗色系游戏风 UI** — 与 RP 小说的沉浸感匹配
6. **移动端响应式** — Grid 降为单列，头像缩小
