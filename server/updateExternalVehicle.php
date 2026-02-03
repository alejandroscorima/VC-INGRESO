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
$jsonExternalVehicle = json_decode(file_get_contents("php://input"), true);
if (!$jsonExternalVehicle) {
    http_response_code(400);
    exit(json_encode(["error"=>"No hay datos"]));
}
require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonExternalVehicle, ['temp_visit_id', 'temp_visit_name', 'temp_visit_doc', 'temp_visit_cel', 'status_validated', 'status_reason', 'status_system']);
if (
    empty($clean['temp_visit_id']) || 
    empty($clean['temp_visit_doc']) || 
    empty($clean['status_system'])
) {
    http_response_code(400);
    exit(json_encode(["error" => "Datos incompletos"]));
}

try {
    $sentencia = $bd->prepare("UPDATE temporary_visits SET temp_visit_name = ?, temp_visit_doc = ?, temp_visit_cel = ?, status_validated = ?, status_reason = ?, status_system = ? WHERE temp_visit_id = ?");
    $resultado = $sentencia->execute([
        $clean['temp_visit_name'], 
        $clean['temp_visit_doc'],
        $clean['temp_visit_cel'], 
        $clean['status_validated'], 
        $clean['status_reason'], 
        $clean['status_system'],
        $clean['temp_visit_id']
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Vehículo externo actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar vehículo externo "]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error de base de datos"]);
}
