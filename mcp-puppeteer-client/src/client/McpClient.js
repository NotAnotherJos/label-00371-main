/**
 * MCP Client 核心类
 * 负责与 @modelcontextprotocol/server-puppeteer 建立连接并进行通信
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { config } from "../config/index.js";
import logger from "../utils/logger.js";

class McpClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.tools = [];
    this.isConnected = false;
  }

  /**
   * 连接到 MCP Server
   * @returns {Promise<boolean>} 连接是否成功
   */
  async connect() {
    try {
      logger.info("Initializing MCP Client...");

      // 创建 Client 实例
      this.client = new Client(
        {
          name: "mcp-puppeteer-client",
          version: "1.0.0",
        },
        {
          capabilities: {},
        },
      );

      // 创建 Stdio Transport
      logger.info(
        `Starting MCP Server: ${config.mcp.serverCommand} ${config.mcp.serverArgs.join(" ")}`,
      );

      this.transport = new StdioClientTransport({
        command: config.mcp.serverCommand,
        args: config.mcp.serverArgs,
      });

      // 连接到服务器
      logger.info("Connecting to MCP Server...");
      await this.client.connect(this.transport);

      this.isConnected = true;
      logger.info("Successfully connected to MCP Server!");

      return true;
    } catch (error) {
      logger.error(`Failed to connect to MCP Server: ${error.message}`);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 获取可用工具列表
   * @returns {Promise<Array>} 工具列表
   */
  async listTools() {
    this._ensureConnected();

    try {
      logger.info("Fetching available tools...");
      const response = await this.client.listTools();
      this.tools = response.tools || [];

      logger.info(`Found ${this.tools.length} available tools:`);
      this.tools.forEach((tool) => {
        logger.info(
          `  - ${tool.name}: ${tool.description || "No description"}`,
        );
      });

      return this.tools;
    } catch (error) {
      logger.error(`Failed to list tools: ${error.message}`);
      throw error;
    }
  }

  /**
   * 调用工具
   * @param {string} toolName - 工具名称
   * @param {Object} args - 工具参数
   * @returns {Promise<Object>} 工具执行结果
   */
  async callTool(toolName, args = {}) {
    this._ensureConnected();

    try {
      logger.info(`Calling tool: ${toolName}`);
      logger.info(`Arguments: ${JSON.stringify(args, null, 2)}`);

      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });

      logger.info(`Tool ${toolName} executed successfully`);
      return result;
    } catch (error) {
      logger.error(`Failed to call tool ${toolName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 导航到指定 URL
   * @param {string} url - 目标 URL
   * @returns {Promise<Object>} 执行结果
   */
  async navigate(url) {
    logger.info(`Navigating to: ${url}`);
    return await this.callTool("puppeteer_navigate", { url });
  }

  /**
   * 截取当前页面截图
   * @param {string} name - 截图名称
   * @param {string} selector - 可选的元素选择器
   * @param {number} width - 截图宽度
   * @param {number} height - 截图高度
   * @param {boolean} encoded - 是否返回 base64 编码数据
   * @returns {Promise<Object>} 截图结果
   */
  async screenshot(
    name,
    selector = undefined,
    width = 800,
    height = 600,
    encoded = true,
  ) {
    logger.info(`Taking screenshot: ${name}`);
    const args = { name, width, height, encoded };
    if (selector) {
      args.selector = selector;
    }
    return await this.callTool("puppeteer_screenshot", args);
  }

  /**
   * 点击页面元素
   * @param {string} selector - CSS 选择器
   * @returns {Promise<Object>} 执行结果
   */
  async click(selector) {
    logger.info(`Clicking element: ${selector}`);
    return await this.callTool("puppeteer_click", { selector });
  }

  /**
   * 在输入框中填充文本
   * @param {string} selector - CSS 选择器
   * @param {string} value - 要填充的文本
   * @returns {Promise<Object>} 执行结果
   */
  async fill(selector, value) {
    logger.info(`Filling input ${selector} with: ${value}`);
    return await this.callTool("puppeteer_fill", { selector, value });
  }

  /**
   * 悬停在元素上
   * @param {string} selector - CSS 选择器
   * @returns {Promise<Object>} 执行结果
   */
  async hover(selector) {
    logger.info(`Hovering over element: ${selector}`);
    return await this.callTool("puppeteer_hover", { selector });
  }

  /**
   * 选择下拉框选项
   * @param {string} selector - CSS 选择器
   * @param {string} value - 选项值
   * @returns {Promise<Object>} 执行结果
   */
  async select(selector, value) {
    logger.info(`Selecting option ${value} in: ${selector}`);
    return await this.callTool("puppeteer_select", { selector, value });
  }

  /**
   * 执行 JavaScript 代码
   * @param {string} script - JavaScript 代码
   * @returns {Promise<Object>} 执行结果
   */
  async evaluate(script) {
    logger.info("Executing JavaScript...");
    return await this.callTool("puppeteer_evaluate", { script });
  }

  /**
   * 断开连接
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        logger.info("Disconnecting from MCP Server...");
        // 先导航到空白页，避免 console 事件在连接关闭后触发
        try {
          await this.callTool("puppeteer_navigate", { url: "about:blank" });
        } catch {
          // 忽略错误
        }
        // 等待事件处理完成
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.client.close();
        this.isConnected = false;
        logger.info("Disconnected successfully");
      } catch (error) {
        logger.error(`Error during disconnect: ${error.message}`);
      }
    }
  }

  /**
   * 确保已连接
   * @private
   */
  _ensureConnected() {
    if (!this.isConnected || !this.client) {
      throw new Error(
        "Not connected to MCP Server. Please call connect() first.",
      );
    }
  }
}

export default McpClient;
