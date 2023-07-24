
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdEntrance.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
$sentencia = $bd->prepare("SELECT doc_number, client_name, birth_date, gender, address, distrito, provincia, departamento, fecha_registro, sala_registro, condicion, motivo, sala_list, fecha_list FROM clients WHERE condicion='OBSERVADO'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$restringidos = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($restringidos);

?>
