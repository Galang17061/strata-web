FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_FILES_BASE_URL=
ARG NEXT_PUBLIC_ACCESS_TOKEN_NAME=strata_token
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_FILES_BASE_URL=$NEXT_PUBLIC_FILES_BASE_URL \
    NEXT_PUBLIC_ACCESS_TOKEN_NAME=$NEXT_PUBLIC_ACCESS_TOKEN_NAME \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost/ >/dev/null || exit 1
