FROM node:18-alpine

RUN npm i -g pnpm 

WORKDIR /app

COPY package*.json pnpm-lock.yaml tsconfig*.json nest-cli.json ./

# 앱 소스 복사
COPY apps/event-server ./apps/event-server
COPY apps/libs ./apps/libs

# 의존성 설치 및 빌드
RUN pnpm install --frozen-lockfile
RUN pnpm run build:event

ENV EVENT_SERVICE_PORT=3002

# 포트 노출
EXPOSE 3002

# 앱 실행
CMD ["node", "dist/apps/event-server/main.js"]