
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
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("insert into vehicles(plate, house_id, type, status, reason, category) values (?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonVehicle->plate, $jsonVehicle->house_id, $jsonVehicle->type, $jsonVehicle->status, $jsonVehicle->reason, $jsonVehicle->category]);
echo json_encode([
    "resultado" => $resultado,
]);
