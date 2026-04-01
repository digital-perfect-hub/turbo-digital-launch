FROM mcr.microsoft.com/playwright:v1.59.0-noble

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app

# Wir kopieren ABSICHTLICH nur die package.json und ignorieren die monorepo-vergiftete Lockfile
COPY package.json ./

# Wir nutzen npm install statt npm ci, um den fatalen Auflösungs-Crash zu umgehen
RUN npm install --omit=dev && npm cache clean --force

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]