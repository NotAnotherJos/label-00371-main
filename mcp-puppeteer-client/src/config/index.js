/**
 * 配置文件
 * MCP Puppeteer Client Configuration
 */

export const config = {
  // MCP Server 配置
  mcp: {
    serverCommand: "npx",
    serverArgs: ["-y", "@modelcontextprotocol/server-puppeteer"],
    connectionTimeout: 30000,
    requestTimeout: 60000,
  },

  // Puppeteer 配置
  puppeteer: {
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  },

  // 截图配置
  screenshot: {
    outputDir: "./screenshots",
    format: "png",
    quality: 90,
  },

  // 日志配置
  logging: {
    level: "info",
    format: "combined",
    outputDir: "./logs",
  },

  // 测试 URL
  testUrls: {
    baidu: "https://www.baidu.com",
    google: "https://www.google.com",
  },
};

export default config;
