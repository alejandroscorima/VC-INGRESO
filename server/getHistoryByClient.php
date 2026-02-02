
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$doc=$_GET['doc'];
$sala=$_GET['sala'];
$fecha=$_GET['fecha'];

$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");

  $sentencia = $bd->prepare("SELECT doc_number, name, date_entrance, hour_entrance, obs FROM visits WHERE date_entrance = '".$fecha."' AND doc_number = '".$doc."' AND sala = '".$sala."' ORDER BY hour_entrance desc");

//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$visitsR = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($visitsR);
?>