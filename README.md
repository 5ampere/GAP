# GAP · General Athletic Preparation

> 通用运动能力准备 —— 面向多运动爱好者的能力评测与训练计划生成网站（前端原型）。

GAP 帮助「不只玩一项运动」的你，找出身体通用能力的短板，并生成围绕这些短板的训练计划。网站默认中文，可一键切换英文。

- 在线预览：<https://gap-scgt.vercel.app/>
- 仓库：<https://github.com/5ampere/GAP>
- 技术栈：Next.js 16（App Router）+ React 19 + TypeScript
- 数据与逻辑：纯前端实现 —— 无后端、无数据库；用户数据保存在浏览器 `localStorage`，训练计划由本地 mock 引擎即时生成。

---

## 功能概览

| 页面 | 路由 | 说明 |
|------|------|------|
| 欢迎（落地页） | `/` | 项目介绍、18 项能力三层模型、不同运动的共享能力雷达 |
| 什么是 GAP | `/docs` | 文档站入口占位页 |
| 定制计划 | `/app/onboarding` | 5 步向导：选目标运动（≥1 项，含「平均主义」一键方案）→ 训练频率 → 能力自测 → 确认生成 |
| 我的能力画像 / 计划 | `/app/dashboard` · `/app/plan` | 查看能力缺口、定制完整训练计划并逐日编排 |

## 仓库结构

```
GAP/
├─ web/                    # Next.js 网站（唯一可运行代码，Vercel 部署根目录）
├─ HighLevelDesign/        # 系统设计文档（HLD）
├─ LowLevelDesign/         # 网站详细设计文档（LLD）——改需求先改这里
├─ DevelopResource/        # 设计素材
└─ README.md
```

## 本地启动

前置要求：[Node.js ≥ 20.9](https://nodejs.org/)（npm 随 Node 自带）。

```bash
# 1. 进入网站目录
cd web

# 2. 安装依赖（首次）
npm install

# 3. 启动开发服务器
npm run dev
```

然后用浏览器打开 <http://localhost:3000> 即可。改代码会热更新，页面自动刷新。

> 常见问题
> - `3000` 端口被占用：开发服务器会自动换端口，按终端提示打开即可。
> - 依赖报错/想重装：删掉 `web/node_modules` 与 `web/package-lock.json` 后重新 `npm install`。

## 常用命令

在 `web/` 目录下执行：

| 命令 | 作用 |
|------|------|
| `npm run dev` | 本地开发，热更新（http://localhost:3000） |
| `npm run build` | 生产构建（含 TypeScript 类型检查；提交前需通过） |
| `npm start` | 本地预览生产构建结果（需先 build） |

## 部署

- 方式：GitHub + Vercel，**单仓库自动部署** —— 推送 `main` 分支即触发。
- Vercel 项目 Root Directory 已设为 `web`。
- 上线流程：本地确认 → `npm run build` 通过 → 提交并 `git push origin main` → 稍等约 1–2 分钟刷新线上地址查看。

## 相关文档

- 系统级设计：[HighLevelDesign/GAP系统设计文档_v1.0.md](HighLevelDesign/GAP系统设计文档_v1.0.md)
- 网站级详细设计（含页面规格、视觉规范、交互细节）：[LowLevelDesign/GAP网站详细设计文档_v1.0.md](LowLevelDesign/GAP网站详细设计文档_v1.0.md)
