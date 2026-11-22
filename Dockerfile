# Dockerfile para DocuHub
FROM node:18-alpine AS base

# Instalar dependências necessárias para better-sqlite3
RUN apk add --no-cache python3 make g++

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Criar diretórios necessários
RUN mkdir -p /app/data /app/public && \
    touch /app/public/.gitkeep && \
    touch /app/data/.gitkeep

# Build da aplicação
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/scripts ./scripts
# Diretório data será criado via volume no docker-compose
RUN mkdir -p /app/data

# Instalar apenas better-sqlite3 para produção
RUN npm install better-sqlite3

# Dar permissões ao diretório de dados
RUN chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 5055

ENV PORT=5055
ENV HOSTNAME="0.0.0.0"

# Iniciar aplicação
CMD ["node", "server.js"]

