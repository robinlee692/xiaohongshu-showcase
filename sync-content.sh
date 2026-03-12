#!/bin/bash

# 小红书内容展示系统 - 自动同步脚本
# 用法：./sync-content.sh

set -e

echo "🔄 开始同步小红书内容..."

# 检查内容目录
CONTENT_DIR="/home/robin/.openclaw/workspace/xiaohongshu"
SHOWCASE_DIR="/home/robin/.openclaw/workspace/xiaohongshu-showcase"

if [ ! -d "$CONTENT_DIR" ]; then
    echo "❌ 内容目录不存在：$CONTENT_DIR"
    exit 1
fi

# 复制最新的 Markdown 文件
echo "📄 复制内容文件..."
cp -f "$CONTENT_DIR"/*.md "$SHOWCASE_DIR/content/" 2>/dev/null || true

# 提交更改
cd "$SHOWCASE_DIR"

if git status --porcelain | grep -q '.'; then
    echo "📝 检测到内容变化，提交中..."
    git add .
    git commit -m "Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "✅ 内容已更新并推送"
else
    echo "✨ 没有新内容需要更新"
fi

echo "🎉 同步完成！"
