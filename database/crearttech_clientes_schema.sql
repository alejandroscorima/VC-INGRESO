-- =============================================================================
-- CREARTTECH - Base de datos de clientes y licencias
-- Gestiona los clientes que adquieren el sistema (VC5, Planicie5, etc.)
-- Usada por: bdLicense.php, getPaymentByClientId.php, getSystemClientById.php
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `crearttech_clientes` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crearttech_clientes`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- CLIENTES (empresas/condominios que usan el sistema)
-- Nombres de columna client_* para compatibilidad con getSystemClientById.php
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `clients`;

CREATE TABLE `clients` (
    `client_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_name` VARCHAR(200) NOT NULL COMMENT 'Nombre o razón social',
    `client_phone` VARCHAR(20) DEFAULT NULL,
    `client_email` VARCHAR(100) DEFAULT NULL,
    `client_ruc` VARCHAR(20) DEFAULT NULL COMMENT 'DNI o RUC según doc_type',
    `doc_type` ENUM('DNI', 'RUC') DEFAULT 'RUC',
    `client_logo` VARCHAR(255) DEFAULT NULL COMMENT 'URL o path del logo',
    `address` VARCHAR(255) DEFAULT NULL,
    `contact_name` VARCHAR(100) DEFAULT NULL COMMENT 'Persona de contacto',
    `notes` TEXT DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`client_id`),
    KEY `idx_client_ruc` (`client_ruc`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clientes Crearttech (condominios/empresas que usan el sistema)';

-- -----------------------------------------------------------------------------
-- PAGOS / PERÍODOS DE LICENCIA
-- Nombres de columna compatibles con getPaymentByClientId.php
-- -----------------------------------------------------------------------------
CREATE TABLE `payment` (
    `payment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_id` INT UNSIGNED NOT NULL,
    `date_start` DATE NOT NULL COMMENT 'Inicio del período de servicio',
    `date_expire` DATE NOT NULL COMMENT 'Fin del período de servicio',
    `payment_date` DATE DEFAULT NULL COMMENT 'Fecha en que se realizó el pago',
    `payment_frequency` ENUM('MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL') DEFAULT 'ANUAL',
    `amount` DECIMAL(12,2) DEFAULT NULL COMMENT 'Monto pagado (opcional)',
    `currency` VARCHAR(3) DEFAULT 'PEN',
    `status` ENUM('PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO') DEFAULT 'PAGADO',
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`payment_id`),
    KEY `idx_client_id` (`client_id`),
    KEY `idx_date_expire` (`date_expire`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_payment_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagos y períodos de licencia por cliente';

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- DATOS INICIALES (cliente demo VC5 y licencia vigente para client_id=1)
-- El frontend usa getPaymentByClientId(1) tras el login; debe existir este cliente y un pago vigente.
-- -----------------------------------------------------------------------------
INSERT INTO `clients` (`client_id`, `client_name`, `client_phone`, `client_email`, `client_ruc`, `doc_type`, `client_logo`, `is_active`) VALUES
(1, 'Villa Club 5', '999888777', 'contacto@villaclub5.com', '20100000001', 'RUC', NULL, 1)
ON DUPLICATE KEY UPDATE `client_name` = VALUES(`client_name`), `client_email` = VALUES(`client_email`);

INSERT INTO `payment` (`client_id`, `date_start`, `date_expire`, `payment_date`, `payment_frequency`, `status`) VALUES
(1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), 'ANUAL', 'PAGADO');
