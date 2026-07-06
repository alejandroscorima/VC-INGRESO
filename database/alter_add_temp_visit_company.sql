-- Migración: campo Empresa/Negocio en visitas externas (temporary_visits)
-- Ejecutar una vez en bases de datos ya desplegadas:
--   mysql -u ... -p vc_db < database/alter_add_temp_visit_company.sql

ALTER TABLE `temporary_visits`
    ADD COLUMN `temp_visit_company` VARCHAR(150) DEFAULT NULL
        COMMENT 'Empresa o negocio (delivery, taxi, etc.)'
        AFTER `temp_visit_name`;
