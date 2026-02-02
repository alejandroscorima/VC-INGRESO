
<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

$jsonHouse = json_decode(file_get_contents("php://input"));
if (!$jsonHouse) {
    exit(json_encode(["error" => "No hay datos"]));
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
    $sentencia = $bd->prepare("insert into houses(block_house, lot, apartment, status_system) values (?,?,?,?)");
    $resultado = $sentencia->execute([
    $jsonHouse->block_house, 
    $jsonHouse->lot, 
    $jsonHouse->apartment ?: null, 
    $jsonHouse->status_system]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Casa creada correctamente"]);
    } else {
    echo json_encode(["success" => false, "message" => "Error al guardar la casa"]);
}
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
