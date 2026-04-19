<?php
/**
 * Cierre automático de reservas: CONFIRMADA → COMPLETADA cuando ya pasó end_date.
 * Usado por el login de administrador (refuerzo). El cierre programado principal es el EVENT MySQL (08:02 America/Lima).
 */

/**
 * @return int número de filas actualizadas
 */
function complete_expired_confirmed_reservations(\PDO $pdo): int
{
    $stmt = $pdo->prepare("
        UPDATE reservations
        SET status = 'COMPLETADA'
        WHERE status = 'CONFIRMADA'
          AND end_date IS NOT NULL
          AND end_date < NOW()
    ");
    $stmt->execute();

    return $stmt->rowCount();
}
