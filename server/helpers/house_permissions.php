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
    $role = $auth['role_system'] ?? '';
    if (strtoupper($role) === 'ADMIN' || strtoupper($role) === 'ADMINISTRADOR') {
        return true;
    }
    $personId = $auth['person_id'] ?? null;
    if ($personId === null) {
        return false;
    }
    $stmt = $pdo->prepare(
        "SELECT 1 FROM house_members WHERE house_id = ? AND person_id = ? AND COALESCE(is_active, 1) = 1 LIMIT 1"
    );
    $stmt->execute([$houseId, $personId]);
    return $stmt->fetch() !== false;
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
    return $stmt->fetch() !== false;
}
