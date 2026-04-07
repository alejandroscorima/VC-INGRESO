<?php
/**
 * Permisos house-centric: validar acceso a casa (house_members) y owner_id en assets.
 * Requiere migraciones 001 (house_members, users.person_id).
 */

/**
 * Verifica si el usuario autenticado puede operar sobre la casa $houseId.
 * - role_system ADMIN/ADMINISTRADOR: acceso global (sin necesidad de ser miembro).
 * - Resto: debe ser miembro activo de la casa (house_members) vía user.person_id.
 *
 * @param PDO $pdo
 * @param array $auth payload del token (user_id, role_system, person_id)
 * @param int $houseId
 * @return bool
 */
function canAccessHouse(\PDO $pdo, array $auth, int $houseId): bool {
    $role = strtoupper(trim($auth['role_system'] ?? ''));
    if ($role === 'ADMIN' || $role === 'ADMINISTRADOR') {
        return true;
    }

    // Si el usuario ya tiene house_id directo en el token/user (registro con house_id tradicional), también tiene acceso.
    $authHouseId = isset($auth['house_id']) ? (int)$auth['house_id'] : null;
    if ($authHouseId && $authHouseId === $houseId) {
        return true;
    }

    $personId = $auth['person_id'] ?? null;
    if ($personId !== null) {
        // Permitir si la persona tiene house_id asignada directamente en persons
        $stmtP = $pdo->prepare("SELECT house_id FROM persons WHERE id = ? LIMIT 1");
        $stmtP->execute([$personId]);
        $personRow = $stmtP->fetch(\PDO::FETCH_ASSOC);
        if ($personRow && isset($personRow['house_id']) && (int)$personRow['house_id'] === $houseId) {
            return true;
        }

        // Si no, revisar por membresía activa en esa casa
        $stmt = $pdo->prepare(
            "SELECT 1 FROM house_members WHERE house_id = ? AND person_id = ? AND COALESCE(is_active, 1) = 1 LIMIT 1"
        );
        $stmt->execute([$houseId, $personId]);
        if ($stmt->fetch() !== false) {
            return true;
        }
    }

    return false;
}

/**
 * Valida que $ownerId (person_id) sea miembro activo de la casa $houseId.
 * Si $ownerId es null, retorna true (campo opcional).
 *
 * @param PDO $pdo
 * @param int $houseId
 * @param int|null $ownerId
 * @return bool
 */
function validateOwnerInHouse(\PDO $pdo, int $houseId, ?int $ownerId): bool {
    if ($ownerId === null || $ownerId === 0) {
        return true;
    }
    $stmt = $pdo->prepare(
        "SELECT 1 FROM house_members WHERE house_id = ? AND person_id = ? AND COALESCE(is_active, 1) = 1 LIMIT 1"
    );
    $stmt->execute([$houseId, $ownerId]);
    if ($stmt->fetch() !== false) {
        return true;
    }
    // Persona ligada a la casa solo vía persons.house_id (sin fila en house_members)
    $stmt2 = $pdo->prepare('SELECT 1 FROM persons WHERE id = ? AND house_id = ? LIMIT 1');
    $stmt2->execute([$ownerId, $houseId]);
    return $stmt2->fetch() !== false;
}

/**
 * Rol con acceso global a casas (crear vehículo asigna owner al primer propietario).
 */
function isAdminRole(array $auth): bool {
    $role = strtoupper(trim($auth['role_system'] ?? ''));

    return $role === 'ADMIN' || $role === 'ADMINISTRADOR';
}

/**
 * Personal operativo (portería, administración de accesos): historial global, etc.
 * Mantener alineado con `src/app/system-roles.ts` (STAFF_ROLE_SYSTEM_VALUES).
 */
function isStaffRole(array $auth): bool {
    $role = strtoupper(trim($auth['role_system'] ?? ''));

    return $role === 'ADMIN' || $role === 'ADMINISTRADOR' || $role === 'OPERARIO' || $role === 'GUARDIA';
}

/**
 * OPERARIO / GUARDIA: solo escanean en portería, no generan QR de hogar.
 */
function isOperarioOrGuardiaRole(array $auth): bool {
    $role = strtoupper(trim($auth['role_system'] ?? ''));

    return $role === 'OPERARIO' || $role === 'GUARDIA';
}

/**
 * Puede generar JWT QR de ingreso: USUARIO o ADMIN/ADMINISTRADOR con person_id vinculada.
 * (Administrador que también es residente del barrio — misma regla que Mi casa.)
 */
function canGenerateAccessQr(array $auth): bool {
    $pid = isset($auth['person_id']) ? (int) $auth['person_id'] : 0;
    if ($pid <= 0) {
        return false;
    }
    $role = strtoupper(trim($auth['role_system'] ?? ''));
    if ($role === 'USUARIO') {
        return true;
    }
    if ($role === 'ADMIN' || $role === 'ADMINISTRADOR') {
        return true;
    }

    return false;
}

/**
 * Puede generar QR para otra persona en Mi casa (reglas propietario/residente/inquilino).
 */
function canGenerateQrForPerson(\PDO $pdo, array $auth, int $targetPersonId): bool {
    if (!canGenerateAccessQr($auth)) {
        return false;
    }
    if (isOperarioOrGuardiaRole($auth)) {
        return false;
    }
    $stmt = $pdo->prepare('SELECT * FROM persons WHERE id = ? LIMIT 1');
    $stmt->execute([$targetPersonId]);
    $p = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$p) {
        return false;
    }
    $authPid = (int) ($auth['person_id'] ?? 0);
    if ($authPid <= 0) {
        return false;
    }
    $hid = (int) ($p['house_id'] ?? 0);
    if ($hid <= 0) {
        $stmtH = $pdo->prepare(
            'SELECT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1 ORDER BY is_primary DESC, id ASC LIMIT 1'
        );
        $stmtH->execute([$targetPersonId]);
        $hm = $stmtH->fetch(\PDO::FETCH_ASSOC);
        if ($hm && !empty($hm['house_id'])) {
            $hid = (int) $hm['house_id'];
        }
    }
    if ($hid <= 0) {
        return false;
    }
    if (!canAccessHouse($pdo, $auth, $hid)) {
        return false;
    }
    if ($targetPersonId === $authPid) {
        return true;
    }
    $pt = strtoupper(trim($p['person_type'] ?? ''));
    $rel = getRelationTypeForHouse($pdo, $authPid, $hid);
    if ($rel === null || $rel === '') {
        return false;
    }
    // INVITADO: visitas registradas en Mi casa (misma regla que canUsuarioCreatePersonForHouse).
    if ($rel === 'PROPIETARIO' || $rel === 'RESIDENTE') {
        return in_array($pt, ['PROPIETARIO', 'RESIDENTE', 'INQUILINO', 'VISITA', 'INVITADO'], true);
    }
    if ($rel === 'INQUILINO') {
        return in_array($pt, ['INQUILINO', 'VISITA', 'INVITADO'], true);
    }

    return false;
}

/**
 * Puede generar QR para un vehículo de una casa a la que tiene acceso (vecino).
 */
function canGenerateQrForVehicle(\PDO $pdo, array $auth, int $vehicleId): bool {
    if (!canGenerateAccessQr($auth)) {
        return false;
    }
    if (isOperarioOrGuardiaRole($auth)) {
        return false;
    }
    $stmt = $pdo->prepare('SELECT vehicle_id, house_id, license_plate FROM vehicles WHERE vehicle_id = ? LIMIT 1');
    $stmt->execute([$vehicleId]);
    $v = $stmt->fetch(\PDO::FETCH_ASSOC);
    if (!$v || empty($v['house_id'])) {
        return false;
    }
    $hid = (int) $v['house_id'];

    return canAccessHouse($pdo, $auth, $hid);
}

/**
 * Primer persons.id de un propietario de la casa (house_members, luego persons).
 */
function getFirstPropietarioPersonIdForHouse(\PDO $pdo, int $houseId): ?int {
    $stmt = $pdo->prepare(
        "SELECT hm.person_id FROM house_members hm
         WHERE hm.house_id = ? AND COALESCE(hm.is_active, 1) = 1
         AND UPPER(TRIM(hm.relation_type)) = 'PROPIETARIO'
         ORDER BY hm.is_primary DESC, hm.id ASC
         LIMIT 1"
    );
    $stmt->execute([$houseId]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    if ($row && !empty($row['person_id'])) {
        return (int) $row['person_id'];
    }
    $stmt2 = $pdo->prepare(
        "SELECT id FROM persons WHERE house_id = ? AND UPPER(TRIM(COALESCE(person_type,''))) = 'PROPIETARIO' ORDER BY id ASC LIMIT 1"
    );
    $stmt2->execute([$houseId]);
    $row2 = $stmt2->fetch(\PDO::FETCH_ASSOC);

    return ($row2 && !empty($row2['id'])) ? (int) $row2['id'] : null;
}

/**
 * Usuario de sistema USUARIO cuya persona es INQUILINO (persons.person_type).
 * Usado para restringir Mi casa: solo activos de owner_id = person_id y vehículos categoría INQUILINO.
 */
function isTenantUser(\PDO $pdo, array $auth): bool {
    $role = strtoupper(trim($auth['role_system'] ?? ''));
    if ($role !== 'USUARIO') {
        return false;
    }
    $personId = isset($auth['person_id']) ? (int) $auth['person_id'] : 0;
    if ($personId <= 0) {
        return false;
    }
    $stmt = $pdo->prepare("SELECT UPPER(TRIM(COALESCE(person_type,''))) AS pt FROM persons WHERE id = ? LIMIT 1");
    $stmt->execute([$personId]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    return $row && ($row['pt'] ?? '') === 'INQUILINO';
}

/**
 * IDs de casas a las que el usuario tiene vínculo (no admin). Vacío si ninguna.
 *
 * @return int[]
 */
function getAccessibleHouseIds(\PDO $pdo, array $auth): array {
    if (isAdminRole($auth)) {
        return [];
    }
    $ids = [];
    $personId = isset($auth['person_id']) ? (int) $auth['person_id'] : 0;
    if ($personId > 0) {
        $stmt = $pdo->prepare('SELECT DISTINCT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1');
        $stmt->execute([$personId]);
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            if (!empty($row['house_id'])) {
                $ids[] = (int) $row['house_id'];
            }
        }
        $stmt2 = $pdo->prepare('SELECT house_id FROM persons WHERE id = ? AND house_id IS NOT NULL LIMIT 1');
        $stmt2->execute([$personId]);
        $row2 = $stmt2->fetch(\PDO::FETCH_ASSOC);
        if ($row2 && !empty($row2['house_id'])) {
            $h = (int) $row2['house_id'];
            if (!in_array($h, $ids, true)) {
                $ids[] = $h;
            }
        }
    }
    $legacy = (int) ($auth['house_id'] ?? 0);
    if ($legacy > 0 && !in_array($legacy, $ids, true)) {
        $ids[] = $legacy;
    }

    return array_values(array_unique($ids));
}

/**
 * Rol de la persona respecto a una casa (house_members.relation_type o persons vinculada a la casa).
 *
 * @return string|null PROPIETARIO|RESIDENTE|INQUILINO|… o null si no hay vínculo
 */
function getRelationTypeForHouse(\PDO $pdo, int $personId, int $houseId): ?string {
    $stmt = $pdo->prepare(
        "SELECT UPPER(TRIM(COALESCE(relation_type,''))) AS rt FROM house_members
         WHERE house_id = ? AND person_id = ? AND COALESCE(is_active, 1) = 1 LIMIT 1"
    );
    $stmt->execute([$houseId, $personId]);
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    if ($row && ($row['rt'] ?? '') !== '') {
        return $row['rt'];
    }
    $stmt2 = $pdo->prepare(
        "SELECT UPPER(TRIM(COALESCE(person_type,''))) AS pt FROM persons WHERE id = ? AND house_id = ? LIMIT 1"
    );
    $stmt2->execute([$personId, $houseId]);
    $row2 = $stmt2->fetch(\PDO::FETCH_ASSOC);

    return ($row2 && ($row2['pt'] ?? '') !== '') ? $row2['pt'] : null;
}

/**
 * USUARIO vecino: puede crear esta persona en esta casa según su vínculo (Mi casa).
 * Staff (isStaffRole) no usa esta función; va por otra rama.
 */
function canUsuarioCreatePersonForHouse(\PDO $pdo, array $auth, int $houseId, string $personType): bool {
    $role = strtoupper(trim($auth['role_system'] ?? ''));
    if ($role !== 'USUARIO') {
        return false;
    }
    if (!canAccessHouse($pdo, $auth, $houseId)) {
        return false;
    }
    $personId = (int) ($auth['person_id'] ?? 0);
    if ($personId <= 0) {
        return false;
    }
    $rel = getRelationTypeForHouse($pdo, $personId, $houseId);
    if ($rel === null || $rel === '') {
        return false;
    }
    $pt = strtoupper(trim($personType));
    if ($pt === '') {
        $pt = 'RESIDENTE';
    }

    $byOwner = ['PROPIETARIO', 'RESIDENTE', 'INQUILINO', 'INVITADO', 'VISITA'];
    $byResident = ['RESIDENTE', 'INQUILINO', 'INVITADO', 'VISITA'];
    $byTenant = ['INQUILINO', 'INVITADO', 'VISITA'];

    if ($rel === 'PROPIETARIO') {
        return in_array($pt, $byOwner, true);
    }
    if ($rel === 'RESIDENTE' || $rel === 'ADMINISTRADOR') {
        return in_array($pt, $byResident, true);
    }
    if ($rel === 'INQUILINO') {
        return in_array($pt, $byTenant, true);
    }

    return false;
}

/**
 * Puede leer/editar datos de esta fila de persons (objeto o array).
 */
function canAccessPersonRecord(\PDO $pdo, array $auth, $person): bool {
    if (isAdminRole($auth)) {
        return true;
    }
    $authPerson = (int) ($auth['person_id'] ?? 0);
    $personId = is_object($person)
        ? (int) ($person->id ?? 0)
        : (int) ($person['id'] ?? 0);
    if ($authPerson > 0 && $personId === $authPerson) {
        return true;
    }
    $hid = is_object($person)
        ? (int) ($person->house_id ?? 0)
        : (int) ($person['house_id'] ?? 0);
    if ($hid > 0 && canAccessHouse($pdo, $auth, $hid)) {
        return true;
    }

    return false;
}

/**
 * Puede ver/editar la ficha de un usuario (staff global; USUARIO: sí mismo o personas de sus casas).
 *
 * @param object|array $targetUser Fila users con person_id y user_id
 */
function canManageUserRecord(\PDO $pdo, array $auth, $targetUser): bool {
    if (isStaffRole($auth)) {
        return true;
    }
    $role = strtoupper(trim($auth['role_system'] ?? ''));
    $myUid = (int) ($auth['user_id'] ?? 0);
    $tid = (int) (is_object($targetUser) ? ($targetUser->user_id ?? 0) : ($targetUser['user_id'] ?? 0));
    if ($role === 'USUARIO' && $myUid > 0 && $tid > 0 && $tid === $myUid) {
        return true;
    }
    if ($role !== 'USUARIO' || $tid <= 0) {
        return false;
    }
    $tpid = (int) (is_object($targetUser) ? ($targetUser->person_id ?? 0) : ($targetUser['person_id'] ?? 0));
    if ($tpid <= 0) {
        return false;
    }
    $stmt = $pdo->prepare('SELECT id, house_id FROM persons WHERE id = ? LIMIT 1');
    $stmt->execute([$tpid]);
    $person = $stmt->fetch(\PDO::FETCH_ASSOC);
    if ($person && canAccessPersonRecord($pdo, $auth, $person)) {
        return true;
    }
    $stmt2 = $pdo->prepare(
        'SELECT DISTINCT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1'
    );
    $stmt2->execute([$tpid]);
    while ($row = $stmt2->fetch(\PDO::FETCH_ASSOC)) {
        if (!empty($row['house_id']) && canAccessHouse($pdo, $auth, (int) $row['house_id'])) {
            return true;
        }
    }

    return false;
}
