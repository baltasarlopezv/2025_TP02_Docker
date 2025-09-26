-- init-prod.sql - Script simple para PROD
-- Este script se ejecuta automáticamente cuando MySQL PROD arranca

USE dockerapp_prod;

-- Crear una tabla simple solo para demostrar conexión
CREATE TABLE IF NOT EXISTS connection_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    environment VARCHAR(10) DEFAULT 'PROD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar registro de prueba
INSERT INTO connection_test (environment) VALUES ('PROD');

-- Mostrar confirmación
SELECT 'Base de datos PROD lista' as status;
