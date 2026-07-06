-- 001: Empresa/Negocio en visitas externas (temporary_visits)
-- Ejecutar una vez en BD ya desplegada:
--   docker exec -i vc-ingreso-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" vc_db' \
--     < database/migrations/001_add_temp_visit_company.sql

ALTER TABLE `temporary_visits`
    ADD COLUMN `temp_visit_company` VARCHAR(150) DEFAULT NULL
        COMMENT 'Empresa o negocio (delivery, taxi, etc.)'
        AFTER `temp_visit_name`;
