-- Migración movida a database/migrations/001_add_temp_visit_company.sql
-- (este archivo se mantiene por compatibilidad con despliegues que ya lo referencian)

ALTER TABLE `temporary_visits`
    ADD COLUMN `temp_visit_company` VARCHAR(150) DEFAULT NULL
        COMMENT 'Empresa o negocio (delivery, taxi, etc.)'
        AFTER `temp_visit_name`;
