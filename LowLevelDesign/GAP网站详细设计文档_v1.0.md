# GAP 网站（Web）详细设计文档

General Athletic Preparation Recommendation System — Web Frontend Detailed Design

面向多运动爱好者的通用运动能力评估、能力缺口分析与训练计划生成系统 · **前端与交互详细设计**

版本：v2.2（v2.1 As-Built 基线之上的变更版，代码尚未落地）
状态：变更待实现（经审阅确认后按文执行）
日期：2026-09-05
上游依赖：[GAP系统设计文档_v1.0.md](../HighLevelDesign/GAP系统设计文档_v1.0.md)

---

## 文档元信息

| **项目**   | **内容**                                                                                                                   |
|------------|----------------------------------------------------------------------------------------------------------------------------|
| 文档定位   | 网站前端与交互的详细设计（LLD）。**本版 v2.2**：以 v2.1（已按文落地，commit `3e20ea1`，2026-09-04 部署）为 As-Built 基线，追加 1 项引擎变更——**每日能力排日算法优化 + 能力相斥关系**（§4.1/§4.2 能力数据、§5.6/§5.8 引擎、附录 C.2 / E），凡与既往版本冲突之处一律以本文为准。 |
| 技术栈     | React 19 / Next.js（App Router，静态预渲染）/ TypeScript；CSS 变量驱动的设计令牌（Design Tokens）；CSS 存放于 `web/src/app/*.css`。 |
| 界面语言   | 中英双语（zh-CN 默认 / en-US 可切换）；能力代码（PWR、STR_MAX…）仅存在于数据层，UI 一律展示能力全称。                        |
| 内容结构   | 同一站点 3 个导航入口：欢迎 `/`、定制计划 `/app/onboarding`、了解GAP `/docs`（v2.1 移除「我的能力」；不做用户注册与数据留存）。                    |
| 评估方式   | 双轨自选：简单自评问卷（SAQ）或专业自测（SPT），向导内二选一后直接进入对应子流程。                                           |
| 视觉风格   | 参考 Apple 官网的简洁、留白、克制理念；Hero 使用照片背景 + 暗色蒙层；数据可视化使用 3 层能力色板；明/暗双主题。                |
| 目标读者   | 产品经理、UI/UX 设计师、前端工程师、算法工程师、内容编辑。                                                                  |
| 非目标     | 医疗诊断界面、康复处方、竞技专项成绩承诺、原生 App。                                                                        |

**范围声明**：本文只描述**当前已实现**的页面、组件、数据与算法（见 §1.1 路由清单）。历史上设计过但**尚未实现**的页面/能力（评估与复测、训练记录、进步页、解释层、完整文档站等）不展开规格，仅以一行列入 §9「路线图」。

---

## 版本原则与文档维护

1. 设计令牌以 `tokens.css` 单一源管理，改令牌即全局生效。
2. 每页、每组件有独立规格；修改一处只影响其对应模块。
3. 引擎相关数值（缺口、优先级、主题）引用 `algorithm_version`；对外仅暴露三档优先级（见 §5）。
4. 任何交互/视觉变更，先在本文档对应章节更新，再改代码。
5. 用户可见逐字文案（标题、副题、按钮、提示）属「内容资源」，**以 `web/src/lib/i18n.tsx`（UI 文案）与 `web/src/lib/data.ts`（能力定义/SAQ 题目/动作要点等数据文案）为单一源**；本文描述其结构、归属页面与关键句式，不逐字复制，避免双源失配。逐字稿变更时需保持 zh/en 成对且 key 稳定（§3.2）。
6. **数据可扩展**：新增运动/能力/动作/方法块等，按 §4「数据模型与数据表」各表行规则与附录 C「数据扩展手册」执行，多数情形仅需增行、无需改交互代码。

**变更记录见附录 E**（行升序、最新在末尾）。修改后需同步递增文首版本号。

---

# 0. 范围与事实标准

## 0.1 事实来源

| 范围       | 来源                                                                  |
|------------|-----------------------------------------------------------------------|
| 路由与页面 | `web/src/app/**/page.tsx`（路由清单见 §1.1）                           |
| 全局布局   | `web/src/app/layout.tsx`、`components/Nav.tsx`、`components/Footer.tsx`、`components/Providers.tsx` |
| 数据       | `web/src/lib/data.ts`（layers/abilities/sports/exercises/saq 等）      |
| 算法       | `web/src/lib/engine.ts`（mock · 确定性）、`components/plan/shared.ts`   |
| 类型契约   | `web/src/lib/types.ts`                                                |
| 存储       | `web/src/lib/store.ts`（localStorage 封装）                            |
| 双语       | `web/src/lib/i18n.tsx`（`t`/`L`/dict）                                 |
| 设计令牌   | `web/src/app/tokens.css`（明/暗）                                     |

## 0.2 v2.0 整理原则

1. **以当前网站为准**：删除既往文档中「5 类分组 / 达成反馈 / 达标判定 / 证言占位 / Hero 雷达半圆 / 剪影与粒子」等与现实现不一致或已废弃的规格；凡代码中已不存在的行为不以旧文为准。
2. **可固化生成**：页面规格精确到「区块 → 组件 → 数据绑定 → 交互 → 文案 key」层级，使本文 + 数据源可复现当前站点结构与行为。
3. **数据表可扩展**：所有数据表集中在 §4 给出行结构与填写规则；新增运动/能力/动作按附录 C 操作即可，不破坏现有页面与引擎。

## 0.3 视觉范围速览

- 全站中性灰阶 + 单一主色（Apple 蓝），明暗主题切换；层级色（L1 红 / L2 绿 / L3 蓝）只用于数据可视化与分组圆点。
- 页面含中文全称能力名、优先级三档 chip（高/中/低）、按「轮」组织的训练日（第 1 天…第 N 天）。
- 计划页采用「引擎给每日能力目标 + 动作库自选编排 → 确认 → 只读总表」流程；对外不判达标、不展示 0–5 精确分。

---

# 1. 站点与信息架构

## 1.1 路由清单（当前实现 · 7 条路由 = 6 业务页 + 内置 404；v2.1 移除 `/app/training`）

| 路由                | 页面名（中文） | 页面文件                               | 性质     | 数据来源 / 入口                                                             |
|---------------------|----------------|----------------------------------------|----------|-----------------------------------------------------------------------------|
| `/`                 | 欢迎           | `app/page.tsx`                         | 落地页   | 静态数据（layers/abilities/sports）+ 本地交互态                              |
| `/app`              | 应用入口       | `app/app/page.tsx`                     | 重定向   | 读 `gap.plan` → 有则 `/app/dashboard`，无则 `/app/onboarding`               |
| `/app/onboarding`   | 定制计划向导   | `app/app/onboarding/page.tsx`          | 表单流程 | 输入 → 写 `gap.user`/`gap.plan` → `/app/dashboard`                          |
| `/app/dashboard`    | 能力画像       | `app/app/dashboard/page.tsx`           | 产品页   | 读 `gap.plan`；无 `days` 则回 `/app/onboarding`                             |
| `/app/plan`         | 训练计划       | `app/app/plan/page.tsx`                | 产品页   | 读/写 `gap.plan`（编排实时写回；确认写 `confirmedAt`）                      |
| `/docs`             | 了解GAP        | `app/docs/page.tsx`                    | 空态占位 | 静态文案；未来：知识库/文档站（v2.1 起为唯一占位页）                        |
| `/_not-found`       | 404            | Next 内置                              | 兜底页   | —                                                                           |

> 页面类型说明：所有页面为 `"use client"` 客户端组件，但页面结构是静态的（无服务端动态数据），构建后输出静态 HTML；客户端仅承担读取 localStorage、切换状态、计算派生值。交互数据不依赖后端。

## 1.2 站点树

```
GAP Web
├─ /                        欢迎（落地页，§6.1）
│   ├─ Hero（照片背景 + 暗蒙层 + 白字 + 双 CTA + 滚动提示）
│   ├─ GAP 是什么 / 不是什么（两栏对比卡）
│   ├─ 18 能力 · 3 层树状图（全量展开，每层一张卡列出能力全称 + 定义）
│   ├─ 六步流程（仅序号 + 标题）
│   ├─ 不同运动共享能力（运动 chips 多选 + 平均需求雷达图）
│   └─ 底部 CTA + 免责声明一行
├─ /app                   使用界面入口（重定向）
│   ├─ /app/onboarding    5 屏向导：目标运动 → 训练天数 → 评估方式 → 能力评估 → 生成
│   ├─ /app/dashboard     能力画像：统计卡 / 雷达图 / 缺口条形图 / 每轮训练日卡
│   ├─ /app/plan          训练计划：编排 Composer（未确认）↔ 只读总表 PlanTable（已确认）
└─ /docs                  了解GAP（空态占位；v2.1 起为全站唯一占位页）
```

## 1.3 全局根布局（`app/layout.tsx`）

- `<html lang="zh-CN" suppressHydrationWarning>`；`<body>` 内首元素为**内联主题脚本**：读 `localStorage['gap.theme']`（缺省 `'light'`）同步写 `<html data-theme>`，避免明暗闪动。
- CSS 按序载入：`tokens.css` → `base.css` → `components.css` → `landing.css` → `app.css`。
- `metadata`：`title: "GAP — General Athletic Preparation"`；`description`（中文）。
- 结构：`<Providers><Nav /><main>{children}</main><Footer /></Providers>`；`main` 为语义正文容器。
- `Providers` 仅挂载 `I18nProvider`（见 §7）。

## 1.4 顶部导航（`components/Nav.tsx`）

```
[◉ GAP]   欢迎    定制计划    了解GAP                [中|EN] [◐]
```

| 项        | 文案 key          | 路由/行为                                                                    |
|-----------|-------------------|-------------------------------------------------------------------------------|
| Logo      | —（"GAP"）        | `<Link href="/">`，SVG 徽标（圆环 + 圆心点）                                   |
| 欢迎      | `nav.home`        | `/`，高亮规则 = `pathname === "/"`                                            |
| 定制计划  | `nav.start`       | `/app/onboarding`，高亮规则 = `pathname.startsWith(href)`                      |
| 了解GAP   | `nav.docs`        | `/docs`（真实路由），规则同上（v2.1 起导航仅 3 项，`nav.training` 键随页删除）|
| 语言按钮  | —                | `setLang(lang === "zh" ? "en" : "zh")`；文案显示目标语：zh 态显示 `EN`，en 态显示 `中` |
| 主题按钮  | —                | `◐`；切 `<html data-theme>` 明/暗，写 `gap.theme`                              |

- 滚动行为：`scrollY > 4` 时加 `.is-scrolled`（nav 背景变磨砂/不透明）。
- 高亮类 `.is-active`；logo + 全部导航项均用 `<Link>`。
- 结构 class：`.nav > .nav-inner.container`，内含 `.nav-logo` / `.nav-links` / `.nav-actions`。

## 1.5 页脚（`components/Footer.tsx`）

```
[产品] 欢迎 · 定制计划 ·    [知识] 了解GAP   [法律] 免责声明   GAP · tagline
© 2026 GAP. GAP 是训练决策工具，不构成医疗建议。
```

| 列       | key            | 链接                               |
|----------|----------------|------------------------------------|
| 产品     | `footer.product` | `/`（nav.home）、`/app/onboarding`（nav.start） |
| 知识     | `footer.knowledge` | `/docs`（nav.docs）              |
| 法律     | `footer.legal` | `免责声明`（仍为无跳转死链 `<a href="#" onClick=preventDefault>`） |
| 品牌     | `footer.tagline` | `General Athletic Preparation`   |
| 底行     | `footer.disclaimer` | `© 2026 GAP. GAP 是训练决策工具，不构成医疗建议。` |

---

# 2. 设计令牌与全局类库

> 令牌一律为 CSS 变量，文件 `web/src/app/tokens.css`；`:root` 为浅色，`[data-theme="dark"]` 覆盖。命名 `--{类别}-{语义}`（无 `gap-` 前缀）。

## 2.1 色彩（Color）

**中性 / 表面（Apple 灰阶）**

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--bg-page` | `#FFFFFF` | `#000000` | 页面背景 |
| `--bg-elevated` | `#F5F5F7` | `#161617` | 分区 / 卡片背景 |
| `--bg-elevated-2` | `#EBEBED` | `#1D1D1F` | 次级卡片 / 输入底 |
| `--text-primary` | `#1D1D1F` | `#F5F5F7` | 主文本 |
| `--text-secondary` | `#6E6E73` | `#A1A1A6` | 次级文本 |
| `--text-tertiary` | `#86868B` | `#6E6E73` | 说明/占位文本 |
| `--separator` | `rgba(0,0,0,.12)` | `rgba(255,255,255,.16)` | 描边/分隔线 |
| `--fill` | `rgba(120,120,128,.12)` | `rgba(120,120,128,.24)` | 图标/标签底色 |

**主色（品牌 / 操作）**

| Token | 值 | 用途 |
|---|---|---|
| `--accent` | `#0071E3` | 主按钮、链接、选中 |
| `--accent-hover` | `#0077ED` | 悬停 |
| `--accent-active` | `#0060C9` | 按下 |
| `--accent-faint` | `rgba(0,113,227,.10)`（暗：`rgba(10,132,255,.16)`） | 选中浅底 / 雷达填充 |

**能力层级色（仅数据可视化 + 分组圆点）**：`--layer-l1:#FF3B30`、`--layer-l2:#34C759`、`--layer-l3:#0A84FF`。语义色：`--success:#34C759`、`--warning:#FF9500`、`--danger:#FF3B30`、`--info:#0A84FF`。三档优先级 chip 即 danger/warning/success（见 §5.6）。规则：UI 文本/按钮/边框用中性 + accent；层级色只出现在可视化与分类圆点。

## 2.2 圆角 / 阴影 / 间距 / 布局

| Token | 值 | 用途 |
|---|---|---|
| `--radius-sm/md/lg/pill` | `8 / 12 / 18 / 999px` | 控件 / 卡片 / 大卡 / 胶囊 |
| `--shadow-sm / --shadow-lg` | `0 2px 8px rgba(0,0,0,.06)` / `0 12px 40px rgba(0,0,0,.12)`（暗色加深） | 卡片 / 弹层 |
| `--space-1..4` | `4/8/12/16px`（`5:20`） | 间距基准 4px |
| `--space-6/8/10/12/16` | `24/32/40/48/64px` | 区块内距 |
| `--space-section` | `96px` | 区块垂直留白 |
| `--container-max` | `1200px` | 内容容器 |
| `--measure` | `680px` | 可读栏宽 |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif` | 正文字体栈 |
| `--font-mono` | `"SF Mono", ui-monospace, Menlo, Consolas, monospace` | 数字/等宽 |
| `--ease-standard` | `cubic-bezier(.25,.1,.25,1)` | 常规过渡 |
| `--dur-fast/base/slow` | `150 / 250 / 500ms` | 时长 |
| `--material-regular` | `saturate(180%) blur(20px)` | 导航磨砂 |

## 2.3 全局类（base.css）

| 类 | 语义 |
|---|---|
| `.display-title` `.h1` `.h2` `.h3` `.body-lg` `.body` `.caption` `.micro` `.eyebrow` | 字号层级（展示标题/标题1-3/大正文/正文/说明/小字/眉题） |
| `.tnum` | `tabular-nums` 等宽数字 |
| `.text-secondary` `.text-tertiary` | 次级/弱文本色 |
| `.container` | 居中 1200px |
| `.measure` | 可读栏宽（680px） |
| `.section`（`.section--tight`） | 垂直留白区块 |
| `.grid` `.grid--2` | CSS grid 两列（响应式回落） |
| `.center` | 文本居中 |
| `.flex` `.flex-between` `.items-center` | flex 布局 |
| `.gap-2/3/4/6` `.mt-2/4/6/8` `.mb-4` | 间距工具类 |
| `.card`（`.card--outlined` `.card--interactive`） | 卡片（描边/可交互选中） |
| `.btn` `.btn-primary` `.btn-secondary` `.btn-ghost` `.btn-lg` `.btn-sm` | 按钮族（primary=accent 实底；secondary=描边；ghost=文字） |
| `.badge` `.badge--maint` | 小徽标（动作类别使用 maint 变体） |
| `.chip`（`.is-active`） | 运动筛选 chip |
| `.icon-btn` | 方形图标按钮（语言/主题/步进） |
| `.field` | 带 label 的表单行 |

## 2.4 动效

- 落地页滚动显现用 `Reveal` 组件（IntersectionObserver，threshold 0.15）：元素初始隐藏（CSS `.data-reveal`），进入视口加 `.is-visible` 淡入上移；`delay`（ms）错峰（六步每步 +60）。
- Hero 滚动提示 `bob` 上下浮动动画；尊重 `prefers-reduced-motion` 关闭。

---

# 3. 基础设施：存储与国际化

## 3.1 本地存储（`lib/store.ts`）

封装 `localStorage`（SSR 安全、JSON 序列化、异常静默）：`store.get<T>(key, def)` / `store.set(key, val)` / `store.remove(key)`。

| Key | 值类型 | 写入点 | 读取点 | 说明 |
|---|---|---|---|---|
| `gap.theme` | `"light" \| "dark"` | Nav 主题按钮、layout 内联脚本 | Nav / layout 脚本 | 明暗主题 |
| `gap.lang` | `"zh" \| "en"` | I18nProvider `setLang` | I18nProvider | 语言（默认 zh） |
| `gap.user` | `UserData` | 向导生成时 | —（预留） | 生成输入快照 |
| `gap.plan` | `Plan` | 向导生成 / 计划页每次写回 | `/app`、dashboard、plan | 当前计划（编排实时写回） |

## 3.2 国际化（`lib/i18n.tsx`）

- Provider 初始化读 `gap.lang`；切换时写回并设 `<html lang="zh-CN"|"en">`。
- `useI18n()` 暴露：`t(key)`（按 key 取 `dict[lang]`，en 缺失回落 zh，再回落 key 本身）；`L(zh, en)`（就地双语文案，en 缺失返回 zh）；`lang`、`setLang`。
- 界面/导航/页文案统一走 `dict`；**数据行内双语**（运动名、能力名、动作名、层级、类别、SAQ 题）在数据对象内成对（`zh/en` 字段），渲染用 `L(zh, en)`。中英一键切换全站即时生效。
- 能力代码、版本号、单位（kg/cm/s/次/min）不翻译。
- dict key 命名空间（对应各页面/区块）：`nav.*`、`footer.*`、`hero.*`、`what.*`、`map.*`、`step.1-6.*`、`sports.*`、`cta.*`、`ob.*`、`mode.*`、`dash.*`、`plan.*` 等；key 值见 `i18n.tsx`（单一源）。

---

# 4. 数据模型与数据表（集中层）

> **单一事实源**：数据行本体一律维护在 `web/src/lib/data.ts`（领域数据）与 `web/src/lib/types.ts`（类型契约），本文件只在「结构上固定字段、枚举、量级与扩展规则」，并附全量行（能力 / 运动）。UI 文案单源 `i18n.tsx` 见 §3.2。
> **扩展（原则 6）**：新增运动/能力/动作/方法块/量表 ⇒ 改 `data.ts` 并满足 §4.8 不变式，界面自动生效，无需改页面组件；操作手册见 附录 C。

## 4.1 类型契约（`types.ts`，全量）

| 类型 | 字段（→语义） | 备注 |
|---|---|---|
| `Lang` | `"zh" \| "en"` | |
| `LayerKey` | `"L1" \| "L2" \| "L3"` | 3 层边界（HLD 1.1） |
| `SportWeight` | `"low" \| "medium" \| "high"` | 目标运动重视度 |
| `SportLevel` | `"recreational" \| "intermediate" \| "competitive"` | 已定义未使用（预留） |
| `AssessmentMode` | `"saq" \| "spt"` | 自评 / 专业自测 |
| `Layer` | `key, zh, en, cssVar, abilities: string[]` | `cssVar`=`--layer-l1/l2/l3` |
| `Ability` | `code, zh, en, layer, def, conflicts: string[]` | code=稳定主键（附录 D）；`conflicts`=相斥能力 code 列表（v2.2，对称，仅能量系统 4 条非空，见 4.2） |
| `Sport` | `id, zh, en, cat, demand` | `demand`=18 能力需求（v2.1 起移除 `icon` 字段） |
| `Exercise` | `id, zh, en, category, cover, primary, equipment[], setsMin, setsMax, reps, rpe, minutes, cue, regression` | cover=刺激向量，见 4.5 |
| `SaqQuestion` | `code, zh, en, a0, a5` | a0/a5=滑块两端锚点文案 |
| `SportGoal` | `id, weight` | 生成输入：目标运动 |
| `UserProfile` | `ageBand, height, weight, trainingAge` | 已定义未采集（预留） |
| `UserConstraints` | `daysPerWeek: number` | 每轮训练天数 1–7 |
| `UserAssessment` | `mode, saq: Record<code, 0–5 分>` | spt 结果先折算为 0–5 落 saq |
| `UserData` | `profile?, sports, constraints, assessment` | 生成引擎入参 |
| `Localized` | `zh, en` | 双语文案对象 |
| `GapItem` | `code, current, target, deficit, priority, transfer, reasons[], recommendation[]` | 能力缺口（§5.3） |
| `DayAbilityTarget` | `code, baseline(=current), target(今日目标分), freq(本轮频次)` | 达标判定口径 |
| `ExerciseChoice` | `exerciseId, factor(0.5\|1\|1.5\|2), ability?` | 用户编排动作；ability=单归属（§6.5） |
| `DayBlueprint` | `day, labelZh, labelEn, themeZh, themeEn, duration, targets[], recommended[], choices[]` | 一个训练日 |
| `Plan` | `algorithm_version, generatedAt, sports, current, target, gaps[], cycleDays, days[], practice, confirmedAt` | 轮模型计划 |

约定：能力 code 一律大写短码（仅数据/算法层用，**不呈现给用户**，界面展示 `zh/en` 全称）；运动/动作 id 为小写连字符 slug；主键幂等（引擎全量依赖主键查找）。

## 4.2 能力与三层（全量 18 条，轴序 = 数组序）

能力全表的轴序 / 雷达顺序 / 分组内顺序一律取 `abilities` 数组序；分层展示（能力树、SAQ/SPT 分层列表）= 按层过滤，组内保持数组序。下方各层表即按实际展示顺序排列（L1→L2→L3）。

**L1 体能基础 / Physical Capacity（9）**
| code | 中文 | English | 相斥（v2.2） | def |
|---|---|---|---|---|
| STR_MAX | 最大力量 | Maximal Strength | — | 单次或极低次数的高力输出能力。 |
| STR_REL | 相对力量 | Relative Strength | — | 单位体重的力量能力，自重运动与攀爬的基础。 |
| STR_END | 力量耐力 | Strength Endurance | — | 重复/持续输出力量的能力。 |
| GRIP_CORE | 握力与躯干传力 | Grip & Core | — | 抓握、悬挂以及下肢到上肢的力量传递。 |
| PWR | 爆发力 | Power | — | 短时间内产生较大机械功率/冲量的能力。 |
| AER_CAP | 有氧能力 | Aerobic Capacity | ANA_CAP · RHIA | 持续有氧能量供给能力。 |
| AER_END | 有氧耐力 | Aerobic Endurance | ANA_CAP · RHIA | 较长时间维持次最大输出的能力。 |
| ANA_CAP | 无氧能力 | Anaerobic Capacity | AER_CAP · AER_END | 短时间高强度能量输出能力。 |
| RHIA | 重复高强度能力 | Repeat High-Intensity Ability | AER_CAP · AER_END | 高强度输出与恢复并重复的能力。 |

**L2 动作能力 / Movement Capacity（7）**
| code | 中文 | English | 相斥（v2.2） | def |
|---|---|---|---|---|
| SPD | 速度 | Speed | — | 快速完成肢体或身体位移的能力。 |
| ACC | 加速 | Acceleration | — | 从低速快速建立速度的能力。 |
| DEC_COD | 减速与变向 | Deceleration & COD | — | 吸收动量、制动、改变方向并再加速。 |
| BAL | 平衡 | Balance | — | 维持和恢复身体重心控制的能力。 |
| COORD | 协调 | Coordination | — | 多身体部位在时间、空间、力量上的协同。 |
| MOB | 活动度 | Mobility | — | 可用且可主动控制的关节运动范围。 |
| STAB | 稳定性 | Stability | — | 动态任务中控制关节/躯干位置的能力。 |

**L3 感知与适应 / Perception & Adaptation（2）**
| code | 中文 | English | 相斥（v2.2） | def |
|---|---|---|---|---|
| REACT | 感知-反应 | Reaction | — | 对外部刺激快速选择并执行动作。 |
| AWARE | 身体空间觉 | Body Awareness | — | 本体感觉、身体位置和空间关系感知。 |

**相斥关系语义（v2.2）**：同列 `·` 分隔的 code 与该能力**互斥**（对称关系，如 AER_CAP ↔ ANA_CAP：有氧+无氧同日作主目标压力过大）。口径取**最小能量系统集**：`有氧系 {AER_CAP, AER_END} × 无氧系 {ANA_CAP, RHIA}` 两两互斥，共 4 对；MOB（活动度）/ AWARE（身体空间觉）/ BAL / COORD 等无相斥（`—`）。数据层 `Ability.conflicts` 存对方 code 列表，与上表双向一致。引擎排日用法见 §5.8。

**三层配色（token）**：L1 `var(--layer-l1)` `#FF3B30` · L2 `--layer-l2` `#34C759` · L3 `--layer-l3` `#0A84FF`；雷达轴标签、能力树/自测分组圆点、移动端能力条按层取色。

## 4.3 运动目录（36 条 = 35 真实运动 + 1「平均主义」伪运动）

字段：`id / zh / en / cat`；`demand` 由 12 种子扩维而来（4.3.1）。分类展示顺序（向导 `CAT_ORDER`，v2.1 起）= 平均主义 → 球类 → 水上 → 雪上 → 攀岩 → 体能 → 户外 → 对抗 → 技巧。下表列 35 条真实运动；平均主义见 4.3.2。

| id | 中文 | English | 类 | demand12 种子 `[STR,RSTR,END,PWR,SPDACC,DECCOD,AER,ANARHIA,BAL,COORD,MOB,GRIPCORE]` |
|---|---|---|---|---|
| basketball | 篮球 | Basketball | 球类 | [4,4,3,5,5,5,4,5,4,5,3,2] |
| soccer | 足球 | Soccer | 球类 | [4,4,4,4,5,5,5,5,4,5,3,1] |
| tennis | 网球 | Tennis | 球类 | [3,3,3,4,5,5,4,5,5,5,4,2] |
| badminton | 羽毛球 | Badminton | 球类 | [3,3,3,4,5,5,4,5,5,5,4,1] |
| volleyball | 排球 | Volleyball | 球类 | [4,4,2,5,4,4,3,4,4,5,3,1] |
| table-tennis | 乒乓球 | Table Tennis | 球类 | [2,2,2,2,5,4,3,4,4,5,3,1] |
| squash | 壁球 | Squash | 球类 | [3,3,4,4,5,5,5,5,5,5,3,1] |
| pickleball | 匹克球 | Pickleball | 球类 | [2,2,2,3,4,4,3,3,4,5,3,1] |
| frisbee | 飞盘 | Frisbee | 球类 | [3,3,3,4,4,4,4,4,4,5,3,2] |
| golf | 高尔夫 | Golf | 球类 | [3,3,2,3,2,1,2,1,3,5,5,3] |
| swimming | 游泳 | Swimming | 水上 | [3,3,4,3,4,1,5,4,4,5,5,3] |
| surfing | 冲浪 | Surfing | 水上 | [4,4,4,5,3,4,4,4,5,5,5,3] |
| kayaking | 皮划艇 | Kayaking | 水上 | [4,4,5,3,3,2,5,4,4,4,4,5] |
| sup | SUP 桨板 | Stand-up Paddle | 水上 | [3,3,4,2,2,2,4,2,5,5,4,3] |
| rowing | 划船 | Rowing | 水上 | [5,4,5,4,3,1,5,5,3,4,3,4] |
| skiing | 高山滑雪 | Alpine Skiing | 雪上 | [4,4,4,5,4,5,4,4,5,5,4,2] |
| snowboarding | 单板滑雪 | Snowboarding | 雪上 | [4,4,4,5,4,5,4,4,5,5,5,2] |
| xc-skiing | 越野滑雪 | Cross-country Skiing | 雪上 | [4,4,5,3,4,3,5,4,4,4,3,2] |
| skating | 滑冰 | Skating | 雪上 | [4,4,4,5,5,5,4,4,5,5,4,1] |
| bouldering | 抱石 | Bouldering | 攀岩 | [4,5,4,4,2,2,2,5,5,5,5,5] |
| sport-climbing | 运动攀岩 | Sport Climbing | 攀岩 | [4,5,5,3,2,2,3,5,5,5,5,5] |
| running | 跑步 | Running | 体能 | [3,4,5,3,5,2,5,3,4,4,3,1] |
| trail-running | 越野跑 | Trail Running | 体能 | [3,4,5,4,4,4,5,4,5,4,4,1] |
| cycling | 骑行 | Cycling | 体能 | [4,4,5,3,4,2,5,4,3,4,3,2] |
| jump-rope | 跳绳 | Jump Rope | 体能 | [2,3,4,4,4,4,4,4,5,5,3,1] |
| hiking | 徒步 | Hiking | 户外 | [3,3,5,2,1,2,5,2,4,3,3,2] |
| mountaineering | 登山 | Mountaineering | 户外 | [4,4,5,3,2,3,5,3,5,4,4,3] |
| mountain-bike | 山地车 | Mountain Biking | 户外 | [4,4,4,4,4,5,4,4,5,5,4,2] |
| boxing | 拳击 | Boxing | 对抗 | [4,4,4,5,5,5,4,5,4,5,4,3] |
| martial-arts | 武术 | Martial Arts | 对抗 | [4,4,4,5,5,5,4,5,5,5,5,3] |
| bjj | 巴西柔术 | Brazilian Jiu-Jitsu | 对抗 | [5,5,5,4,3,4,4,5,5,5,5,5] |
| dancing | 跳舞 | Dancing | 技巧 | [2,3,3,4,4,4,3,3,5,5,5,1] |
| roller-skating | 轮滑 | Roller Skating | 技巧 | [3,4,4,4,5,5,4,3,5,5,4,1] |
| skateboarding | 滑板 | Skateboarding | 技巧 | [3,4,3,4,4,5,3,3,5,5,4,1] |
| parkour | 跑酷 | Parkour | 技巧 | [4,5,4,5,5,5,3,4,5,5,5,2] |
| balanced | 平均主义 | Balanced | 平均主义 | 见 4.3.2（运行时全量均值，非固定种子） |

### 4.3.1 12 指标 → 18 能力扩维（`demand12`，引擎固定映射）

| 指标 | 映射到能力 | 指标 | 映射到能力 |
|---|---|---|---|
| STR | STR_MAX | ANARHIA | ANA_CAP、RHIA |
| RSTR | STR_REL | BAL | BAL |
| END | STR_END | COORD | COORD、REACT、AWARE |
| PWR | PWR | MOB | MOB、STAB |
| SPDACC | SPD、ACC | GRIPCORE | GRIP_CORE |
| DECCOD | DEC_COD | AER | AER_CAP、AER_END |

### 4.3.2 「平均主义」伪运动（v2.1 新增）

`id:"balanced"` · zh `平均主义` · en `Balanced` · cat `平均主义`。**demand12 种子 = 其余全部真实运动（35 条）各指标逐列算术平均、保留 1 位小数、不含自身**；随运动目录增删自动重算（运行期惰性求值，不落静态行）。当前值 ≈ `[3.5, 3.7, 3.9, 3.8, 3.9, 3.7, 4, 3.9, 4.5, 4.7, 3.9, 2.2]`（为 §4.8-2 整数种子规则的一位小数例外）。

**交互规则**：位于向导 `CAT_ORDER` 首位，可**单独选择**；选中即清空其余真实运动并使其实体段隐藏（提示可取消后手动挑选），不与任何真实运动混选。**不进入欢迎页 `#sports` 共享能力演示**（§6.1-⑤）；仅服务「不想仔细挑选运动」的用户。

## 4.4 自测量表（全量 18 项，`SPT_TESTS`）

每项覆盖一个能力，ranges 为升序 `[上限值, 对应分]`：输入 ≤ 上限即取该分，超最后上限取末档分；无输入留空 → 保留先验 2.5。saq 全流程另有 0–5 自评滑块题（锚点 a0/a5 见 data.ts，单一源）。

| key | code | zh / en | 单位 | ranges |
|---|---|---|---|---|
| squat | STR_MAX | 深蹲/硬拉 3–5RM / Squat/Deadlift 3–5RM | kg | ≤40→2 · ≤80→3 · ≤120→4 |
| pullup | STR_REL | 标准引体最大次数 / Max pull-ups | 次 | ≤3→2 · ≤8→3 · ≤15→4 |
| pushup | STR_END | 俯卧撑连续次数 / Push-ups in a row | 次 | ≤10→2 · ≤25→3 · ≤40→4 |
| grip | GRIP_CORE | 握力计 / Grip strength | kg | ≤30→2 · ≤45→3 · ≤60→4 |
| broadJump | PWR | 立定跳远 / Broad jump | cm | ≤180→2 · ≤220→3 · ≤260→4 |
| sprint30 | SPD | 30m 冲刺 / 30m sprint | 秒 | ≤5.2→2 · ≤4.8→3 · ≤4.4→4 |
| sprint10 | ACC | 10m 冲刺 / 10m sprint | 秒 | ≤2.2→2 · ≤2.0→3 · ≤1.8→4 |
| cod | DEC_COD | 5-10-5 变向 / 5-10-5 change of direction | 秒 | ≤6.0→2 · ≤5.4→3 · ≤4.8→4 |
| run12 | AER_CAP | 12 分钟跑 / 12-min run | m | ≤2200→2 · ≤2600→3 · ≤3000→4 |
| steady30 | AER_END | 30 分钟稳态（自评） / 30-min steady (self-rated) | 0–5 | ≤1→1 · ≤2→2 · ≤3→3 · ≤4→4 · ≤5→5 |
| ana | ANA_CAP | 短冲输出（自评） / Short sprint output | 0–5 | 同 1:1 |
| rhia | RHIA | 重复短冲完成次数 / Repeated sprints completed | 次 | ≤4→2 · ≤6→3 · ≤8→4 |
| balance | BAL | 单脚站立（闭眼） / Single-leg stand (eyes closed) | 秒 | ≤10→2 · ≤30→3 · ≤60→4 |
| rope | COORD | 跳绳（30 秒） / Jump rope (30s) | 次 | ≤20→2 · ≤40→3 · ≤60→4 |
| react | REACT | 反应时 / Reaction time | ms | ≤350→2 · ≤300→3 · ≤250→4 |
| aware | AWARE | 闭眼单脚/落点（自评） / Eyes-closed position | 0–5 | 1:1 |
| ankle | MOB | 踝活动度 knee-to-wall / Ankle dorsiflexion | cm | ≤5→2 · ≤10→3 · ≤15→4 |
| landing | STAB | 单腿落地稳定性（自评） / Single-leg landing | 0–5 | 1:1 |

## 4.5 动作库（64 条）

**字段**（类型见 4.1）：`id, zh, en, category, setsMin, setsMax, reps(次/秒/米文本), rpe(文本，`"低"`/`"中"`/`"高"` 或数值 RPE), minutes(默认剂量分钟), equipment[], cue(动作要点), regression(退阶), primary(主刺激能力 code), cover(协同刺激能力 → 0–5 当量)`。

**剂量口径**：展示默认 = `setsMin–setsMax 组 × reps（RPE 非“低”时标注 RPE）≈ minutes min`；强度倍率 `f` 只等比缩放组数（`round(sets*f)`，下限 1）与分钟（`≈round(minutes*f)min`），reps 与 RPE 不变（见 §7 组件）。
**动作行构造**：库内每行由一个 `E(id, zh, en, category, setsMin, setsMax, reps, rpe, minutes, equipment, cue, regression, primary, [[code,v],…])` 辅助函数产出，其中最后一个参数仅声明**协同刺激**项；`primary` 为独立标签（用于方法带/排序/单归属判定的主刺激能力），**不自动写入 cover**。
**相关判定口径（重要）**：某动作要能进入能力 A 的候选/被引擎覆盖，需 `cover[A] > 0`。当前 64 行中每行 cover 列出 1–4 个协同能力（取值 0.1–0.35 档）。**新增动作时若目标是以某能力为主刺激的可选动作，须同时在 cover 参数中列出该能力（建议主档 0.5 量级），否则它不会出现在该能力的动作库与推荐组合中。**（附录 C.3 给出范例。）

**分类目录（18，`categoryLabel`）**：squat 下肢蹲 · hinge 髋铰链 · push 上肢推 · pull 上肢拉 · carry 负重行走 · core 躯干核心 · jump 跳跃 · throw 投掷 · sprint 冲刺 · decel 减速 · cod 变向 · landing 落地 · balance 平衡 · coord 协调 · reaction 反应 · aerobic 有氧 · interval 间歇 · mobility 活动度。

**器械选项（稳定顺序，12，`EQUIPMENT`）**：无器械 · 哑铃 · 杠铃 · 壶铃 · 弹力带 · 单杠 · 双杠 · 跳箱 · 药球 · 跳绳 · 场地 · 固定器械。（当前界面无器械筛选 UI，顺序为未来筛选稳定性保留。）

**行内容**（cue/regression/cover 等完整字段）以 `data.ts` 为准（单一源），本文件不重复转写；页面渲染与引擎读取一律按本节的字段口径。

## 4.6 跨层聚合与辅助查询

`ability(code)` / `layer(key)` / `sport(id)` / `exercise(id)` 主键查找；`exercisesOf(code)` = `cover[code] > 0` 的动作（与候选口径一致）。三层可用 `abilities.filter(a => a.layer === l.key)`（保持数组序）获得组内列表；能力数量 `abilities.length`（18）被统计卡片用作分母。

## 4.7 规划产物内嵌数据

§5 引擎在生成 Plan 时把 `sports`（所选目标运动）、`current/target/gaps`、`cycleDays`、`days`、`practice`、`confirmedAt(null)` 一并写入 `gap.plan`；动作库明细不写回 engine，`recommended[]` 仅存 id。编排态 Plan 每次变更整体写回（§6.5）。

## 4.8 扩展不变式（数据类）

1. **能力集合 = 各层 `Layer.abilities` 的并集（code 唯一、无遗漏），总数为 18**；新增能力需同步：abilities 全表、所属 Layer.abilities（自动入雷达/树/统计）、SAQ 与 SPT 各补一题、为其提供 ≥3 个可选动作（`cover` 含该能力）。新增能力默认 `conflicts:[]`；确需相斥时按 §4.2 口径**成对**维护、双向一致。
2. **运动**：id 唯一 slug、cat 属于 CAT_ORDER（新增类别需同步列表；`balanced` 平均主义为伪运动，见 4.3.2，不入此规则）、demand 12 种子每值 1–5（平均主义例外：1 位小数的全量均值）；v2.1 起**无 icon 字段与图标资源**；每能力可无 demand 项（未选相关运动能力缺省目标 2.0）。
3. **动作**：id 唯一、cover 值域 0–5 且主刺激能力显式入 cover、category ∈ 18 类（新增类别需同步 `categoryLabel`）、equipment ∈ EQUIPMENT、剂量字段齐全。
4. **方法块**：能力 code 全覆盖 18 项，band 冲突（AER/ANA 同为 6）允许并列同带。
5. 双语字段必须成对（`{zh,en}`）；`Localized` 类文案成对且 en 可缺省回落。
6. 添加全部走 `data.ts` + `i18n.tsx`，页面/引擎零改动即可渲染新数据（引擎遍历 abilities 与 sports 完成；向导运动卡自动含新行；欢迎页 `#sports` chip 固定为 35 条真实运动文本列表，不含平均主义）。

---

# 5. 计划引擎与共享规则（`lib/engine.ts` · `components/plan/shared.ts`）

> 现为**确定性 mock 引擎**（现行 `algorithm_version:"0.2.1-mock"`；v2.2 排日算法落地后启用 `"0.3.0-mock"`），未来由后端版本化算法替换（接口以 generatePlan(UserData)→Plan 为界，见 附录 C.5 / §9）。全部数值保留 1 位小数 `round1`。

## 5.1 重视度权值 `weightOf`

`high→1.3` · `medium→1.0` · `low→0.7`。

## 5.2 目标能力 `buildTarget(sports)`

逐能力聚合所选运动：只统计**存在该能力 demand** 的运动（无 → 目标 2.0）。`mean`=按重视度加权的需求均值，`peak`=权后最大值。混合需求 `demand = 0.7·mean + 0.3·peak`；目标分 `target = round1(clamp(1.2 + 0.62·demand, 1, 5))`。

## 5.3 当前能力 `buildCurrent(assessment)` 与缺口 `computeGaps`

`current`：自测/自评映射后值，未测能力取**先验 2.5**。`deficit = round1(max(0, target − current))`，`deficit < 0.1` 视为无缺口不入表。`demandOf`=所选运动对该能力的需求最大值（≥1）；`transferOf`=需求 ≥4 的运动数。**`priority = min(100, round(deficit · demandOf · (0.5 + transferOf) · 8))`**。`gaps` 按 priority 降序。每项附三条理由文案与建议频次文案（`deficit ≥ 1.5 → 每轮 2 次暴露`，否则 `1–2 次`；从退阶动作开始逐步进阶）。

## 5.4 训练方法块与方法带（G.3 排序依据，7 块）

| zh | en | band | codes |
|---|---|---|---|
| 速度/反应/爆发 | Speed/Reaction/Power | 2 | SPD, ACC, PWR, REACT |
| 力量 | Strength | 3 | STR_MAX, STR_REL, STR_END |
| 握力/核心/单侧 | Grip/Core/Unilateral | 4 | GRIP_CORE, STAB, BAL, COORD, AWARE |
| 移动/变向 | Movement/Agility | 5 | DEC_COD |
| 体能/间歇 | Conditioning | 6 | ANA_CAP, RHIA |
| 有氧 | Aerobic | 6 | AER_CAP, AER_END |
| 活动度 | Mobility | 7 | MOB |

能力 → 块 = 表中首个包含它的块，否则 `{综合 General, band 3}`。**主题合成 themeOf(codes)**：按上表数组序收集命中的块名，`" + "` 连接；无命中空集 → `恢复与机动 Recovery & Flex`。

## 5.5 时长估算 `durationOf(ids)`

`sum = Σ minutes`；`total = round(sum·1.6 / 5)·5`（组间休息 ×1.6，取整到 5 的倍数）；文本 `max(10, total−10) – (total+10)`；空集 → `"0"`。

## 5.6 覆盖与参考推荐（确定性）

- **覆盖 `coveredBy(list, code) = round1(Σ cover[code]·factor)`**（仅 cover>0 项计）。
- **参考组合 `buildRecommended(targets)`**（两轮贪心，上限 8 项）：
  1. 逐目标能力求「需补量」`need = round(max(0.1, target − baseline))`；
  2. 先给每个目标能力各配一个候选（第一候选排序：未用类别优先 → 主能力是它优先 → cover 降序）；类别去重仅为排序偏好非硬约束；
  3. 再反复给「剩余需补量最大且仍有候选」的能力补动作，至全达标或满 8 项（guard ≤ 24）；
  4. 兜底：不足 5 项且未满 8 时补一条 `primary==="MOB"` 的活动度动作；
  5. 最终按所属方法块 band 升序排序输出 id 数组（准备/热身块不参与挑选）。
- **单日能力目标**：能力以本轮**实际出现次数** `k`（≥1，含必要重复，见 §5.8）均摊缺口，`δday = deficit/k`，`target_day = round1(min(5, current + δday))`，`baseline=current`。**对外三档优先级**（`shared.ts`，仪表盘/编排/总表统一口径，依据整体 `deficit`）：`high ≥1.0`（danger 红）· `mid ≥0.5`（warning 琥珀）· `low <0.5`（success 绿）；文本 高/中/低 · High/Mid/Low；chip 文案 `优先级 · 高` 等。

## 5.7 编排共享（`shared.ts`）

- `FACTORS = [0.5, 1, 1.5, 2]`；倍率步进按此循环。
- `setsRange(ex, f)`：`lo=max(1,round(setsMin·f))`，`hi=max(lo,round(setsMax·f))`，文本 `lo–hi`；组数/分钟随 f，reps、RPE 不变。
- **单归属 `ownerOf(ex, targetCodes)`**：主能力恰为当日目标 → 归它；否则取该动作 cover 最高的当日目标能力；对该日所有目标 cover 均 0 → `null` → 归「通用动作（准备 / 收尾）」弱化组。
- `estimatedMinutes(day) = Σ minutes·factor`（编排实际用，区别于建议 duration）。

## 5.8 生成编排 `generatePlan(user)` → `Plan`

1. 计算 target / current / gaps（§5.2–5.3）。
2. `N = clamp(daysPerWeek, 1, 7)`；基准频次 `freqOf(deficit)`：`N===1 → 1`；否则 `deficit ≥ 1.2 → min(2, N)`，`其余 → 1`（大缺口强度双频保留，见步骤 4）。
3. 单日容量上限 `C = clamp(ceil(S/N)+1, 3, 6)`，`S = Σ freqOf`；上限不强制填满。
4. **排日（v2.2 两阶段）**。全阶段硬性可用条件 = 天未含该能力本身、未含与其**相斥**的能力（§4.2 相斥列）、未满容量 C。
   - **阶段一 · 铺开**：按缺口能力 `priority` 降序，各放**第 1 次暴露**——在可用天中选「当前项数最少」者（并列取序号小）。使不同能力尽量各占一天、**跨日不重复**。
   - **阶段二 · 必要重复**（跨日重复仅允许以下两类来源）：
     a) **强度双频**：`deficit ≥ 1.2` 且 `N ≥ 2` 的能力补第 2 次（放入可用天中当前最少者；必要时与其他能力共日，仍受相斥/容量约束）。
     b) **富余填空**：上述排完后仍存在空白训练日（占用天数 < N）时，按 `deficit` 降序（并列按 `priority` 降序）为能力追加暴露，**只放空白日**，直至 N 天均有 ≥1 目标能力，或候选能力达到上限 `ceil(N/A)`（A = 缺口能力数，天然 ≤3）。即「训练日太多、能力太少」时才扩散重复，且按均摊扩散、不使单项能力霸周。
   - **不变量**：同一天同一能力 ≤1；无上述来源不重复（阶段一天与天之间自然互不重复）；任一能力一轮出现次数 ∈ 1…上限。
   - **兜底降级**（极端情形，按确定性次序）：任何排位先满足「无相斥 + 未满 C」；可用天不足时放宽「相斥」→ 选「冲突数最少且项数最少」的天（仍守容量 C）；`N>1` 时若仍无可用位则该次暴露顺延（留作恢复与机动，**容量不再放宽、不超载堆叠**）；`N=1` 时一周仅一日须容纳全部能力，容量与相斥均无法回避，整体超载同日即走此兜底。
5. 每日目标能力按该能力 priority 降序呈现；单日目标增量按该能力本轮实际出现次数均摊（§5.6）；计算主题（5.4）、时长（5.5）、推荐组合（5.6）、标签 `第 d+1 天 / Day d+1`。
6. 生成专项提醒 `practice` 文案（含所选运动中文名顿号连接 / 英文逗号连接，无则回落「所选运动」）。
7. 返回 Plan（`confirmedAt=null`；写库见 §3.1）。

---
# 6. 页面规格（按路由）

> 通用壳（根布局）见 §1.3–1.5：每页统一 `Nav + <main>{…}</main> + Footer`；正文区块用 `.container`、标题用 `.eyebrow/.display-title/.h2`，间距工具 `.mt-*/mb-*`。App 区页面（/app/*）头部常为 `eyebrow("GAP") + display-title` + 右侧操作组。全部渲染为客户端组件（`"use client"`），从 `store` 读数据。

## 6.1 欢迎页 `/`（`app/page.tsx`）

**① Hero**（整屏，恒定照片底 + 暗蒙层 + 白字，不随明暗主题）：`background-image: url(/hero-bg.webp)` + `::before` scrim（`rgba(0,0,0,.5)→.22` 渐变）。内容：眉题 `General Athletic Preparation`（三个首字母用 `.gap-accent` 高亮）+ `h1.hero-title`（`hero.title`）+ `p.hero-sub`（副标题）+ CTA 双按钮：**左次按钮 `了解 GAP`（hero.cta2，btn-secondary）→ 锚点 `#what`；右主按钮 `定制计划`（hero.cta，btn-primary）→ `/app/onboarding`（v2.1 由主前副后对调为左副右主）**+ 底部滚动提示（`hero.scrollHint`）。**不含雷达图/半圆，不含剪影/粒子层**。
**② 是什么 / 不是什么**（`#what`）：眉题 + 标题 + hook + 副文，居中 measure；两张对列卡片（Reveal 100ms 错峰）：`✓ yes1-3` / `✕ no1-3` 列表，左右圆点 `.mark yes/no`。
**③ 18 能力 3 层树状图**（`#map`）：标题区后按 `layers` 渲染三张卡片（每层卡片：层色 `.category-dot` + `L(层名)` + `.ability-grid` 内该层全部能力格 `.ability-cell`：能力全称 + 一句 def），Reveal 逐层显现。**无点击展开/收起**。
**④ 如何运作**（`#steps`）：6 步 `STEPS`（key `step.1..6`），Reveal 每步 `delay=i*60`；每步仅图标（数字 1–6）+ 标题。**不再渲染步骤描述**。
**⑤ 共享能力**（`#sports`）：35 条真实运动**纯文字 chip**（`L(zh,en)`，无图标，`selectedSports` 内 is-active），默认选中 `[bouldering, skiing, badminton]`；点击 toggle，**上限 5**、可减到 0（不含「平均主义」伪运动，见 4.3.2）。下方 `RadarChart current={demandProfile} showLegend={false}`（只呈现当前多边形，无图例）；`demandProfile[能力]` = 已选运动该项需求均值（未选 0）。图形下方一行：已选 ≥1 → 名字 `" + "` 连接；0 → 文案 `至少选择 1 项运动`。
**⑥ 底部 CTA**（`section--tight`）：标题 + 主按钮（→/app/onboarding）+ 页脚免责一行。落地页所有 CTA 文案走 `hero.*/what.*/map.*/steps.*/sports.*/cta.*`。

## 6.2 应用入口 `/app`（`app/app/page.tsx`）

客户端跳转壳：挂载后读 `gap.plan`，有 → `router.replace("/app/dashboard")`，无 → `/app/onboarding`；过渡期间居中显示 `GAP` + `ob.step6.sub` 加载文案。**不出现在导航**（导航项直达 onboarding/dashboard/plan 的具体页）。

## 6.3 引导向导 `/app/onboarding`（`app/app/onboarding/page.tsx`）

**壳**：顶部 5 段进度条（`.seg`，is-done/is-active）；页头 `Step n / 5` + 标题（`TITLES`=ob.step2..step6）+ 副文（`SUBS`）；内容 `.wizard-card`；底部按钮对（左 `.back` 步骤 1 隐藏占位，右主按钮 `.next/.generate`，generating 时禁用）。
**状态机** `WizardState{step,sports,constraints{daysPerWeek:3},mode:"saq",saq:{},spt:{}}`；`patch/patchConstraints` 增量更新。
- **Step 1 目标运动**（ob.step2，v2.1 起卡片网格）：副文 `ob.step2.sub` = 「选择 1–6 项…/ Choose 1–6 sports…」；计数 `已选 n 项`。按 `CAT_ORDER`（平均主义 → 球类 → … → 技巧）分段渲染；每类段 = 标题 + `.sport-grid`（`grid-template-columns: repeat(auto-fill, minmax(≈148px,1fr))`，**致密卡片**，同类并排多张而非单列纵向）：
  - `.sport-card`：整面可点；主行中文名 + 小字 English；选中加 `.is-active` 描边与对勾，卡内底部露出 Segmented `低/中/高`（重视度，默认 medium）；再次点击取消该运动。
  - 真实运动**上限 6**：选满后其余卡禁用（提示先取消再换）；`next` 校验 **≥1**，不足 alert「请至少选择 1 项目标运动。」。
  - 「平均主义」段仅一张特殊卡 `.sport-card--balanced`（副行「按全部运动平均水平定制」）：选中即清空全部真实运动并隐藏其实体段（显示「已选平均主义，取消后可手动挑选」提示）；与真实运动**互斥、只可单独选**。
- **Step 2 每轮训练天数**（ob.step3）：Field + `− 数字 ＋` 步进（1–7，icon-btn），初始 3。
- **Step 3 评估方式**（ob.step4）：两卡片（saq / spt）`card--interactive is-selected`，含标题与描述；键盘可操作。
- **Step 4 评估**（ob.step5）：`mode==="saq"` → **SAQ 自评**：按 `layers` 分组（组头 = 层色圆点 + 层名），每层内按数组序渲染全部该层能力，每条 = 题干（saq 题）+ range 滑块 0–5 + 当前值 + 两端锚点 a0/a5；缺省值 3。`mode==="spt"` → **SPT 专业自测**：提示「覆盖全部 18 项能力…留空用默认先验」；两列 grid，每项 = 字段（SPT_TESTS 表）+ number 输入（placeholder 单位，可留空）。底部提示「自评用于生成第一版计划，可随时用专业自测校准」。
- **Step 5 确认**（ob.step6）：文案 + 摘要卡（目标运动名“ · ”连接 / 每轮 n 天 / 评估方式）+ 生成按钮。
**生成动画**：点击生成 → `generating`，进度文案依次「正在评估能力缺口… / 匹配训练方法… / 编排每日目标…」（每 550ms 一档，3 档后完成）；完成后合并能力分（spt 折算见 §4.4，saq 未答取 3）、构造 `UserData`、`generatePlan`，写 `gap.user`、`gap.plan`，`router.push("/app/dashboard")`。

## 6.4 仪表盘 `/app/dashboard`（`app/app/dashboard/page.tsx`）

入口：读 `gap.plan`；无或 `days` 非数组 → `router.replace("/app/onboarding")`。`matchMedia("(max-width:768px)")` 决定雷达区渲染方式，监听变化切换。`isMobile` 时雷达区改渲染 18 行 `AbilityBar`（桌面 `RadarChart`）。
**头部**：eyebrow + `dash.title`；右侧两链接：`调整计划`（btn-secondary）、`复测`（btn-ghost），均去 /app/onboarding。
**统计磁贴**（.stat-tile×4）：`需提升能力 g.gaps.length/18` · `高优先级 highCount`（整体 deficit 三档 high 计数，§5.6）· `每轮训练 cycleDays 次` · `目标运动 sports.length`。
**区块 ① 能力雷达**（`dash.radar`）：卡片内 `.dash-radar-wrap`；桌面 = RadarChart（current/target 双多边形）；移动 = AbilityBar 每能力（现状条 + 目标刻度）。
**区块 ② 能力缺口**（`dash.gaps`）：顶部三档图例（`.legend-dot is-high/mid/low` + `高 ≥1.0 / 中 0.5–1.0 / 低 <0.5`）；卡片内 `GapBarChart gaps`；无缺口 → 维持文案。
**区块 ③ 每日概览**（`dash.week`）：卡片内 `.day-tiles` 每训练日 tile：`label` + 编排计数（choices 数 → `n 项` 否则 `待编排`）、主题行、`duration 分钟`；tile 不可点击。卡底按钮 `定制完整计划`（dash.viewPlan；v2.1 由「查看完整计划」改名）→/app/plan。
数据均来自 plan（编排中写回实时反映）。

## 6.5 训练计划 `/app/plan`（`app/app/plan/page.tsx`）

入口同 §6.4（无计划回炉）。本地态 `active(天索引)`、`sel(选中能力)`；头部 + `返回仪表盘`。**编排态（`confirmedAt` 为空）** 与**确认态（非空）**二态：
- **确认态**：渲染 `PlanTable`（只读总表，§7），工具条含「重新编排」→ 清 `confirmedAt` 回编排态。
- **编排态**（板块结构）：
  1. 工具条：`本轮共 N 个训练日` + 主按钮 `确认计划`（确认即写 `confirmedAt=now`，无弹层无校验）。
  2. **板块① 选择训练日**：`DayTabs`（第 k 天 tab，切日重置 sel）。
  3. **板块② 当日按能力分组**：标题 = 当日 label；meta 行 =（`建议 duration 分钟` 或 `本日自由安排`）+（已编排 `当前约 estimatedMinutes min`）。卡片内说明小字 + `AbilityGroup`（目标能力组按 targets 顺序；组头=能力全称+优先级档 chip，整行点击 → 选中联动板块③；组内直接列出已加入动作行：名称 + 类别徽标 + `组数区间×reps RPE≈分钟` + `− f× ＋` 倍率步进（f≠1 高亮）+ ✕ 移除；空组提示「尚未添加…」）。尾部按钮：`套用参考推荐组合 (n)`（用 recommended 整日替换，factor=1，归属按 ownerOf 推导；无归属归通用组）与 `清空本日`（有已选才可点）。无目标能力的自由日：仅通用组或无动作空态文案。
  4. **板块③ 动作选择矩阵**：标题 `为「能力名」选动作`；`ExercisePicker code=selCode`：只列 `cover[能力]>0` 动作，主能力优先 + cover 降序，`.eq-grid` 卡片（名称+类别徽标、剂量行、器械 tag、`要点/退阶` details、`加入`按钮，已加入禁用置 `已加入`）。加入的新动作立即以 `ability=当前选中能力` 落位该组下方。
  5. 页脚单行 `.practice-note`：专项实践提醒弱化文案。
- **写回（persist）**：每次操作归一化 `ability` 归属后整体 `store.set("gap.plan", …)`（§4.7）；读旧数据时显示层同样 tagOwner 归一。
- **编排合法性**：同天重复动作禁止加入；倍率在 FACTORS 内循环。

## 6.6 占位页（v2.1 起仅 `/docs` 一处）

**`/docs` 了解 GAP**：居中卡片区——标题 + 副文「知识库正在建设中——…18 能力地图、计划如何生成、安全须知…」（`.section.center`，`minHeight:55vh` 垂直居中）；导航可见（nav.docs）。
**v2.1 移除 `/app/training`「我的能力」占位页**（`app/app/training/page.tsx` 整体删除；不做用户注册与复测留存）；现阶段无更多功能，后续承接项见 §9。

---

# 7. 组件规格

## 7.1 骨架与通用组件

| 组件 | 文件 | 规格（结构级） |
|---|---|---|
| `Nav` | components/Nav.tsx | §1.4 完整规格；滚动 >4px 加 `.is-scrolled`（磨砂）；active 判定 `/` 精确、其余前缀 |
| `Footer` | components/Footer.tsx | §1.5 完整规格（4 列 + 免责条） |
| `Providers` | components/Providers.tsx | 包一层 `I18nProvider` |
| `Reveal` | components/Reveal.tsx | 视口显现；无 IO 兼容直接 visible；`.data-reveal→.is-visible`；delay→transitionDelay |

## 7.2 数据可视化组件

**`RadarChart`（components/RadarChart.tsx）**
- 正方形 `viewBox 0 0 640 640`（CX=CY=320）；轴心最大值半径 `MAXR=232`（略收窄以留轴标签空间）。
- 轴 = 数组序的 18 能力，角度 `(i/n)·2π − π/2`（自顶部顺时针）。5 层同心多边形环（5/4/3/2/1 刻度）`stroke: var(--separator)`；从圆心到 MAXR 的轴线同色。
- 轴标签置于 `MAXR+26` 半径处，字号 12，按 `cos` 定 text-anchor（>0.35 start / <−0.35 end / 其余 middle），`dominant-baseline:middle`，颜色 = 所属层 `var(--layer-l1/l2/l3)`。
- 数值钳制 0–5：`current` 多边形 `fill:var(--accent-faint); stroke:var(--accent); stroke-width:2; join:round`；可选 `target` 多边形 `stroke:var(--text-secondary); width:1.5; dasharray 5 5`。
- `showLegend` 时底部 `.radar-legend` 两色线图例（现状/目标）。`aria-label="capacity radar chart"`。

**`AbilityBar`（components/AbilityBar.tsx）** 移动端逐能力条：label（micro）+ track（`.bar-fill` 宽 `current/5·100%`，色=层 cssVar；`.bar-target` 刻度线 `left:target/5·100%`）+ `.bar-val`（current 保留 1 位小数）。`showLabel=false` 时省 label 列（grid 1fr 56px）。

**`GapBarChart`（components/GapBarChart.tsx）** 缺口横条：行排序 = 档位 high→mid→low（`ORDER` 映射），同档缺口大者在前；条长 = `deficit/maxDefect·100%`，填充色 `tierColor(档)`；行尾 tier-chip（`is-high/mid/low`）。去精度：不显示缺口数值。

## 7.3 计划组件（components/plan/）

| 组件 | 规格 |
|---|---|
| `DayTabs` | 日切换按钮组（role tablist/tab + aria-selected）；is-active；去达标无小标/点 |
| `AbilityGroup` | 见 §6.5 板块②。分组：目标组按 `targets` 顺序 + 尾部弱化 `通用动作（准备 / 收尾）`（cover 对全部目标 0 的动作集中）。组头含能力全称 + `tier-chip`（优先级 高/中/低）；整行 button 点击 onSelect 联动；aria-pressed |
| `ExercisePicker` | 见 §6.5 板块③；候选 & 排序口径见 §4.5；`eq-grid` 卡片默认 3 列（断点 2/1）；加入去重 |
| `PlanTable` | 只读总表（确认态）：thead `天/主题/能力（优先级）/动作明细/预估`；能力列 = 每目标能力行 + tier-chip（无目标 `—`）；动作列 = 名称+类别徽标+`lo–hi组×reps RPE（×f 加量 / 减量轻）`；预估列 `≈Σminutes·factor`；tfoot = practice 单行 + `算法版本 · 生成于时间`；空天数行不受 `.table-scroll` 横向溢出 |
| `shared.ts` | 无 UI 逻辑：FACTORS / tierOf / tierLabel / tierColor / ownerOf / setsRange / estimatedMinutes（§5.6–5.7） |

## 7.4 已停用组件（代码内未引用，可清理）

`SilhouetteLayer.tsx`、`ParticleLayer.tsx`（及 landing.css 中 `.hero-silhouettes/.particles` 规则）：此前 Hero 装饰，现 Hero 用照片背景，**不 import、不渲染**。附录 B 组件清单标记为「未引用 · 建议删除」。

---

# 8. 工程与体验约定

## 8.1 无障碍与表单语义
- 图标化按钮含 `aria-label`（语言切换、倍率 ±、移除、icon 步进）；Segmented/计划 tab/能力组头使用语义按钮与 `aria-pressed/aria-selected`。
- `Reveal` 仅做视觉显现（不动结构），尊重 `prefers-reduced-motion` 关闭位移动画。
- 可交互卡片（评估方式卡片）支持 Enter/空格触发。
- 说明性优先：能力/动作/图表主文本不经由图标传达；图表设 `role="img"` + aria-label。

## 8.2 响应式断点
- 计划/向导两列 grid 与 `eq-grid` 默认 3 列：按宽度回退 2/1。
- 仪表盘雷达区在 `max-width:768px` 切换为 `AbilityBar` 列表。
- 容器 1200px、卡片区块自适应；工具条 `flex-wrap` 回行。
- 落地页能力树卡片在大屏一排三层、窄屏纵向堆叠（`.ability-grid` 栅格自适应）。

## 8.3 性能与静态渲染
- Next.js App Router **全站静态预渲染**（客户端渲染页初始壳含 loading 态）；`output` 未启用服务端渲染依赖，数据全部 localStorage。
- CSS 单一令牌层（tokens.css）+ 原子层 base + 组件层 + 页面层，import 顺序固定（§1.3）；避免内联新色，一律走 token。
- Hero 背景 `webp` 一次性压缩资产（窄 ≤1920、质 ~70、≤300KB 目标，叠轻模糊），运行时 background + scrim 无额外解码成本。
- 动效仅 transform/opacity。

## 8.4 工程约定
- 每页/组件 `"use client"`；数据 import 只走 `@/lib/data`、`@/lib/store`、`@/lib/i18n`，算法走 `@/lib/engine`，计划逻辑 `@/components/plan/shared`。
- **提交前验证**：`web/` 下 `npm run build` 必须通过（类型 + 静态导出），未通过不交付。
- 文案、数据、能力代码的三条「单一事实源」纪律见 版本原则 5 & §3.2/§4；任何页面改字 ≠ 改 i18n.tsx 与 data.ts 皆为文档失准。
- 版本号纪律：每次页面/数据/算法交付后升本 LLD 版本与变更记录（附录 E）。

## 8.5 错误与空态
- 缺计划访问 /app/*：读存储失败 → replace 到 /app/onboarding；壳期显示加载文案。
- 自由日 / 空动作库 / 无缺口：均有指定空态文案（§6.4/§6.5）。
- i18n 缺 key：en 回落 zh、再回落 key 本身，绝不崩溃。

---

# 9. 范围外 · 路线图（单行）

后续候选（未立项规格，按需单独立版展开）：① 完整文档站：GAP 方法论/18 能力地图/计划原理/安全须知（/docs 落地）；② 计划复测与新轮次生成、计划到期提醒与自由日建议；③ mock → 真实后端：版本化能力/动作知识库与计划算法服务（替换 engine generatePlan 接口，`algorithm_version` 随之升级）；④ SPT 完整流程协议化、动作视频与演示动图、计划导出/打印；⑤ 用户账户、设备间同步（localStorage → 云端，gap.* 键位保留）——v2.1 注：用户已明确**不做注册/留存**，「我的能力」复测页与账户类短期均不立项。功能对齐原则：以上任一立项均须回到本 LLD 版本化新增章节，而非就地堆砌。

---

# 附录 A 路由与文件映射

| 路由 | 页面文件 | 事实 |
|---|---|---|
| `/` | `app/page.tsx` | 静态欢迎页 |
| `/app` | `app/app/page.tsx` | 跳转壳 |
| `/app/onboarding` | `app/app/onboarding/page.tsx` | 5 步向导 |
| `/app/dashboard` | `app/app/dashboard/page.tsx` | 仪表盘 |
| `/app/plan` | `app/app/plan/page.tsx` | 计划编排/总表 |
| `/docs` | `app/docs/page.tsx` | 知识库（占位） |
| 404 | Next 默认 not-found | |
| 全局壳 | `app/layout.tsx` | CSS 顺序 + 主题内联脚本 + Providers>Nav>main>Footer |

样式文件：`tokens.css`（令牌）· `base.css`（原子类）· `components.css`（组件）· `landing.css`（欢迎页）· `app.css`（app 区）。

# 附录 B 组件清单（文件 → 职责/状态）

| 文件 | 职责 | 状态 |
|---|---|---|
| Nav / Footer / Providers / Reveal | 骨架与通用 | 在用 |
| RadarChart / AbilityBar / GapBarChart | 可视化 | 在用 |
| DayTabs / AbilityGroup / ExercisePicker / PlanTable / shared.ts | 计划 | 在用 |
| SilhouetteLayer / ParticleLayer | Hero 旧装饰 | **未引用 · 建议删除** |
| SportIcon / Sport.icon SVG | 运动图标资源 | **v2.1 已删除**（运动一律纯文字，无图标） |

# 附录 C 数据扩展手册

**C.1 新增运动**：在 `data.ts` `sports[]` 内补行（id/zh/en/cat/demand12(12 种子)；v2.1 起**无 icon 字段**），cat 若为新类别同步 `CAT_ORDER`（向导顺序；首位为「平均主义」伪运动段）。规则见 §4.8-2。向导运动卡自动出现；欢迎页 `#sports` chip 固定渲染 35 条真实运动（不含平均主义）；引擎聚合自动纳入；新增真实运动会令 `balanced` 均值自动重算（4.3.2）。**C.2 新增能力**：按 4.2 补全三层表（含新增「相斥」列）→ 数据文件同步（abilities 补 `conflicts`（默认 `[]`，需相斥则与对方成对、双向一致）、所属 Layer.abilities、demand12 若改映射、SAQ 1 题、SPT_TESTS 1 条、覆盖该能力的动作 ≥3）。雷达/树/统计卡片分母自动更新。**C.3 新增动作**：示例——加入以 STR_MAX 为主刺激的 `E("...", "…", "…", "squat", 3, 4, "6-8", "7-8", 6, ["杠铃"], "要点…", "退阶…", "STR_MAX", [["STR_MAX", 0.5], ["STAB", 0.25]])`：**主刺激能力必须同时出现在 cover 元组**（否则不进入 STR_MAX 候选/推荐），category 须 ∈18 类（或同步 categoryLabel），equipment ∈ EQUIPMENT。**C.4 新增量表档位/锚点**：SPT ranges 升序二元组、SAQ a0/a5 文案改 data.ts 即生效；单位与 placeholder 同步。**C.5 接真实后端**：保持 `generatePlan(UserData): Plan` 契约与 `Plan` 结构（gap.plan 键位、`algorithm_version` 字段标识），后端实现后仅换 import 源，前端无改动。

# 附录 D 术语对照（能力 code ↔ 全称 ↔ English）

| code | 中文全称 | English | code | 中文全称 | English |
|---|---|---|---|---|---|
| STR_MAX | 最大力量 | Maximal Strength | ANA_CAP | 无氧能力 | Anaerobic Capacity |
| STR_REL | 相对力量 | Relative Strength | RHIA | 重复高强度能力 | Repeat High-Intensity Ability |
| STR_END | 力量耐力 | Strength Endurance | BAL | 平衡 | Balance |
| GRIP_CORE | 握力与躯干传力 | Grip & Core | COORD | 协调 | Coordination |
| PWR | 爆发力 | Power | REACT | 感知-反应 | Reaction |
| SPD | 速度 | Speed | AWARE | 身体空间觉 | Body Awareness |
| ACC | 加速 | Acceleration | MOB | 活动度 | Mobility |
| DEC_COD | 减速与变向 | Deceleration & COD | STAB | 稳定性 | Stability |
| AER_CAP | 有氧能力 | Aerobic Capacity | | | |
| AER_END | 有氧耐力 | Aerobic Endurance | | | |

规则：code 只存在于数据/算法与引用层，任何面向用户的界面一律展示上述全称（随语言切换）。

# 附录 E 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0–v1.19 | — | 历史迭代（落地页多次改版、动作库扩编 64、轮模型、去达成/达标、去精度、动态容量、动作单归属等）；阶段细节已并入本文各章节 |
| **v2.0** | 2026-09-02 | **以当前网页为标准的整理版（As-Built）**：重建同文件；文档原则「代码/数据文件为唯一事实源」；正文重排为「页面规格 + 集中数据层」；删除全部未上线章节（评估成绩/日志/为什么/进步、完整文档站、后端 API 合同等）→ §9 单行路线图；数据层表全量入 §4 并附扩展不变式与附录 C；仓库外内容（剪影/粒子/旧 5 类分组）从规格中移除并标记死代码 |
| **v2.1** | 2026-09-04 | **6 项变更（需求已确认 → 已按文落地，commit `3e20ea1`，2026-09-04 部署）**：① 移除「我的能力」界面 `/app/training`（删页面及导航/页脚入口，不做注册与复测留存；占位页仅余 /docs）；② 欢迎页 Hero CTA 左右对调——左次按钮 `了解 GAP`（hero.cta2 →`#what`）、右主按钮 `定制计划`（hero.cta →`/app/onboarding`）；③ 运动去图标——欢迎页共享能力 chips 纯文字，删 `SportIcon` 组件、`Sport.icon` 字段与全部 SVG 资源；④ 向导 Step 1 目标运动按类别改为致密卡片网格（`.sport-grid`/`.sport-card`，auto-fill minmax≈148px）；⑤ Step 1 最少选 1 项即可 + 新增「平均主义」伪运动（置首段、单卡、全量均值种子 ≈`[3.5,3.7,…]`、与真实运动互斥单选；§4.3.2）；⑥ 计划按钮 `查看完整计划`→`定制完整计划`（dash.viewPlan）。连带文案：ob.step2.sub、step.1.d 由「2–6 项」改「1–6 项」。 |
| **v2.2** | 2026-09-05 | **1 项引擎优化（需求已确认；代码待「执行」后落地）**：① 能力表新增**相斥关系**（§4.2「相斥」列 + §4.1 `Ability.conflicts`）：最小能量系统口径——`有氧系 {AER_CAP, AER_END} × 无氧系 {ANA_CAP, RHIA}` 两两互斥共 4 对，MOB/AWARE 等无相斥；同一训练日目标列表不得并存互斥对。② 每日能力排日改为**「铺开 + 必要重复」两阶段**（§5.8）：阶段一各缺口能力第 1 次暴露尽量各占不同天、跨日不重复；阶段二仅两类必要重复——a) 大缺口 `deficit ≥ 1.2` 强度双频保留，b) 训练日富余（占用天数 < N）时按需填空、上限 `⌈N/A⌉≤3`；配兜底降级（先放宽相斥（仍守容量）→ 满位即顺延，容量不超载；仅 `N=1` 单日整体超载兜底）。单日目标增量按该能力本轮实际出现次数均摊（§5.6）。算法版本 `0.2.1-mock` → `0.3.0-mock`。 |

> 文档维护规则见「版本原则与文档维护」。本文件与 `web/src` 对不上即为待办：先改页面或数据，再升版本号并回填本表。

<!-- EOF -->




