
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonClient = json_decode(file_get_contents("php://input"));
if (!$jsonClient) {
    exit("No hay datos");
}
$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("UPDATE clients SET condicion = ?, motivo = ?, sala_list = ?, fecha_list = ?, origin_list = ? WHERE doc_number = ?");
$resultado = $sentencia->execute([$jsonClient->condicion, $jsonClient->motivo, $jsonClient->sala_list, $jsonClient->fecha_list, $jsonClient->origin_list, $jsonClient->doc_number]);
echo json_encode($resultado);
