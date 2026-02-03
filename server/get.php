
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");
if (empty($_GET["doc_number"])) {
  exit("No está en sala");
}
$doc_number = $_GET["doc_number"];
$date_entrance = $_GET["date_entrance"];
$selectedSala = $_GET['selectedSala'] ?? '';
$bd = include_once "bd.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$tables = [
    'PALACIO' => 'visits_palacio',
    'VENEZUELA' => 'visits_venezuela',
    'HUANDOY' => 'visits_huandoy',
    'KANTA' => 'visits_kanta',
    'MEGA' => 'visits_mega',
    'PRO' => 'visits_pro',
    'HUARAL' => 'visits_huaral',
    'SAN JUAN I' => 'visits_sji',
    'SAN JUAN II' => 'visits_sjii',
    'SAN JUAN III' => 'visits_sjiii',
];

if (!isset($tables[$selectedSala])) {
    http_response_code(400);
    exit(json_encode(['error' => 'Sala no válida']));
}

$table = $tables[$selectedSala];
$sql = "SELECT hour_entrance, age FROM {$table} WHERE doc_number = :doc AND date_entrance = :date";
$sentencia = $bd->prepare($sql);
$sentencia->bindParam(':doc', $doc_number, PDO::PARAM_STR);
$sentencia->bindParam(':date', $date_entrance, PDO::PARAM_STR);
$sentencia->execute();
$cliente = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($cliente);
