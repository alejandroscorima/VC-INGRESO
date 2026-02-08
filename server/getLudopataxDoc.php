
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");
if (empty($_GET["doc_number"])) {
    exit("No está en sala");
}
$doc_number = $_GET["doc_number"];

$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sentencia = $bd->prepare("SELECT id, type_doc, code, doc_number, name FROM ludopatas WHERE doc_number = :doc");
$sentencia->bindParam(':doc', $doc_number, PDO::PARAM_STR);
$sentencia->execute();
$ludop = $sentencia->fetchObject();
echo json_encode($ludop);
