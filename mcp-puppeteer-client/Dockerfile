# MCP Puppeteer Client Dockerfile
# 支持 ARM64 和 AMD64 架构

FROM --platform=$BUILDPLATFORM node:20-slim AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 生产镜像
FROM --platform=$TARGETPLATFORM node:20-slim

# 安装 Puppeteer 依赖
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 设置 Puppeteer 环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 创建非 root 用户并设置 home 目录
RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# 创建截图、日志和 npm 缓存目录
RUN mkdir -p screenshots logs /home/appuser/.npm && \
    chown -R appuser:appuser /app /home/appuser

# 设置 npm 缓存目录
ENV NPM_CONFIG_CACHE=/home/appuser/.npm

# 切换到非 root 用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# 默认命令
CMD ["node", "src/demo.js"]
