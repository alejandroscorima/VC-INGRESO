-- Tabla de Mascotas
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species ENUM('DOG', 'CAT', 'BIRD', 'OTHER') NOT NULL,
    breed VARCHAR(100) DEFAULT '',
    color VARCHAR(50) DEFAULT '',
    owner_id INT NOT NULL,
    photo_url VARCHAR(255) DEFAULT NULL,
    status_validated ENUM('PERMITIDO', 'OBSERVADO', 'DENEGADO') DEFAULT 'PERMITIDO',
    status_reason VARCHAR(255) DEFAULT NULL,
    microchip_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES persons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para mejorar rendimiento
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pets_status ON pets(status_validated);
CREATE INDEX idx_pets_species ON pets(species);
