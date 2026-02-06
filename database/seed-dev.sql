-- =============================================================================
-- VC-INGRESO - Datos de prueba para desarrollo
-- Ejecutar después de "Creación de tablas VC.sql" y "Relación Claves Foráneas VC.sql"
-- Base de datos: vc_db
--
-- Cómo ejecutar (PowerShell, con MySQL en Docker):
--   .\scripts\import-sql-mysql.ps1 "database\seed-dev.sql" vc_db
-- O manualmente:
--   Get-Content database\seed-dev.sql -Raw | docker exec -i vc-ingreso-mysql mysql -uroot -pOscorpsvr vc_db
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. CASAS (houses)
-- -----------------------------------------------------------------------------
INSERT INTO `houses` (`block_house`, `lot`, `apartment`, `status_system`) VALUES
('A', 101, NULL, 'ACTIVO'),
('A', 102, '201', 'ACTIVO'),
('B', 1, NULL, 'ACTIVO')
ON DUPLICATE KEY UPDATE `block_house` = VALUES(`block_house`);

-- -----------------------------------------------------------------------------
-- 2. USUARIOS (users) - Para iniciar sesión
-- Contraseña en texto plano para dev: demo123 (el login acepta texto plano si no es hash)
-- Admin: admin / demo123  |  Operario: operario / demo123  |  Guardia: guardia / demo123
-- -----------------------------------------------------------------------------
INSERT INTO `users` (
    `type_doc`, `doc_number`, `first_name`, `paternal_surname`, `maternal_surname`,
    `gender`, `birth_date`, `cel_number`, `email`, `role_system`, `username_system`, `password_system`,
    `house_id`, `status_validated`, `status_system`
) VALUES
('DNI', '00000001', 'Admin', 'Sistema', 'VC', 'M', '1990-01-15', '999111222', 'admin@vc.local', 'ADMIN', 'admin', 'demo123', NULL, 'PERMITIDO', 'ACTIVO'),
('DNI', '00000002', 'Juan', 'Operario', 'García', 'M', '1985-05-20', '999333444', 'operario@vc.local', 'OPERARIO', 'operario', 'demo123', 1, 'PERMITIDO', 'ACTIVO'),
('DNI', '00000003', 'María', 'Guardia', 'López', 'F', '1992-08-10', '999555666', 'guardia@vc.local', 'GUARDIA', 'guardia', 'demo123', 2, 'PERMITIDO', 'ACTIVO')
ON DUPLICATE KEY UPDATE `username_system` = VALUES(`username_system`);

-- -----------------------------------------------------------------------------
-- 3. PERSONAS (persons) - Residentes/propietarios (para mascotas, reservas, access_logs)
-- -----------------------------------------------------------------------------
INSERT INTO `persons` (
    `type_doc`, `doc_number`, `first_name`, `paternal_surname`, `maternal_surname`,
    `gender`, `birth_date`, `cel_number`, `email`, `person_type`, `house_id`,
    `status_validated`, `status_system`
) VALUES
('DNI', '10000001', 'Carlos', 'Residente', 'Uno', 'M', '1980-03-12', '987654321', 'carlos@email.com', 'PROPIETARIO', 1, 'PERMITIDO', 'ACTIVO'),
('DNI', '10000002', 'Ana', 'Residente', 'Dos', 'F', '1985-07-22', '987654322', 'ana@email.com', 'PROPIETARIO', 2, 'PERMITIDO', 'ACTIVO'),
('DNI', '10000003', 'Luis', 'Residente', 'Tres', 'M', '1975-11-05', '987654323', 'luis@email.com', 'RESIDENTE', 3, 'PERMITIDO', 'ACTIVO')
ON DUPLICATE KEY UPDATE `doc_number` = VALUES(`doc_number`);

-- -----------------------------------------------------------------------------
-- 4. VEHÍCULOS (vehicles)
-- -----------------------------------------------------------------------------
INSERT INTO `vehicles` (`license_plate`, `type_vehicle`, `house_id`, `owner_id`, `status_validated`, `status_system`) VALUES
('ABC-001', 'AUTO', 1, 1, 'PERMITIDO', 'ACTIVO'),
('ABC-002', 'AUTO', 2, 2, 'PERMITIDO', 'ACTIVO'),
('XYZ-999', 'MOTO', 3, 3, 'PERMITIDO', 'ACTIVO')
ON DUPLICATE KEY UPDATE `license_plate` = VALUES(`license_plate`);

-- -----------------------------------------------------------------------------
-- 5. MASCOTAS (pets) - Funcionalidad nueva
-- -----------------------------------------------------------------------------
INSERT INTO `pets` (`name`, `species`, `breed`, `color`, `owner_id`, `status_validated`, `microchip_id`) VALUES
('Max', 'DOG', 'Labrador', 'Negro', 1, 'PERMITIDO', NULL),
('Luna', 'CAT', 'Persa', 'Blanco', 1, 'PERMITIDO', NULL),
('Firulais', 'DOG', 'Criollo', 'Café', 2, 'PERMITIDO', 'CHIP-001')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 6. RESERVACIONES (reservations) - Funcionalidad nueva
-- access_points: 1=Garita, 2=Entrada Peatonal, 3=Piscina, 4=Casa Club (según Creación de tablas)
-- -----------------------------------------------------------------------------
INSERT INTO `reservations` (`access_point_id`, `person_id`, `house_id`, `reservation_date`, `end_date`, `status`, `num_guests`, `contact_phone`, `observation`) VALUES
(4, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'CONFIRMADA', 10, '987654321', 'Cumpleaños'),
(3, 2, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 3 HOUR), 'PENDIENTE', 4, '987654322', NULL),
(4, 3, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 4 HOUR), 'PENDIENTE', 20, '987654323', 'Reunión familiar');

-- -----------------------------------------------------------------------------
-- 7. REGISTROS DE ACCESO (access_logs) - Funcionalidad nueva
-- access_point_id: 1=Garita Principal, 2=Entrada Peatonal, 3=Piscina, 4=Casa Club
-- -----------------------------------------------------------------------------
INSERT INTO `access_logs` (`access_point_id`, `person_id`, `doc_number`, `vehicle_id`, `type`, `observation`) VALUES
(1, 1, NULL, 1, 'INGRESO', 'Ingreso vehículo ABC-001'),
(1, NULL, '10000002', NULL, 'INGRESO', 'Visita a pie'),
(2, 3, NULL, NULL, 'INGRESO', 'Entrada peatonal'),
(1, 1, NULL, 1, 'EGRESO', NULL),
(1, 2, NULL, 2, 'INGRESO', NULL)
ON DUPLICATE KEY UPDATE `type` = VALUES(`type`);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- CREDENCIALES DE PRUEBA (resumen)
-- =============================================================================
-- Usuario     | username_system | password_system | role_system
-- ------------|-----------------|----------------|------------
-- Admin       | admin           | demo123        | ADMIN
-- Operario    | operario        | demo123        | OPERARIO
-- Guardia     | guardia         | demo123        | GUARDIA
