// 键盘快捷键和对话式交互功能

// 导航状态
let currentIndex = -1;
let navigationItems = [];
let isHelpVisible = false;

// 初始化
function initKeyboardNavigation() {
    // 收集导航项
    collectNavigationItems();
    
    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyPress);
    
    // 添加点击事件监听器，更新当前索引
    document.addEventListener('click', updateCurrentIndex);
    
    // 初始化命令行（可选）
    initCommandLine();
}

// 收集导航项
function collectNavigationItems() {
    // 收集所有链接
    const links = document.querySelectorAll('a');
    navigationItems = Array.from(links);
    
    // 如果有文章列表，收集文章项
    const articles = document.querySelectorAll('#articles li');
    if (articles.length > 0) {
        navigationItems = Array.from(articles);
    }
}

// 处理键盘按键
function handleKeyPress(e) {
    // 如果正在输入命令，不处理快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(e.key.toLowerCase()) {
        // 帮助
        case '?':
            e.preventDefault();
            toggleHelp();
            break;
        
        // 首页
        case 'h':
            e.preventDefault();
            window.location.href = 'index.html';
            break;
        
        // 文章列表
        case 'a':
            e.preventDefault();
            window.location.href = 'posts.html';
            break;
        
        // 个人介绍
        case 'p':
            e.preventDefault();
            window.location.href = 'index.html#about';
            break;
        
        // 退出
        case 'q':
            e.preventDefault();
            if (confirm('确定要退出吗？')) {
                window.close();
            }
            break;
        
        // 上导航
        case 'arrowup':
            e.preventDefault();
            navigate(-1);
            break;
        
        // 下导航
        case 'arrowdown':
            e.preventDefault();
            navigate(1);
            break;
        
        // 选择
        case 'enter':
            e.preventDefault();
            selectCurrentItem();
            break;
    }
}

// 导航函数
function navigate(direction) {
    // 移除当前选中项的样式
    if (currentIndex >= 0 && currentIndex < navigationItems.length) {
        navigationItems[currentIndex].style.backgroundColor = '';
        navigationItems[currentIndex].style.color = '';
    }
    
    // 更新索引
    currentIndex += direction;
    
    // 边界检查
    if (currentIndex < 0) {
        currentIndex = navigationItems.length - 1;
    } else if (currentIndex >= navigationItems.length) {
        currentIndex = 0;
    }
    
    // 添加选中样式
    const currentItem = navigationItems[currentIndex];
    currentItem.style.backgroundColor = '#0366d6';
    currentItem.style.color = '#ffffff';
    
    // 滚动到可见区域
    currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 选择当前项
function selectCurrentItem() {
    if (currentIndex >= 0 && currentIndex < navigationItems.length) {
        const currentItem = navigationItems[currentIndex];
        
        // 如果是文章列表项，获取链接
        const link = currentItem.querySelector('a');
        if (link) {
            window.location.href = link.href;
        } else if (currentItem.tagName === 'A') {
            // 如果是直接链接，点击它
            currentItem.click();
        }
    }
}

// 更新当前索引
function updateCurrentIndex(e) {
    const target = e.target;
    if (target.tagName === 'A') {
        const index = navigationItems.indexOf(target);
        if (index >= 0) {
            currentIndex = index;
        }
    } else if (target.closest('#articles li')) {
        const listItem = target.closest('#articles li');
        const index = navigationItems.indexOf(listItem);
        if (index >= 0) {
            currentIndex = index;
        }
    }
}

// 切换帮助显示
function toggleHelp() {
    let helpDiv = document.getElementById('help-dialog');
    
    if (isHelpVisible) {
        // 移除帮助对话框
        if (helpDiv) {
            helpDiv.remove();
        }
        isHelpVisible = false;
    } else {
        // 创建帮助对话框
        helpDiv = document.createElement('div');
        helpDiv.id = 'help-dialog';
        helpDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            border: 1px solid #ccc;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            font-family: Arial, sans-serif;
        `;
        
        // 帮助内容
        helpDiv.innerHTML = `
            <h2 style="margin-top: 0;">快捷键帮助</h2>
            <div style="margin-bottom: 20px;">
                <h3>导航快捷键</h3>
                <ul style="list-style-type: disc; padding-left: 20px;">
                    <li><strong>H</strong> - 回到首页</li>
                    <li><strong>A</strong> - 跳转到文章列表</li>
                    <li><strong>P</strong> - 查看个人介绍</li>
                    <li><strong>↑/↓</strong> - 上下导航</li>
                    <li><strong>Enter</strong> - 选择当前项</li>
                </ul>
                
                <h3>其他快捷键</h3>
                <ul style="list-style-type: disc; padding-left: 20px;">
                    <li><strong>?</strong> - 显示/隐藏帮助</li>
                    <li><strong>Q</strong> - 退出当前页面</li>
                </ul>
                
                <h3>命令行命令（可选）</h3>
                <ul style="list-style-type: disc; padding-left: 20px;">
                    <li><strong>list</strong> - 列出所有文章</li>
                    <li><strong>view &lt;id&gt;</strong> - 查看指定文章</li>
                    <li><strong>about</strong> - 查看个人介绍</li>
                    <li><strong>help</strong> - 显示帮助信息</li>
                </ul>
            </div>
            <button id="close-help" style="padding: 8px 16px; background-color: #0366d6; color: white; border: none; cursor: pointer;">关闭</button>
        `;
        
        // 添加到页面
        document.body.appendChild(helpDiv);
        
        // 添加关闭事件
        document.getElementById('close-help').addEventListener('click', toggleHelp);
        
        isHelpVisible = true;
    }
}

// 初始化命令行（可选）
function initCommandLine() {
    // 如果是首页或文章列表页，添加命令行输入
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        const commandLine = document.createElement('div');
        commandLine.style.cssText = `
            margin-top: 30px;
            padding: 10px;
            border-top: 1px solid #ccc;
        `;
        
        commandLine.innerHTML = `
            <div style="margin-bottom: 10px; font-size: 14px; color: #666;">命令行模式 - 输入命令后按Enter执行 (输入 help 查看帮助)</div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 10px; color: #0366d6; font-weight: bold;">$</span>
                <input type="text" id="command-input" placeholder="输入命令..." style="flex: 1; padding: 8px; font-family: monospace; border: 1px solid #ccc; outline: none;">
            </div>
            <div id="command-output" style="margin-top: 10px; font-family: monospace; font-size: 14px;"></div>
        `;
        
        document.body.appendChild(commandLine);
        
        // 添加命令输入事件
        const commandInput = document.getElementById('command-input');
        const commandOutput = document.getElementById('command-output');
        
        commandInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                executeCommand(command, commandOutput);
                this.value = '';
            }
        });
    }
}

// 执行命令
function executeCommand(command, outputElement) {
    const [cmd, ...args] = command.split(' ');
    
    switch(cmd.toLowerCase()) {
        case 'list':
            listArticles(outputElement);
            break;
        case 'view':
            viewArticle(args[0], outputElement);
            break;
        case 'about':
            showAbout(outputElement);
            break;
        case 'help':
            showCommandHelp(outputElement);
            break;
        case 'clear':
            outputElement.innerHTML = '';
            break;
        default:
            outputElement.innerHTML = `<span style="color: red;">未知命令: ${cmd}</span><br>`;
            break;
    }
}

// 列出所有文章
function listArticles(outputElement) {
    const articles = [
        { id: '1', title: '3D扫描、生成与打印', date: '2025-11-24', file: '2025-11-24-3D扫描生成与打印.md' },
        { id: '2', title: '分析EEG‑Driven AR‑Robot System for Zero‑Touch Grasping Manipulation', date: '2025-11-30', file: '2025-11-30-分析EEG%E2%80%91Driven%20AR%E2%80%91Robot%20System%20for%20Zero%E2%80%9ETouch%20Grasping%20Manipulation.md' },
        { id: '3', title: '智能网联汽车在智慧城市部署的技术、架构与治理要点', date: '2025-11-30', file: '2025-11-30-智能网联汽车在智慧城市部署的技术、架构与治理要点.md' },
        { id: '4', title: '2025-12-01', date: '2025-12-01', file: '2025-12-01.md' },
        { id: '5', title: '读田渊栋五年总结', date: '2025-12-07', file: '2025-12-07-读田渊栋五年总结.md' },
        { id: '6', title: 'toolbox', date: '2025-12-15', file: '2025-12-15-toolbox.md' },
        { id: '7', title: '2025-12-16', date: '2025-12-16', file: '2025-12-16.md' }
    ];
    
    let output = '<strong>文章列表:</strong><br>';
    articles.forEach(article => {
        output += `${article.id}. <a href="post.html?file=${article.file}" style="color: #0366d6;">${article.title}</a> (${article.date})<br>`;
    });
    
    outputElement.innerHTML = output;
}

// 查看指定文章
function viewArticle(id, outputElement) {
    const articleId = parseInt(id);
    if (isNaN(articleId) || articleId < 1 || articleId > 7) {
        outputElement.innerHTML = `<span style="color: red;">无效的文章ID</span><br>`;
        return;
    }
    
    // 文章文件名映射
    const articleFiles = [
        '', // 索引0不用
        '2025-11-24-3D扫描生成与打印.md',
        '2025-11-30-分析EEG%E2%80%91Driven%20AR%E2%80%91Robot%20System%20for%20Zero%E2%80%9ETouch%20Grasping%20Manipulation.md',
        '2025-11-30-智能网联汽车在智慧城市部署的技术、架构与治理要点.md',
        '2025-12-01.md',
        '2025-12-07-读田渊栋五年总结.md',
        '2025-12-15-toolbox.md',
        '2025-12-16.md'
    ];
    
    window.location.href = `post.html?file=${articleFiles[articleId]}`;
}

// 显示个人介绍
function showAbout(outputElement) {
    outputElement.innerHTML = `
        <strong>关于我</strong><br>
        我是一名技术爱好者，专注于人工智能、机器学习和产品设计领域。<br>
        这个博客是我记录技术学习、产品思考和个人成长的地方。我希望通过分享我的经验和感悟，能够帮助到更多的人。<br>
        在这里，你可以找到关于技术开发、产品设计、读书感悟等方面的内容。我会定期更新博客，分享我在学习和工作中的收获和思考。<br>
        <a href="index.html#about" style="color: #0366d6; margin-top: 10px; display: inline-block;">查看完整介绍</a>
    `;
}

// 显示命令帮助
function showCommandHelp(outputElement) {
    outputElement.innerHTML = `
        <strong>命令帮助</strong><br>
        <ul style="list-style-type: disc; padding-left: 20px; margin: 10px 0;">
            <li><strong>list</strong> - 列出所有文章</li>
            <li><strong>view &lt;id&gt;</strong> - 查看指定文章</li>
            <li><strong>about</strong> - 查看个人介绍</li>
            <li><strong>help</strong> - 显示帮助信息</li>
            <li><strong>clear</strong> - 清除输出</li>
        </ul>
    `;
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardNavigation);
} else {
    initKeyboardNavigation();
}