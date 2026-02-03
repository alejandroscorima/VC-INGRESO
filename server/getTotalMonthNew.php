
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

$fechaLike = "%{$fecha}%";
$sentencia = $bd->prepare("SELECT fecha_registro FECHA, count(*) AFORO FROM clients WHERE fecha_registro LIKE :fecha AND sala_registro = :sala GROUP BY FECHA");
$sentencia->bindParam(':fecha', $fechaLike, PDO::PARAM_STR);
$sentencia->bindParam(':sala', $sala, PDO::PARAM_STR);
$sentencia->execute();
$destacados = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($destacados);

?>
