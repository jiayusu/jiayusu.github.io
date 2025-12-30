// 文章页面的JavaScript

// 简化的Markdown加载逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 解析URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('file');
    
    if (!filename) {
        showError('没有指定文章文件');
        return;
    }
    
    // 加载Markdown文件
    loadMarkdownPost(filename);
});

// 加载Markdown文章
async function loadMarkdownPost(filename) {
    try {
        // 确保filename是字符串
        if (typeof filename !== 'string') {
            throw new Error('无效的文件名');
        }
        
        // 构建完整URL
        const filePath = `_posts/${encodeURIComponent(filename)}`;
        
        // 加载Markdown文件
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`文章不存在或无法访问 (HTTP ${response.status})`);
        }
        
        const markdown = await response.text();
        
        // 解析Markdown内容
        const { frontMatter, content } = parseMarkdown(markdown);
        
        // 渲染文章
        renderPost(frontMatter, content);
        
    } catch (error) {
        console.error('加载文章失败:', error);
        showError(`加载文章失败: ${error.message}`);
    }
}

// 显示错误信息
function showError(message) {
    document.getElementById('post-title').textContent = '错误';
    document.getElementById('post-content').innerHTML = `
        <p>${message}</p>
        <p>可能的原因：</p>
        <ul>
            <li>文件名错误</li>
            <li>文件路径错误</li>
            <li>服务器配置问题</li>
            <li>网络连接问题</li>
        </ul>
        <a href="index.html">返回首页</a>
    `;
}

// 解析Markdown，提取front matter和内容
function parseMarkdown(markdown) {
    let frontMatter = {
        title: '无标题'
    };
    let content = markdown;
    
    // 尝试解析front matter
    if (markdown.startsWith('---\n')) {
        const endOfFrontMatter = markdown.indexOf('\n---\n', 4);
        if (endOfFrontMatter !== -1) {
            const frontMatterString = markdown.substring(4, endOfFrontMatter);
            content = markdown.substring(endOfFrontMatter + 5).trim();
            
            // 解析front matter
            const lines = frontMatterString.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine === '') return;
                
                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex === -1) return;
                
                const key = trimmedLine.substring(0, colonIndex).trim();
                const value = trimmedLine.substring(colonIndex + 1).trim().replace(/^['"](.*)['"]$/, '$1');
                
                if (key && value) {
                    frontMatter[key.toLowerCase()] = value;
                }
            });
        }
    }
    
    // 如果没有从front matter中提取到标题，尝试从内容中提取
    if (frontMatter.title === '无标题') {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            frontMatter.title = titleMatch[1].trim();
            // 从内容中移除标题行
            content = content.replace(/^#\s+.+\n/, '').trim();
        }
    }
    
    return { frontMatter, content };
}

// 渲染文章
function renderPost(frontMatter, content) {
    try {
        // 设置页面标题
        const title = frontMatter.title || '无标题';
        
        document.title = `${title} - 我的博客`;
        document.getElementById('post-title').textContent = title;
        
        // 转换Markdown为HTML
        let html;
        
        // 检查marked库是否可用
        if (typeof marked === 'undefined') {
            // 如果marked库不可用，使用简化的Markdown转换
            html = simplifiedMarkdownRender(content);
        } else {
            try {
                // 使用marked库转换Markdown
                html = marked.parse(content);
            } catch (markdownError) {
                // 如果marked库转换失败，使用简化转换
                html = simplifiedMarkdownRender(content);
            }
        }
        
        // 显示转换后的HTML
        document.getElementById('post-content').innerHTML = html;
        
        // 美化代码块
        beautifyCodeBlocks();
        
    } catch (error) {
        console.error('渲染文章失败:', error);
        showError(`渲染文章失败: ${error.message}`);
    }
}

// 简化的Markdown转换（备用方案）
function simplifiedMarkdownRender(markdown) {
    return markdown
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
        .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
        .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
        .replace(/(\n<li>.*<\/li>)+/gm, '<ul>$&</ul>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// 美化代码块
function beautifyCodeBlocks() {
    try {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            // 移除行号
            codeBlock.innerHTML = codeBlock.innerHTML.replace(/^(\d+:\s+)/gm, '');
            // 添加基本的样式
            codeBlock.style.backgroundColor = '#f0f0f0';
            codeBlock.style.padding = '10px';
            codeBlock.style.borderRadius = '4px';
            codeBlock.style.fontFamily = 'monospace';
        });
    } catch (error) {
        console.error('美化代码块失败:', error);
    }
}
