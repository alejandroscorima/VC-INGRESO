
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdData.php";

$user_id=$_GET['user_id'];

$sentencia = $bd->prepare("SELECT user_id, doc_number, first_name, last_name, gender, username, area_id, position, campus_id, dem_role FROM users WHERE user_id='".$user_id."'");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$user = $sentencia->fetchAll(PDO::FETCH_OBJ);
$user = $sentencia->fetchObject();
//echo json_encode($mascotas);
echo json_encode($user);

?>
