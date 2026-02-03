
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala = $_GET['sala'] ?? '';
$fecha = $_GET['fecha'] ?? '';
$dia = $_GET['dia'] ?? '';
$mes = $_GET['mes'] ?? '';

$fecha1 = $_GET['fecha1'] ?? '';
$fecha2 = $_GET['fecha2'] ?? '';
$fecha3 = $_GET['fecha3'] ?? '';
$fecha4 = $_GET['fecha4'] ?? '';

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
  'OLYMPO' => 'visits_olympo',
];

if (!isset($tables[$sala])) {
  http_response_code(400);
  exit(json_encode(['error' => 'Sala no válida']));
}

$fechaLike = "%{$fecha}%";
$sql = "SELECT date_entrance FECHA, count(*) AFORO FROM {$tables[$sala]} WHERE date_entrance LIKE :fecha GROUP BY FECHA";
$sentencia = $bd->prepare($sql);
$sentencia->bindParam(':fecha', $fechaLike, PDO::PARAM_STR);
$sentencia->execute();
$destacados = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($destacados);

?>
