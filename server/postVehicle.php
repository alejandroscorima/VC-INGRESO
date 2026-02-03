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

// Decodificar el JSON recibido
$jsonVehicle = json_decode(file_get_contents("php://input"), true);
if (!$jsonVehicle) {
    http_response_code(400); // Solicitud incorrecta
    exit(json_encode(["success" => false, "error" => "No se encontraron datos en la solicitud"]));
}
require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonVehicle, ['license_plate', 'type_vehicle', 'house_id', 'status_validated', 'status_reason', 'status_system', 'category_entry']);

try {
    // Preparar la consulta SQL
    $sentencia = $bd->prepare("INSERT INTO vehicles (license_plate, type_vehicle, house_id, status_validated, status_reason, status_system, category_entry) VALUES (?, ?, ?, ?, ?, ?, ?)");

    // Ejecutar la consulta
    $resultado = $sentencia->execute([
        $clean['license_plate'],
        $clean['type_vehicle'],
        $clean['house_id'],
        $clean['status_validated'],
        $clean['status_reason'],
        $clean['status_system'],
        $clean['category_entry']
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "vehículo creado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al guardar vehículo"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error de base de datos"]);
}
