-- Migration: Reservations Table
-- Para VC-INGRESO - Sistema de Control de Acceso
-- Fecha: 2024-01

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `access_point_id` INT UNSIGNED NOT NULL COMMENT 'ID del área (Casa Club, Piscina, etc.)',
  `person_id` INT UNSIGNED NULL COMMENT 'ID del responsable de la reservación',
  `house_id` INT UNSIGNED NOT NULL COMMENT 'ID de la vivienda',
  `reservation_date` DATETIME NOT NULL COMMENT 'Fecha y hora de inicio',
  `end_date` DATETIME NULL COMMENT 'Fecha y hora de fin',
  `status` ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
  `observation` TEXT NULL COMMENT 'Observaciones',
  `num_guests` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Número de invitados',
  `contact_phone` VARCHAR(20) NULL COMMENT 'Teléfono de contacto',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_access_point` (`access_point_id`),
  INDEX `idx_person` (`person_id`),
  INDEX `idx_house` (`house_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_reservation_date` (`reservation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reservaciones de áreas comunes';

-- Actualizar access_points para incluir Casa Club y Piscina si no existen
INSERT INTO `access_points` (`name`, `type`, `location`, `max_capacity`, `current_capacity`) VALUES
('Casa Club', 'CASA_CLUB', 'Edificio principal de eventos', 200, 0),
('Piscina', 'PISCINA', 'Área de piscina', 50, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);
