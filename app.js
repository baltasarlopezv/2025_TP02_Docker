// app.js
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

// Middleware para JSON
app.use(express.json());

// Variables de entorno
const PORT = process.env.PORT;
const ENVIRONMENT = process.env.ENVIRONMENT;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Variable global para la conexión
let db;

// Función para conectar a la base de datos con reintentos
async function connectDB() {
  const maxRetries = 5;
  const retryDelay = 3000; // 3 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      return; // Conexión exitosa, salir de la función
      
    } catch (error) {
      console.error(`❌ Intento ${attempt}/${maxRetries} - Error conectando a MySQL:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('💥 No se pudo conectar a MySQL después de varios intentos');
        // No falla la app, solo no tendrá conexión BD
        return;
      }
      
      console.log(`⏳ Reintentando en ${retryDelay/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
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

// Ruta para ver todos los registros de la tabla de prueba
app.get("/data", async (req, res) => {
  if (!db) {
    return res.status(500).json({
      error: "No hay conexión a la base de datos",
      environment: ENVIRONMENT
    });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM connection_test ORDER BY created_at DESC");
    res.json({
      environment: ENVIRONMENT,
      database: `${DB_HOST}:${DB_PORT}/${DB_NAME}`,
      total_records: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      error: "Error consultando datos",
      details: error.message,
      environment: ENVIRONMENT
    });
  }
});

// Ruta para agregar un nuevo registro
app.post("/data", async (req, res) => {
  if (!db) {
    return res.status(500).json({
      error: "No hay conexión a la base de datos",
      environment: ENVIRONMENT
    });
  }

  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      error: "Se requiere el campo 'message' en el body",
      example: { message: "Mi mensaje de prueba" }
    });
  }

  try {
    // Verificar si la columna message ya existe, si no, agregarla
    try {
      await db.execute(`
        ALTER TABLE connection_test 
        ADD COLUMN message TEXT AFTER environment
      `);
    } catch (alterError) {
      // La columna probablemente ya existe, continuar
      console.log("Columna message ya existe o error menor:", alterError.message);
    }

    const [result] = await db.execute(
      "INSERT INTO connection_test (environment, message) VALUES (?, ?)",
      [ENVIRONMENT, message]
    );

    res.status(201).json({
      success: true,
      environment: ENVIRONMENT,
      message: "Registro creado exitosamente",
      data: {
        id: result.insertId,
        environment: ENVIRONMENT,
        message: message,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Error insertando datos",
      details: error.message,
      environment: ENVIRONMENT
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
