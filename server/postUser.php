<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

$jsonUser  = json_decode(file_get_contents("php://input"));
if (!$jsonUser ) {
    exit("No hay datos");
}

// Hashear la contraseña antes de almacenarla
$hashedPassword = password_hash($jsonUser ->password, PASSWORD_DEFAULT);

$bd = include_once "bdData.php";
$sentencia = $bd->prepare("insert into users(type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, cel_number, username, password, entrance_role, house_id, category, status, reason, photo_url) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonUser ->type_doc, $jsonUser ->doc_number, $jsonUser ->first_name, $jsonUser ->paternal_surname, $jsonUser ->maternal_surname, $jsonUser ->gender, $jsonUser ->birth_date, $jsonUser ->cel_number, $jsonUser ->username, $hashedPassword, $jsonUser ->entrance_role, $jsonUser ->house_id, $jsonUser ->category, $jsonUser ->status, $jsonUser ->reason, $jsonUser ->photo_url]);

echo json_encode([
    "resultado" => $resultado,
]);