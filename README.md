# 🐳 TP02 Docker - Aplicación Node.js con MySQL

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

Aplicación web containerizada con Node.js y Express que se conecta a una base de datos MySQL, configurada para correr en dos entornos diferentes (QA y PROD) usando Docker Compose.

## 📋 Contenido

- [Requisitos](#-requisitos)
- [Instalación Rápida](#-instalación-rápida)
- [Comandos Principales](#-comandos-principales)
- [URLs y Endpoints](#-urls-y-endpoints)
- [Verificación de Funcionamiento](#-verificación-de-funcionamiento)
- [Gestión de Contenedores](#-gestión-de-contenedores)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)

---

## 🔧 Requisitos

- **Docker** >= 20.0
- **Docker Compose** >= 2.0
- **Git** para clonar el repositorio

### Verificar instalación:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/baltasarlopezv/2025_TP02_Docker.git
cd 2025_TP02_Docker
```

### 2. Levantar todos los servicios
```bash
docker-compose up -d
```

### 3. Verificar que está funcionando
```bash
# Ver contenedores en ejecución
docker ps

# Probar endpoint QA
curl http://localhost:3000

# Probar endpoint PROD
curl http://localhost:3001
```

---

## 📝 Comandos Principales

### Levantar servicios

```bash
# Levantar en primer plano (ver logs en tiempo real)
docker-compose up

# Levantar en segundo plano (modo detached)
docker-compose up -d

# Reconstruir imágenes y levantar
docker-compose up --build

# Levantar solo un servicio específico
docker-compose up mysql
docker-compose up app-qa
```

### Detener servicios

```bash
# Detener contenedores (mantiene volúmenes y redes)
docker-compose stop

# Detener y remover contenedores, redes
docker-compose down

# Detener, remover contenedores, redes Y volúmenes (⚠️ BORRA DATOS)
docker-compose down -v
```

### Ver estado y logs

```bash
# Ver contenedores en ejecución
docker ps

# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs app-qa
docker-compose logs mysql

# Seguir logs en tiempo real
docker-compose logs -f
```

### Gestión de la imagen

```bash
# Descargar imagen desde Docker Hub
docker pull baltasarlopezv/tp02-docker-app:v1.0

# Construir imagen localmente (si modificás código)
docker build -t baltasarlopezv/tp02-docker-app:v1.0 .

# Ver imágenes disponibles
docker images

# Remover imagen local
docker rmi baltasarlopezv/tp02-docker-app:v1.0
```

---

## 🌐 URLs y Endpoints

### Aplicación QA (Puerto 3000)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| [http://localhost:3000](http://localhost:3000) | GET | Página principal QA |
| [http://localhost:3000/health](http://localhost:3000/health) | GET | Estado de salud |
| [http://localhost:3000/messages](http://localhost:3000/messages) | GET | Mensajes de QA |
| [http://localhost:3000/messages](http://localhost:3000/messages) | POST | Crear mensaje QA |

### Aplicación PROD (Puerto 3001)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| [http://localhost:3001](http://localhost:3001) | GET | Página principal PROD |
| [http://localhost:3001/health](http://localhost:3001/health) | GET | Estado de salud |
| [http://localhost:3001/messages](http://localhost:3001/messages) | GET | Mensajes de PROD |
| [http://localhost:3001/messages](http://localhost:3001/messages) | POST | Crear mensaje PROD |

### Base de Datos MySQL (Puerto 3306)

- **Host:** localhost:3306
- **Usuario:** appuser
- **Contraseña:** apppassword123
- **Base de datos:** dockerapp

---

## ✅ Verificación de Funcionamiento

### 1. Verificar que los contenedores están corriendo
```bash
docker ps
```
**Esperado:** 3 contenedores en estado "Up" (mysql-db, dockerapp-qa, dockerapp-prod)

### 2. Probar endpoints principales
```bash
# QA
curl http://localhost:3000
# Esperado: {"message":"Hola desde la aplicación en entorno: QA",...}

# PROD  
curl http://localhost:3001
# Esperado: {"message":"Hola desde la aplicación en entorno: PROD",...}
```

### 3. Verificar conexión a base de datos
```bash
# Mensajes de QA
curl http://localhost:3000/messages
# Esperado: {"environment":"QA","messages":[...]}

# Mensajes de PROD
curl http://localhost:3001/messages  
# Esperado: {"environment":"PROD","messages":[...]}
```

### 4. Probar creación de mensajes
```bash
# Crear mensaje en QA
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"Test desde QA"}'

# Crear mensaje en PROD
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"Test desde PROD"}'
```

### 5. Verificar persistencia de datos
```bash
# Detener contenedores
docker-compose down

# Volver a levantar
docker-compose up -d

# Verificar que los datos se mantuvieron
curl http://localhost:3000/messages
curl http://localhost:3001/messages
```

---

## 🛠️ Gestión de Contenedores

### Acceder a un contenedor

```bash
# Acceder al contenedor de MySQL
docker exec -it mysql-db bash
mysql -u appuser -p dockerapp

# Acceder al contenedor de la aplicación
docker exec -it dockerapp-qa sh
docker exec -it dockerapp-prod sh
```

### Reiniciar servicios

```bash
# Reiniciar un servicio específico
docker-compose restart app-qa
docker-compose restart mysql

# Reiniciar todos los servicios
docker-compose restart
```

### Limpiar sistema

```bash
# Remover contenedores parados
docker container prune

# Remover imágenes no utilizadas
docker image prune

# Limpiar todo (contenedores, imágenes, redes, cache)
docker system prune -a

# ⚠️ Limpiar INCLUYENDO volúmenes (borra datos)
docker system prune -a --volumes
```

---

## 📁 Estructura del Proyecto

```
2025_TP02_Docker/
├── app.js              # Aplicación Node.js principal
├── package.json        # Dependencias de Node.js
├── Dockerfile          # Instrucciones para construir imagen
├── docker-compose.yml  # Configuración multi-servicio
├── init.sql           # Script de inicialización MySQL
├── .dockerignore      # Archivos ignorados por Docker
├── README.md          # Este archivo
└── decisiones.md      # Justificaciones técnicas
```

---

## 🔧 Variables de Entorno

### Aplicación

| Variable | QA | PROD | Descripción |
|----------|-----|------|-------------|
| `PORT` | 3000 | 3000 | Puerto interno del contenedor |
| `ENVIRONMENT` | QA | PROD | Entorno de ejecución |
| `DB_HOST` | mysql | mysql | Host de la base de datos |
| `DB_PORT` | 3306 | 3306 | Puerto de MySQL |
| `DB_USER` | appuser | appuser | Usuario de base de datos |
| `DB_PASSWORD` | apppassword123 | apppassword123 | Contraseña de BD |
| `DB_NAME` | dockerapp | dockerapp | Nombre de la base de datos |

### MySQL

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MYSQL_ROOT_PASSWORD` | rootpassword123 | Contraseña del usuario root |
| `MYSQL_DATABASE` | dockerapp | Base de datos a crear |
| `MYSQL_USER` | appuser | Usuario de aplicación |
| `MYSQL_PASSWORD` | apppassword123 | Contraseña del usuario |

---

## 🐛 Solución de Problemas

### Error: "Port already in use"
```bash
# Ver qué está usando el puerto
lsof -i :3000
lsof -i :3001
lsof -i :3306

# Detener Docker Compose si está corriendo
docker-compose down
```

### Error: "Cannot connect to MySQL"
```bash
# Verificar que MySQL esté healthy
docker ps

# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar MySQL
docker-compose restart mysql
```

### Los datos se perdieron
```bash
# Verificar que el volumen existe
docker volume ls

# Ver información del volumen
docker volume inspect 2025_tp02_docker_mysql_data
```

---

## 📞 Información Adicional

- **Autor:** Baltasar Lopez
- **Docker Hub:** [baltasarlopezv/tp02-docker-app](https://hub.docker.com/r/baltasarlopezv/tp02-docker-app)
- **Repositorio:** [GitHub](https://github.com/baltasarlopezv/2025_TP02_Docker)
- **Curso:** Ingeniería de Software III - UCC

---

## 📈 Tags de Imagen

- `baltasarlopezv/tp02-docker-app:v1.0` - Versión estable
- `baltasarlopezv/tp02-docker-app:latest` - Última versión

---

**¡Listo para usar!** 🚀