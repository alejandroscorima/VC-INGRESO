<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$bd = include_once "bdData.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
$sentencia = $bd->prepare("SELECT a.vehicle_id, a.plate, a.house_id, a.status, a.type, a.reason, COALESCE(b.block,'SN') AS block, COALESCE(b.lot,'SN') AS lot, COALESCE(b.apartment,'SN') AS apartment FROM vehicles a LEFT JOIN houses b ON a.house_id = b.house_id ORDER BY a.type, a.plate");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$vehicles = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($vehicles);
?>