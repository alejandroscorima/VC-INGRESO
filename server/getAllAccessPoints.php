
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$bd = include_once "vc_db.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
$sentencia = $bd->prepare("SELECT ap_id, ap_location, image_url, status_system, ap_description FROM access_points WHERE status_system='activo'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$points = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($points);
?>