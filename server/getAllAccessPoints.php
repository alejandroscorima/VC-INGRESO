
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$bd = include_once "bdData.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
$sentencia = $bd->prepare("SELECT id, name, image_url, status, table_entrance FROM access_points WHERE status='ON'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$points = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($points);
?>