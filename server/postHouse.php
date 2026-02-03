<?php
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

$jsonHouse = json_decode(file_get_contents("php://input"), true);
if (!$jsonHouse) {
    http_response_code(400);
    exit(json_encode(["error" => "No hay datos"]));
}

require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonHouse, ['block_house', 'lot', 'apartment', 'status_system']);

if (
    empty($clean['block_house']) ||
    !isset($clean['lot']) ||
    empty($clean['status_system'])
) {
    http_response_code(400);
    exit(json_encode(["error" => "Datos incompletos"]));
}

try {
    $sentencia = $bd->prepare("INSERT INTO houses(block_house, lot, apartment, status_system) VALUES (?,?,?,?)");
    $resultado = $sentencia->execute([
        $clean['block_house'],
        $clean['lot'],
        $clean['apartment'] ?: null,
        $clean['status_system']
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Casa creada correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al guardar la casa"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de base de datos"]);
}
