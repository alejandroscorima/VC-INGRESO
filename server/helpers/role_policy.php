<?php
/**
 * Combinaciones permitidas role_system × persons.person_type (NULL = sin tipo / staff sin hogar).
 *
 * - ADMINISTRADOR: NULL | PROPIETARIO | RESIDENTE (nunca INQUILINO).
 * - OPERARIO: NULL | PROPIETARIO | RESIDENTE | INQUILINO.
 * - USUARIO: PROPIETARIO | RESIDENTE | INQUILINO (siempre con persona).
 */

function rpNormalizePersonType($pt): ?string
{
    if ($pt === null) {
        return null;
    }
    $t = strtoupper(trim((string) $pt));
    if ($t === '' || $t === 'NULL') {
        return null;
    }

    return $t;
}

function isValidRolePersonPair(string $role, ?string $personType): bool
{
    $r = strtoupper(trim($role));
    $pt = rpNormalizePersonType($personType);

    if ($r === 'ADMINISTRADOR') {
        return $pt === null || in_array($pt, ['PROPIETARIO', 'RESIDENTE'], true);
    }
    if ($r === 'OPERARIO') {
        return $pt === null || in_array($pt, ['PROPIETARIO', 'RESIDENTE', 'INQUILINO'], true);
    }
    if ($r === 'USUARIO') {
        return $pt !== null && in_array($pt, ['PROPIETARIO', 'RESIDENTE', 'INQUILINO'], true);
    }

    return false;
}

/**
 * Tipo de persona para permisos: JWT person_type o persons.
 */
function rpPersonTypeFromAuth(\PDO $pdo, array $auth): ?string
{
    if (array_key_exists('person_type', $auth)) {
        $v = $auth['person_type'];

        return rpNormalizePersonType($v === null ? null : (string) $v);
    }
    $pid = (int) ($auth['person_id'] ?? 0);
    if ($pid <= 0) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT UPPER(TRIM(COALESCE(person_type,\'\'))) AS pt FROM persons WHERE id = ? LIMIT 1');
    $stmt->execute([$pid]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);

    return $row ? rpNormalizePersonType($row['pt'] ?? '') : null;
}

function rpValidateLoginRolePerson(string $role, ?string $personType): ?string
{
    if (!isValidRolePersonPair($role, $personType)) {
        return 'Combinación de rol de sistema y tipo de persona no permitida. Contacte a administración.';
    }

    return null;
}
