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

// Configuración de conexión a MySQL
const dbConfig = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
};

// Variable global para la conexión
let db;

// Función para conectar a la base de datos
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log(`✅ Conectado a MySQL en ${DB_HOST}:${DB_PORT}`);
    
    // Crear tabla si no existe
    await initDatabase();
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
  }
}

// Función para inicializar la base de datos
async function initDatabase() {
  try {
    // Crear tabla de mensajes si no existe
    const createTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        environment VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(createTable);
    console.log("✅ Tabla 'messages' lista");
    
    // Insertar mensaje inicial según el entorno
    const initialMessage = ENVIRONMENT === "PROD" 
      ? "Aplicación en producción funcionando correctamente"
      : "Aplicación en QA - Entorno de pruebas";
      
    const checkExisting = "SELECT COUNT(*) as count FROM messages WHERE environment = ?";
    const [rows] = await db.execute(checkExisting, [ENVIRONMENT]);
    
    if (rows[0].count === 0) {
      const insertInitial = "INSERT INTO messages (content, environment) VALUES (?, ?)";
      await db.execute(insertInitial, [initialMessage, ENVIRONMENT]);
      console.log(`✅ Mensaje inicial insertado para ${ENVIRONMENT}`);
    }
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error.message);
  }
}

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: `Hola desde la aplicación en entorno: ${ENVIRONMENT}`,
    port: PORT,
    database: `${DB_HOST}:${DB_PORT}/${DB_NAME}`,
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

// Ruta para obtener mensajes de la base de datos
app.get("/messages", async (req, res) => {
  try {
    const query = "SELECT * FROM messages WHERE environment = ? ORDER BY created_at DESC";
    const [rows] = await db.execute(query, [ENVIRONMENT]);
    
    res.json({
      environment: ENVIRONMENT,
      messages: rows
    });
  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo mensajes",
      details: error.message
    });
  }
});

// Ruta para crear un nuevo mensaje
app.post("/messages", async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: "El campo 'content' es requerido"
      });
    }
    
    const query = "INSERT INTO messages (content, environment) VALUES (?, ?)";
    const [result] = await db.execute(query, [content, ENVIRONMENT]);
    
    res.json({
      message: "Mensaje creado exitosamente",
      id: result.insertId,
      content: content,
      environment: ENVIRONMENT
    });
  } catch (error) {
    res.status(500).json({
      error: "Error creando mensaje",
      details: error.message
    });
  }
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
