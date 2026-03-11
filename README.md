# 📕 小红书内容展示系统

自动展示每日生成的小红书内容，支持密码保护和历史内容浏览。

## 🚀 快速部署

### 1. 推送到 GitHub

```bash
cd /home/robin/.openclaw/workspace/xiaohongshu-showcase
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/robinlee692/xiaohongshu-showcase.git
git push -u origin main
```

### 2. 部署到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 导入 `xiaohongshu-showcase` 仓库
5. 点击 "Deploy"

### 3. 配置环境变量（可选）

如果小红书内容不在默认路径，设置环境变量：

```
XIAOHONGSHU_CONTENT_PATH=/your/custom/path
```

## 🔐 访问密码

默认密码：`0692`

## 📁 目录结构

```
xiaohongshu-showcase/
├── app/
│   ├── api/              # API 路由
│   ├── posts/[slug]/     # 内容详情页
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页（登录页）
├── lib/
│   └── posts.ts          # 内容读取工具
└── ...
```

## 🎨 功能特性

- ✅ 密码保护访问
- ✅ 内容列表展示
- ✅ 内容详情查看
- ✅ 按日期排序
- ✅ 标签展示
- ✅ 发布状态标识
- ✅ 响应式设计

## 🔄 自动更新

内容来自 `/home/robin/.openclaw/workspace/xiaohongshu/` 目录下的 Markdown 文件。

每次有新的小红书内容生成时，Vercel 会自动重新部署（需配置 GitHub Actions）。

## 🛠️ 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 📝 内容格式

Markdown 文件 frontmatter 支持以下字段：

```yaml
---
title: 内容标题
date: 2026-03-11
tags:
  - AI 工具
  - 效率神器
status: 待发布
---
```

## 📄 License

MIT
