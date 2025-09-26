-- init-qa.sql - Script simple para QA
-- Este script se ejecuta automáticamente cuando MySQL QA arranca

USE dockerapp_qa;

-- Crear una tabla simple para demostrar funcionalidad CRUD
CREATE TABLE IF NOT EXISTS connection_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    environment VARCHAR(10) DEFAULT 'QA',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar registros de prueba
INSERT INTO connection_test (environment, message) VALUES 
('QA', 'Sistema QA inicializado correctamente'),
('QA', 'Base de datos de pruebas lista'),
('QA', 'Entorno de desarrollo funcionando');

-- Mostrar confirmación
SELECT 'Base de datos QA lista' as status;
