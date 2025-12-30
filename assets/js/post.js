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
        console.log('尝试加载文章:', filename);
        
        // 确保filename是字符串
        if (typeof filename !== 'string') {
            throw new Error('无效的文件名');
        }
        
        // 构建完整URL，直接使用文件名
        const filePath = `_posts/${filename}`;
        console.log('请求URL:', filePath);
        
        // 尝试直接访问文件
        try {
            // 加载Markdown文件
            const response = await fetch(filePath);
            
            console.log('响应状态:', response.status);
            
            if (!response.ok) {
                // 如果直接访问失败，尝试使用encodeURIComponent编码
                console.log('直接访问失败，尝试使用URL编码...');
                const encodedFilePath = `_posts/${encodeURIComponent(filename)}`;
                console.log('尝试编码后的URL:', encodedFilePath);
                const encodedResponse = await fetch(encodedFilePath);
                
                if (!encodedResponse.ok) {
                    throw new Error(`文章不存在或无法访问 (HTTP ${encodedResponse.status})`);
                }
                
                const markdown = await encodedResponse.text();
                console.log('使用编码URL成功获取Markdown内容，长度:', markdown.length);
                
                // 解析Markdown内容
                const { frontMatter, content } = parseMarkdown(markdown);
                
                // 渲染文章
                renderPost(frontMatter, content);
                return;
            }
            
            const markdown = await response.text();
            console.log('成功获取Markdown内容，长度:', markdown.length);
            
            // 解析Markdown内容
            const { frontMatter, content } = parseMarkdown(markdown);
            
            // 渲染文章
            renderPost(frontMatter, content);
        } catch (error) {
            // 如果fetch失败，尝试使用XMLHttpRequest作为备用方案
            console.error('fetch请求失败，尝试使用XMLHttpRequest...', error);
            loadMarkdownWithXHR(filename);
        }
        
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('post-title').textContent = '错误';
        document.getElementById('post-content').innerHTML = `
            <p>加载文章失败: ${error.message}</p>
            <p>请检查控制台获取更多详细信息。</p>
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
}

// 使用XMLHttpRequest加载Markdown文件（备用方案）
function loadMarkdownWithXHR(filename) {
    try {
        const xhr = new XMLHttpRequest();
        const filePath = `_posts/${filename}`;
        
        console.log('使用XMLHttpRequest请求:', filePath);
        
        xhr.open('GET', filePath, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('XMLHttpRequest请求成功，状态:', xhr.status);
                const markdown = xhr.responseText;
                console.log('获取Markdown内容，长度:', markdown.length);
                
                // 解析Markdown内容
                const { frontMatter, content } = parseMarkdown(markdown);
                
                // 渲染文章
                renderPost(frontMatter, content);
            } else {
                // 如果直接访问失败，尝试使用encodeURIComponent编码
                console.log('XMLHttpRequest直接访问失败，尝试使用URL编码...');
                const encodedFilePath = `_posts/${encodeURIComponent(filename)}`;
                console.log('尝试编码后的URL:', encodedFilePath);
                
                const encodedXhr = new XMLHttpRequest();
                encodedXhr.open('GET', encodedFilePath, true);
                
                encodedXhr.onload = function() {
                    if (encodedXhr.status === 200) {
                        console.log('编码后XMLHttpRequest请求成功，状态:', encodedXhr.status);
                        const markdown = encodedXhr.responseText;
                        
                        // 解析Markdown内容
                        const { frontMatter, content } = parseMarkdown(markdown);
                        
                        // 渲染文章
                        renderPost(frontMatter, content);
                    } else {
                        const error = new Error(`文章不存在或无法访问 (HTTP ${encodedXhr.status})`);
                        console.error('加载文章失败:', error);
                        document.getElementById('post-title').textContent = '错误';
                        document.getElementById('post-content').innerHTML = `
                            <p>加载文章失败: ${error.message}</p>
                            <p>请检查控制台获取更多详细信息。</p>
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
                };
                
                encodedXhr.onerror = function() {
                    const error = new Error('网络错误，无法访问文章');
                    console.error('XMLHttpRequest请求错误:', error);
                    document.getElementById('post-title').textContent = '错误';
                    document.getElementById('post-content').innerHTML = `
                        <p>加载文章失败: ${error.message}</p>
                        <p>请检查控制台获取更多详细信息。</p>
                        <p>可能的原因：</p>
                        <ul>
                            <li>文件名错误</li>
                            <li>文件路径错误</li>
                            <li>服务器配置问题</li>
                            <li>网络连接问题</li>
                        </ul>
                        <a href="index.html">返回首页</a>
                    `;
                };
                
                encodedXhr.send();
            }
        };
        
        xhr.onerror = function() {
            const error = new Error('网络错误，无法访问文章');
            console.error('XMLHttpRequest请求错误:', error);
            document.getElementById('post-title').textContent = '错误';
            document.getElementById('post-content').innerHTML = `
                <p>加载文章失败: ${error.message}</p>
                <p>请检查控制台获取更多详细信息。</p>
                <p>可能的原因：</p>
                <ul>
                    <li>文件名错误</li>
                    <li>文件路径错误</li>
                    <li>服务器配置问题</li>
                    <li>网络连接问题</li>
                </ul>
                <a href="index.html">返回首页</a>
            `;
        };
        
        xhr.send();
    } catch (error) {
        console.error('XMLHttpRequest请求失败:', error);
        document.getElementById('post-title').textContent = '错误';
        document.getElementById('post-content').innerHTML = `
            <p>加载文章失败: ${error.message}</p>
            <p>请检查控制台获取更多详细信息。</p>
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
}

// 解析Markdown，提取front matter和内容
function parseMarkdown(markdown) {
    let frontMatter = {
        title: '无标题'
    };
    let content = markdown;
    
    try {
        console.log('开始解析Markdown内容...');
        
        // 简单的front matter解析，不依赖正则表达式
        if (markdown.startsWith('---\n')) {
            console.log('检测到front matter格式...');
            
            const endOfFrontMatter = markdown.indexOf('\n---\n', 4);
            if (endOfFrontMatter !== -1) {
                const frontMatterString = markdown.substring(4, endOfFrontMatter);
                content = markdown.substring(endOfFrontMatter + 5).trim();
                
                console.log('提取front matter内容:', frontMatterString);
                console.log('提取文章内容，长度:', content.length);
                
                // 解析front matter
                const lines = frontMatterString.split('\n');
                lines.forEach(line => {
                    if (line.trim() === '') return;
                    
                    const colonIndex = line.indexOf(':');
                    if (colonIndex === -1) return;
                    
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^['"](.*)['"]$/, '$1');
                    
                    if (key && value) {
                        frontMatter[key] = value;
                        console.log('解析front matter字段:', key, '=', value);
                    }
                });
            }
        }
    } catch (error) {
        console.error('解析front matter失败:', error);
        // 如果解析失败，返回默认值
        frontMatter = {
            title: '无标题'
        };
        content = markdown;
    }
    
    console.log('解析完成，front matter:', frontMatter);
    return { frontMatter, content };
}

// 渲染文章
function renderPost(frontMatter, content) {
    try {
        console.log('开始渲染文章...');
        
        // 设置页面标题
        const title = frontMatter.title || '无标题';
        console.log('文章标题:', title);
        
        document.title = `${title} - 我的博客`;
        document.getElementById('post-title').textContent = title;
        
        // 检查marked库是否可用
        if (typeof marked === 'undefined') {
            console.error('marked.js库未加载，尝试直接显示Markdown内容...');
            // 如果marked库不可用，直接显示原始Markdown内容
            document.getElementById('post-content').innerHTML = `
                <pre style="background-color: #f0f0f0; padding: 10px; overflow-x: auto;">${content}</pre>
            `;
            return;
        }
        
        console.log('marked.js库已加载，开始转换Markdown...');
        
        // 简单的Markdown转换，确保内容能显示
        try {
            // 转换Markdown为HTML
            const html = marked.parse(content);
            console.log('Markdown转换成功，HTML长度:', html.length);
            document.getElementById('post-content').innerHTML = html;
        } catch (markdownError) {
            console.error('Markdown转换失败，尝试使用简化转换...', markdownError);
            // 简化的Markdown转换，只处理基本格式
            const simplifiedHtml = simplifyMarkdown(content);
            document.getElementById('post-content').innerHTML = simplifiedHtml;
        }
        
        console.log('文章渲染完成');
        
        // 添加语法高亮（如果有代码块）
        addSyntaxHighlighting();
    } catch (error) {
        console.error('渲染文章失败:', error);
        document.getElementById('post-content').innerHTML = `
            <p>渲染文章失败: ${error.message}</p>
            <p>详细错误信息:</p>
            <pre style="background-color: #ffebee; padding: 10px; overflow-x: auto; color: red;">${error.stack || error}</pre>
            <p>原始内容（前500字符）:</p>
            <pre style="background-color: #f0f0f0; padding: 10px; overflow-x: auto;">${content.substring(0, 500)}...</pre>
        `;
    }
}

// 简化的Markdown转换（备用方案）
function simplifyMarkdown(markdown) {
    return markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(\n<li>.*<\/li>)+/gm, '<ul>$&</ul>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// 添加语法高亮（简化版）
function addSyntaxHighlighting() {
    try {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            // 移除行号
            codeBlock.innerHTML = codeBlock.innerHTML.replace(/^(\d+:\s+)/gm, '');
            // 添加基本的样式
            codeBlock.style.backgroundColor = '#f0f0f0';
            codeBlock.style.padding = '10px';
            codeBlock.style.borderRadius = '4px';
        });
    } catch (error) {
        console.error('添加语法高亮失败:', error);
    }
}
