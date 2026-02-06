-- =============================================================================
-- VC-INGRESO - Claves foráneas (relaciones entre tablas)
-- Ejecutar después de "Creación de tablas VC.sql" si las tablas ya existen
-- y no se añadieron las FK en ese script.
-- Esquema: access_points.id, persons.id, access_logs.access_point_id, etc.
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar FKs existentes si se re-ejecuta (opcional; ignorar errores si no existen)
-- ALTER TABLE users DROP FOREIGN KEY fk_users_house;
-- ALTER TABLE persons DROP FOREIGN KEY fk_persons_house;
-- ... etc.

-- users -> houses
ALTER TABLE `users`
    ADD CONSTRAINT `fk_users_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- persons -> houses
ALTER TABLE `persons`
    ADD CONSTRAINT `fk_persons_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- vehicles -> houses
ALTER TABLE `vehicles`
    ADD CONSTRAINT `fk_vehicles_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- access_logs -> access_points(id), persons(id), vehicles(vehicle_id)
ALTER TABLE `access_logs`
    ADD CONSTRAINT `fk_access_logs_ap` FOREIGN KEY (`access_point_id`) REFERENCES `access_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `access_logs`
    ADD CONSTRAINT `fk_access_logs_person` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `access_logs`
    ADD CONSTRAINT `fk_access_logs_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- temporary_access_logs -> access_points(id), temporary_visits, houses, users(operario_id)
ALTER TABLE `temporary_access_logs`
    ADD CONSTRAINT `fk_temp_access_logs_ap` FOREIGN KEY (`access_point_id`) REFERENCES `access_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `temporary_access_logs`
    ADD CONSTRAINT `fk_temp_access_logs_temp_visit` FOREIGN KEY (`temp_visit_id`) REFERENCES `temporary_visits` (`temp_visit_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `temporary_access_logs`
    ADD CONSTRAINT `fk_temp_access_logs_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `temporary_access_logs`
    ADD CONSTRAINT `fk_temp_access_logs_operario` FOREIGN KEY (`operario_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- pets -> persons(id)
ALTER TABLE `pets`
    ADD CONSTRAINT `fk_pets_owner` FOREIGN KEY (`owner_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- reservations -> access_points(id), persons(id), houses(house_id)
ALTER TABLE `reservations`
    ADD CONSTRAINT `fk_reservations_ap` FOREIGN KEY (`access_point_id`) REFERENCES `access_points` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `reservations`
    ADD CONSTRAINT `fk_reservations_person` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `reservations`
    ADD CONSTRAINT `fk_reservations_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`house_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
