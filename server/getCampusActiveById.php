
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$campus_id=$_GET['campus_id'];

$bd = include_once "bdData.php";

$sentencia = $bd->prepare("SELECT campus_id, name, address, company, ruc, table_entrance FROM campus WHERE campus_id='".$campus_id."' AND entrance_switch='ON'");

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$sala = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($sala);
