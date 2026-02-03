<?php
// CORS se maneja en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    http_response_code(405);
    exit(json_encode(["error" => "Solo acepto peticiones PUT"]));
}
$jsonHouse = json_decode(file_get_contents("php://input"), true);
if (!$jsonHouse) {
    http_response_code(400);
    exit(json_encode(["error"=>"No hay datos"]));
}
require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonHouse, ['block_house', 'lot', 'apartment', 'status_system', 'house_id']);
if (
    empty($clean['block_house']) || 
    !isset($clean['lot']) || 
    empty($clean['status_system'])
) {
    http_response_code(400);
    exit(json_encode(["error" => "Datos incompletos"]));
}

try {
    $sentencia = $bd->prepare("UPDATE houses SET block_house = ?, lot = ?, apartment = ?, status_system = ? WHERE house_id = ?");
    $resultado = $sentencia->execute([
        $clean['block_house'], 
        $clean['lot'], 
        $clean['apartment'] ?: null, 
        $clean['status_system'], 
        $clean['house_id']
    ]);
    
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Casa actualizada correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar la casa"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de base de datos"]);
}
