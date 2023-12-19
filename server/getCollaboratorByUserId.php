
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$user_id=$_GET['user_id'];

$bd = include_once "bdData.php";

$sentencia = $bd->prepare("SELECT 
colab_id,
user_id,
area_id,
campus_id,
position,
raz_social,
situation,
service_unit,
type_area,
admission_date,
cessation_date,
colab_code

/*
,type_doc ,doc_number, first_name ,
paternal_surname 
maternal_surname ,
gender ,
birth_date ,
civil_status,
profession ,
cel_number ,
email,
address,
district,
province,
region  ,
username ,
password ,
supply_role ,
entrance_role ,
lotteryact_role ,
dem_role  ,
dem_role_id  ,
hr_role ,
secretsanta_role  ,
latitud  ,
longitud ,
photo_url
*/
FROM collaborators WHERE user_id=".$user_id);

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$collaborator = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($collaborator);
