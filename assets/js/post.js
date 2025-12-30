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
        
        // 构建完整URL，确保中文文件名被正确编码
        const filePath = `_posts/${encodeURIComponent(filename)}`;
        
        // 加载Markdown文件，确保使用正确的编码
        const response = await fetch(filePath, {
            headers: {
                'Accept': 'text/markdown; charset=utf-8'
            }
        });
        
        if (!response.ok) {
            throw new Error(`文章不存在或无法访问 (HTTP ${response.status})`);
        }
        
        // 使用arrayBuffer和TextDecoder确保UTF-8编码，处理BOM
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
        let markdown;
        
        try {
            markdown = decoder.decode(arrayBuffer);
        } catch (decodingError) {
            console.warn('UTF-8解码失败，尝试使用windows-1252兼容模式:', decodingError);
            // 尝试使用更宽容的编码解码
            const fallbackDecoder = new TextDecoder('windows-1252', { fatal: false });
            markdown = fallbackDecoder.decode(arrayBuffer);
        }
        
        // 检查并修复可能的编码问题
        function fixEncoding(str) {
            // 确保输入是字符串
            if (typeof str !== 'string') {
                return '无效的内容';
            }
            
            return str
                .replace(/\uFEFF/g, '') // 移除BOM（字节顺序标记）
                .replace(/\uFFFD/g, '?') // 替换无法识别的字符
                .replace(/\r\n/g, '\n') // 统一换行符
                .trim();
        }
        
        const fixedMarkdown = fixEncoding(markdown);
        
        // 解析修复后的Markdown内容
        const { frontMatter, content } = parseMarkdown(fixedMarkdown);
        
        // 渲染文章
        renderPost(frontMatter, content);
        
    } catch (error) {
        console.error('加载文章失败:', error);
        showError(`加载文章失败: ${error.message}`);
    }
}

// 显示错误信息
function showError(message) {
    // 确保message是字符串
    if (typeof message !== 'string') {
        message = '未知错误';
    }
    
    document.getElementById('post-title').textContent = '错误';
    
    // 分析错误类型，提供更具体的解决方案
    let errorType = 'general';
    let solution = '';
    
    if (message.includes('不存在') || message.includes('404')) {
        errorType = 'not-found';
        solution = '<p>请检查文章是否存在，或返回首页浏览所有文章。</p>';
    } else if (message.includes('编码') || message.includes('解码') || message.includes('UTF-8')) {
        errorType = 'encoding';
        solution = '<p>文章文件可能存在编码问题，请确保使用UTF-8编码保存Markdown文件。</p>';
    } else if (message.includes('网络') || message.includes('连接')) {
        errorType = 'network';
        solution = '<p>请检查网络连接，或稍后重试。</p>';
    }
    
    document.getElementById('post-content').innerHTML = `
        <div class="error-container">
            <h2>错误信息</h2>
            <p>${message}</p>
            
            <h3>可能的原因：</h3>
            <ul>
                <li>文件名错误或文章已被删除</li>
                <li>文件路径错误</li>
                <li>文件编码格式不正确（建议使用UTF-8）</li>
                <li>网络连接问题</li>
                <li>服务器配置问题</li>
            </ul>
            
            ${solution}
            
            <div class="error-actions">
                <a href="index.html" class="btn-primary">返回首页</a>
                <a href="posts.html" class="btn-secondary">浏览所有文章</a>
            </div>
            
            <div class="debug-info">
                <h4>调试信息：</h4>
                <p>当前时间：${new Date().toLocaleString()}</p>
                <p>请求URL：${window.location.href}</p>
            </div>
        </div>
    `;
    
    // 添加一些基本样式
    const style = document.createElement('style');
    style.textContent = `
        .error-container {
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .error-container h2 {
            color: #dc3545;
            margin-bottom: 1rem;
        }
        .error-container h3 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        .error-container ul {
            margin-left: 1.5rem;
        }
        .error-actions {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
        }
        .btn-primary {
            padding: 0.5rem 1rem;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .btn-primary:hover {
            background-color: #0056b3;
        }
        .btn-secondary {
            padding: 0.5rem 1rem;
            background-color: #6c757d;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .btn-secondary:hover {
            background-color: #5a6268;
        }
        .debug-info {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #dee2e6;
            font-size: 0.9rem;
            color: #6c757d;
        }
    `;
    document.head.appendChild(style);
}

// 解析Markdown，提取front matter和内容
function parseMarkdown(markdown) {
    let frontMatter = {
        title: '无标题'
    };
    let content = markdown;
    
    // 确保markdown是字符串
    if (typeof markdown !== 'string') {
        return { frontMatter, content: '无效的Markdown内容' };
    }
    
    // 简单的front matter解析
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);
    
    if (match) {
        const frontMatterString = match[1];
        content = match[2].trim();
        
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
