<?php
/**
 * Reglas de negocio — reservas Casa club / áreas comunes.
 *
 * Modificar SOLO estos valores si cambia la política del condominio.
 */

/** Máximo de reservas “activas” (PENDIENTE + CONFIRMADA) por casa y por mes calendario (según reservation_date). */
const RESERVATION_MAX_ACTIVE_PER_MONTH_PER_HOUSE = 5;

/**
 * Hora de inicio del “día lógico” de reserva: desde este momento del día D
 * hasta la misma hora del día D+1 (entrega del ambiente).
 */
const RESERVATION_DAY_START_HOUR = 8;
