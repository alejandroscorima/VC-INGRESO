
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    http_response_code(405);
    exit(json_encode(["error" => "Solo acepto peticiones PUT"]));
}
$jsonClient = json_decode(file_get_contents("php://input"), true);
if (!$jsonClient) {
    http_response_code(400);
    exit(json_encode(["error" => "No hay datos"]));
}
$fields = ['condicion', 'motivo', 'fecha_list', 'sala_list', 'origin_list', 'doc_number'];
require_once __DIR__ . '/sanitize.php';
$clean = sanitize_payload($jsonClient, $fields);
$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("UPDATE clients SET condicion = ?, motivo = ?, fecha_list = ?, sala_list = ?, origin_list = ? WHERE doc_number = ?");
$resultado = $sentencia->execute([
    $clean['condicion'],
    $clean['motivo'],
    $clean['fecha_list'],
    $clean['sala_list'],
    $clean['origin_list'],
    $clean['doc_number']
]);
echo json_encode($resultado);
