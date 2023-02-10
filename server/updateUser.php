
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonUser = json_decode(file_get_contents("php://input"));
if (!$jsonUser) {
    exit("No hay datos");
}
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("UPDATE users SET first_name = ?, last_name = ?, gender = ?, username = ?, area_id = ?, campus_id = ?, position = ?, dem_role = ? WHERE user_id = ?");
$resultado = $sentencia->execute([$jsonUser->first_name, $jsonUser->last_name, $jsonUser->gender, $jsonUser->username, $jsonUser->area_id, $jsonUser->campus_id, $jsonUser->position, $jsonUser->dem_role, $jsonUser->user_id]);
echo json_encode($resultado);
