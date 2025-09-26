-- init-qa.sql - Script simple para QA
-- Este script se ejecuta automáticamente cuando MySQL QA arranca

USE dockerapp_qa;

-- Crear una tabla simple solo para demostrar conexión
CREATE TABLE IF NOT EXISTS connection_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    environment VARCHAR(10) DEFAULT 'QA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar registro de prueba
INSERT INTO connection_test (environment) VALUES ('QA');

-- Mostrar confirmación
SELECT 'Base de datos QA lista' as status;
