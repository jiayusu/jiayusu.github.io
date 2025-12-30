// 生成文章数据文件的脚本
// 用于将Markdown文件转换为JavaScript对象，避免直接访问_posts目录

const fs = require('fs');
const path = require('path');

// 读取_posts目录下的所有Markdown文件
const postsDir = path.join(__dirname, '_posts');
const files = fs.readdirSync(postsDir);

// 文章数据数组
const postsData = [];

console.log('正在生成文章数据...');

// 遍历所有Markdown文件
files.forEach(file => {
    if (path.extname(file) === '.md') {
        try {
            const filePath = path.join(postsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 提取文件名作为唯一标识
            const id = path.basename(file, '.md');
            
            // 简单解析front matter
            let frontMatter = {
                title: id,
                date: id.split('-').slice(0, 3).join('-')
            };
            
            let articleContent = content;
            
            // 尝试解析front matter
            const frontMatterRegex = /^\s*---\s*\n([\s\S]*?)\s*\n---\s*\n?([\s\S]*)$/;
            const match = content.match(frontMatterRegex);
            
            if (match) {
                const frontMatterString = match[1];
                articleContent = match[2].trim();
                
                // 解析front matter键值对
                const lines = frontMatterString.split('\n');
                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine === '' || trimmedLine.startsWith('#')) return;
                    
                    const colonIndex = trimmedLine.indexOf(':');
                    if (colonIndex !== -1) {
                        const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
                        const value = trimmedLine.substring(colonIndex + 1).trim().replace(/^['"](.*)['"]$/, '$1');
                        if (key && value) {
                            frontMatter[key] = value;
                        }
                    }
                });
            }
            
            // 添加到文章数据
            postsData.push({
                id: id,
                filename: file,
                title: frontMatter.title || id,
                date: frontMatter.date || id.split('-').slice(0, 3).join('-'),
                content: articleContent
            });
            
            console.log(`✓ 处理成功: ${file}`);
            
        } catch (error) {
            console.error(`✗ 处理失败: ${file}`, error.message);
        }
    }
});

// 生成JavaScript文件
const outputPath = path.join(__dirname, 'assets', 'js', 'posts-data.js');
const outputContent = `// 文章数据，自动生成
const postsData = ${JSON.stringify(postsData, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent, 'utf-8');

console.log(`\n成功生成文章数据文件: ${outputPath}`);
console.log(`共处理 ${postsData.length} 篇文章`);

// 生成索引文件，用于快速查找
const indexContent = `// 文章索引，自动生成
const postsIndex = {
${postsData.map(post => `    '${post.filename}': ${postsData.indexOf(post)}`).join(',\n')}
};
`;

const indexPath = path.join(__dirname, 'assets', 'js', 'posts-index.js');
fs.writeFileSync(indexPath, indexContent, 'utf-8');

console.log(`成功生成文章索引文件: ${indexPath}`);
