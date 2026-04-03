-- Quién registró la visita temporal (taxi, delivery, etc.). Permite que cada usuario gestione solo sus anotaciones;
-- administración y operarios siguen viendo todo vía API.

ALTER TABLE `temporary_visits`
  ADD COLUMN `registered_by_user_id` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Usuario del sistema que registró esta visita' AFTER `temp_visit_id`,
  ADD KEY `idx_temporary_visits_registered_by` (`registered_by_user_id`);

ALTER TABLE `temporary_visits`
  ADD CONSTRAINT `fk_temporary_visits_registered_by` FOREIGN KEY (`registered_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
