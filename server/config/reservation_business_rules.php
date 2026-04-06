<?php
/**
 * Reglas de negocio — reservas Casa club / áreas comunes.
 *
 * Modificar SOLO estos valores si cambia la política del condominio.
 */

/** Máximo de reservas “activas” (PENDIENTE + CONFIRMADA) por casa y por mes calendario. */
const RESERVATION_MAX_ACTIVE_PER_MONTH_PER_HOUSE = 5;

/** Duración máxima de un evento (entre reservation_date y end_date), en horas. */
const RESERVATION_MAX_EVENT_HOURS = 8;
