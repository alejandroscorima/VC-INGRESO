
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonHouse = json_decode(file_get_contents("php://input"));
if (!$jsonHouse) {
    exit(json_encode(["error"=>"No hay datos"]));
}
if (
    empty($jsonHouse->block_house) || 
    !isset($jsonHouse->lot) || 
    empty($jsonHouse->status_system)
) {
    exit(json_encode(["error" => "Datos incompletos"]));
}

$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

try {
    $sentencia = $bd->prepare("UPDATE houses SET block_house = ?, lot = ?, apartment = ?, status_system = ? WHERE house_id = ?");
    $resultado = $sentencia->execute([
        $jsonHouse->block_house, 
        $jsonHouse->lot, 
        $jsonHouse->apartment ?: null, 
        $jsonHouse->status_system, 
        $jsonHouse->house_id
    ]);
    
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Casa actualizada correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar la casa"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}