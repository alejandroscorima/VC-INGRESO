
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");
if (empty($_GET["client_id"])) {
    exit("No está en sala");
}
$client_id = $_GET["client_id"];

$bd = include_once "bdLicense.php";

$sentencia = $bd->prepare("SELECT client_id, client_name, client_phone, client_email, client_ruc, client_logo FROM clients WHERE client_id = '".$client_id."'");

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$cliente = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($cliente);
