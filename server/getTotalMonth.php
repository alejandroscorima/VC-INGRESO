
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala=$_GET['sala'];
$fecha=$_GET['fecha'];
$dia=$_GET['dia'];
$mes=$_GET['mes'];

$fecha1=$_GET['fecha1'];
$fecha2=$_GET['fecha2'];
$fecha3=$_GET['fecha3'];
$fecha4=$_GET['fecha4'];

$bd = include_once "bdEntrance.php";

if($sala=='PALACIO'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_palacio WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='VENEZUELA'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_venezuela WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='HUANDOY'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_huandoy WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='KANTA'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_kanta WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='MEGA'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_mega WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='PRO'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_pro WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='HUARAL'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_huaral WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='SAN JUAN I'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sji WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='SAN JUAN II'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sjii WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='SAN JUAN III'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sjiii WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

if($sala=='OLYMPO'){
  $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_olympo WHERE date_entrance like '%".$fecha."%' GROUP BY FECHA");
}

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$destacados = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($destacados);

?>
