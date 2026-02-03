<?php
// CORS se maneja en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    http_response_code(405);
    exit(json_encode(["error" => "Solo acepto peticiones PUT"]));
}
$jsonVehicle = json_decode(file_get_contents("php://input"), true);
if (!$jsonVehicle) {
    http_response_code(400);
    exit(json_encode(["error"=>"No hay datos"]));
}
require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonVehicle, ['vehicle_id', 'type_vehicle', 'house_id', 'status_validated', 'status_reason', 'status_system', 'category_entry']);
if (
    empty($clean['vehicle_id']) || 
    empty($clean['house_id']) || 
    empty($clean['status_system'])
) {
    http_response_code(400);
    exit(json_encode(["error" => "Datos incompletos"]));
}

try {
    $sentencia = $bd->prepare("UPDATE vehicles SET type_vehicle = ?, house_id = ?, status_validated = ?, status_reason = ?, status_system = ?, category_entry = ? WHERE vehicle_id = ?");
    $resultado = $sentencia->execute([
        $clean['type_vehicle'], 
        $clean['house_id'], 
        $clean['status_validated'], 
        $clean['status_reason'], 
        $clean['status_system'],
        $clean['category_entry'], 
        $clean['vehicle_id']
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Vehículo actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar vehículo"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error de base de datos"]);
}
