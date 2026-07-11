# Build the Vite SPA, then serve the static bundle with nginx.
# VITE_API_URL is baked in at build time (Vite inlines import.meta.env), so pass
# it as a build arg pointing at your deployed backend's GraphQL endpoint.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:4000/graphql
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
