<?php
// No exponer errores PHP en producción
if (getenv('APP_DEBUG') === 'true' || getenv('APP_DEBUG') === '1') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Headers CORS explícitos por si vc_db.php no los envía
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// CORS y conexión a BD se manejan en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    exit(json_encode(["error" => "Solo acepto peticiones POST"]));
}

$jsonUser  = json_decode(file_get_contents("php://input"), true);
if (!$jsonUser) {
    http_response_code(400);
    exit(json_encode(["error" => "No hay datos"]));
}
require_once __DIR__ . '/sanitize.php';
$fields = [
    'type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname',
    'gender', 'birth_date', 'cel_number', 'email', 'username_system', 'role_system',
    'house_id', 'photo_url', 'status_validated', 'status_reason',
    'status_system', 'civil_status', 'address_reniec', 'district',
    'province', 'region'
];
$clean = sanitize_payload($jsonUser, $fields);

if (empty($clean['doc_number']) || empty($clean['first_name']) || empty($clean['paternal_surname'])) {
    http_response_code(400);
    exit(json_encode(["error" => "Se requieren doc_number, first_name y paternal_surname"]));
}

// Buscar persona por documento
$stmt = $bd->prepare("SELECT id FROM persons WHERE doc_number = ? LIMIT 1");
$stmt->execute([trim($clean['doc_number'])]);
$existingPerson = $stmt->fetch(PDO::FETCH_OBJ);
if ($existingPerson) {
    $stmt = $bd->prepare("SELECT 1 FROM users WHERE person_id = ? LIMIT 1");
    $stmt->execute([$existingPerson->id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        exit(json_encode(["error" => "Ya existe un usuario con este número de documento"]));
    }
    $personId = (int) $existingPerson->id;
} else {
    // Crear persona (datos civiles)
    $address = $clean['address_reniec'] ?? null;
    $stmt = $bd->prepare("INSERT INTO persons (
        type_doc, doc_number, first_name, paternal_surname, maternal_surname,
        gender, birth_date, cel_number, email, address, district, province, region,
        civil_status, photo_url, person_type, house_id, status_validated, status_system
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RESIDENTE', ?, ?, ?)");
    $stmt->execute([
        $clean['type_doc'] ?? null,
        trim($clean['doc_number']),
        $clean['first_name'] ?? null,
        $clean['paternal_surname'] ?? null,
        $clean['maternal_surname'] ?? null,
        $clean['gender'] ?? null,
        $clean['birth_date'] ?? null,
        $clean['cel_number'] ?? null,
        $clean['email'] ?? null,
        $address,
        $clean['district'] ?? null,
        $clean['province'] ?? null,
        $clean['region'] ?? null,
        $clean['civil_status'] ?? null,
        $clean['photo_url'] ?? null,
        $clean['house_id'] ?? null,
        $clean['status_validated'] ?? null,
        $clean['status_system'] ?? null
    ]);
    $personId = (int) $bd->lastInsertId();
}

// Verificar username único
$username = trim($clean['username_system'] ?? $clean['doc_number']);
$stmt = $bd->prepare("SELECT 1 FROM users WHERE username_system = ? LIMIT 1");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    http_response_code(409);
    exit(json_encode(["error" => "El nombre de usuario ya existe"]));
}

$password = $jsonUser['password_system'] ?? '';
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insertar usuario (solo datos del sistema)
$sql = "INSERT INTO users (person_id, username_system, password_system, role_system, house_id, status_validated, status_reason, status_system) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$sentencia = $bd->prepare($sql);
$resultado = $sentencia->execute([
    $personId,
    $username,
    $hashedPassword,
    $clean['role_system'] ?? 'RESIDENTE',
    $clean['house_id'] ?? null,
    $clean['status_validated'] ?? null,
    $clean['status_reason'] ?? null,
    $clean['status_system'] ?? null
]);

if ($resultado) {
    echo json_encode(["success" => true, "message" => "Usuario creado correctamente."]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al crear el usuario."]);
}
