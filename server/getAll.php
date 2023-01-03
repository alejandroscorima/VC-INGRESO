
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");
$fecha_cumple=$_GET['fecha_cumple'];
$bd = include_once "bd.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
$sentencia = $bd->prepare("select doc_number, client_name from clients where birth_date like '%".$fecha_cumple."%'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$clientes = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($clientes);
?>