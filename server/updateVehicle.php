
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
    exit("No hay datos");
}
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("UPDATE vehicles SET type = ?, house_id = ?, status = ?, reason = ?, category = ? WHERE vehicle_id = ?");
$resultado = $sentencia->execute([$jsonVehicle->type, $jsonVehicle->house_id, $jsonVehicle->status, $jsonVehicle->reason, $jsonVehicle->category, $jsonVehicle->vehicle_id]);
echo json_encode($resultado);
