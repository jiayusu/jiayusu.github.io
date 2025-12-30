// 文章页面的JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 解析URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('file');
    
    if (!filename) {
        document.getElementById('post-title').textContent = '错误';
        document.getElementById('post-content').innerHTML = '<p>没有指定文章文件</p>';
        return;
    }
    
    // 加载Markdown文件
    loadMarkdownPost(filename);
});

// 加载Markdown文章
async function loadMarkdownPost(filename) {
    try {
        const response = await fetch(`_posts/${filename}`);
        
        if (!response.ok) {
            throw new Error('文章不存在');
        }
        
        const markdown = await response.text();
        
        // 解析Markdown内容
        const { frontMatter, content } = parseMarkdown(markdown);
        
        // 渲染文章
        renderPost(frontMatter, content);
        
    } catch (error) {
        document.getElementById('post-title').textContent = '错误';
        document.getElementById('post-content').innerHTML = `<p>加载文章失败: ${error.message}</p>`;
    }
}

// 解析Markdown，提取front matter和内容
function parseMarkdown(markdown) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);
    
    let frontMatter = {};
    let content = markdown;
    
    if (match) {
        const frontMatterString = match[1];
        content = match[2];
        
        // 解析front matter
        const lines = frontMatterString.split('\n');
        lines.forEach(line => {
            const [key, ...valueParts] = line.split(': ');
            if (key && valueParts.length) {
                frontMatter[key.trim()] = valueParts.join(': ').trim().replace(/^['"](.*)['"]$/, '$1');
            }
        });
    }
    
    return { frontMatter, content };
}

// 渲染文章
function renderPost(frontMatter, content) {
    // 设置页面标题
    const title = frontMatter.title || '无标题';
    document.title = `${title} - 我的博客`;
    document.getElementById('post-title').textContent = title;
    
    // 转换Markdown为HTML
    const html = marked.parse(content);
    document.getElementById('post-content').innerHTML = html;
    
    // 添加语法高亮（如果有代码块）
    addSyntaxHighlighting();
}

// 添加语法高亮（简化版）
function addSyntaxHighlighting() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
        // 移除行号
        codeBlock.innerHTML = codeBlock.innerHTML.replace(/^(\d+:\s+)/gm, '');
    });
}
