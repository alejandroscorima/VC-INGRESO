
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: *");
if ($_SERVER["REQUEST_METHOD"] != "PUT") {
    exit("Solo acepto peticiones PUT");
}
$jsonLudopata = json_decode(file_get_contents("php://input"));
if (!$jsonLudopata) {
    exit("No hay datos");
}
$bd = include_once "bdEntrance.php";
$sentencia = $bd->prepare("UPDATE ludopatas SET type_doc = ?, doc_number = ?, name = ?, code = ? WHERE doc_number = ?");
$resultado = $sentencia->execute([$jsonLudopata->type_doc, $jsonLudopata->doc_number, $jsonLudopata->name, $jsonLudopata->code, $jsonLudopata->doc_number]);
echo json_encode($resultado);
