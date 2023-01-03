
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$fecha_cumple=$_GET['fecha_cumple'];

$bd = include_once "bdEntrance.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
$sentencia = $bd->prepare("SELECT doc_number, client_name, birth_date, gender, condicion FROM clients WHERE birth_date LIKE '%".$fecha_cumple."%' AND (condicion = 'PERMITIDO' OR condicion = 'DESTACADO')");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$clients = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($clients);

?>
