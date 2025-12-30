# 个人博客

这是一个简洁、优雅的个人博客，采用纯HTML、CSS和JavaScript编写，支持Markdown文章，无需依赖任何复杂框架。

## 功能特性

- 🎨 简洁简约的设计风格
- 📱 响应式布局，适配各种设备
- ✨ 流畅的交互效果
- � 支持Markdown文章
- ⌨️ 支持键盘快捷键导航
- �📦 易于扩展，方便添加新内容
- 🚀 快速加载，适合GitHub Pages部署

## 目录结构

```
├── index.html          # 主页面
├── post.html           # 文章详情页
├── posts.html          # 文章列表页
├── README.md           # 说明文档
├── generate-posts-data.js  # 生成文章数据的脚本
├── _posts/             # Markdown文章目录
└── assets/             # 资源文件夹
    ├── css/            # 样式文件
    └── js/             # JavaScript文件
        ├── main.js     # 主脚本
        ├── post.js     # 文章加载脚本
        ├── keyboard.js # 键盘快捷键脚本
        └── posts-data.js  # 生成的文章数据
```

## 如何使用

### 部署到GitHub Pages

1. 将所有文件上传到GitHub仓库
2. 在仓库设置中开启GitHub Pages
3. 选择主分支作为源
4. 访问提供的GitHub Pages URL即可查看博客

### 添加新文章

1. 在`_posts/`目录下创建新的Markdown文件
2. 文件名格式：`YYYY-MM-DD-文章标题.md`
3. 在文件开头添加front matter：

```markdown
---
layout: post
title: "文章标题"
date: YYYY-MM-DD
---

文章内容...
```

4. 运行生成文章数据的脚本：

```bash
node generate-posts-data.js
```

5. 将生成的`posts-data.js`文件提交到GitHub

### 自定义样式

在`assets/css/style.css`文件中，您可以修改CSS变量来自定义配色方案：

```css
:root {
    --primary-color: #333333;        /* 主色调 */
    --secondary-color: #f0f0f0;      /* 次要色调 */
    --accent-color: #0366d6;         /* 强调色 */
    --text-primary: #333333;         /* 主要文字颜色 */
    --text-secondary: #666666;       /* 次要文字颜色 */
    --bg-primary: #ffffff;           /* 主要背景色 */
    --bg-secondary: #fafafa;         /* 次要背景色 */
}
```

### 键盘快捷键

- `?` - 显示帮助
- `H` - 回到首页
- `A` - 文章列表
- `P` - 个人介绍
- `↑/↓` - 导航
- `Enter` - 选择
- `Q` - 退出

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript (ES6+)** - 交互效果
- **marked.js** - Markdown渲染
- **GitHub Pages** - 部署平台

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

## 联系方式

如有任何问题或建议，欢迎通过以下方式联系：

- GitHub: [jiayusu](https://github.com/jiayusu)
