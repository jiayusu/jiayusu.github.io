# Su Jiayu 的工作笔记

一个部署在 GitHub Pages 上的 Jekyll 原子笔记站。

## 写一篇概念笔记

在 `_notes/` 新建不带日期的 Markdown 文件。标题应是一条可以独立理解的观点，而不只是宽泛主题：

```markdown
---
title: "反馈必须让用户知道系统如何理解自己"
summary: "一句话说明这篇笔记解决的问题。"
---

只展开一个概念。

## 连接

- [相关概念]({% raw %}{% link _notes/products-emerge-through-iteration.md %}{% endraw %})
```

首页直接展示 `_notes`。桌面端会在右侧展开站内链接，移动端正常进入新页面。

## 本地预览

```bash
bundle exec jekyll serve
```

发布由 GitHub Pages 完成。
