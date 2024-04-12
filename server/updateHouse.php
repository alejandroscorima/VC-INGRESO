
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
    exit("No hay datos");
}
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("UPDATE houses SET block = ?, lot = ?, apartment = ? WHERE house_id = ?");
$resultado = $sentencia->execute([$jsonHouse->block, $jsonHouse->lot, $jsonHouse->apartment, $jsonHouse->house_id]);
echo json_encode($resultado);
