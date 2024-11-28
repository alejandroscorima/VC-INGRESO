
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
// header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: PUT");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: *");

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}



$jsonVehicle = json_decode(file_get_contents("php://input"));
if (!$jsonVehicle) {
    exit("No hay datos");
}
$bd = include_once "vc_db.php";
$sentencia = $bd->prepare("INSERT INTO vehicles (license_plate, type_vehicle, house_id,owner_id, status_validated, status_reason, status_system, category_entry) VALUES (?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonVehicle->license_plate, $jsonVehicle->type_vehicle, $jsonVehicle->house_id, $jsonVehicle->owner_id, $jsonVehicle->status_validated, $jsonVehicle->status_reason, $jsonVehicle->status_system, $jsonVehicle->category_entry]);
echo json_encode([
    "resultado" => $resultado,
]);
