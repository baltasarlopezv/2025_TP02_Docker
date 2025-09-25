-- init.sql - Script de inicialización de MySQL
-- Este script se ejecuta automáticamente cuando MySQL arranca por primera vez

USE dockerapp;

-- Crear tabla messages si no existe
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    environment VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_environment (environment)
);

-- Insertar algunos datos de ejemplo
INSERT INTO messages (content, environment) VALUES 
('¡Bienvenido al entorno QA!', 'QA'),
('Sistema de pruebas funcionando', 'QA'),
('¡Aplicación en producción!', 'PROD'),
('Sistema productivo estable', 'PROD');

-- Mostrar confirmación
SELECT 'Base de datos inicializada correctamente' as status;
