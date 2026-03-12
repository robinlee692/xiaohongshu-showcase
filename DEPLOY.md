# 🚀 部署指南

## 方式一：手动部署（推荐）

### Step 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`xiaohongshu-showcase`
3. 设为 **Public**（公开）
4. 不要初始化 README
5. 点击 "Create repository"

### Step 2: 推送代码到 GitHub

在终端执行以下命令：

```bash
cd /home/robin/.openclaw/workspace/xiaohongshu-showcase

# 添加远程仓库（替换为你的 GitHub token）
git remote add origin https://robinlee692:YOUR_GITHUB_TOKEN@github.com/robinlee692/xiaohongshu-showcase.git

# 推送代码
git push -u origin main
```

**获取 GitHub Token**：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成后复制 token，替换上面命令中的 `YOUR_GITHUB_TOKEN`

### Step 3: 部署到 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 找到并导入 `xiaohongshu-showcase` 仓库
5. 保持默认配置，点击 "Deploy"
6. 等待部署完成（约 1-2 分钟）

### Step 4: 配置环境变量

在 Vercel 项目设置中：

1. 进入 Settings → Environment Variables
2. 添加环境变量：
   ```
   XIAOHONGSHU_CONTENT_PATH=/home/robin/.openclaw/workspace/xiaohongshu
   ```
3. 重新部署项目

### Step 5: 配置自动更新（可选）

为了让内容更新后自动重新部署：

1. 在 Vercel 项目设置中，进入 Git → Connected Git Repository
2. 确保已连接 GitHub 仓库
3. Vercel 会自动监听 main 分支的推送并重新部署

---

## 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
cd /home/robin/.openclaw/workspace/xiaohongshu-showcase
vercel

# 生产环境部署
vercel --prod
```

---

## 🔐 访问信息

- **默认密码**：`0692`
- **Vercel 域名**：`https://xiaohongshu-showcase.vercel.app`（或你的自定义域名）

---

## 📝 内容更新流程

当前内容来自：`/home/robin/.openclaw/workspace/xiaohongshu/`

每次定时任务生成新内容后：

1. 内容自动保存到 Markdown 文件
2. Git 检测文件变化
3. 自动推送（需配置 GitHub Actions）或手动推送
4. Vercel 自动重新部署
5. 网站内容更新

---

## 🛠️ 故障排查

### 问题 1: 推送失败

```
remote: Support for password authentication was removed...
```

**解决**：使用 GitHub Token 替代密码，或配置 SSH key。

### 问题 2: Vercel 部署失败

检查：
- `package.json` 依赖是否正确
- 构建日志中的错误信息
- 环境变量是否配置正确

### 问题 3: 内容不显示

检查：
- 环境变量 `XIAOHONGSHU_CONTENT_PATH` 是否正确
- Markdown 文件格式是否正确
- Vercel 函数是否有读取权限

---

## 📞 需要帮助？

遇到问题时，请提供：
1. 错误信息截图
2. Vercel 部署日志
3. GitHub 仓库链接
