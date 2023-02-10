
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



$jsonUser = json_decode(file_get_contents("php://input"));
if (!$jsonUser) {
    exit("No hay datos");
}
$bd = include_once "bdData.php";
$sentencia = $bd->prepare("insert into users(doc_number, first_name, last_name, gender, username, password, area_id, campus_id, position, dem_role) values (?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonUser->doc_number, $jsonUser->first_name, $jsonUser->last_name, $jsonUser->gender, $jsonUser->username, $jsonUser->password, $jsonUser->area_id, $jsonUser->campus_id, $jsonUser->position, $jsonUser->dem_role]);
echo json_encode([
    "resultado" => $resultado,
]);
