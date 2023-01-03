
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
    $sentencia = $bd->prepare("SELECT fecha_registro FECHA, count(*) AFORO FROM clients WHERE fecha_registro>='".$fechaInicio."' AND fecha_registro<='".$fechaFin."' AND sala_registro='".$sala."' GROUP BY FECHA");
  }
  else{
    $sentencia = $bd->prepare("SELECT fecha_registro FECHA, count(*) AFORO FROM clients WHERE (fecha_registro='".$fecha1."' OR fecha_registro='".$fecha2."' OR fecha_registro='".$fecha3."' OR fecha_registro='".$fecha4."' OR fecha_registro='".$fecha5."') AND sala_registro='".$sala."' GROUP BY FECHA");
  }
}
else{
  $sentencia = $bd->prepare("SELECT fecha_registro FECHA, count(*) AFORO FROM clients WHERE fecha_registro like '%".$fechaMes."%' AND sala_registro='".$sala."' GROUP BY FECHA");
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
