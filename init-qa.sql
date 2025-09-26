-- init-qa.sql - Script de inicialización para QA
-- Este script se ejecuta automáticamente cuando MySQL QA arranca por primera vez

USE dockerapp_qa;

-- Crear tabla messages si no existe
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    environment VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_environment (environment)
);

-- Insertar datos específicos de QA
INSERT INTO messages (content, environment) VALUES 
('¡Bienvenido al entorno QA!', 'QA'),
('Sistema de pruebas funcionando', 'QA'),
('Base de datos QA inicializada', 'QA'),
('Entorno de testing listo', 'QA');

-- Mostrar confirmación
SELECT 'Base de datos QA inicializada correctamente' as status;
