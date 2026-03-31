FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npx playwright install --with-deps chromium

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]
