
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
// header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: PUT");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: *");

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    exit(json_encode(["error" => "Solo acepto peticiones POST"]));
}

$jsonClient = json_decode(file_get_contents("php://input"), true);
if (!$jsonClient) {
    http_response_code(400);
    exit(json_encode(["error" => "No hay datos"]));
}
$fields = ['doc_number', 'client_name', 'birth_date', 'gender', 'address', 'distrito', 'provincia', 'departamento', 'fecha_registro', 'sala_registro', 'condicion', 'origin_list', 'motivo', 'sala_list', 'fecha_list'];
require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonClient, $fields);
$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("insert into clients(doc_number, client_name, birth_date, gender, address, distrito, provincia, departamento, fecha_registro, sala_registro, condicion, origin_list, motivo, sala_list, fecha_list) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
$resultado = $sentencia->execute([
    $clean['doc_number'],
    $clean['client_name'],
    $clean['birth_date'],
    $clean['gender'],
    $clean['address'],
    $clean['distrito'],
    $clean['provincia'],
    $clean['departamento'],
    $clean['fecha_registro'],
    $clean['sala_registro'],
    $clean['condicion'],
    $clean['origin_list'],
    $clean['motivo'],
    $clean['sala_list'],
    $clean['fecha_list']
]);
echo json_encode([
    "resultado" => $resultado,
]);
