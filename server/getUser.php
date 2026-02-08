<?php
/**
 * Login: autentica por username/password.
 * Retorna user + person (identidad real) + my_houses (desde house_members).
 * Requiere migraciones 001 y 002 (users.person_id, house_members).
 */
$bd = include_once "vc_db.php";
require_once __DIR__ . '/token.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($payload['username_system'] ?? '');
$password = $payload['password_system'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetros requeridos']);
    exit;
}

// User (solo sistema). Datos civiles vienen de persons vía person_id.
$sql = "SELECT u.user_id, u.person_id, u.is_active, u.role_system, u.house_id,
    u.status_validated, u.status_reason, u.status_system, u.force_password_change, u.password_system
    FROM users u
    WHERE LOWER(u.username_system) = LOWER(:username)";
$stmt = $bd->prepare($sql);
$stmt->bindParam(':username', $username, PDO::PARAM_STR);
$stmt->execute();
$user = $stmt->fetchObject();

if (!$user || $user->password_system === null || $user->password_system === '') {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    exit;
}

// is_active: si la columna existe y es 0, denegar
if (isset($user->is_active) && (int)$user->is_active === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Cuenta deshabilitada']);
    exit;
}

$stored = (string) $user->password_system;
$isHashed = (strlen($stored) >= 60 && (strpos($stored, '$2y$') === 0 || strpos($stored, '$2a$') === 0))
    || strpos($stored, '$argon2') === 0;
$validPassword = $isHashed
    ? password_verify($password, $stored)
    : hash_equals($stored, (string) $password);

if (!$validPassword) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    exit;
}

// Person (identidad civil: nombres, documento, contacto, etc.)
$person = null;
if (!empty($user->person_id)) {
    $stmtPerson = $bd->prepare("SELECT id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, cel_number, email, address, district, province, region, civil_status, person_type, house_id, photo_url, status_validated, status_system FROM persons WHERE id = ?");
    $stmtPerson->execute([$user->person_id]);
    $person = $stmtPerson->fetchObject();
}

// Casas accesibles: desde house_members (fuente de verdad). Fallback legacy: users.house_id
$my_houses = [];
if (!empty($user->person_id)) {
    $stmtHouses = $bd->prepare("
        SELECT h.house_id, h.house_type, h.block_house, h.lot, h.apartment, hm.relation_type, hm.is_primary
        FROM house_members hm
        JOIN houses h ON h.house_id = hm.house_id
        WHERE hm.person_id = ? AND hm.is_active = 1
        ORDER BY hm.is_primary DESC, hm.id
    ");
    $stmtHouses->execute([$user->person_id]);
    $my_houses = $stmtHouses->fetchAll(PDO::FETCH_OBJ);
}
if (empty($my_houses) && !empty($user->house_id)) {
    // Legacy: una sola casa desde users.house_id
    $stmtLegacy = $bd->prepare("SELECT house_id, house_type, block_house, lot, apartment FROM houses WHERE house_id = ?");
    $stmtLegacy->execute([$user->house_id]);
    $h = $stmtLegacy->fetchObject();
    if ($h) {
        $h->relation_type = 'RESIDENTE';
        $h->is_primary = 1;
        $my_houses = [$h];
    }
}

unset($user->password_system);

$tokenPayload = [
    'user_id' => $user->user_id,
    'role_system' => $user->role_system,
    'house_id' => $user->house_id, // legacy; preferir my_houses
];
if (!empty($user->person_id)) {
    $tokenPayload['person_id'] = (int) $user->person_id;
}
$token = generateToken($tokenPayload);

echo json_encode([
    'user' => $user,
    'person' => $person,
    'my_houses' => $my_houses,
    'token' => $token,
]);
