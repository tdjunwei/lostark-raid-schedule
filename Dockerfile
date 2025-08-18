# Lost Ark 副本日程表系統 Dockerfile
# 多階段建構，優化映像大小和建構速度

# 階段 1: 依賴安裝階段
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 複製 package 文件
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# 階段 2: 建構階段
FROM node:22-alpine AS builder
WORKDIR /app

# 複製所有依賴
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安裝開發依賴並建構
RUN npm ci
RUN npm run build

# 階段 3: 運行階段
FROM node:22-alpine AS runner
WORKDIR /app

# 建立非 root 用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要文件
COPY --from=builder /app/public ./public

# 設置正確的權限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 複製建構產物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 複製 Supabase 配置和遷移文件
COPY --from=builder --chown=nextjs:nodejs /app/supabase ./supabase

# 切換到非 root 用戶
USER nextjs

# 暴露端口
EXPOSE 3000

# 設置環境變數
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# 啟動應用
CMD ["node", "server.js"]