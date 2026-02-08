
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala = $_GET['sala'] ?? '';
$fechaInicio = $_GET['fechaInicio'] ?? '';
$fechaFin = $_GET['fechaFin'] ?? '';
$fechaMes = $_GET['fechaMes'] ?? '';
$dia = $_GET['dia'] ?? '';
$mes = $_GET['mes'] ?? '';

$fecha1 = $_GET['fecha1'] ?? '';
$fecha2 = $_GET['fecha2'] ?? '';
$fecha3 = $_GET['fecha3'] ?? '';
$fecha4 = $_GET['fecha4'] ?? '';
$fecha5 = $_GET['fecha5'] ?? '';

$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

if ($mes === 'SELECCIONAR') {
  if ($dia === 'SELECCIONAR') {
    $sql = "SELECT hora HORA, sum(activo) AFORO FROM aforo WHERE fecha >= :inicio AND fecha <= :fin AND sala = :sala GROUP BY HORA";
    $sentencia = $bd->prepare($sql);
    $sentencia->bindParam(':inicio', $fechaInicio, PDO::PARAM_STR);
    $sentencia->bindParam(':fin', $fechaFin, PDO::PARAM_STR);
    $sentencia->bindParam(':sala', $sala, PDO::PARAM_STR);
  } else {
    $dates = array_values(array_filter([$fecha1, $fecha2, $fecha3, $fecha4, $fecha5], fn($d) => $d !== ''));
    if (empty($dates)) {
      http_response_code(400);
      exit(json_encode(['error' => 'Fechas requeridas']));
    }
    $placeholders = [];
    foreach ($dates as $idx => $d) {
      $placeholders[] = ':d' . $idx;
    }
    $inClause = implode(', ', $placeholders);
    $sql = "SELECT hora HORA, sum(activo) AFORO FROM aforo WHERE fecha IN ({$inClause}) AND sala = :sala GROUP BY HORA";
    $sentencia = $bd->prepare($sql);
    foreach ($dates as $idx => $d) {
      $sentencia->bindValue(':d' . $idx, $d, PDO::PARAM_STR);
    }
    $sentencia->bindParam(':sala', $sala, PDO::PARAM_STR);
  }
} else {
  $fechaLike = "%{$fechaMes}%";
  $sql = "SELECT hora HORA, sum(activo) AFORO FROM aforo WHERE fecha LIKE :fechaMes AND sala = :sala GROUP BY HORA";
  $sentencia = $bd->prepare($sql);
  $sentencia->bindParam(':fechaMes', $fechaLike, PDO::PARAM_STR);
  $sentencia->bindParam(':sala', $sala, PDO::PARAM_STR);
}

$sentencia->execute();
$destacados = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($destacados);

?>
