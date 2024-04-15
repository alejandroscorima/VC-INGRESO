
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
$sentencia = $bd->prepare("UPDATE users SET first_name = ?, paternal_surname = ?, maternal_surname = ?, gender = ?, birth_date = ?, cel_number = ?, username = ?, entrance_role = ?, house_id = ?, category = ?, status = ?, reason = ?, password = ?, photo_url = ? WHERE user_id = ?");
$resultado = $sentencia->execute([$jsonUser->first_name, $jsonUser->paternal_surname, $jsonUser->maternal_surname, $jsonUser->gender, $jsonUser->birth_date, $jsonUser->cel_number, $jsonUser->username, $jsonUser->entrance_role, $jsonUser->house_id, $jsonUser->category, $jsonUser->status, $jsonUser->reason, $jsonUser->password, $jsonUser->photo_url, $jsonUser->user_id]);
echo json_encode($resultado);
