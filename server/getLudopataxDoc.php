
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");
if (empty($_GET["doc_number"])) {
    exit("No está en sala");
}
$doc_number = $_GET["doc_number"];

$bd = include_once "bdEntrance.php";

$sentencia = $bd->prepare("SELECT id, type_doc, code, doc_number, name FROM ludopatas WHERE doc_number = '".$doc_number."'");

$sentencia->execute();
//$cliente = $sentencia->fetchObject();
$ludop = $sentencia->fetchObject();
//echo json_encode($cliente[$cliente.length()-1]);
echo json_encode($ludop);
