# TikTok-clone GraphQL backend.
# Runs migrations then boots the server. Uses tsx at runtime so TS path aliases
# (#/*, @/*) and extensionless ESM imports resolve exactly as they do in dev.
FROM node:24-alpine

WORKDIR /app

# Install dependencies (incl. drizzle-kit for migrations at startup).
COPY package.json package-lock.json ./
RUN npm ci

# App source + drizzle migration files.
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# Apply pending migrations, then start the server.
CMD ["npm", "run", "migrate:start"]
