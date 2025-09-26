-- init-prod.sql - Script simple para PROD
-- Este script se ejecuta automáticamente cuando MySQL PROD arranca

USE dockerapp_prod;

-- Crear una tabla simple para demostrar funcionalidad CRUD
CREATE TABLE IF NOT EXISTS connection_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    environment VARCHAR(10) DEFAULT 'PROD',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar registros de prueba
INSERT INTO connection_test (environment, message) VALUES 
('PROD', 'Sistema PROD inicializado correctamente'),
('PROD', 'Base de datos productiva lista'),
('PROD', 'Entorno de producción funcionando');

-- Mostrar confirmación
SELECT 'Base de datos PROD lista' as status;
