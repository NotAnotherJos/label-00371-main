/**
 * MCP Puppeteer Client - 入口文件
 * 提供命令行接口和模块导出
 */

import McpClient from "./client/McpClient.js";
import logger from "./utils/logger.js";
import { formatToolsList } from "./utils/helpers.js";

/**
 * 交互式命令行演示
 */
async function interactiveDemo() {
  const client = new McpClient();

  try {
    // 连接
    console.log("\n🚀 MCP Puppeteer Client");
    console.log("========================\n");

    await client.connect();
    console.log("✅ Connected to MCP Server\n");

    // 列出工具
    console.log("📋 Available Tools:");
    console.log("-------------------");
    const tools = await client.listTools();
    console.log(formatToolsList(tools));
    console.log("\n");

    // 简单演示
    console.log("🌐 Demo: Navigate to Baidu");
    console.log("--------------------------");

    await client.navigate("https://www.baidu.com");
    console.log("✅ Navigated to Baidu\n");

    await client.screenshot("demo_screenshot", undefined, 1280, 720);
    console.log("📸 Screenshot taken\n");

    console.log("🎉 Demo completed successfully!");
    console.log("Run `npm run demo` for a full demonstration.\n");
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  } finally {
    await client.disconnect();
  }
}

// 导出模块
export { McpClient };
export { default as logger } from "./utils/logger.js";
export { config } from "./config/index.js";
export * from "./utils/helpers.js";

// 如果直接运行此文件
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  interactiveDemo();
}
