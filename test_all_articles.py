import requests
import urllib.parse
import re

# 测试文章列表
articles = [
    "2025-11-24-3D扫描生成与打印.md",
    "2025-11-30-分析EEG-Driven AR-Robot System for Zero-Touch Grasping Manipulation.md",
    "2025-11-30-智能网联汽车在智慧城市部署的技术、架构与治理要点.md",
    "2025-12-01.md",
    "2025-12-07-读田渊栋五年总结.md",
    "2025-12-15-toolbox.md",
    "2025-12-16.md"
]

print("测试文章访问情况：")
print("=" * 70)

total = len(articles)
success = 0
failed = 0

test_results = []

for article in articles:
    try:
        # 构建完整URL，确保中文文件名被正确编码
        url = f"http://localhost:8000/post.html?file={urllib.parse.quote(article)}"
        print(f"\n正在测试: {article}")
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        # 确保响应内容被正确解码为UTF-8
        response.encoding = 'utf-8'
        
        result = {
            'article': article,
            'status_code': response.status_code,
            'success': False,
            'error': None,
            'title': None
        }
        
        if response.status_code == 200:
            # 检查页面内容
            if "错误信息" in response.text:
                result['error'] = "页面包含错误信息"
                print(f"✗ 页面包含错误信息")
                failed += 1
            elif "<div id=\"post-content\">" in response.text:
                # 检查内容是否为空
                content_match = re.search(r'<div id=\"post-content\">([\s\S]*?)<\/div>', response.text, re.DOTALL)
                if content_match:
                    content = content_match.group(1).strip()
                    if content and content != "正在加载文章..." and "无效的Markdown内容" not in content:
                        # 提取文章标题
                        title_match = re.search(r'<h1[^>]*>(.*?)<\/h1>', response.text)
                        if title_match:
                            article_title = title_match.group(1).strip()
                            result['title'] = article_title
                            print(f"✓ 成功加载，标题: {article_title[:50]}...")
                        else:
                            print(f"✓ 成功加载，无明确标题")
                        result['success'] = True
                        success += 1
                    else:
                        result['error'] = "内容为空或无效"
                        print(f"✗ 内容为空或无效")
                        failed += 1
                else:
                    result['error'] = "无法提取文章内容"
                    print(f"✗ 无法提取文章内容")
                    failed += 1
            else:
                result['error'] = "页面结构不正确"
                print(f"✗ 页面结构不正确")
                failed += 1
        else:
            result['error'] = f"HTTP错误: {response.status_code}"
            print(f"✗ HTTP错误: {response.status_code}")
            failed += 1
            
    except Exception as e:
        result['error'] = f"异常: {str(e)}"
        print(f"✗ 异常: {str(e)}")
        failed += 1
    
    test_results.append(result)

print("\n" + "=" * 70)
print(f"测试结果：成功 {success}/{total}, 失败 {failed}/{total}")
print("=" * 70)

# 输出详细结果
if failed > 0:
    print("\n失败的文章：")
    for result in test_results:
        if not result['success']:
            print(f"- {result['article']}: {result['error']}")

print("\n测试完成！")
