# Su Jiayu 的工作笔记

一个部署在 GitHub Pages 上的 Jekyll 原子笔记站。

## 写一篇概念笔记

在 `_notes/` 新建不带日期的 Markdown 文件。标题应是一条可以独立理解的观点，而不只是宽泛主题：

```markdown
---
title: "反馈必须让用户知道系统如何理解自己"
topic: "交互与认知"
summary: "一句话说明这篇笔记解决的问题。"
---

只展开一个概念。

## 连接

- [相关概念]({% raw %}{% link _notes/products-emerge-through-iteration.md %}{% endraw %})
- 来源：[原始记录]({% raw %}{% post_url 2026-10-06-G %}{% endraw %})
```

## 保存来源记录

日记、摘录和长文继续放在 `_posts/`。在 front matter 中列出由它展开的概念文件名：

```markdown
---
layout: post
title: "来源记录"
date: YYYY-MM-DD
concepts:
  - products-emerge-through-iteration
---
```

首页按主题展示 `_notes`，来源记录保留在页面底部。桌面端会在右侧展开站内链接，移动端正常进入新页面。

## 本地预览

```bash
bundle exec jekyll serve
```

发布由 GitHub Pages 完成。
