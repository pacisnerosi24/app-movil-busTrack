# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app

# Instalamos pnpm y nest-cli globalmente
RUN npm install -g pnpm @nestjs/cli

# Copiamos los archivos de paquetes
COPY package.json pnpm-lock.yaml ./

# TRUCO MÁGICO PARA DOCKER + PNPM: 
# Usamos un archivo .npmrc temporal para forzar dependencias "hoisted" (planas)
RUN echo "node-linker=hoisted" > .npmrc

# Instalamos todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código y construimos
COPY . .
RUN pnpm build

# Etapa 2: Producción (Imagen final súper ligera)
FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN echo "node-linker=hoisted" > .npmrc

# Instalamos SOLO dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiamos el código compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]