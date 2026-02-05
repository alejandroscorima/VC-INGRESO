-- Migration: Access Logs Table
-- Para VC-INGRESO - Sistema de Control de Acceso
-- Fecha: 2024-01

CREATE TABLE IF NOT EXISTS `access_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `access_point_id` INT UNSIGNED NOT NULL COMMENT 'ID del punto de acceso (garita, piscina, etc.)',
  `person_id` INT UNSIGNED NULL COMMENT 'ID de la persona (si es residente/visita registrada)',
  `doc_number` VARCHAR(20) NULL COMMENT 'Número de documento (si no tiene person_id)',
  `vehicle_id` INT UNSIGNED NULL COMMENT 'ID del vehículo (si aplica)',
  `type` ENUM('INGRESO', 'EGRESO') NOT NULL DEFAULT 'INGRESO' COMMENT 'Tipo de movimiento',
  `observation` TEXT NULL COMMENT 'Observaciones adicionales',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_access_point` (`access_point_id`),
  INDEX `idx_person` (`person_id`),
  INDEX `idx_doc_number` (`doc_number`),
  INDEX `idx_vehicle` (`vehicle_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de ingresos y egresos del condominio';

-- Tabla de Puntos de Acceso
CREATE TABLE IF NOT EXISTS `access_points` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre del punto de acceso',
  `type` ENUM('GARITA', 'PISCINA', 'CASA_CLUB', 'ENTRADA_PEATONAL', 'ENTRADA_VEHICULAR', 'OTRO') NOT NULL DEFAULT 'OTRO',
  `location` VARCHAR(255) NULL COMMENT 'Ubicación física',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `max_capacity` INT UNSIGNED NULL COMMENT 'Aforo máximo (para Piscina, Casa Club)',
  `current_capacity` INT UNSIGNED NULL DEFAULT 0 COMMENT 'Aforo actual',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Puntos de acceso del condominio';

-- Insertar puntos de acceso por defecto
INSERT INTO `access_points` (`name`, `type`, `location`, `max_capacity`, `current_capacity`) VALUES
('Garita Principal', 'GARITA', 'Entrada principal del condominio', NULL, 0),
('Entrada Peatonal Norte', 'ENTRADA_PEATONAL', 'Puerta norte del condominio', NULL, 0),
('Piscina', 'PISCINA', 'Área de piscina', 50, 0),
('Casa Club', 'CASA_CLUB', 'Edificio de eventos', 200, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);
