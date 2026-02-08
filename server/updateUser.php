<?php
// No exponer errores PHP en producción
if (getenv('APP_DEBUG') === 'true' || getenv('APP_DEBUG') === '1') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Headers CORS explícitos
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    http_response_code(405);
    exit(json_encode(["error" => "Solo acepto peticiones PUT"]));
}

$jsonUser  = json_decode(file_get_contents("php://input"), true);
if (!$jsonUser) {
    http_response_code(400);
    exit(json_encode(["error" => "No hay datos"]));
}
require_once __DIR__ . '/sanitize.php';
$fields = [
    'type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname',
    'gender', 'birth_date', 'cel_number', 'email', 'role_system', 'username_system',
    'house_id', 'photo_url', 'status_validated', 'status_reason',
    'status_system', 'civil_status', 'address_reniec', 'district',
    'province', 'region', 'user_id'
];
$clean = sanitize_payload($jsonUser, $fields);

$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

if (empty($clean['user_id'])) {
    http_response_code(400);
    exit(json_encode(["error" => "user_id es requerido"]));
}

$stmt = $bd->prepare("SELECT user_id, person_id FROM users WHERE user_id = ? LIMIT 1");
$stmt->execute([$clean['user_id']]);
$user = $stmt->fetch(PDO::FETCH_OBJ);
if (!$user) {
    http_response_code(404);
    exit(json_encode(["error" => "Usuario no encontrado"]));
}

// Actualizar persona (datos civiles) si tiene person_id
if (!empty($user->person_id)) {
    $stmt = $bd->prepare("UPDATE persons SET 
        type_doc = ?, doc_number = ?, first_name = ?, paternal_surname = ?, maternal_surname = ?,
        gender = ?, birth_date = ?, cel_number = ?, email = ?, address = ?, district = ?, province = ?, region = ?,
        civil_status = ?, photo_url = ?, house_id = ?, status_validated = ?, status_system = ?
        WHERE id = ?");
    $stmt->execute([
        $clean['type_doc'] ?? null,
        $clean['doc_number'] ?? null,
        $clean['first_name'] ?? null,
        $clean['paternal_surname'] ?? null,
        $clean['maternal_surname'] ?? null,
        $clean['gender'] ?? null,
        $clean['birth_date'] ?? null,
        $clean['cel_number'] ?? null,
        $clean['email'] ?? null,
        $clean['address_reniec'] ?? null,
        $clean['district'] ?? null,
        $clean['province'] ?? null,
        $clean['region'] ?? null,
        $clean['civil_status'] ?? null,
        $clean['photo_url'] ?? null,
        $clean['house_id'] ?? null,
        $clean['status_validated'] ?? null,
        $clean['status_system'] ?? null,
        $user->person_id
    ]);
}

// Actualizar usuario (solo sistema); contraseña solo si se envía
$params = [
    $clean['role_system'] ?? null,
    $clean['username_system'] ?? null,
    $clean['house_id'] ?? null,
    $clean['status_validated'] ?? null,
    $clean['status_reason'] ?? null,
    $clean['status_system'] ?? null,
    $clean['user_id']
];
$sql = "UPDATE users SET role_system = ?, username_system = ?, house_id = ?, status_validated = ?, status_reason = ?, status_system = ? WHERE user_id = ?";
if (!empty($jsonUser['password_system'])) {
    $hashedPassword = password_hash($jsonUser['password_system'], PASSWORD_DEFAULT);
    $sql = "UPDATE users SET role_system = ?, username_system = ?, password_system = ?, house_id = ?, status_validated = ?, status_reason = ?, status_system = ? WHERE user_id = ?";
    array_splice($params, 2, 0, [$hashedPassword]);
}
$sentencia = $bd->prepare($sql);
$resultado = $sentencia->execute($params);

if ($resultado) {
    echo json_encode(["success" => true, "message" => "Usuario actualizado correctamente."]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar el usuario."]);
}
