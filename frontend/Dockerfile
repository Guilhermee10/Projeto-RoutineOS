# syntax=docker/dockerfile:1
# Frontend: o Vite gera arquivos estáticos (estágio build) e o nginx só os serve.

FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
# Endereço da API "assado" no JavaScript na hora do build (é o endereço que o
# NAVEGADOR usa, por isso é localhost e não o nome do container)
ARG VITE_API_URL=http://localhost:3333/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# nginx-unprivileged: roda sem root, na porta 8080
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
