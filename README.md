# 个人博客

这是一个简洁、优雅的个人博客，采用纯HTML、CSS和JavaScript编写，无需依赖任何框架。

## 功能特性

- 🎨 简洁淡雅的设计风格
- 📱 响应式布局，适配各种设备
- ✨ 流畅的动画和交互效果
- 📦 易于扩展，方便添加新内容
- 🚀 快速加载，适合GitHub Pages部署

## 目录结构

```
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 交互脚本
├── README.md           # 说明文档
└── assets/             # 资源文件夹
    ├── images/         # 图片资源
    └── fonts/          # 字体资源
```

## 如何使用

### 部署到GitHub Pages

1. 将所有文件上传到GitHub仓库
2. 在仓库设置中开启GitHub Pages
3. 选择主分支作为源
4. 访问提供的GitHub Pages URL即可查看博客

### 添加新作品

#### 方法一：直接修改HTML

在`index.html`文件中，找到`<div class="works-grid">`部分，添加新的作品卡片：

```html
<div class="work-card">
    <div class="work-image">
        <img src="作品图片URL" alt="作品标题">
    </div>
    <div class="work-content">
        <h3 class="work-title">作品标题</h3>
        <p class="work-description">作品描述</p>
        <a href="作品链接" class="work-link">查看详情 →</a>
    </div>
</div>
```

#### 方法二：使用JavaScript函数

在`script.js`文件末尾，添加以下代码：

```javascript
// 在页面加载完成后添加新作品
window.addEventListener('load', function() {
    addWorkItem(
        '作品标题',
        '作品描述',
        '作品图片URL',
        '作品链接'
    );
});
```

### 添加新博客

#### 方法一：直接修改HTML

在`index.html`文件中，找到`<div class="blog-grid">`部分，添加新的博客卡片：

```html
<div class="blog-card">
    <div class="blog-date">发布日期</div>
    <h3 class="blog-title">博客标题</h3>
    <p class="blog-excerpt">博客摘要</p>
    <a href="博客链接" class="blog-link">阅读全文 →</a>
</div>
```

#### 方法二：使用JavaScript函数

在`script.js`文件末尾，添加以下代码：

```javascript
// 在页面加载完成后添加新博客
window.addEventListener('load', function() {
    addBlogItem(
        '博客标题',
        '博客摘要',
        '发布日期',
        '博客链接'
    );
});
```

### 自定义样式

在`style.css`文件中，您可以修改以下CSS变量来自定义配色方案：

```css
:root {
    --primary-color: #6c63ff;        /* 主色调 */
    --secondary-color: #f0f0f0;      /* 次要色调 */
    --accent-color: #4ecdc4;         /* 强调色 */
    --text-primary: #333333;         /* 主要文字颜色 */
    --text-secondary: #666666;       /* 次要文字颜色 */
    --bg-primary: #ffffff;           /* 主要背景色 */
    --bg-secondary: #fafafa;         /* 次要背景色 */
}
```

### 添加新页面

1. 创建新的HTML文件，例如`about.html`
2. 复制`index.html`的基础结构
3. 修改内容部分
4. 在导航栏中添加链接

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript (ES6+)** - 交互效果
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

- GitHub: [您的GitHub用户名]
- Email: [您的邮箱地址]
- LinkedIn: [您的LinkedIn链接]
