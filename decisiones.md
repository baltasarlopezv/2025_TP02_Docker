# 📋 Decisiones Técnicas - TP02 Docker

**Autor:** Baltasar Lopez V.  
**Fecha:** Septiembre 2025  
**Curso:** Ingeniería de Software III - UCC

---

## 🎯 Resumen del Proyecto

Este proyecto implementa una aplicación web containerizada usando Docker, diseñada para demostrar conceptos clave como:
- Containerización de aplicaciones
- Configuración multi-entorno (QA/PROD)
- Persistencia de datos con volúmenes
- Orquestación con Docker Compose
- Publicación en registries públicos

---

## 🚀 1. Elección de la Aplicación y Tecnología

### **Decisión: Node.js con Express**

**¿Por qué Node.js?**
- **Simplicidad**: Permite crear APIs REST de forma rápida y sencilla
- **Ecosistema maduro**: NPM tiene librerías estables para MySQL y manejo HTTP
- **Lightweight**: Ideal para contenedores, bajo consumo de recursos
- **Async por naturaleza**: Manejo eficiente de conexiones de base de datos

**¿Por qué Express?**
- Framework minimalista pero poderoso
- Amplia documentación y comunidad
- Middleware robusto para manejo de JSON y rutas
- Compatible con contenedores sin configuraciones complejas

### **Estructura de la Aplicación**
```javascript
// Variables de entorno diferenciadas por entorno
const ENVIRONMENT = process.env.ENVIRONMENT || "QA";
```
- **Rutas implementadas**: `/`, `/health`, `/messages` (GET/POST)
- **Conexión asíncrona** a MySQL con manejo de errores
- **Logs informativos** para debugging y monitoreo

---

## 🐳 2. Elección de Imagen Base Docker

### **Decisión: `node:18-alpine`**

**Justificación técnica:**
- **Tamaño optimizado**: Alpine Linux reduce la imagen de ~1GB a ~195MB
- **Seguridad**: Menor superficie de ataque, menos paquetes instalados
- **Versión LTS**: Node.js 18 tiene soporte a largo plazo
- **Compatibilidad**: Funciona perfectamente con mysql2 y express

**Alternativas consideradas y descartadas:**
- `node:18` (oficial): Demasiado pesada (~1GB)
- `node:18-slim`: Intermedio, pero Alpine es más eficiente
- `node:alpine` (latest): Preferimos version fija para reproducibilidad

### **Estructura del Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Decisiones específicas:**
1. **WORKDIR**: `/usr/src/app` es el estándar para aplicaciones Node.js
2. **COPY package*.json primero**: Optimiza cache de Docker, solo reinstala dependencias si cambia package.json
3. **EXPOSE 3000**: Documenta qué puerto usa, aunque no es obligatorio
4. **CMD**: Usa npm start para consistencia con el desarrollo local

---

## 🗄️ 3. Elección de Base de Datos

### **Decisión: MySQL 8.0**

**Justificación técnica:**
- **Estabilidad probada**: MySQL es una BD madura y confiable
- **Ecosistema Docker**: Imagen oficial bien mantenida con healthchecks
- **Facilidad de configuración**: Variables de entorno simples
- **Compatibilidad**: Driver mysql2 para Node.js muy estable

**¿Por qué no otras bases de datos?**
- **PostgreSQL**: Más compleja para un caso de uso simple
- **MongoDB**: No necesitamos documentos, estructura relacional simple es suficiente
- **SQLite**: No permite conexiones concurrentes reales entre contenedores

### **Configuración de MySQL**
```yaml
environment:
  MYSQL_ROOT_PASSWORD: rootpassword123
  MYSQL_DATABASE: dockerapp
  MYSQL_USER: appuser
  MYSQL_PASSWORD: apppassword123
```

**Decisiones de seguridad:**
- Usuario dedicado (`appuser`) en lugar de usar root
- Contraseñas fuertes para entorno de producción
- Base de datos específica para la aplicación

---

## 🏗️ 4. Arquitectura Docker Compose

### **Decisión: Arquitectura Multi-Servicio**

**Servicios implementados:**
1. **mysql**: Base de datos compartida
2. **app-qa**: Aplicación en entorno QA (puerto 3000)
3. **app-prod**: Aplicación en entorno PROD (puerto 3001)

### **Red y Comunicación**
```yaml
networks:
  app-network:
    driver: bridge
```

**¿Por qué una red personalizada?**
- **Aislamiento**: Los contenedores no interfieren con otros proyectos
- **Resolución DNS**: Los servicios se comunican por nombre (`mysql`)
- **Seguridad**: Solo los servicios definidos pueden comunicarse

### **Healthcheck de MySQL**
```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  timeout: 20s
  retries: 10
```

**Justificación:**
- **Dependencias ordenadas**: Las apps esperan a que MySQL esté listo
- **Tolerancia a fallas**: Reintentos automáticos si MySQL tarda en arrancar
- **Monitoreo**: Docker Compose reporta el estado real de MySQL

---

## ⚙️ 5. Configuración QA vs PROD

### **Decisión: Misma Imagen, Variables de Entorno Diferentes**

**Implementación:**
```yaml
app-qa:
  environment:
    - ENVIRONMENT=QA
    - PORT=3000
app-prod:
  environment:
    - ENVIRONMENT=PROD
    - PORT=3000  # Puerto interno igual
  ports:
    - "3001:3000"  # Puerto externo diferente
```

**Ventajas de este approach:**
- **Una sola imagen**: Misma lógica, diferentes configuraciones
- **Deployments consistentes**: Lo que funciona en QA funciona en PROD
- **Variables claras**: Fácil identificar diferencias de configuración
- **Escalabilidad**: Fácil agregar más entornos (staging, dev)

### **Diferenciación de Datos**
```javascript
const initialMessage = ENVIRONMENT === "PROD" 
  ? "Aplicación en producción funcionando correctamente"
  : "Aplicación en QA - Entorno de pruebas";
```

**¿Por qué datos diferentes por entorno?**
- **Testing realista**: QA tiene datos de prueba, PROD datos reales
- **Identificación clara**: Es obvio en qué entorno estás trabajando
- **Troubleshooting**: Logs y mensajes identifican el entorno automáticamente

---

## 💾 6. Estrategia de Persistencia de Datos

### **Decisión: Volúmenes Docker Named**

```yaml
volumes:
  mysql_data:
    driver: local
```

**¿Por qué volúmenes named vs bind mounts?**
- **Portabilidad**: Funcionan igual en Windows, Mac y Linux
- **Performance**: Docker optimiza el acceso a datos
- **Gestión automática**: Docker maneja permisos y ubicación
- **Backup simplificado**: `docker volume` commands para respaldo

### **Script de Inicialización**
```yaml
volumes:
  - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

**Justificación:**
- **Reproducibilidad**: Cualquier persona obtiene los mismos datos iniciales
- **Automatización**: No hay pasos manuales para configurar la BD
- **Separación de entornos**: QA y PROD tienen datos diferenciados automáticamente

---

## 📦 7. Estrategia de Versionado y Publicación

### **Decisión: Docker Hub con Tags Semánticos**

**Tags implementados:**
- `baltasarlopezv/tp02-docker-app:v1.0` - Versión estable
- `baltasarlopezv/tp02-docker-app:latest` - Más reciente

**Justificación del versionado:**
- **v1.0**: Primera versión estable y funcional completa
- **latest**: Para desarrollo y testing rápido
- **Semántico**: Seguimos convenciones de la industria

### **¿Por qué Docker Hub público?**
- **Accesibilidad**: Cualquier persona puede descargar y probar
- **CI/CD ready**: Se puede integrar con pipelines automáticos
- **Estándar de industria**: Hub es el registry más usado
- **Free tier**: Suficiente para proyectos académicos

### **Actualización de docker-compose.yml**
```yaml
# Antes: build: .
image: baltasarlopezv/tp02-docker-app:v1.0
```

**Ventaja:** Los usuarios no necesitan código fuente, solo el compose file.

---

## 🔧 8. Decisiones de Configuración Avanzadas

### **Restart Policies**
```yaml
restart: always
```
- **Disponibilidad**: Servicios se reinician automáticamente
- **Tolerancia a fallas**: Recuperación automática de errores temporales

### **Labels para Organización**
```yaml
labels:
  - "environment=qa"
  - "app=dockerapp"
```
- **Monitoreo**: Fácil filtrar contenedores por etiquetas
- **Automatización**: Scripts pueden usar labels para operaciones batch

### **Port Mapping Strategy**
- **QA**: 3000:3000 (directo)
- **PROD**: 3001:3000 (mapeado)
- **MySQL**: 3306:3306 (para debugging/herramientas externas)

---

## 📊 9. Evidencias de Funcionamiento

### **✅ Construcción y Publicación Exitosa**

```bash
$ docker build -t baltasarlopezv/tp02-docker-app:v1.0 .
[+] Building 1.6s (11/11) FINISHED
$ docker push baltasarlopezv/tp02-docker-app:v1.0
v1.0: digest: sha256:946323a3ae4b8c5d85ff166f40565990706036a27f8c5655232420f04b7c5d3b
```

### **✅ Despliegue Multi-Entorno Funcional**

```bash
$ docker-compose up -d
[+] Running 4/4
 ✔ Network app-network    Created
 ✔ Container mysql-db     Healthy
 ✔ Container dockerapp-qa Started  
 ✔ Container dockerapp-prod Started
```

### **✅ Conectividad y Diferenciación de Entornos**

**QA Response:**
```json
{
  "message": "Hola desde la aplicación en entorno: QA",
  "port": "3000",
  "database": "mysql:3306/dockerapp",
  "timestamp": "2025-09-25T02:15:12.589Z"
}
```

**PROD Response:**
```json
{
  "message": "Hola desde la aplicación en entorno: PROD",
  "port": "3000", 
  "database": "mysql:3306/dockerapp",
  "timestamp": "2025-09-25T02:15:23.674Z"
}
```

### **✅ Persistencia de Datos Verificada**

**QA Messages:**
```json
{
  "environment": "QA",
  "messages": [
    {"id": 1, "content": "¡Bienvenido al entorno QA!", "environment": "QA"},
    {"id": 2, "content": "Sistema de pruebas funcionando", "environment": "QA"}
  ]
}
```

**PROD Messages:**
```json
{
  "environment": "PROD", 
  "messages": [
    {"id": 3, "content": "¡Aplicación en producción!", "environment": "PROD"},
    {"id": 4, "content": "Sistema productivo estable", "environment": "PROD"}
  ]
}
```

### **✅ Descarga desde Docker Hub Comprobada**

```bash
$ docker-compose up -d
[+] Running 5/5
 ✔ app-prod Pulled    5.9s  # ← DESCARGA DESDE DOCKER HUB
 ✔ app-qa Pulled      5.9s  # ← DESCARGA DESDE DOCKER HUB
```

---

## ⚠️ 10. Problemas Encontrados y Soluciones

### **Problema 1: Warning de version en docker-compose.yml**
```
WARN: the attribute `version` is obsolete
```
**Solución:** Removimos `version: '3.8'` ya que Docker Compose moderno no lo requiere.

### **Problema 2: Caracteres especiales en MySQL**
**Síntoma:** Algunos caracteres aparecían como `Â¡` en lugar de `¡`
**Causa:** Encoding UTF-8 vs Latin-1
**Status:** Cosmético, no afecta funcionalidad

### **Problema 3: Healthcheck timing**
**Síntoma:** Apps intentaban conectar antes que MySQL estuviera listo
**Solución:** 
```yaml
depends_on:
  mysql:
    condition: service_healthy
```

---

## 🎓 11. Aprendizajes y Conclusiones

### **Conceptos Docker Aplicados**
- **Containerización**: Aplicación funciona igual en cualquier entorno
- **Multi-stage builds**: Optimización con package.json copy
- **Networking**: Comunicación inter-contenedor por DNS
- **Volumes**: Persistencia de datos más allá del ciclo de vida del contenedor
- **Environment variables**: Configuración flexible sin rebuild

### **Mejores Prácticas Implementadas**
- Una aplicación por contenedor
- Imágenes ligeras (Alpine)
- Secrets por variables de entorno (para demo)
- Healthchecks para dependencias
- Tags semánticos para releases
- Documentación exhaustiva

### **¿Qué aprendí?**
- Docker Compose simplifica enormemente el manejo de aplicaciones multi-servicio
- La separación de configuración por entorno es clave para operaciones
- Los volúmenes Docker son más robustos que los bind mounts
- La publicación en registries públicos hace el proyecto verdaderamente portable

### **Siguiente Paso Sugerido**
En un entorno real, implementaría:
- Secrets management (Docker Swarm secrets o Kubernetes secrets)
- SSL/TLS termination con reverse proxy
- Monitoring con Prometheus/Grafana
- CI/CD pipeline con GitHub Actions

---

## 📖 Referencias

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Proyecto completado exitosamente ✅**