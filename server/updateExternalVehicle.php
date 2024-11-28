
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonExternalVehicle = json_decode(file_get_contents("php://input"));
if (!$jsonExternalVehicle) {
    exit(json_encode(["error"=>"No hay datos"]));
}
if (
    empty($jsonExternalVehicle->temp_visit_id) || 
    empty($jsonExternalVehicle->temp_visit_doc) || 
    empty($jsonExternalVehicle->status_system)
) {
    exit(json_encode(["error" => "Datos incompletos"]));
}

$bd = include_once "vc_db.php";
try {
    $sentencia = $bd->prepare("UPDATE temporary_visits SET temp_visit_name = ?, temp_visit_doc = ?, temp_visit_cel = ?, status_validated = ?, status_reason = ?, status_system = ? WHERE temp_visit_id = ?");
    $resultado = $sentencia->execute([
        $jsonExternalVehicle->temp_visit_name, 
        $jsonExternalVehicle->temp_visit_doc,
        $jsonExternalVehicle->temp_visit_cel, 
        $jsonExternalVehicle->status_validated, 
        $jsonExternalVehicle->status_reason, 
        $jsonExternalVehicle->status_system,
        $jsonExternalVehicle->temp_visit_id
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Vehículo externo actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar vehículo externo "]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Error de base de datos: " . $e->getMessage()]);
}
