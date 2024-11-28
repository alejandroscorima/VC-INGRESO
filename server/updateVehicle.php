
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonVehicle = json_decode(file_get_contents("php://input"));
if (!$jsonVehicle) {
    exit(json_encode(["error"=>"No hay datos"]));
}
if (
    empty($jsonVehicle->vehicle_id) || 
    empty($jsonVehicle->house_id) || 
    empty($jsonVehicle->status_system)
) {
    exit(json_encode(["error" => "Datos incompletos"]));
}

$bd = include_once "vc_db.php";
try {
    $sentencia = $bd->prepare("UPDATE vehicles SET type_vehicle = ?, house_id = ?, status_validated = ?, status_reason = ?, status_system = ?, category_entry = ? WHERE vehicle_id = ?");
    $resultado = $sentencia->execute([
        $jsonVehicle->type_vehicle, 
        $jsonVehicle->house_id, 
        $jsonVehicle->status_validated, 
        $jsonVehicle->status_reason, 
        $jsonVehicle->status_system,
        $jsonVehicle->category_entry, 
        $jsonVehicle->vehicle_id
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Vehículo actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar vehículo"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Error de base de datos: " . $e->getMessage()]);
}
