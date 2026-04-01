FROM mcr.microsoft.com/playwright:v1.53.2-noble

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
