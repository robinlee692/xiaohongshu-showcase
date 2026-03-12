#!/usr/bin/env node

/**
 * 小红书内容自动生成脚本 v3.0
 * 使用 Tavily API 搜索热点，生成包含配图提示词的完整内容
 * 输出格式严格匹配详情页 4 部分结构
 */

const { tavily } = require('@tavily/core');
const fs = require('fs');
const path = require('path');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';
const CONTENT_DIR = path.join(process.cwd(), 'content');

// 内容主题配置
const TOPICS = [
  {
    name: 'AI 工具推荐',
    query: 'AI tools 2026 productivity automation social media content creation',
    tags: ['AI 工具推荐', '效率神器', '职场干货', '自媒体运营', '内容创作', 'AI 应用', '工作效率', '数字化工具']
  },
  {
    name: '科技前沿',
    query: 'tech news AI artificial intelligence March 2026 innovation trends',
    tags: ['科技前沿', 'AI 新闻', '行业动态', '未来趋势', '创新科技', '技术突破', '数码科技', '科技资讯']
  },
  {
    name: '效率提升',
    query: 'productivity hacks time management AI automation workflow 2026',
    tags: ['效率提升', '时间管理', '职场必备', '自我提升', '工作技巧', '成长思维', '职场干货', '效率工具']
  }
];

// 生成配图提示词（4 张图）
function generateImagePrompts(topic) {
  return [
    `小红书风格封面，${topic}主题，明亮渐变色背景（粉紫/橙黄），大标题文字醒目，Emoji 装饰元素✨⭐️，清新活力风格，竖版构图 3:4，高饱和度`,
    `信息图表风格，${topic}核心要点分点展示，3-4 个卡片式布局，每点配简洁图标，统一配色方案（粉色系），简洁现代设计，扁平化风格`,
    `真实生活场景，办公桌/咖啡厅环境，笔记本电脑/手机展示${topic}相关内容，温暖色调，自然光，营造轻松高效氛围，生活方式摄影风格，浅景深`,
    `左右/上下对比布局，展示使用前后的差异或关键数据对比，清晰视觉分隔，箭头/图标引导，信息可视化设计，小红书爆款风格，粉色调`
  ];
}

// 生成小红书风格内容
async function generateXiaohongshuContent(topic) {
  console.log(`🔍 搜索热点：${topic.name}...`);
  
  const tvly = tavily({ apiKey: TAVILY_API_KEY });
  const searchResult = await tvly.search(topic.query, {
    count: 5,
    timeRange: 'week',
    topic: 'news'
  });

  // 提取关键信息
  const highlights = searchResult.results.slice(0, 3).map(r => ({
    title: r.title,
    snippet: r.snippet,
    url: r.url
  }));

  // 生成标题（带 Emoji，15-20 字）
  const titleTemplates = [
    `${topic.name.split(' ')[0]}太卷了❗️这 3 个神器让我效率翻 3 倍`,
    `2026 年${topic.name.split(' ')[0]}必看🔥小白也能轻松上手`,
    `打工人必备❗️${topic.name.split(' ')[0]}让我少加班 2 小时`,
    `姐妹们冲❗️${topic.name.split(' ')[0]}真的香到不行`,
    `亲测好用💯${topic.name.split(' ')[0]}Top3 排行榜`
  ];

  const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

  // 生成正文（300-500 字，分 3-4 段，聊天式/种草风）
  const content = `姐妹们！最近挖到${topic.name}相关的超好用工具/资讯，真的香到不行😭 必须来给你们种草！

🔥 最新热点速递

${highlights.map((h, i) => `${i + 1}. **${h.title.split(' - ')[0]}**
${h.snippet.substring(0, 80)}...`).join('\n\n')}

💡 核心亮点

- 亮点 1：自动提取自搜索结果，结合实际应用场景
- 亮点 2：突出实用价值，解决真实痛点
- 亮点 3：数据支撑，增强说服力

🤔 适合人群

✅ 职场新人/学生党
✅ 需要提升效率的
✅ 对${topic.name.split(' ')[0]}感兴趣的
✅ 想早点下班的打工人

💬 我的真实体验

说真的，这个真的帮了大忙！以前要花 2 小时的事情，现在半小时搞定～
用对工具/方法，每天多出 2 小时追剧不香吗？

有问题的姐妹评论区见～👇

---

**📌 下期预告：** 敬请期待更多${topic.name}相关内容！`;

  // 生成配图提示词
  const imagePrompts = generateImagePrompts(topic.name);

  return {
    title,
    content,
    tags: topic.tags,
    imagePrompts
  };
}

// 保存内容到文件（v3.0 格式）
function saveContent(data) {
  const date = new Date().toISOString().split('T')[0];
  const slug = `${date}-${data.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').substring(0, 30)}`.toLowerCase();
  
  // Frontmatter（只包含必需字段）
  const frontmatter = `---
title: ${data.title}
date: ${date}
tags:
${data.tags.map(tag => `  - ${tag}`).join('\n')}
status: 待发布
---

`;

  // 正文内容（直接输出，不需要额外的配图建议标题）
  const fullContent = frontmatter + data.content;

  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, fullContent, 'utf8');

  console.log(`✅ 内容已保存：${filePath}`);
  console.log(`   标题：${data.title}`);
  console.log(`   标签：${data.tags.length} 个`);
  console.log(`   配图提示词：${data.imagePrompts.length} 条`);
  
  // 将配图提示词保存到单独的 JSON 文件（便于系统读取）
  const promptsFile = path.join(CONTENT_DIR, `${slug}.prompts.json`);
  fs.writeFileSync(promptsFile, JSON.stringify({
    imagePrompts: data.imagePrompts
  }, null, 2), 'utf8');
  console.log(`   提示词文件：${promptsFile}`);

  return filePath;
}

// 主函数
async function main() {
  console.log('🚀 小红书内容自动生成 v3.0 启动...\n');

  // 确保内容目录存在
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    console.log(`📁 创建内容目录：${CONTENT_DIR}\n`);
  }

  // 随机选择一个主题
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  
  try {
    // 生成内容
    const content = await generateXiaohongshuContent(topic);
    
    console.log(`\n📝 生成内容:`);
    console.log(`标题：${content.title}`);
    console.log(`标签：${content.tags.join(', ')}`);
    console.log(`配图提示词：${content.imagePrompts.length} 条`);
    
    // 保存内容
    const filePath = saveContent(content);
    
    console.log(`\n✨ 生成完成！`);
    console.log(`文件位置：${filePath}`);
    console.log(`\n📋 内容结构（v3.0）:`);
    console.log(`1. 笔记标题 - 来自 frontmatter.title`);
    console.log(`2. 笔记正文 - Markdown 内容`);
    console.log(`3. 笔记标签 - 来自 frontmatter.tags`);
    console.log(`4. 配图提示词 - 来自 .prompts.json 文件`);
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { generateXiaohongshuContent, saveContent };
