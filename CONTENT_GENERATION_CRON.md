# 📕 小红书内容生成定时任务配置

**创建时间：** 2026-03-12  
**版本：** v2.0（支持配图建议和生图提示词）

---

## 🎯 任务目标

每天自动生成 1 篇小红书风格图文内容，包含：
- ✅ 标题（带 Emoji，15-20 字）
- ✅ 正文（300-500 字，聊天式/种草风）
- ✅ 标签（5-8 个热门话题）
- ✅ 配图建议（3-4 张图的画面描述）
- ✅ 生图提示词（可直接用于 AI 绘画工具）

---

## 📋 定时任务配置

### 任务 1：AI 热点新闻（工作日）

**时间：** 每天 09:00（周一到周五）  
** Cron 表达式：** `0 9 * * 1-5`

**搜索词：**
```
AI tools artificial intelligence news 2026 machine learning LLM generative AI
```

**输出标签：**
```
#AI 工具推荐 #效率神器 #职场干货 #科技前沿 #内容创作
```

---

### 任务 2：效率工具推荐（周末）

**时间：** 每周六 10:00  
** Cron 表达式：** `0 10 * * 6`

**搜索词：**
```
productivity tools automation workflow time management 2026
```

**输出标签：**
```
#效率工具 #时间管理 #职场必备 #自我提升 #工作技巧
```

---

### 任务 3：行业趋势分析（周日）

**时间：** 每周日 10:00  
** Cron 表达式：** `0 10 * * 0`

**搜索词：**
```
tech trends industry analysis innovation future 2026
```

**输出标签：**
```
#行业趋势 #科技前沿 #未来趋势 #创新科技 #市场洞察
```

---

## 🛠️ 执行脚本

### 方式 1：Node.js 脚本（推荐）

```bash
cd /home/robin/.openclaw/workspace/xiaohongshu-showcase
node generate-xiaohongshu-content.js
```

**功能：**
- 使用 Tavily API 搜索最新热点
- 自动生成小红书风格内容
- 自动生成 4 张配图建议和生图提示词
- 自动保存到 `content/` 目录

**环境变量：**
```bash
export TAVILY_API_KEY=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
```

---

### 方式 2：OpenClaw Cron 任务

**配置示例：**
```json
{
  "name": "小红书内容生成-AI 热点",
  "schedule": {
    "kind": "cron",
    "expr": "0 9 * * 1-5",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "使用 Tavily 搜索 AI 热点新闻，生成小红书风格图文内容，包含标题、正文、标签、配图建议和生图提示词，保存到 xiaohongshu-showcase 的 content 目录",
    "timeoutSeconds": 300
  },
  "sessionTarget": "isolated",
  "enabled": true
}
```

---

## 📝 内容格式规范

### Frontmatter
```yaml
---
title: 标题（带 Emoji，15-20 字）
date: 2026-03-12
tags:
  - 标签 1
  - 标签 2
  - 标签 3
  - 标签 4
  - 标签 5
status: 待发布
---
```

### 正文结构
```markdown
# 标题（与 frontmatter 一致）

姐妹们！开头引入...

## 🔥 小标题 1

内容段落...

## 💡 小标题 2

内容段落...

## 💬 总结/互动

结尾引导评论...

---

**📌 下期预告：** 下期内容预告...
```

### 配图建议格式
```markdown
## 🖼️ 配图建议

【图 1 - 封面图】
画面：小红书风格封面，主题明确，明亮渐变色背景（粉紫/橙黄），大标题文字，Emoji 装饰元素✨⭐️，清新活力风格，竖版构图 3:4

【图 2 - 核心功能/要点展示图】
画面：信息图表风格，核心要点分点展示，卡片式布局，每点配图标，统一配色方案，简洁现代设计，适合小红书展示

【图 3 - 使用场景图】
画面：真实生活场景，办公桌/咖啡厅环境，笔记本电脑/手机展示相关内容，温暖色调，自然光，营造轻松高效氛围，生活方式摄影风格

【图 4 - 对比图/总结图】
画面：左右/上下对比布局，展示使用前后的差异或关键数据对比，清晰视觉分隔，箭头/图标引导，信息可视化设计，小红书爆款风格
```

---

## 🚀 自动部署流程

```mermaid
graph LR
    A[定时任务触发] --> B[执行生成脚本]
    B --> C[搜索 Tavily 热点]
    C --> D[生成小红书内容]
    D --> E[保存 Markdown 文件]
    E --> F[Git Add + Commit + Push]
    F --> G[Vercel 自动部署]
    G --> H[网站更新完成]
```

---

## 📊 质量检查清单

生成内容后，请检查：

- [ ] 标题是否带 Emoji，15-20 字
- [ ] 正文是否 300-500 字，分 3-4 段
- [ ] 是否有 5-8 个标签
- [ ] 是否有 3-4 张配图建议
- [ ] 每张图是否有画面描述
- [ ] 内容是否符合小红书调性（聊天式/种草风）
- [ ] 是否避免硬广，注重实用价值
- [ ] 是否有互动引导（评论区见等）

---

## 🔧 故障排查

### 问题 1：内容未生成

**检查：**
1. Tavily API Key 是否有效
2. 网络连接是否正常
3. `content/` 目录是否有写权限

**解决：**
```bash
# 检查 API Key
echo $TAVILY_API_KEY

# 测试 Tavily 连接
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{"api_key": "'$TAVILY_API_KEY'", "query": "test"}'

# 检查目录权限
ls -la /home/robin/.openclaw/workspace/xiaohongshu-showcase/content/
```

---

### 问题 2：配图建议未提取

**检查：**
1. 配图建议格式是否正确（`【图 X - 标题】`）
2. 画面描述是否以`画面：` 开头

**解决：**
- 确保格式完全匹配
- 检查中文字符是否正确

---

### 问题 3：Vercel 部署失败

**检查：**
1. Git Push 是否成功
2. Vercel 项目是否连接 GitHub
3. 构建日志是否有错误

**解决：**
```bash
# 检查 Git 状态
cd /home/robin/.openclaw/workspace/xiaohongshu-showcase
git status
git log -1

# 手动触发部署
vercel --prod
```

---

## 📈 效果追踪

### 关键指标

| 指标 | 目标值 | 追踪方式 |
|------|--------|----------|
| 每日生成篇数 | 1 篇 | 统计 `content/` 目录文件数 |
| 内容质量评分 | 4.5+/5 | 人工评审 |
| 配图完整度 | 100% | 检查配图建议字段 |
| 部署成功率 | 99%+ | Vercel 部署日志 |

### 优化建议

- 每周回顾生成内容，调整搜索词
- 根据热点变化更新主题配置
- 收集用户反馈优化内容风格
- 定期更新标签库（追热点）

---

## 🎯 最佳实践

1. **固定时间生成**：选择流量低峰期（如早 9 点）
2. **人工审核**：生成后快速浏览，确保质量
3. **及时发布**：审核通过后立即发布
4. **数据追踪**：记录哪些主题/标签效果好
5. **持续优化**：根据数据调整生成策略

---

**最后更新：** 2026-03-12  
**维护者：** 🐦 Robin
