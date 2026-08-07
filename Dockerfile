# 自然拼读星 · 微信云托管后端镜像
FROM node:18-alpine

WORKDIR /app

# 仅安装后端依赖
COPY server/package.json ./package.json
RUN npm install --production

# 复制后端代码
COPY server/ ./

EXPOSE 80
ENV PORT=80

CMD ["node", "index.js"]
