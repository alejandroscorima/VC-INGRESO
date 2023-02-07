
<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: DELETE");
$metodo = $_SERVER["REQUEST_METHOD"];
if ($metodo != "DELETE" && $metodo != "OPTIONS") {
    exit("Solo se permite método DELETE");
}

$ludop_id = $_GET["ludop_id"];
$bd = include_once "bdEntrance.php";
$sentencia = $bd->prepare("DELETE FROM ludopatas WHERE id = ?");
$resultado = $sentencia->execute([$ludop_id]);
echo json_encode($resultado);
