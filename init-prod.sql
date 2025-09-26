-- init-prod.sql - Script de inicialización para PRODUCCIÓN
-- Este script se ejecuta automáticamente cuando MySQL PROD arranca por primera vez

USE dockerapp_prod;

-- Crear tabla messages si no existe
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    environment VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_environment (environment)
);

-- Insertar datos específicos de PRODUCCIÓN
INSERT INTO messages (content, environment) VALUES 
('¡Aplicación en producción!', 'PROD'),
('Sistema productivo estable', 'PROD'),
('Base de datos PROD inicializada', 'PROD'),
('Entorno productivo funcionando', 'PROD');

-- Mostrar confirmación
SELECT 'Base de datos PROD inicializada correctamente' as status;
