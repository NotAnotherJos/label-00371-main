# MCP Puppeteer Client

连接 `@modelcontextprotocol/server-puppeteer` 的客户端脚本，实现网页自动化操作。

## ⚠️ Docker 运行限制

Docker 容器内运行 Puppeteer 存在 **Chromium sandbox 限制问题**：

```
FATAL:zygote_host_impl_linux.cc(128)] No usable sandbox!
```

**原因**：Docker 容器默认禁用了 unprivileged user namespaces，而 Chromium 需要 sandbox 环境运行。解决方案是使用 `--no-sandbox` 参数启动 Chromium，但 `@modelcontextprotocol/server-puppeteer` 这个外部 MCP Server 包不支持传递此参数。

**解决方案**：

1. **推荐：本地运行** - 直接使用 `npm run demo` 在主机上运行，已验证完全正常
2. **等待上游修复** - 等待 MCP Server 包支持 `--no-sandbox` 参数
3. **Fork 修改** - 自行 fork `@modelcontextprotocol/server-puppeteer` 并添加 sandbox 配置

## How to Run

### 一键启动（推荐）

**Windows:**

```bash
# 双击运行 start.bat 或在命令行执行：
start.bat
```

**Linux/macOS:**

```bash
chmod +x start.sh
./start.sh
```

### 手动运行

#### 前置要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装与运行

```bash
# 1. 进入项目目录
cd mcp-puppeteer-client

# 2. 安装依赖
npm install

# 3. 运行测试连接
npm test

# 4. 运行完整演示（百度搜索自动化）
npm run demo

# 5. 运行简单示例
npm start
```

### 运行示例脚本

```bash
# 百度自动化示例
node src/examples/baidu-automation.js "搜索关键词"

# 高级操作示例
node src/examples/advanced-operations.js
```

## Services

| 服务                 | 说明                 | 端口  |
| -------------------- | -------------------- | ----- |
| MCP Puppeteer Server | Puppeteer MCP 服务器 | stdio |
| MCP Client           | 客户端脚本           | N/A   |

## 测试账号

本项目为纯脚本工具，无需账号。

## 题目内容

在 `/Users/bytedance/Desktop/code/test/gui-agent/` 目录下，生成一个连接 `@modelcontextprotocol/server-puppeteer` 的脚本，包括：

- 连接 MCP Server
- 获取工具列表
- 调用工具
- 使用百度网页为例，进行点击、截图之类的操作

---

## 项目结构

```
mcp-puppeteer-client/
├── src/
│   ├── client/
│   │   └── McpClient.js      # MCP 客户端核心类
│   ├── config/
│   │   └── index.js          # 配置文件
│   ├── utils/
│   │   ├── logger.js         # 日志工具
│   │   └── helpers.js        # 辅助函数
│   ├── examples/
│   │   ├── baidu-automation.js    # 百度自动化示例
│   │   └── advanced-operations.js # 高级操作示例
│   ├── index.js              # 入口文件
│   ├── demo.js               # 完整演示脚本
│   └── test-connection.js    # 连接测试脚本
├── package.json
├── Dockerfile
└── .gitignore
```

## 功能特性

### 核心功能

1. **连接管理**
   - 自动启动 MCP Puppeteer Server
   - 通过 stdio 建立连接
   - 优雅断开连接

2. **工具调用**
   - `puppeteer_navigate` - 导航到指定 URL
   - `puppeteer_screenshot` - 截取页面截图
   - `puppeteer_click` - 点击元素
   - `puppeteer_fill` - 填充表单
   - `puppeteer_hover` - 悬停在元素上
   - `puppeteer_select` - 选择下拉选项
   - `puppeteer_evaluate` - 执行 JavaScript

3. **辅助功能**
   - 日志记录（Winston）
   - 截图自动保存
   - 错误处理

### 使用示例

```javascript
import McpClient from "./client/McpClient.js";

const client = new McpClient();

// 连接
await client.connect();

// 获取工具列表
const tools = await client.listTools();

// 导航到百度
await client.navigate("https://www.baidu.com");

// 截图
await client.screenshot("homepage");

// 输入搜索词
await client.fill("#kw", "MCP Puppeteer");

// 点击搜索
await client.click("#su");

// 执行 JavaScript
await client.evaluate("document.title");

// 断开连接
await client.disconnect();
```

## Docker 运行

```bash
# 构建并运行
docker-compose up --build -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

> 注意：由于上述 sandbox 限制，Docker 环境暂不可用。生产环境建议直接在主机运行。

## 已知问题

### 1. 断开连接时的 "Not connected" 错误

```
Error: Not connected
at Server.notification
```

**原因**：`@modelcontextprotocol/server-puppeteer` 包已被标记为 deprecated，在关闭连接时没有正确处理浏览器的 console 事件回调，导致在连接关闭后仍尝试发送通知。

**影响**：不影响实际功能，所有操作都能正常完成。

**解决方案**：代码中已添加在断开连接前先导航到 `about:blank` 的处理，减少此错误的发生。

### 2. MCP Server 包已废弃

```
npm warn deprecated @modelcontextprotocol/server-puppeteer@2025.5.12: Package no longer supported
npm warn deprecated puppeteer@23.11.1: < 24.15.0 is no longer supported
```

**说明**：`@modelcontextprotocol/server-puppeteer` 官方包已不再维护，建议关注官方是否有替代方案。

## 截图输出

所有截图保存在 `screenshots/` 目录，文件名格式：`{name}_{timestamp}.png`

## 日志

日志文件保存在 `logs/` 目录：

- `combined.log` - 所有日志
- `error.log` - 错误日志

## License

MIT
