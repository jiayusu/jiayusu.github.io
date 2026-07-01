#!/usr/bin/env bash
# 写日记：新建/追加当天日记，自动 git commit + push
# 用法：
#   ./diary.sh 今天写了个日记脚本，很开心      # 直接把内容作为参数
#   ./diary.sh                                  # 不带参数则打开编辑器输入
set -euo pipefail

# 始终在仓库根目录（脚本所在目录）操作
cd "$(dirname "$0")"

DATE=$(date +%Y-%m-%d)          # 文件名用，需带前导零（Jekyll 要求）
TIME=$(date +%H:%M)
TITLE_DATE=$(date +%Y-%-m-%-d)  # 标题用，去掉前导零，匹配现有风格
FILE="_posts/${DATE}-日记.md"

# 1) 取得日记内容
if [ "$#" -gt 0 ]; then
  CONTENT="$*"
else
  TMP=$(mktemp)
  "${EDITOR:-vi}" "$TMP"
  CONTENT=$(cat "$TMP")
  rm -f "$TMP"
fi

# 内容为空则取消
if [ -z "$(printf '%s' "$CONTENT" | tr -d '[:space:]')" ]; then
  echo "内容为空，已取消。"
  exit 1
fi

# 2) 新建或追加
if [ ! -f "$FILE" ]; then
  cat > "$FILE" <<EOF
---
layout: post
title: "${TITLE_DATE} 日记"
date: ${TITLE_DATE}
---

${CONTENT}
EOF
  echo "📝 新建日记：$FILE"
else
  {
    echo ""
    echo "## ${TIME}"
    echo ""
    echo "${CONTENT}"
  } >> "$FILE"
  echo "➕ 追加到当天日记：$FILE"
fi

# 3) 自动提交并推送
git add "$FILE"
git commit -m "日记 ${DATE} ${TIME}" >/dev/null
git push >/dev/null 2>&1
echo "✅ 已提交并推送到 GitHub"
