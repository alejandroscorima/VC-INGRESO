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
    return $stmt->fetch() !== false;
}
