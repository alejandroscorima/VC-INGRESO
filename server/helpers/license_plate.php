<?php
/**
 * Normalización de placas (vehículos residentes y, opcionalmente, visitas externas).
 * Solo letras latinas A-Z y dígitos 0-9, en mayúsculas; sin espacios ni guiones.
 */

/**
 * @param string $raw Placa tal como la envía el cliente o está en legado BD.
 * @return string Cadena normalizada (puede quedar vacía si no hay alfanuméricos).
 */
function normalize_license_plate(string $raw): string
{
    $s = strtoupper(trim($raw));

    return preg_replace('/[^A-Z0-9]/', '', $s);
}
