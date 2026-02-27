/**
 * 辅助工具函数
 * Helper Utilities
 */

import fs from "fs";
import path from "path";
import { config } from "../config/index.js";

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 生成带时间戳的文件名
 * @param {string} prefix - 文件名前缀
 * @param {string} extension - 文件扩展名
 * @returns {string} 生成的文件名
 */
export function generateTimestampedFilename(prefix, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * 保存截图到文件
 * @param {string} base64Data - Base64 编码的图片数据
 * @param {string} filename - 文件名
 * @returns {string} 保存的文件路径
 */
export function saveScreenshot(base64Data, filename) {
  ensureDirectoryExists(config.screenshot.outputDir);
  const filePath = path.join(config.screenshot.outputDir, filename);
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 格式化工具列表输出
 * @param {Array} tools - 工具列表
 * @returns {string} 格式化后的字符串
 */
export function formatToolsList(tools) {
  if (!tools || tools.length === 0) {
    return "No tools available";
  }

  return tools
    .map((tool, index) => {
      const params = tool.inputSchema?.properties
        ? Object.keys(tool.inputSchema.properties).join(", ")
        : "none";
      return `${index + 1}. ${tool.name}\n   Description: ${tool.description || "N/A"}\n   Parameters: ${params}`;
    })
    .join("\n\n");
}

/**
 * 安全的 JSON 解析
 * @param {string} jsonString - JSON 字符串
 * @param {*} defaultValue - 解析失败时的默认值
 * @returns {*} 解析结果或默认值
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * 截断字符串
 * @param {string} str - 原始字符串
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的字符串
 */
export function truncateString(str, maxLength = 100) {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + "...";
}

export default {
  ensureDirectoryExists,
  generateTimestampedFilename,
  saveScreenshot,
  delay,
  formatToolsList,
  safeJsonParse,
  truncateString,
};

/**
 * 从 MCP 截图结果中提取 base64 数据并保存
 * @param {Object} result - MCP 截图返回结果
 * @param {string} name - 截图名称前缀
 * @returns {string|null} 保存的文件路径，失败返回 null
 */
export function saveScreenshotFromResult(result, name) {
  if (!result?.content) {
    return null;
  }

  // 遍历 content 数组查找 base64 数据
  for (const item of result.content) {
    // 检查 data 字段（image 类型）
    if (item.data) {
      const filename = generateTimestampedFilename(name, "png");
      return saveScreenshot(item.data, filename);
    }

    // 检查 text 字段中的 data:image/png;base64 格式
    if (item.text && item.text.includes("data:image/png;base64,")) {
      const base64Data = item.text.split("data:image/png;base64,")[1];
      if (base64Data) {
        const filename = generateTimestampedFilename(name, "png");
        return saveScreenshot(base64Data, filename);
      }
    }
  }

  return null;
}
