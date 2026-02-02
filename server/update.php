
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonMascota = json_decode(file_get_contents("php://input"));
if (!$jsonMascota) {
    exit("No hay datos");
}
$bd = include_once "bd.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("UPDATE visits_sji SET name = ?, doc_number = ?, age = ? WHERE id = ?");
$resultado = $sentencia->execute([$jsonMascota->name, $jsonMascota->doc_number, $jsonMascota->age, $jsonMascota->id]);
echo json_encode($resultado);
