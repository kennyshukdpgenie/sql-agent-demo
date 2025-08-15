FROM node:18-slim

# 安装依赖
RUN apt-get update && apt-get install -y \
  default-mysql-client \
  curl \
  gnupg \
  && rm -rf /var/lib/apt/lists/*

# 安装 n8n v1.81.0
RUN npm install -g n8n@1.81.0

# 创建工作目录
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node

USER node
WORKDIR /home/node

# 默认端口
EXPOSE 5678

CMD ["n8n"]
