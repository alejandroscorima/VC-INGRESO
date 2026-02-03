
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$doc = $_GET['doc'] ?? '';
$sala = $_GET['sala'] ?? '';
$fecha = $_GET['fecha'] ?? '';

$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sql = "SELECT doc_number, name, date_entrance, hour_entrance, obs FROM visits WHERE date_entrance = :fecha AND doc_number = :doc AND sala = :sala ORDER BY hour_entrance DESC";
$sentencia = $bd->prepare($sql);
$sentencia->bindParam(':fecha', $fecha, PDO::PARAM_STR);
$sentencia->bindParam(':doc', $doc, PDO::PARAM_STR);
$sentencia->bindParam(':sala', $sala, PDO::PARAM_STR);

$sentencia->execute();
$visitsR = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($visitsR);
?>