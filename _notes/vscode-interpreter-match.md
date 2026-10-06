---
title: "VS Code 与终端必须使用同一个 Python 解释器"
topic: "创作与工具"
summary: "编辑器不能跳转到包时，先检查解释器路径是否一致。"
status: "可操作"
---

终端能运行 Python 包，但 VS Code 无法补全或跳转，常见原因不是包损坏，而是两者正在使用不同环境。

在 VS Code 中打开命令面板，执行 **Python: Select Interpreter**，选择与终端 `python` 对应的解释器。必要时同时检查工作区设置和新终端启动后的环境是否一致。

## 连接

- [可复现的编程环境需要明确版本与恢复路径]({% link _notes/reproducible-coding-environments.md %})
- [工具箱应该从命令行基础开始]({% link _notes/toolbox-starts-with-shell.md %})
- 来源：[VS Code 问题及解决方法]({% post_url 2025-12-01-unnamed-post %})
