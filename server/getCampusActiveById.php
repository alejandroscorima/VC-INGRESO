
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$campus_id = $_GET['campus_id'] ?? '';

$bd = include_once "bdData.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("SELECT campus_id, name, address, company, ruc, table_entrance FROM campus WHERE campus_id = :campus_id");
$sentencia->bindParam(':campus_id', $campus_id, PDO::PARAM_INT);
$sentencia->execute();
$sala = $sentencia->fetchObject();
echo json_encode($sala);
