# 🐳 TP02 Docker - Aplicación Node.js con MySQL

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

Aplicación web containerizada con Node.js y Express que se conecta a bases de datos MySQL separadas por entorno, configurada para correr en QA y PROD con aislamiento total de datos.

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
# Ver contenedores en ejecución (deberías ver 4: 2 apps + 2 MySQL)
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

```bash
# Levantar solo servicios específicos
docker-compose up mysql-qa mysql-prod  # Solo las bases de datos
docker-compose up app-qa               # Solo QA
docker-compose up app-prod             # Solo PROD
```
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

```bash
# Ver logs de servicios específicos
docker-compose logs app-qa
docker-compose logs app-prod
docker-compose logs mysql-qa
docker-compose logs mysql-prod

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

### Base de Datos MySQL

#### QA Environment (Puerto 3306)
- **Host:** localhost:3306
- **Usuario:** appuser
- **Contraseña:** apppassword123
- **Base de datos:** dockerapp_qa

#### PROD Environment (Puerto 3307) 
- **Host:** localhost:3307
- **Usuario:** produser
- **Contraseña:** prodpassword456
- **Base de datos:** dockerapp_prod

---

## ✅ Verificación de Funcionamiento

### 1. Verificar que los contenedores están corriendo
```bash
docker ps
```
**Esperado:** 4 contenedores en estado "Up": 
- `mysql-qa`, `mysql-prod` (bases de datos)
- `dockerapp-qa`, `dockerapp-prod` (aplicaciones)

### 2. Probar endpoints principales
```bash
# QA
curl http://localhost:3000
# Esperado: {"message":"Hola desde la aplicación en entorno: QA","database":"mysql-qa:3306/dockerapp_qa",...}

# PROD  
curl http://localhost:3001
# Esperado: {"message":"Hola desde la aplicación en entorno: PROD","database":"mysql-prod:3306/dockerapp_prod",...}
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
# Acceder al contenedor de MySQL QA
docker exec -it mysql-qa bash
mysql -u appuser -p dockerapp_qa

# Acceder al contenedor de MySQL PROD  
docker exec -it mysql-prod bash
mysql -u produser -p dockerapp_prod

# Acceder al contenedor de la aplicación
docker exec -it dockerapp-qa sh
docker exec -it dockerapp-prod sh
```

### Reiniciar servicios

```bash
# Reiniciar servicios específicos
docker-compose restart app-qa
docker-compose restart app-prod
docker-compose restart mysql-qa
docker-compose restart mysql-prod

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
├── init-qa.sql         # Script de inicialización MySQL QA
├── init-prod.sql       # Script de inicialización MySQL PROD
├── .dockerignore       # Archivos ignorados por Docker
├── README.md           # Este archivo
└── decisiones.md       # Justificaciones técnicas
```

---

## 🔧 Variables de Entorno

### Aplicación

| Variable | QA | PROD | Descripción |
|----------|-----|------|-------------|
| `PORT` | 3000 | 3000 | Puerto interno del contenedor |
| `ENVIRONMENT` | QA | PROD | Entorno de ejecución |
| `DB_HOST` | mysql-qa | mysql-prod | Host de la base de datos |
| `DB_PORT` | 3306 | 3306 | Puerto de MySQL |
| `DB_USER` | appuser | produser | Usuario de base de datos |
| `DB_PASSWORD` | apppassword123 | prodpassword456 | Contraseña de BD |
| `DB_NAME` | dockerapp_qa | dockerapp_prod | Nombre de la base de datos |

### MySQL QA

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MYSQL_ROOT_PASSWORD` | rootpassword123 | Contraseña del usuario root |
| `MYSQL_DATABASE` | dockerapp_qa | Base de datos a crear |
| `MYSQL_USER` | appuser | Usuario de aplicación |
| `MYSQL_PASSWORD` | apppassword123 | Contraseña del usuario |

### MySQL PROD

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MYSQL_ROOT_PASSWORD` | rootpassword456 | Contraseña del usuario root |
| `MYSQL_DATABASE` | dockerapp_prod | Base de datos a crear |
| `MYSQL_USER` | produser | Usuario de aplicación |
| `MYSQL_PASSWORD` | prodpassword456 | Contraseña del usuario |

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
# Verificar que ambos MySQL estén healthy
docker ps

# Ver logs específicos
docker-compose logs mysql-qa
docker-compose logs mysql-prod

# Reiniciar MySQL específico
docker-compose restart mysql-qa
docker-compose restart mysql-prod
```

### Los datos se perdieron
```bash
# Verificar que los volúmenes existen
docker volume ls

# Ver información de volúmenes
docker volume inspect 2025_tp02_docker_mysql_qa_data
docker volume inspect 2025_tp02_docker_mysql_prod_data
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