
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdData.php";

$user_id=$_GET['user_id'];

$sentencia = $bd->prepare("SELECT 
user_id ,colab_id ,type_doc ,doc_number, first_name ,
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

 FROM user2
WHERE user_id='".$user_id."'");


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
//$user = $sentencia->fetchAll(PDO::FETCH_OBJ);
$user = $sentencia->fetchObject();
//echo json_encode($mascotas);
echo json_encode($user);

?>
