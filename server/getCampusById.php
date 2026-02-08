
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$campus_id = $_GET['campus_id'] ?? '';

$bd = include_once "bdData.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("SELECT campus_id, name, address, company, ruc, supply_ord_suffix, supply_req_suffix, zone FROM campus WHERE dem_switch='ON' AND campus_id = :campus_id");
$sentencia->bindParam(':campus_id', $campus_id, PDO::PARAM_INT);
$sentencia->execute();
$campus = $sentencia->fetchObject();
echo json_encode($campus);
