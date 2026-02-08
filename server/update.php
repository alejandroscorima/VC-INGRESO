
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonMascota = json_decode(file_get_contents("php://input"), true);
if (!$jsonMascota) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay datos']);
    exit;
}
$name = trim($jsonMascota['name'] ?? '');
$doc_number = trim($jsonMascota['doc_number'] ?? '');
$age = $jsonMascota['age'] ?? null;
$id = $jsonMascota['id'] ?? null;

if ($name === '' || $doc_number === '' || !is_numeric($age) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetros inválidos']);
    exit;
}
$bd = include_once "bd.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("UPDATE visits_sji SET name = ?, doc_number = ?, age = ? WHERE id = ?");
$resultado = $sentencia->execute([$name, $doc_number, (int)$age, (int)$id]);
echo json_encode($resultado);
