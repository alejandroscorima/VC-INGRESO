
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$area_id = $_GET['area_id'] ?? '';

$bd = include_once "bdData.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("SELECT area_id, name, chief_id, zone FROM areas WHERE area_id = :area_id");
$sentencia->bindParam(':area_id', $area_id, PDO::PARAM_INT);
$sentencia->execute();
$area = $sentencia->fetchObject();
echo json_encode($area);
