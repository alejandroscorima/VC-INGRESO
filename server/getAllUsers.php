<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$bd = include_once "bdData.php";
//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
$sentencia = $bd->prepare("SELECT user_id, colab_id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, civil_status, profession, cel_number, email, address, district, province, region, username, entrance_role, latitud, longitud, photo_url, house_id, status, reason FROM access_points WHERE status='ON'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$points = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($points);
?>