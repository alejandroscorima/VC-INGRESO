<?php
/**
 * Reglas por tipo de vehículo (alineado con src/app/vehicle-types.ts).
 */

/** @return string[] */
function vehicle_types_catalog(): array
{
    return [
        'AUTOMOVIL',
        'MOTOCICLETA',
        'MOTO ELECTRICA',
        'CAMIONETA',
        'CAMION',
        'MINIVAN',
        'MINI BUS',
        'MOTOTAXI',
        'FURGONETA',
        'BICICLETA',
    ];
}

function vehicle_type_is_known(string $type): bool
{
    $t = mb_strtoupper(trim($type), 'UTF-8');

    return in_array($t, vehicle_types_catalog(), true);
}

/** Bicicleta y moto eléctrica no usan placa de circulación; requieren foto. */
function vehicle_type_requires_license_plate(string $type): bool
{
    $t = mb_strtoupper(trim($type), 'UTF-8');

    return !in_array($t, ['BICICLETA', 'MOTO ELECTRICA'], true);
}
