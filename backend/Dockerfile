# syntax=docker/dockerfile:1
# Imagem do backend em 3 estágios:
#   build   -> instala TUDO (inclui o CLI do Prisma) e gera o Prisma Client
#   migrate -> usado só pelo serviço "migrate" do compose (prisma migrate deploy)
#   runtime -> imagem final, enxuta: só dependências de produção, usuário sem privilégios

FROM node:20-slim AS build
WORKDIR /app
# O Prisma precisa do OpenSSL no Linux
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY prisma ./prisma
RUN npx prisma generate

FROM build AS migrate
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
# O cliente gerado (e o motor de consultas) vem do estágio build
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
# Roda como o usuário "node" (sem root): se alguém explorar uma falha, o estrago é menor
USER node
EXPOSE 3333
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3333/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
