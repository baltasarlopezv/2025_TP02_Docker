# Imagen base oficial de Node.js (ligera)
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero (para instalar dependencias)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código al contenedor
COPY . .

# Exponer el puerto 3000 para que Docker lo publique
EXPOSE 3000

# Comando por defecto para ejecutar la app
CMD ["npm", "start"]
