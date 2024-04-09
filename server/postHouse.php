
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



$jsonHouse = json_decode(file_get_contents("php://input"));
if (!$jsonHouse) {
    exit("No hay datos");
}
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("insert into houses(block, lot, apartment) values (?,?,?)");
$resultado = $sentencia->execute([$jsonHouse->block, $jsonHouse->lot, $jsonHouse->apartment]);
echo json_encode([
    "resultado" => $resultado,
]);
