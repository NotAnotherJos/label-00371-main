/**
 * 百度自动化操作示例
 * Baidu Automation Example
 *
 * 演示完整的百度搜索自动化流程
 */

import McpClient from "../client/McpClient.js";
import logger from "../utils/logger.js";
import {
  delay,
  saveScreenshot,
  generateTimestampedFilename,
} from "../utils/helpers.js";

/**
 * 百度搜索自动化类
 */
class BaiduAutomation {
  constructor() {
    this.client = new McpClient();
    this.baseUrl = "https://www.baidu.com";
    this.selectors = {
      searchInput: "#kw",
      searchButton: "#su",
      searchResults: ".result",
      resultTitle: ".result h3 a",
      logo: "#lg img",
      newsTab: '.s_tab_inner a[href*="news"]',
    };
  }

  /**
   * 初始化连接
   */
  async init() {
    logger.info("Initializing Baidu Automation...");
    await this.client.connect();
    logger.info("Connected to MCP Server");
  }

  /**
   * 打开百度首页
   */
  async openHomepage() {
    logger.info("Opening Baidu homepage...");
    await this.client.navigate(this.baseUrl);
    await delay(2000);
    logger.info("Baidu homepage loaded");
  }

  /**
   * 执行搜索
   * @param {string} keyword - 搜索关键词
   */
  async search(keyword) {
    logger.info(`Searching for: ${keyword}`);

    // 输入搜索关键词
    await this.client.fill(this.selectors.searchInput, keyword);
    await delay(500);

    // 点击搜索按钮
    await this.client.click(this.selectors.searchButton);
    await delay(3000);

    logger.info("Search completed");
  }

  /**
   * 获取搜索结果数量
   * @returns {Promise<number>} 搜索结果数量
   */
  async getResultCount() {
    const result = await this.client.evaluate(`
      document.querySelectorAll('${this.selectors.searchResults}').length
    `);
    return result?.content?.[0]?.text ? parseInt(result.content[0].text) : 0;
  }

  /**
   * 获取页面标题
   * @returns {Promise<string>} 页面标题
   */
  async getPageTitle() {
    const result = await this.client.evaluate("document.title");
    return result?.content?.[0]?.text || "";
  }

  /**
   * 截取当前页面截图
   * @param {string} name - 截图名称
   * @returns {Promise<string|null>} 保存的文件路径
   */
  async takeScreenshot(name) {
    const result = await this.client.screenshot(name, undefined, 1920, 1080);

    if (result?.content?.[0]?.data) {
      const filename = generateTimestampedFilename(name, "png");
      const savedPath = saveScreenshot(result.content[0].data, filename);
      logger.info(`Screenshot saved: ${savedPath}`);
      return savedPath;
    }

    return null;
  }

  /**
   * 点击第一个搜索结果
   */
  async clickFirstResult() {
    logger.info("Clicking first search result...");
    try {
      await this.client.click(this.selectors.resultTitle);
      await delay(2000);
      logger.info("Clicked first result");
    } catch (error) {
      logger.warn(`Could not click first result: ${error.message}`);
    }
  }

  /**
   * 悬停在 Logo 上
   */
  async hoverLogo() {
    logger.info("Hovering over Baidu logo...");
    try {
      await this.client.hover(this.selectors.logo);
      await delay(1000);
      logger.info("Hovered over logo");
    } catch (error) {
      logger.warn(`Could not hover over logo: ${error.message}`);
    }
  }

  /**
   * 清理并断开连接
   */
  async cleanup() {
    logger.info("Cleaning up...");
    await this.client.disconnect();
    logger.info("Disconnected");
  }

  /**
   * 运行完整的自动化流程
   * @param {string} keyword - 搜索关键词
   */
  async runFullDemo(keyword = "MCP Puppeteer") {
    try {
      await this.init();

      // 1. 打开首页
      await this.openHomepage();
      await this.takeScreenshot("01_homepage");

      // 2. 悬停在 Logo 上
      await this.hoverLogo();
      await this.takeScreenshot("02_hover_logo");

      // 3. 执行搜索
      await this.search(keyword);
      await this.takeScreenshot("03_search_results");

      // 4. 获取搜索结果信息
      const resultCount = await this.getResultCount();
      const pageTitle = await this.getPageTitle();

      logger.info(`Page Title: ${pageTitle}`);
      logger.info(`Result Count: ${resultCount}`);

      // 5. 点击第一个结果
      await this.clickFirstResult();
      await this.takeScreenshot("04_after_click");

      logger.info("Full demo completed successfully!");
    } catch (error) {
      logger.error(`Demo failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 运行示例
async function main() {
  const automation = new BaiduAutomation();

  // 从命令行参数获取搜索关键词
  const keyword = process.argv[2] || "Model Context Protocol";

  console.log("\n🔍 Baidu Automation Demo");
  console.log("========================");
  console.log(`Search keyword: ${keyword}\n`);

  await automation.runFullDemo(keyword);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

export default BaiduAutomation;
