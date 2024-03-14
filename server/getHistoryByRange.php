
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$fecha_inicial=$_GET['fecha_inicial'];
$fecha_final=$_GET['fecha_final'];
$sala=$_GET['sala'];

$bd = include_once "bdEntrance.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");

if(true){
  $sentencia = $bd->prepare("SELECT b.doc_number, b.first_name, a.age, b.gender, a.date_entrance, a.date_entrance, a.hour_entrance, a.obs, a.visits FROM visits_vc5 a JOIN vc_data.users b ON a.person_id=b.user_id WHERE a.date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY a.id desc");
}

if($sala=='PALACIO'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_palacio WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='VENEZUELA'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_venezuela WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='HUANDOY'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_huandoy WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='KANTA'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_kanta WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='MEGA'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_mega WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='PRO'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_pro WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='HUARAL'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_huaral WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='SAN JUAN I'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_sji WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='SAN JUAN II'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_sjii WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='SAN JUAN III'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_sjiii WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
if($sala=='OLYMPO'){
  $sentencia = $bd->prepare("SELECT doc_number, name, age, gender, date_entrance, date_entrance, hour_entrance, obs, visits FROM visits_olympo WHERE date_entrance BETWEEN '".$fecha_inicial."' AND '".$fecha_final."' ORDER BY id desc");
}
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$clients = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($clients);

?>
