FROM node:18-bookworm-slim AS builder

WORKDIR /build

COPY services/app-frontend/package.json services/app-frontend/package-lock.json* /build/services/app-frontend/

WORKDIR /build/services/app-frontend
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY services/app-frontend/ /build/services/app-frontend/

# Set a default version for the build (git not available in container)
ARG REACT_APP_VERSION=dev
ENV REACT_APP_VERSION=${REACT_APP_VERSION}

RUN npm run build

FROM nginx:stable-bookworm

COPY --from=builder /build/services/app-frontend/build /usr/share/nginx/html

# Nginx config: SPA routing + reverse proxy to backend services
COPY services/app-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4040

CMD ["nginx", "-g", "daemon off;"]
