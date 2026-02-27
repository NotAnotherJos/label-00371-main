/**
 * 高级操作示例
 * Advanced Operations Example
 *
 * 演示更多 MCP Puppeteer 的高级功能
 */

import McpClient from "../client/McpClient.js";
import logger from "../utils/logger.js";
import {
  delay,
  saveScreenshot,
  generateTimestampedFilename,
} from "../utils/helpers.js";

/**
 * 高级操作演示
 */
async function advancedOperationsDemo() {
  const client = new McpClient();

  try {
    await client.connect();
    logger.info("Connected to MCP Server");

    // 获取所有可用工具
    const tools = await client.listTools();
    logger.info(`Available tools: ${tools.map((t) => t.name).join(", ")}`);

    // 1. 导航到百度
    logger.info("\n--- Navigation Demo ---");
    await client.navigate("https://www.baidu.com");
    await delay(2000);

    // 2. 执行复杂的 JavaScript
    logger.info("\n--- JavaScript Evaluation Demo ---");

    // 获取页面元数据
    const metaInfo = await client.evaluate(`
      JSON.stringify({
        title: document.title,
        url: window.location.href,
        charset: document.characterSet,
        doctype: document.doctype ? document.doctype.name : 'none',
        links: document.links.length,
        images: document.images.length,
        scripts: document.scripts.length,
        stylesheets: document.styleSheets.length,
        cookies: document.cookie ? 'present' : 'none',
        localStorage: typeof localStorage !== 'undefined' ? 'available' : 'unavailable',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    `);
    logger.info(`Page metadata: ${JSON.stringify(metaInfo, null, 2)}`);

    // 3. 修改页面样式
    logger.info("\n--- Style Modification Demo ---");
    await client.evaluate(`
      // 添加自定义样式
      const style = document.createElement('style');
      style.textContent = \`
        body {
          border: 5px solid red !important;
        }
        #kw {
          background-color: #ffffcc !important;
          border: 2px solid #ff6600 !important;
        }
      \`;
      document.head.appendChild(style);
    `);
    await delay(500);

    // 截图展示修改后的样式
    const styleResult = await client.screenshot(
      "style_modified",
      undefined,
      1920,
      1080,
    );
    if (styleResult?.content?.[0]?.data) {
      const filename = generateTimestampedFilename("style_modified", "png");
      saveScreenshot(styleResult.content[0].data, filename);
      logger.info("Style modification screenshot saved");
    }

    // 4. 表单交互演示
    logger.info("\n--- Form Interaction Demo ---");

    // 聚焦搜索框
    await client.evaluate(`document.querySelector('#kw').focus()`);
    await delay(300);

    // 输入文字
    await client.fill("#kw", "MCP Puppeteer 自动化测试");
    await delay(500);

    // 截图
    const formResult = await client.screenshot(
      "form_filled",
      undefined,
      1920,
      1080,
    );
    if (formResult?.content?.[0]?.data) {
      const filename = generateTimestampedFilename("form_filled", "png");
      saveScreenshot(formResult.content[0].data, filename);
      logger.info("Form interaction screenshot saved");
    }

    // 5. 滚动操作
    logger.info("\n--- Scroll Demo ---");

    // 先执行搜索
    await client.click("#su");
    await delay(3000);

    // 滚动到页面底部
    await client.evaluate(`
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    `);
    await delay(1000);

    const scrollResult = await client.screenshot(
      "scrolled_bottom",
      undefined,
      1920,
      1080,
    );
    if (scrollResult?.content?.[0]?.data) {
      const filename = generateTimestampedFilename("scrolled_bottom", "png");
      saveScreenshot(scrollResult.content[0].data, filename);
      logger.info("Scroll screenshot saved");
    }

    // 滚动回顶部
    await client.evaluate(`
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    `);
    await delay(1000);

    // 6. 元素高亮
    logger.info("\n--- Element Highlight Demo ---");
    await client.evaluate(`
      // 高亮所有搜索结果
      document.querySelectorAll('.result').forEach((el, index) => {
        el.style.border = '2px solid #' + Math.floor(Math.random()*16777215).toString(16);
        el.style.borderRadius = '8px';
        el.style.padding = '10px';
        el.style.margin = '5px 0';
      });
    `);
    await delay(500);

    const highlightResult = await client.screenshot(
      "highlighted_results",
      undefined,
      1920,
      1080,
    );
    if (highlightResult?.content?.[0]?.data) {
      const filename = generateTimestampedFilename(
        "highlighted_results",
        "png",
      );
      saveScreenshot(highlightResult.content[0].data, filename);
      logger.info("Highlight screenshot saved");
    }

    // 7. 获取搜索结果数据
    logger.info("\n--- Data Extraction Demo ---");
    const searchResults = await client.evaluate(`
      JSON.stringify(
        Array.from(document.querySelectorAll('.result h3 a')).slice(0, 5).map((a, i) => ({
          index: i + 1,
          title: a.textContent.trim(),
          href: a.href
        }))
      )
    `);
    logger.info(`Search results: ${JSON.stringify(searchResults, null, 2)}`);

    logger.info("\n✅ Advanced operations demo completed!");
  } catch (error) {
    logger.error(`Demo failed: ${error.message}`);
    throw error;
  } finally {
    await client.disconnect();
  }
}

// 运行
advancedOperationsDemo().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

export { advancedOperationsDemo };
