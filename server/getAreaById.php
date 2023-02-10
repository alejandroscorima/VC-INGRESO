
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$area_id=$_GET['area_id'];

$bd = include_once "bdData.php";

$sentencia = $bd->prepare("SELECT area_id, name, chief_id, zone  FROM areas WHERE area_id=".$area_id);

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$area = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($area);
