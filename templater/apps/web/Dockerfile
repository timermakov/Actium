FROM node:22-bullseye AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8001
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && mkdir -p /var/cache/nginx /var/run /var/log/nginx \
    && chown -R appuser:appgroup /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
