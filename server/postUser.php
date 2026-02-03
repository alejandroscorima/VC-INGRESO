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
    'house_id', 'property_category', 'photo_url', 'status_validated', 'status_reason',
    'status_system', 'civil_status', 'profession', 'address_reniec', 'district',
    'province', 'region'
];
$clean = sanitize_payload($jsonUser, $fields);

// Hashear la contraseña antes de guardarla
$password = $jsonUser['password_system'] ?? '';
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Preparar la consulta SQL para insertar un nuevo usuario
$sql = "INSERT INTO users (
            type_doc, doc_number, first_name, paternal_surname, maternal_surname, 
            gender, birth_date, cel_number, email, username_system, password_system, 
            role_system, house_id, property_category, photo_url, 
            status_validated, status_reason, status_system, civil_status, 
            profession, address_reniec, district, province, region
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$sentencia = $bd->prepare($sql);

// Ejecutar la consulta con los valores del JSON recibido
$resultado = $sentencia->execute([
    $clean['type_doc'],
    $clean['doc_number'],
    $clean['first_name'],
    $clean['paternal_surname'],
    $clean['maternal_surname'],
    $clean['gender'],
    $clean['birth_date'],
    $clean['cel_number'],
    $clean['email'],
    $clean['username_system'],
    $hashedPassword,
    $clean['role_system'],
    $clean['house_id'],
    $clean['property_category'],
    $clean['photo_url'],
    $clean['status_validated'],
    $clean['status_reason'],
    $clean['status_system'],
    $clean['civil_status'],
    $clean['profession'],
    $clean['address_reniec'],
    $clean['district'],
    $clean['province'],
    $clean['region']
]);

// Retornar respuesta en JSON
if ($resultado) {
    echo json_encode(["success" => true, "message" => "Usuario creado correctamente."]);
} else {
    http_response_code(500); // Error interno
    echo json_encode(["error" => "Error al crear el usuario."]);
}
