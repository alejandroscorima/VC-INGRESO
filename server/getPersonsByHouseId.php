
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$house_id=$_GET['house_id'];

$bd = include_once "bdData.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");

  $sentencia = $bd->prepare("SELECT a.user_id, a.colab_id, a.type_doc, a.doc_number, a.first_name, a.paternal_surname, a.maternal_surname, a.gender, a.birth_date, a.civil_status, a.profession, a.cel_number, a.email, a.address, a.district, a.province, a.region, a.username, a.entrance_role, a.latitud, a.longitud, a.photo_url, a.house_id, a.status, a.reason, a.category, COALESCE(b.block,'SN') AS block, COALESCE(b.lot,'SN') AS lot, COALESCE(b.apartment,'SN') AS apartment FROM users a LEFT JOIN houses b ON a.house_id=b.house_id WHERE a.house_id=".$house_id."");

//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$persons = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($persons);
?>