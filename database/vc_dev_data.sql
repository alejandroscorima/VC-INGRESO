-- =============================================================================
-- VC-INGRESO - Datos de prueba para desarrollo
-- Ejecutar después de vc_create_database.sql
-- Base de datos: vc_db
--
-- Cómo ejecutar (MySQL en Docker):
--   docker exec -i vc-ingreso-mysql mysql -uroot -p<DB_PASS> vc_db < database/vc_dev_data.sql
-- O desde cliente MySQL conectado a vc_db:
--   source database/vc_dev_data.sql
-- =============================================================================

USE vc_db;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. CASAS (houses)
-- -----------------------------------------------------------------------------
INSERT INTO `houses` (`house_type`, `block_house`, `lot`, `apartment`, `status_system`) VALUES
('CASA', 'A', 101, NULL, 'ACTIVO'),
('DEPARTAMENTO', 'A', 102, '201', 'ACTIVO'),
('CASA', 'B', 1, NULL, 'ACTIVO')
ON DUPLICATE KEY UPDATE `block_house` = VALUES(`block_house`);

-- -----------------------------------------------------------------------------
-- 2. USUARIOS (users) - Para iniciar sesión
-- Contraseña en texto plano para dev: demo123 (el login acepta texto plano si no es hash)
-- Admin: admin / demo123 (rol ADMINISTRADOR para ver Configuración)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (
    `type_doc`, `doc_number`, `first_name`, `paternal_surname`, `maternal_surname`,
    `gender`, `birth_date`, `cel_number`, `email`, `role_system`, `username_system`, `password_system`,
    `house_id`, `property_category`, `status_validated`, `status_system`
) VALUES
('DNI', '00000001', 'Admin', 'Sistema', 'VC', 'M', '1990-01-15', '999111222', 'admin@vc.local', 'ADMINISTRADOR', 'admin', 'demo123', NULL, NULL, 'PERMITIDO', 'ACTIVO'),
('DNI', '00000002', 'Juan', 'Operario', 'García', 'M', '1985-05-20', '999333444', 'operario@vc.local', 'OPERARIO', 'operario', 'demo123', 1, 'PROPIETARIO', 'PERMITIDO', 'ACTIVO'),
('DNI', '00000003', 'María', 'Guardia', 'López', 'F', '1992-08-10', '999555666', 'guardia@vc.local', 'GUARDIA', 'guardia', 'demo123', 2, 'RESIDENTE', 'PERMITIDO', 'ACTIVO'),
('DNI', '00000004', 'Pedro', 'Inquilino', 'Soto', 'M', '1988-04-01', '999777888', 'pedro@vc.local', 'USUARIO', 'pedro', 'demo123', 1, 'INQUILINO', 'PERMITIDO', 'ACTIVO')
ON DUPLICATE KEY UPDATE `username_system` = VALUES(`username_system`), `role_system` = VALUES(`role_system`);

-- -----------------------------------------------------------------------------
-- 3. PERSONAS (persons) - Residentes/propietarios/inquilinos (para mascotas, reservas, access_logs)
-- -----------------------------------------------------------------------------
INSERT INTO `persons` (
    `type_doc`, `doc_number`, `first_name`, `paternal_surname`, `maternal_surname`,
    `gender`, `birth_date`, `cel_number`, `email`, `person_type`, `house_id`,
    `status_validated`, `status_system`
) VALUES
('DNI', '10000001', 'Carlos', 'Residente', 'Uno', 'M', '1980-03-12', '987654321', 'carlos@email.com', 'PROPIETARIO', 1, 'PERMITIDO', 'ACTIVO'),
('DNI', '10000002', 'Ana', 'Residente', 'Dos', 'F', '1985-07-22', '987654322', 'ana@email.com', 'PROPIETARIO', 2, 'PERMITIDO', 'ACTIVO'),
('DNI', '10000003', 'Luis', 'Residente', 'Tres', 'M', '1975-11-05', '987654323', 'luis@email.com', 'RESIDENTE', 3, 'PERMITIDO', 'ACTIVO'),
('DNI', '10000004', 'Rosa', 'Inquilina', 'Cuatro', 'F', '1990-09-14', '987654324', 'rosa@email.com', 'INQUILINO', 1, 'PERMITIDO', 'ACTIVO'),
('DNI', '10000005', 'Visitante', 'Prueba', 'Uno', 'M', '1982-01-20', '987654325', 'visita@email.com', 'VISITA', 1, 'PERMITIDO', 'ACTIVO')
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
INSERT INTO `pets` (`name`, `species`, `breed`, `color`, `house_id`, `owner_id`, `status_validated`, `microchip_id`) VALUES
('Max', 'PERRO', 'Labrador', 'Negro', 1, 1, 'PERMITIDO', NULL),
('Luna', 'GATO', 'Persa', 'Blanco', 1, 1, 'PERMITIDO', NULL),
('Firulais', 'PERRO', 'Criollo', 'Café', 2, 2, 'PERMITIDO', 'CHIP-001')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 6. RESERVACIONES (reservations)
-- access_points: 1=Garita, 2=Entrada Peatonal, 3=Piscina, 4=Casa Club
-- -----------------------------------------------------------------------------
INSERT INTO `reservations` (`access_point_id`, `person_id`, `house_id`, `reservation_date`, `end_date`, `status`, `num_guests`, `contact_phone`, `observation`) VALUES
(4, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'CONFIRMADA', 10, '987654321', 'Cumpleaños'),
(3, 2, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 3 HOUR), 'PENDIENTE', 4, '987654322', NULL),
(4, 3, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 4 HOUR), 'PENDIENTE', 20, '987654323', 'Reunión familiar'),
(3, 1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 HOUR), 'CONFIRMADA', 2, '987654321', 'Piscina hoy'),
(4, 2, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 HOUR), 'PENDIENTE', 5, '987654322', NULL);

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
-- Usuario     | username_system | password_system | role_system    | house_id
-- ------------|-----------------|-----------------|----------------|---------
-- Admin       | admin           | demo123        | ADMINISTRADOR   | NULL (ve Configuración)
-- Operario    | operario        | demo123        | OPERARIO       | 1
-- Guardia     | guardia         | demo123        | GUARDIA        | 2
-- Pedro       | pedro           | demo123        | USUARIO (inquilino) | 1
--
-- Para probar: Login con admin/demo123 → ver menú Configuración (Usuarios, Domicilios, Vehículos, Mascotas).
-- Mi Casa (con usuario con house_id): Residentes, Inquilinos, Mascotas, Vehículos, Visitas, Vehículos Externos.
-- Calendario: áreas 3 (Piscina), 4 (Casa Club); reservaciones con fechas de hoy y próximos días.
