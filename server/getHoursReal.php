
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala=$_GET['sala'];
$fechaInicio=$_GET['fechaInicio'];
$fechaFin=$_GET['fechaFin'];
$fechaMes=$_GET['fechaMes'];
$dia=$_GET['dia'];
$mes=$_GET['mes'];

$fecha1=$_GET['fecha1'];
$fecha2=$_GET['fecha2'];
$fecha3=$_GET['fecha3'];
$fecha4=$_GET['fecha4'];
$fecha5=$_GET['fecha5'];

$bd = include_once "bdEntrance.php";


if($mes=='SELECCIONAR'){
  if($dia=='SELECCIONAR'){
    $sentencia = $bd->prepare("SELECT hora HORA, sum(activo) AFORO FROM aforo WHERE fecha>='".$fechaInicio."' AND fecha<='".$fechaFin."' AND sala='".$sala."' GROUP BY HORA");
  }
  else{
    $sentencia = $bd->prepare("SELECT hora HORA, sum(activo) AFORO FROM aforo WHERE (fecha='".$fecha1."' OR fecha='".$fecha2."' OR fecha='".$fecha3."' OR fecha='".$fecha4."' OR fecha='".$fecha5."') AND sala='".$sala."' GROUP BY HORA");
  }
}
else{
  $sentencia = $bd->prepare("SELECT hora HORA, sum(activo) AFORO FROM aforo WHERE fecha like '%".$fechaMes."%' AND sala='".$sala."' GROUP BY HORA");
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
