
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



$jsonClient = json_decode(file_get_contents("php://input"));
if (!$jsonClient) {
    exit("No hay datos");
}
$bd = include_once "bdEntrance.php";
$sentencia = $bd->prepare("insert into clients(doc_number, client_name, birth_date, gender, address, distrito, provincia, departamento, fecha_registro, sala_registro, condicion) values (?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([$jsonClient->doc_number, $jsonClient->client_name, $jsonClient->birth_date, $jsonClient->gender, $jsonClient->address, $jsonClient->distrito, $jsonClient->provincia, $jsonClient->departamento, $jsonClient->fecha_registro, $jsonClient->sala_registro, $jsonClient->condicion]);
echo json_encode([
    "resultado" => $resultado,
]);
