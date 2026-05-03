# ============================================
# Dockerfile para el servicio "web" (Node + Express)
# ============================================

# Imagen base ligera con Node 20
FROM node:20-alpine

# wget se usa en el healthcheck del docker-compose
RUN apk add --no-cache wget

# Carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos primero los manifests para aprovechar la cache de Docker:
# si package.json no cambia, no se reinstalan dependencias.
COPY package*.json ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

# Copiamos el resto del código
COPY . .

# El contenedor escucha en 3000 (mismo puerto que el compose expone internamente)
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
CMD ["node", "index.js"]
