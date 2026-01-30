#!/usr/bin/env python3
import os
import re

# 读取Markdown文件并转换为HTML
def markdown_to_html(markdown_content):
    # 简单的Markdown到HTML转换
    # 处理标题
    content = re.sub(r'^# (.*)$', r'<h1>\1</h1>', markdown_content, flags=re.MULTILINE)
    content = re.sub(r'^## (.*)$', r'<h2>\1</h2>', content, flags=re.MULTILINE)
    content = re.sub(r'^### (.*)$', r'<h3>\1</h3>', content, flags=re.MULTILINE)
    
    # 处理段落
    content = re.sub(r'^(?!<h[1-6]>)([^\n]+)$', r'<p>\1</p>', content, flags=re.MULTILINE)
    
    # 处理链接
    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', content)
    
    # 处理粗体
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    
    # 处理斜体
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
    
    return content

# 生成HTML文件
def generate_html_posts():
    posts_dir = '_posts'
    html_dir = 'posts'
    
    # 创建posts目录
    if not os.path.exists(html_dir):
        os.makedirs(html_dir)
    
    # 处理每篇文章
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            # 读取Markdown文件
            with open(os.path.join(posts_dir, filename), 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 提取标题（从文件名或内容中）
            title = filename.replace('.md', '').split('-', 3)[3:] if len(filename.split('-')) > 3 else filename.replace('.md', '')
            title = ' '.join(title) if title else '无标题文章'
            
            # 转换Markdown为HTML
            html_content = markdown_to_html(content)
            
            # 生成HTML文件内容
            html_template = f'''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 我的博客</title>
    <style>
        body {{
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1, h2 {{
            text-align: center;
        }}
    </style>
</head>
<body>
    <!-- 返回链接 -->
    <a href="../index.html">← 返回首页</a>
    
    <!-- 文章内容 -->
    <article>
        <h1>{title}</h1>
        <div>
            {html_content}
        </div>
    </article>
</body>
</html>
            '''
            
            # 生成HTML文件名
            html_filename = filename.replace('.md', '.html')
            html_path = os.path.join(html_dir, html_filename)
            
            # 写入HTML文件
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_template)
            
            print(f'生成文章: {html_filename}')

if __name__ == '__main__':
    generate_html_posts()
    print('所有文章HTML文件生成完成！')
