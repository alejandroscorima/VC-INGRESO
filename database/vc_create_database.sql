-- =============================================================================
-- VC-INGRESO - Creación completa de base de datos
-- Incluye tablas legacy + mascotas, reservaciones y access_logs (nuevo formato)
-- Ejecutar en orden; las claves foráneas se añaden al final.
-- =============================================================================
-- En Docker, este archivo se ejecuta desde database/init-docker.sh sustituyendo
-- __MYSQL_ROOT_PASSWORD__ por la contraseña real (root@'%' para que la API conecte).
-- Ejecución manual: sed 's/__MYSQL_ROOT_PASSWORD__/PASSWORD/g' database/vc_create_database.sql | mysql -uroot -p
-- =============================================================================

-- Permitir root desde la red Docker (contenedor API). Placeholder sustituido por init-docker.sh o por sed en ejecución manual.
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '__MYSQL_ROOT_PASSWORD__';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Crear bases de datos (dev/stage/prod). Licencias: crearttech_clientes (bdLicense.php, DB_LICENSE_NAME).
CREATE DATABASE IF NOT EXISTS vc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS crearttech_clientes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos vc_db para las tablas
USE vc_db;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. CASAS (houses)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `house_members`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `pets`;
DROP TABLE IF EXISTS `temporary_access_logs`;
DROP TABLE IF EXISTS `access_logs`;
DROP TABLE IF EXISTS `temporary_visits`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `persons`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `access_points`;
DROP TABLE IF EXISTS `houses`;

CREATE TABLE `houses` (
    `house_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `house_type` ENUM('CASA', 'DEPARTAMENTO', 'LOCAL COMERCIAL','OTRO') NOT NULL,
    `block_house` VARCHAR(5) NOT NULL,
    `lot` INT NOT NULL,
    `apartment` VARCHAR(10) DEFAULT NULL,
    `owner_id` INT UNSIGNED DEFAULT NULL,
    `status_system` VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (`house_id`),
    KEY `idx_block_lot` (`block_house`, `lot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Casas, departamentos o locales comerciales del condominio';

-- -----------------------------------------------------------------------------
-- 2. USUARIOS (users) - Solo datos del sistema (login, roles, estado). Identidad en persons.
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `person_id` INT UNSIGNED DEFAULT NULL COMMENT 'FK persons.id - identidad civil; 1 user = 1 person',
    `role_system` VARCHAR(20) NOT NULL,
    `username_system` VARCHAR(50) NOT NULL,
    `password_system` VARCHAR(255) NOT NULL,
    `house_id` INT UNSIGNED DEFAULT NULL COMMENT 'Legacy: preferir house_members',
    `status_validated` VARCHAR(50) DEFAULT NULL,
    `status_reason` VARCHAR(255) DEFAULT NULL,
    `status_system` VARCHAR(50) DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=habilitado, 0=deshabilitado',
    `force_password_change` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=obligar cambio en próximo login',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_username` (`username_system`),
    UNIQUE KEY `uk_person_id` (`person_id`),
    KEY `idx_house` (`house_id`),
    KEY `idx_person_id` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema (enlace a persons para datos civiles)';

-- Si la BD ya existe y users no tiene force_password_change:
-- ALTER TABLE users ADD COLUMN force_password_change TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=obligar cambio en próximo login' AFTER is_active;

-- -----------------------------------------------------------------------------
-- 3. PUNTOS DE ACCESO (access_points) - Áreas y garitas (formato unificado API)
-- -----------------------------------------------------------------------------
CREATE TABLE `access_points` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nombre del punto/área',
    `type` ENUM('GARITA', 'PISCINA', 'CASA_CLUB', 'ENTRADA_PEATONAL', 'ENTRADA_VEHICULAR', 'OTRO') NOT NULL DEFAULT 'OTRO',
    `location` VARCHAR(255) DEFAULT NULL COMMENT 'Ubicación física',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `max_capacity` INT UNSIGNED DEFAULT NULL COMMENT 'Aforo máximo (Piscina, Casa Club)',
    `current_capacity` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`),
    KEY `idx_type` (`type`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Puntos de acceso y áreas reservables';

-- -----------------------------------------------------------------------------
-- 4. PERSONAS (persons) - Residentes, propietarios, visitas (API persons + pets.owner)
-- -----------------------------------------------------------------------------
CREATE TABLE `persons` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_doc` VARCHAR(20) DEFAULT NULL,
    `doc_number` VARCHAR(15) NOT NULL,
    `first_name` VARCHAR(100) DEFAULT NULL,
    `paternal_surname` VARCHAR(50) DEFAULT NULL,
    `maternal_surname` VARCHAR(50) DEFAULT NULL,
    `gender` VARCHAR(10) DEFAULT NULL,
    `birth_date` DATE DEFAULT NULL,
    `cel_number` VARCHAR(15) DEFAULT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `address` VARCHAR(255) DEFAULT NULL,
    `district` VARCHAR(50) DEFAULT NULL,
    `province` VARCHAR(50) DEFAULT NULL,
    `region` VARCHAR(50) DEFAULT NULL,
    `civil_status` VARCHAR(20) DEFAULT NULL,
    `status_validated` ENUM('PERMITIDO', 'OBSERVADO', 'DENEGADO') DEFAULT 'PERMITIDO',
    `status_reason` VARCHAR(255) DEFAULT NULL,
    `status_system` VARCHAR(50) DEFAULT NULL,
    `person_type` VARCHAR(50) DEFAULT NULL COMMENT 'PROPIETARIO, RESIDENTE, VISITA, etc.',
    `house_id` INT UNSIGNED DEFAULT NULL,
    `photo_url` VARCHAR(255) DEFAULT NULL,
    `origin_list` VARCHAR(255) DEFAULT NULL,
    `motivo` VARCHAR(255) DEFAULT NULL,
    `puerta_list` VARCHAR(255) DEFAULT NULL COMMENT 'Puntos de acceso (garita, piscina, etc.)',
    `fecha_list` VARCHAR(255) DEFAULT NULL,
    `fecha_registro` DATETIME DEFAULT NULL,
    `puerta_registro` VARCHAR(50) DEFAULT NULL COMMENT 'Puerta/punto de registro',
    `condicion` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_doc` (`doc_number`),
    KEY `idx_house` (`house_id`),
    KEY `idx_status` (`status_validated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Personas (residentes, propietarios, visitas)';

-- -----------------------------------------------------------------------------
-- 4.1. HOUSE MEMBERS (house_members) - Fuente de verdad pertenencia persona-casa
-- -----------------------------------------------------------------------------
CREATE TABLE `house_members` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `house_id` INT UNSIGNED NOT NULL,
    `person_id` INT UNSIGNED NOT NULL,
    `relation_type` VARCHAR(50) NOT NULL DEFAULT 'RESIDENTE' COMMENT 'PROPIETARIO|RESIDENTE|INQUILINO|FAMILIAR|APODERADO|etc',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=contacto principal de la casa',
    `start_date` DATE DEFAULT NULL,
    `end_date` DATE DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_house_person` (`house_id`, `person_id`),
    KEY `idx_house_id` (`house_id`),
    KEY `idx_person_id` (`person_id`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pertenencia persona-casa. Fuente de verdad para Mi Casa y permisos house-centric.';

-- -----------------------------------------------------------------------------
-- 5. VEHÍCULOS (vehicles)
-- -----------------------------------------------------------------------------
CREATE TABLE `vehicles` (
    `vehicle_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `license_plate` VARCHAR(15) NOT NULL,
    `type_vehicle` VARCHAR(15) DEFAULT NULL,
    `house_id` INT UNSIGNED DEFAULT NULL,
    `owner_id` INT UNSIGNED DEFAULT NULL,
    `status_validated` VARCHAR(50) DEFAULT NULL,
    `status_reason` VARCHAR(255) DEFAULT NULL,
    `status_system` VARCHAR(50) DEFAULT NULL,
    `category_entry` VARCHAR(50) DEFAULT NULL,
    `color` VARCHAR(15) DEFAULT NULL,
    `brand` VARCHAR(15) DEFAULT NULL,
    `model` VARCHAR(15) DEFAULT NULL,
    `year` VARCHAR(15) DEFAULT NULL,
    `photo_url` VARCHAR(255) DEFAULT NULL,
    `created_by_user_id` INT UNSIGNED DEFAULT NULL,
    `updated_by_user_id` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`vehicle_id`),
    UNIQUE KEY `uk_plate` (`license_plate`),
    KEY `idx_house` (`house_id`),
    KEY `idx_created_by_user` (`created_by_user_id`),
    KEY `idx_updated_by_user` (`updated_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vehículos registrados';

-- -----------------------------------------------------------------------------
-- 6. VISITAS TEMPORALES (temporary_visits)
-- -----------------------------------------------------------------------------
CREATE TABLE `temporary_visits` (
    `temp_visit_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `temp_visit_name` VARCHAR(100) DEFAULT NULL,
    `temp_visit_doc` VARCHAR(15) DEFAULT NULL,
    `temp_visit_plate` VARCHAR(15) DEFAULT NULL,
    `temp_visit_cel` VARCHAR(15) DEFAULT NULL,
    `temp_visit_type` VARCHAR(15) NOT NULL,
    `status_validated` VARCHAR(50) DEFAULT NULL,
    `status_reason` VARCHAR(255) DEFAULT NULL,
    `status_system` VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (`temp_visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. REGISTROS DE ACCESO (access_logs) - Formato API (access_point_id, person_id, type)
-- -----------------------------------------------------------------------------
CREATE TABLE `access_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `access_point_id` INT UNSIGNED NOT NULL,
    `person_id` INT UNSIGNED DEFAULT NULL COMMENT 'Persona/residente',
    `doc_number` VARCHAR(20) DEFAULT NULL COMMENT 'Si no hay person_id',
    `vehicle_id` INT UNSIGNED DEFAULT NULL,
    `type` ENUM('INGRESO', 'EGRESO') NOT NULL DEFAULT 'INGRESO',
    `observation` TEXT DEFAULT NULL,
    `created_by_user_id` INT UNSIGNED DEFAULT NULL COMMENT 'user_id del guardia/operario que registró',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_access_point` (`access_point_id`),
    KEY `idx_person` (`person_id`),
    KEY `idx_doc_number` (`doc_number`),
    KEY `idx_vehicle` (`vehicle_id`),
    KEY `idx_type` (`type`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_created_by_user` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de ingresos/egresos';

-- -----------------------------------------------------------------------------
-- 8. REGISTROS DE ACCESO TEMPORAL (temporary_access_logs)
-- -----------------------------------------------------------------------------
CREATE TABLE `temporary_access_logs` (
    `temp_access_log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `temp_visit_id` INT UNSIGNED DEFAULT NULL,
    `temp_entry_time` DATETIME NOT NULL,
    `temp_exit_time` DATETIME DEFAULT NULL,
    `access_point_id` INT UNSIGNED NOT NULL,
    `status_validated` VARCHAR(50) DEFAULT NULL,
    `house_id` INT UNSIGNED DEFAULT NULL,
    `operario_id` INT UNSIGNED DEFAULT NULL,
    `created_by_user_id` INT UNSIGNED DEFAULT NULL COMMENT 'user_id quien registró (reemplazo conceptual de operario_id)',
    PRIMARY KEY (`temp_access_log_id`),
    KEY `idx_temp_visit` (`temp_visit_id`),
    KEY `idx_access_point` (`access_point_id`),
    KEY `idx_house` (`house_id`),
    KEY `idx_operario` (`operario_id`),
    KEY `idx_created_by_user` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. MASCOTAS (pets)
-- -----------------------------------------------------------------------------
CREATE TABLE `pets` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `species` ENUM('PERRO', 'GATO', 'AVE', 'PEQUEÑO MAMÍFERO', 'ACUÁTICO', 'EXÓTICO', 'OTRO') NOT NULL,
    `breed` VARCHAR(100) DEFAULT '',
    `color` VARCHAR(50) DEFAULT '',
    `age_years` TINYINT UNSIGNED DEFAULT NULL COMMENT 'Edad en años (opcional)',
    `house_id` INT UNSIGNED NOT NULL COMMENT 'Casa a la que pertenece (gestión por casa)',
    `owner_id` INT UNSIGNED DEFAULT NULL COMMENT 'persons.id - dueño opcional',
    `photo_url` VARCHAR(255) DEFAULT NULL,
    `status_validated` ENUM('PERMITIDO', 'OBSERVADO', 'DENEGADO') DEFAULT 'PERMITIDO',
    `status_reason` VARCHAR(255) DEFAULT NULL,
    `microchip_id` VARCHAR(50) DEFAULT NULL,
    `created_by_user_id` INT UNSIGNED DEFAULT NULL,
    `updated_by_user_id` INT UNSIGNED DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_house` (`house_id`),
    KEY `idx_owner` (`owner_id`),
    KEY `idx_status` (`status_validated`),
    KEY `idx_species` (`species`),
    KEY `idx_created_by_user` (`created_by_user_id`),
    KEY `idx_updated_by_user` (`updated_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mascotas registradas';

-- -----------------------------------------------------------------------------
-- 10. RESERVACIONES (reservations)
-- -----------------------------------------------------------------------------
CREATE TABLE `reservations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `access_point_id` INT UNSIGNED NOT NULL COMMENT 'Área (Casa Club, Piscina)',
    `person_id` INT UNSIGNED DEFAULT NULL COMMENT 'Responsable',
    `house_id` INT UNSIGNED NOT NULL,
    `reservation_date` DATETIME NOT NULL,
    `end_date` DATETIME DEFAULT NULL,
    `status` ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    `observation` TEXT DEFAULT NULL,
    `num_guests` INT UNSIGNED NOT NULL DEFAULT 1,
    `contact_phone` VARCHAR(20) DEFAULT NULL,
    `created_by_user_id` INT UNSIGNED DEFAULT NULL COMMENT 'user_id quien creó la reserva',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_access_point` (`access_point_id`),
    KEY `idx_person` (`person_id`),
    KEY `idx_house` (`house_id`),
    KEY `idx_status` (`status`),
    KEY `idx_reservation_date` (`reservation_date`),
    KEY `idx_created_by_user` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reservaciones de áreas comunes';

-- =============================================================================
-- CLAVES FORÁNEAS
-- =============================================================================
-- users -> houses, persons
ALTER TABLE `users`
    ADD CONSTRAINT `fk_users_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_users_person` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- persons -> houses
ALTER TABLE `persons`
    ADD CONSTRAINT `fk_persons_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- house_members -> houses, persons
ALTER TABLE `house_members`
    ADD CONSTRAINT `fk_house_members_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_house_members_person` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- vehicles -> houses, users
ALTER TABLE `vehicles`
    ADD CONSTRAINT `fk_vehicles_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_vehicles_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_vehicles_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- access_logs -> access_points(id), persons(id), vehicles(vehicle_id), users(created_by)
ALTER TABLE `access_logs`
    ADD CONSTRAINT `fk_access_logs_ap` FOREIGN KEY (`access_point_id`) REFERENCES `access_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_access_logs_person` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_access_logs_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_access_logs_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- temporary_access_logs -> users
ALTER TABLE `temporary_access_logs`
    ADD CONSTRAINT `fk_temp_access_logs_ap` FOREIGN KEY (`access_point_id`) REFERENCES `access_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_temp_access_logs_temp_visit` FOREIGN KEY (`temp_visit_id`) REFERENCES `temporary_visits` (`temp_visit_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_temp_access_logs_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_temp_access_logs_operario` FOREIGN KEY (`operario_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_temp_access_logs_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- pets -> houses, persons (opcional), users
ALTER TABLE `pets`
    ADD CONSTRAINT `fk_pets_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pets_owner` FOREIGN KEY (`owner_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pets_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_pets_updated_by` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- reservations -> users
ALTER TABLE `reservations`
    ADD CONSTRAINT `fk_reservations_ap` FOREIGN KEY (`access_point_id`) REFERENCES `access_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_reservations_person` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_reservations_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_reservations_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- DATOS INICIALES (puntos de acceso para reservas y API)
-- =============================================================================
INSERT INTO `access_points` (`name`, `type`, `location`, `max_capacity`, `current_capacity`) VALUES
('Garita Principal', 'GARITA', 'Entrada principal del condominio', NULL, 0),
('Entrada Peatonal', 'ENTRADA_PEATONAL', 'Puerta principal peatonal', NULL, 0),
('Piscina', 'PISCINA', 'Área de piscina', 50, 0),
('Casa Club', 'CASA_CLUB', 'Edificio de eventos', 200, 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
