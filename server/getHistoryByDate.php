
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala=$_GET['sala'];
$fecha=$_GET['fecha'];

$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
if($sala=='PALACIO'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_palacio WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='VENEZUELA'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_venezuela WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='HUANDOY'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_huandoy WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='KANTA'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_kanta WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='MEGA'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_mega WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='PRO'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_pro WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='HUARAL'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_huaral WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='SAN JUAN I'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_sji WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='SAN JUAN II'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_sjii WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
if($sala=='SAN JUAN III'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, hour_entrance, obs, visits FROM visits_sjiii WHERE date_entrance = '".$fecha."' ORDER BY hour_entrance desc");
}
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$clients = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($clients);

?>
