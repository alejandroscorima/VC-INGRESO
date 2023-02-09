
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
// header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Methods: PUT");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: *");

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}



$jsonLudop = json_decode(file_get_contents("php://input"));
if (!$jsonLudop) {
    exit("No hay datos");
}
$bd = include_once "bdEntrance.php";
$sentencia = $bd->prepare("insert into ludopatas(code, type_doc, doc_number, name) values (?,?,?,?)");
$resultado = $sentencia->execute([$jsonLudop->code, $jsonLudop->type_doc, $jsonLudop->doc_number, $jsonLudop->name]);
echo json_encode([
    "resultado" => $resultado,
]);
