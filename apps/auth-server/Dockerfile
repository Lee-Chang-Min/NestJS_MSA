FROM node:18-alpine

RUN npm i -g pnpm 

WORKDIR /app

COPY package*.json pnpm-lock.yaml tsconfig*.json nest-cli.json ./

# 앱 소스 복사
COPY apps/auth-server ./apps/auth-server
COPY apps/libs ./apps/libs

# 의존성 설치 및 빌드
RUN pnpm install --frozen-lockfile
RUN pnpm run build:auth

ENV AUTH_SERVICE_PORT=3001

# 포트 노출
EXPOSE 3001

# 앱 실행
CMD ["node", "dist/apps/auth-server/main.js"]