# Stage 1: Build Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY gofigeeks-gql-frontend/package*.json ./
RUN npm install
COPY gofigeeks-gql-frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS build-backend
WORKDIR /app
COPY gofigeeks-gql-backend/package*.json ./
RUN npm install
COPY gofigeeks-gql-backend/ ./
# If you have a build step (like tsc), add it here
# RUN npm run build 

# Stage 3: Final Production Image
FROM node:20-alpine
WORKDIR /app
# Copy backend files
COPY --from=build-backend /app /app
# Copy frontend build output into the 'public' folder
COPY --from=build-frontend /app/dist /app/public

EXPOSE 4000
CMD ["node", "src/index.js"]