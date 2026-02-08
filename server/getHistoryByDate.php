
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala = $_GET['sala'] ?? '';
$fecha = $_GET['fecha'] ?? '';

$bd = include_once "bdEntrance.php";
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

if (!isset($tables[$sala])) {
  http_response_code(400);
  exit(json_encode(['error' => 'Sala no válida']));
}

$table = $tables[$sala];
$sql = "SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM {$table} WHERE date_entrance = :fecha ORDER BY hour_entrance DESC";
$sentencia = $bd->prepare($sql);
$sentencia->bindParam(':fecha', $fecha, PDO::PARAM_STR);
$sentencia->execute();
$clients = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($clients);

?>
