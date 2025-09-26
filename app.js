// app.js
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

// Middleware para JSON
app.use(express.json());

// Variables de entorno
const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.ENVIRONMENT || "QA";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";
const DB_NAME = process.env.DB_NAME || "dockerapp";

// Variable global para la conexión
let db;

// Función para conectar a la base de datos
async function connectDB() {
  try {
    const dbConfig = {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    };
    
    db = await mysql.createConnection(dbConfig);
    console.log(`✅ Conectado a MySQL en ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
    // No falla la app, solo no tendrá conexión BD
  }
}

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: `Hola desde la aplicación en entorno: ${ENVIRONMENT}`,
    port: PORT,
    database: db ? `${DB_HOST}:${DB_PORT}/${DB_NAME}` : "No conectado",
    status: db ? "Conectado a BD" : "Sin conexión BD",
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba de salud
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    environment: ENVIRONMENT,
    database: db ? "connected" : "disconnected"
  });
});

// Inicializar conexión a la base de datos al arrancar
connectDB();

// Levantar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}, entorno: ${ENVIRONMENT}`);
  console.log(`📊 Variables de entorno:`);
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - ENVIRONMENT: ${ENVIRONMENT}`);
  console.log(`   - DB_HOST: ${DB_HOST}`);
  console.log(`   - DB_NAME: ${DB_NAME}`);
});
