/**
 * MCP Server 连接测试脚本
 * 用于验证 MCP Server 是否正常工作
 */

import McpClient from "./client/McpClient.js";
import logger from "./utils/logger.js";

async function testConnection() {
  const client = new McpClient();
  let success = true;

  console.log("\n🔍 MCP Puppeteer Server Connection Test");
  console.log("========================================\n");

  try {
    // Test 1: 连接测试
    console.log("Test 1: Connection");
    console.log("------------------");
    await client.connect();
    console.log("✅ PASS: Successfully connected to MCP Server\n");

    // Test 2: 工具列表测试
    console.log("Test 2: List Tools");
    console.log("------------------");
    const tools = await client.listTools();
    if (tools && tools.length > 0) {
      console.log(`✅ PASS: Found ${tools.length} tools`);
      tools.forEach((tool) => {
        console.log(`   - ${tool.name}`);
      });
    } else {
      console.log("❌ FAIL: No tools found");
      success = false;
    }
    console.log("");

    // Test 3: 导航测试
    console.log("Test 3: Navigation");
    console.log("------------------");
    try {
      await client.navigate("https://www.baidu.com");
      console.log("✅ PASS: Navigation successful\n");
    } catch (error) {
      console.log(`❌ FAIL: Navigation failed - ${error.message}\n`);
      success = false;
    }

    // Test 4: 截图测试
    console.log("Test 4: Screenshot");
    console.log("------------------");
    try {
      const result = await client.screenshot(
        "test_screenshot",
        undefined,
        800,
        600,
      );
      if (result) {
        console.log("✅ PASS: Screenshot successful\n");
      } else {
        console.log("❌ FAIL: Screenshot returned empty result\n");
        success = false;
      }
    } catch (error) {
      console.log(`❌ FAIL: Screenshot failed - ${error.message}\n`);
      success = false;
    }

    // Test 5: JavaScript 执行测试
    console.log("Test 5: JavaScript Evaluation");
    console.log("-----------------------------");
    try {
      const evalResult = await client.evaluate("document.title");
      console.log(`✅ PASS: JavaScript evaluation successful`);
      console.log(`   Page title: ${JSON.stringify(evalResult)}\n`);
    } catch (error) {
      console.log(`❌ FAIL: JavaScript evaluation failed - ${error.message}\n`);
      success = false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}\n`);
    success = false;
  } finally {
    await client.disconnect();
  }

  // 总结
  console.log("========================================");
  if (success) {
    console.log("🎉 All tests passed!");
    console.log("The MCP Puppeteer Server is working correctly.\n");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed.");
    console.log("Please check the error messages above.\n");
    process.exit(1);
  }
}

testConnection();
