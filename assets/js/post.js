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
        
        // 修复URL编码问题：先解码再编码，确保只编码一次
        const decodedFilename = decodeURIComponent(filename);
        
        // 构建完整URL，使用绝对路径或确保相对路径正确
        // 检查当前页面URL，确保路径正确
        const currentUrl = new URL(window.location.href);
        const baseUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname.split('/').slice(0, -1).join('/')}/`;
        
        const filePath = `_posts/${encodeURIComponent(decodedFilename)}`;
        const fullUrl = new URL(filePath, baseUrl).href;
        
        console.log('=== 加载文章调试信息 ===');
        console.log('原始文件名:', filename);
        console.log('解码后文件名:', decodedFilename);
        console.log('当前页面URL:', window.location.href);
        console.log('基本URL:', baseUrl);
        console.log('相对路径:', filePath);
        console.log('完整URL:', fullUrl);
        console.log('='.repeat(50));
        
        // 加载Markdown文件，确保使用正确的编码
        const response = await fetch(filePath, {
            headers: {
                'Accept': 'text/markdown; charset=utf-8'
            }
        });
        
        if (!response.ok) {
            console.error('HTTP错误:', response.status, response.statusText);
            throw new Error(`文章不存在或无法访问 (HTTP ${response.status})`);
        }
        
        // 查看响应头信息
        console.log('响应头信息:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // 使用response.text()直接获取文本内容，自动处理编码
        let markdown;
        try {
            markdown = await response.text();
            console.log('成功获取文章内容，长度:', markdown.length);
            console.log('文章内容前500字符:', markdown.substring(0, 500) + '...');
        } catch (textError) {
            console.error('获取文本内容失败:', textError);
            throw new Error('获取文章内容失败');
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
        console.log('修复编码后，内容长度:', fixedMarkdown.length);
        
        // 解析修复后的Markdown内容
        const { frontMatter, content } = parseMarkdown(fixedMarkdown);
        console.log('解析结果:', { frontMatter, contentLength: content.length });
        console.log('解析后的正文前200字符:', content.substring(0, 200) + '...');
        
        // 渲染文章
        renderPost(frontMatter, content);
        console.log('文章渲染完成');
        
    } catch (error) {
        console.error('加载文章失败:', error);
        console.error('错误堆栈:', error.stack);
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
        console.error('无效的Markdown内容，不是字符串类型:', typeof markdown);
        return { frontMatter, content: '无效的Markdown内容' };
    }
    
    console.log('开始解析Markdown，前100字符:', markdown.substring(0, 100) + '...');
    
    // 改进的front matter解析：更灵活的正则表达式
    // 支持不同的换行符，支持前后空格，支持缺少末尾换行
    const frontMatterRegex = /^\s*---\s*\n([\s\S]*?)\s*\n---\s*\n?([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);
    
    if (match) {
        console.log('找到front matter，开始解析');
        const frontMatterString = match[1];
        content = match[2].trim();
        
        console.log('front matter内容:', frontMatterString);
        console.log('正文内容前100字符:', content.substring(0, 100) + '...');
        
        try {
            // 解析front matter
            const lines = frontMatterString.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine === '' || trimmedLine.startsWith('#')) return;
                
                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex === -1) {
                    console.warn('无效的front matter行，跳过:', trimmedLine);
                    return;
                }
                
                const key = trimmedLine.substring(0, colonIndex).trim();
                const value = trimmedLine.substring(colonIndex + 1).trim().replace(/^['"](.*)['"]$/, '$1');
                
                if (key && value) {
                    frontMatter[key.toLowerCase()] = value;
                    console.log('解析front matter项:', key, ':', value);
                }
            });
        } catch (parseError) {
            console.warn('front matter解析失败，使用默认值:', parseError);
            // 使用默认值，不影响后续渲染
        }
    } else {
        console.log('未找到front matter，使用默认标题');
    }
    
    // 如果没有从front matter中提取到标题，尝试从内容中提取
    if (frontMatter.title === '无标题') {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            frontMatter.title = titleMatch[1].trim();
            console.log('从内容中提取标题:', frontMatter.title);
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
        
        console.log('开始渲染文章:', title);
        console.log('正文长度:', content.length);
        
        // 转换Markdown为HTML
        let html;
        
        // 检查marked库是否可用
        if (typeof marked !== 'undefined') {
            try {
                console.log('使用marked.js渲染Markdown');
                // 使用marked库转换Markdown，兼容新旧版本
                if (typeof marked.parse === 'function') {
                    // 新版本marked.js
                    html = marked.parse(content);
                } else {
                    // 旧版本marked.js
                    html = marked(content);
                }
                console.log('marked.js渲染成功，HTML长度:', html.length);
            } catch (markdownError) {
                console.warn('marked.js渲染失败，使用简化渲染:', markdownError);
                // 如果marked库转换失败，使用简化转换
                html = simplifiedMarkdownRender(content);
                console.log('简化渲染成功，HTML长度:', html.length);
            }
        } else {
            console.warn('marked.js库不可用，使用简化渲染');
            // 如果marked库不可用，使用简化的Markdown转换
            html = simplifiedMarkdownRender(content);
            console.log('简化渲染成功，HTML长度:', html.length);
        }
        
        // 显示转换后的HTML
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = html;
            console.log('成功将HTML插入到页面');
        } else {
            throw new Error('页面中未找到post-content元素');
        }
        
        // 美化代码块
        beautifyCodeBlocks();
        console.log('文章渲染完成');
        
    } catch (error) {
        console.error('渲染文章失败:', error);
        console.error('错误堆栈:', error.stack);
        showError(`渲染文章失败: ${error.message}`);
    }
}

// 简化的Markdown转换（备用方案）
function simplifiedMarkdownRender(markdown) {
    // 确保输入是字符串
    if (typeof markdown !== 'string') {
        return '<p>无效的Markdown内容</p>';
    }
    
    // 增强的Markdown转换，支持更多语法
    return markdown
        // 标题处理
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
        .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
        // 列表处理
        .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
        // 包裹列表项
        .replace(/(\n<li>.*<\/li>)+/gm, '<ul>$&</ul>')
        // 段落处理
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '')
        // 代码处理
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // 链接和图片处理
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // 强调处理
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // 块引用处理
        .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
        // 水平线处理
        .replace(/^---\s*$/gm, '<hr>')
        .replace(/^\*\*\*\s*$/gm, '<hr>')
        .replace(/^___\s*$/gm, '<hr>')
        // 表格处理（简单支持）
        .replace(/^(.*)\|(.*)$/gm, function(match, p1, p2) {
            if (p1 && p2) {
                return '<tr><td>' + match.split('|').map(cell => cell.trim()).join('</td><td>') + '</td></tr>';
            }
            return match;
        })
        .replace(/(<tr>.*<\/tr>)+/gm, '<table border="1"><tbody>$&</tbody></table>');
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
