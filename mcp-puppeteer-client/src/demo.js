/**
 * MCP Puppeteer Client Demo
 * 演示如何连接 MCP Server 并操作百度网页
 */

import McpClient from "./client/McpClient.js";
import logger from "./utils/logger.js";
import {
  delay,
  formatToolsList,
  saveScreenshot,
  generateTimestampedFilename,
  saveScreenshotFromResult,
} from "./utils/helpers.js";
import { config } from "./config/index.js";

async function main() {
  const client = new McpClient();

  try {
    // ========================================
    // Step 1: 连接到 MCP Server
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 1: Connecting to MCP Puppeteer Server");
    logger.info("=".repeat(60));

    await client.connect();
    logger.info("Connection established successfully!\n");

    // ========================================
    // Step 2: 获取可用工具列表
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 2: Listing Available Tools");
    logger.info("=".repeat(60));

    const tools = await client.listTools();
    console.log("\n" + formatToolsList(tools) + "\n");

    // ========================================
    // Step 3: 导航到百度首页
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 3: Navigating to Baidu Homepage");
    logger.info("=".repeat(60));

    const baiduUrl = config.testUrls.baidu;
    const navResult = await client.navigate(baiduUrl);
    logger.info(`Navigation result: ${JSON.stringify(navResult, null, 2)}`);

    // 等待页面加载
    await delay(2000);

    // ========================================
    // Step 4: 截取百度首页截图
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 4: Taking Screenshot of Baidu Homepage");
    logger.info("=".repeat(60));

    const screenshotResult1 = await client.screenshot(
      "baidu_homepage",
      undefined,
      1920,
      1080,
    );
    logger.info("Homepage screenshot taken");

    // 保存截图
    const savedPath1 = saveScreenshotFromResult(
      screenshotResult1,
      "baidu_homepage",
    );
    if (savedPath1) {
      logger.info(`Screenshot saved to: ${savedPath1}`);
    } else {
      logger.info("Screenshot stored as MCP resource (not saved locally)");
    }

    // ========================================
    // Step 5: 在搜索框中输入文字
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 5: Filling Search Input");
    logger.info("=".repeat(60));

    // 百度搜索框的选择器
    const searchInputSelector = "#kw";
    const searchKeyword = "Model Context Protocol";

    await client.fill(searchInputSelector, searchKeyword);
    logger.info(`Filled search input with: "${searchKeyword}"`);

    await delay(1000);

    // ========================================
    // Step 6: 截取输入后的截图
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 6: Taking Screenshot After Input");
    logger.info("=".repeat(60));

    const screenshotResult2 = await client.screenshot(
      "baidu_after_input",
      undefined,
      1920,
      1080,
    );
    logger.info("Screenshot after input taken");

    const savedPath2 = saveScreenshotFromResult(
      screenshotResult2,
      "baidu_after_input",
    );
    if (savedPath2) {
      logger.info(`Screenshot saved to: ${savedPath2}`);
    }

    // ========================================
    // Step 7: 点击搜索按钮
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 7: Clicking Search Button");
    logger.info("=".repeat(60));

    // 使用键盘回车来触发搜索（更可靠）
    await client.evaluate(`
      document.querySelector('#kw').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
      document.querySelector('#su').click();
    `);
    logger.info("Search triggered via Enter key and button click");

    // 等待搜索结果加载
    await delay(5000);

    // ========================================
    // Step 8: 截取搜索结果截图
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 8: Taking Screenshot of Search Results");
    logger.info("=".repeat(60));

    const screenshotResult3 = await client.screenshot(
      "baidu_search_results",
      undefined,
      1920,
      1080,
    );
    logger.info("Search results screenshot taken");

    const savedPath3 = saveScreenshotFromResult(
      screenshotResult3,
      "baidu_search_results",
    );
    if (savedPath3) {
      logger.info(`Screenshot saved to: ${savedPath3}`);
    }

    // ========================================
    // Step 9: 执行 JavaScript 获取页面信息
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 9: Executing JavaScript to Get Page Info");
    logger.info("=".repeat(60));

    const evalResult = await client.evaluate(`
      JSON.stringify({
        title: document.title,
        url: window.location.href,
        resultCount: document.querySelectorAll('.result').length,
        timestamp: new Date().toISOString()
      })
    `);
    logger.info(`Page info: ${JSON.stringify(evalResult, null, 2)}`);

    // ========================================
    // Step 10: 悬停在第一个搜索结果上
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Step 10: Hovering Over First Search Result");
    logger.info("=".repeat(60));

    try {
      // 尝试悬停在第一个搜索结果链接上
      await client.hover(".result h3 a");
      logger.info("Hovered over first search result");

      await delay(1000);

      // 截取悬停后的截图
      const screenshotResult4 = await client.screenshot(
        "baidu_hover_result",
        undefined,
        1920,
        1080,
      );
      const savedPath4 = saveScreenshotFromResult(
        screenshotResult4,
        "baidu_hover_result",
      );
      if (savedPath4) {
        logger.info(`Screenshot saved to: ${savedPath4}`);
      }
    } catch (error) {
      logger.warn(`Could not hover over search result: ${error.message}`);
    }

    // ========================================
    // 完成
    // ========================================
    logger.info("=".repeat(60));
    logger.info("Demo Completed Successfully!");
    logger.info("=".repeat(60));
    logger.info(
      "All screenshots have been saved to the ./screenshots directory",
    );
  } catch (error) {
    logger.error(`Demo failed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    // 断开连接
    await client.disconnect();
  }
}

// 运行 Demo
main().catch((error) => {
  logger.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
