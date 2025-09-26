# 📋 Decisiones Técnicas - TP02 Docker

**Autor:** Baltasar Lopez V.  
**Fecha:** Septiembre 2025  
**Curso:** Ingeniería de Software III - UCC

---

## 🎯 Resumen del Proyecto

Este proyecto implementa una aplicación web containerizada usando Docker, diseñada para demostrar conceptos clave como:
- Containerización de aplicaciones
- **Aislamiento total de bases de datos por entorno**
- Configuración multi-entorno (QA/PROD) con recursos dedicados
- Persistencia de datos con volúmenes independientes
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

### **Decisión: MySQL 8.0 con Bases de Datos Separadas por Entorno**

**Justificación técnica:**
- **Estabilidad probada**: MySQL es una BD madura y confiable
- **Ecosistema Docker**: Imagen oficial bien mantenida con healthchecks
- **Facilidad de configuración**: Variables de entorno simples
- **Compatibilidad**: Driver mysql2 para Node.js muy estable
- **Aislamiento total**: QA y PROD completamente independientes

**¿Por qué bases separadas en lugar de una compartida?**
- **Aislamiento**: Errores en QA no pueden afectar datos de PROD
- **Seguridad**: Credenciales diferentes por entorno
- **Performance**: Cada entorno tiene recursos dedicados
- **Realismo**: Simula arquitectura productiva real

### **Configuración de MySQL por Entorno**

**QA Environment:**
```yaml
mysql-qa:
  environment:
    MYSQL_ROOT_PASSWORD: rootpassword123
    MYSQL_DATABASE: dockerapp_qa
    MYSQL_USER: appuser
    MYSQL_PASSWORD: apppassword123
  ports:
    - "3306:3306"
```

**PROD Environment:**
```yaml
mysql-prod:
  environment:
    MYSQL_ROOT_PASSWORD: rootpassword456
    MYSQL_DATABASE: dockerapp_prod  
    MYSQL_USER: produser
    MYSQL_PASSWORD: prodpassword456
  ports:
    - "3307:3306"  # Puerto externo diferente
```

**Decisiones de seguridad:**
- **Usuarios dedicados por entorno**: `appuser` vs `produser`
- **Contraseñas diferentes**: Simula gestión de secretos real
- **Puertos diferenciados**: QA (3306) vs PROD (3307)
- **Bases de datos específicas**: `dockerapp_qa` vs `dockerapp_prod`

---

## 🏗️ 4. Arquitectura Docker Compose

### **Decisión: Arquitectura Multi-Servicio con Aislamiento Total**

**Servicios implementados:**
1. **mysql-qa**: Base de datos exclusiva para QA
2. **mysql-prod**: Base de datos exclusiva para PROD  
3. **app-qa**: Aplicación en entorno QA (puerto 3000)
4. **app-prod**: Aplicación en entorno PROD (puerto 3001)

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

### **Healthcheck Individual por BD**
```yaml
mysql-qa:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
mysql-prod:  
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
```

**Justificación:**
- **Dependencias ordenadas**: Cada app espera a su BD específica
- **Tolerancia a fallas**: Si falla QA, PROD sigue funcionando
- **Monitoreo granular**: Estado independiente por servicio

---

## ⚙️ 5. Configuración QA vs PROD

### **Decisión: Misma Imagen, Variables de Entorno Diferentes**

**Implementación por entorno:**
```yaml
app-qa:
  environment:
    - ENVIRONMENT=QA
    - DB_HOST=mysql-qa      # Conexión dedicada
    - DB_NAME=dockerapp_qa  # BD específica
app-prod:
  environment:
    - ENVIRONMENT=PROD
    - DB_HOST=mysql-prod    # Conexión dedicada  
    - DB_NAME=dockerapp_prod # BD específica
  ports:
    - "3001:3000"  # Puerto externo diferente
```

**Ventajas de este approach:**
- **Una sola imagen**: Misma lógica, diferentes configuraciones
- **Deployments consistentes**: Lo que funciona en QA funciona en PROD
- **Variables claras**: Fácil identificar diferencias de configuración
- **Escalabilidad**: Fácil agregar más entornos (staging, dev)
- **Aislamiento total**: Bases de datos completamente separadas

### **Diferenciación de Datos por Entorno**
```javascript
// Cada entorno tiene su propia base de datos
const DB_NAME = process.env.DB_NAME; // dockerapp_qa vs dockerapp_prod
const DB_HOST = process.env.DB_HOST; // mysql-qa vs mysql-prod
```

**Scripts de inicialización separados:**
- `init-qa.sql`: Datos específicos para testing
- `init-prod.sql`: Datos específicos para producción

---

## 💾 6. Estrategia de Persistencia de Datos

### **Decisión: Volúmenes Docker Named Separados**

```yaml
volumes:
  mysql_qa_data:
    driver: local
  mysql_prod_data:
    driver: local
```

**¿Por qué volúmenes separados?**
- **Aislamiento total**: Los datos de QA no pueden afectar PROD
- **Backup independiente**: Se puede hacer respaldo por entorno
- **Gestión granular**: Cada entorno se puede limpiar independientemente
- **Portabilidad**: Funcionan igual en Windows, Mac y Linux

### **Scripts de Inicialización Específicos**
```yaml
mysql-qa:
  volumes:
    - ./init-qa.sql:/docker-entrypoint-initdb.d/init-qa.sql:ro
mysql-prod:
  volumes:
    - ./init-prod.sql:/docker-entrypoint-initdb.d/init-prod.sql:ro
```

**Justificación:**
- **Datos apropiados por entorno**: QA tiene datos de testing, PROD datos productivos
- **Reproducibilidad**: Cualquier persona obtiene exactamente los mismos datos
- **Automatización**: No hay pasos manuales para configurar las BDs

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
- **QA App**: 3000:3000 (directo)
- **PROD App**: 3001:3000 (mapeado)
- **QA MySQL**: 3306:3306 (puerto estándar)
- **PROD MySQL**: 3307:3306 (puerto alternativo)

**Ventajas:**
- **Acceso simultáneo**: Todos los servicios accesibles al mismo tiempo
- **Sin conflictos**: Cada servicio tiene su puerto único
- **Herramientas externas**: Se puede conectar DBeaver, etc. a cada BD

---

## 📊 9. Evidencias de Funcionamiento

### **✅ Construcción y Publicación Exitosa**

```bash
$ docker build -t baltasarlopezv/tp02-docker-app:v1.0 .
[+] Building 1.6s (11/11) FINISHED
$ docker push baltasarlopezv/tp02-docker-app:v1.0
v1.0: digest: sha256:946323a3ae4b8c5d85ff166f40565990706036a27f8c5655232420f04b7c5d3b
```

### **✅ Despliegue Multi-Entorno con Aislamiento Total**

```bash
$ docker-compose up -d
[+] Running 5/5
 ✔ Network app-network       Created
 ✔ Container mysql-qa        Healthy  
 ✔ Container mysql-prod      Healthy
 ✔ Container dockerapp-qa    Started  
 ✔ Container dockerapp-prod  Started
```

### **✅ Conectividad y Diferenciación Completa**

**QA Response:**
```json
{
  "message": "Hola desde la aplicación en entorno: QA",
  "database": "mysql-qa:3306/dockerapp_qa",
  "timestamp": "2025-09-26T16:46:37.741Z"
}
```

**PROD Response:**
```json
{
  "message": "Hola desde la aplicación en entorno: PROD",
  "database": "mysql-prod:3306/dockerapp_prod", 
  "timestamp": "2025-09-26T16:46:46.572Z"
}
```

### **✅ Aislamiento de Datos Comprobado**

**QA Messages (mysql-qa:dockerapp_qa):**
```json
{
  "environment": "QA",
  "messages": [
    {"id": 1, "content": "¡Bienvenido al entorno QA!", "environment": "QA"},
    {"id": 2, "content": "Sistema de pruebas funcionando", "environment": "QA"},
    {"id": 3, "content": "Base de datos QA inicializada", "environment": "QA"},
    {"id": 4, "content": "Entorno de testing listo", "environment": "QA"}
  ]
}
```

**PROD Messages (mysql-prod:dockerapp_prod):**
```json
{
  "environment": "PROD",
  "messages": [
    {"id": 1, "content": "¡Aplicación en producción!", "environment": "PROD"},
    {"id": 2, "content": "Sistema productivo estable", "environment": "PROD"},
    {"id": 3, "content": "Base de datos PROD inicializada", "environment": "PROD"},
    {"id": 4, "content": "Entorno productivo funcionando", "environment": "PROD"}
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
- **El aislamiento de bases de datos es clave para entornos reales**
- Los volúmenes Docker son más robustos que los bind mounts
- La publicación en registries públicos hace el proyecto verdaderamente portable
- **Cada entorno debe tener recursos dedicados para simular producción**

### **Evolución del proyecto:**
**Versión inicial:** 1 BD compartida → Simpler, menos realista
**Versión final:** BDs separadas → Más complejo, más realista y profesional

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