<?php
// CORS, DB connection, and preflight are handled inside bdLicense.php
$bd = include_once "bdLicense.php";

if (empty($_GET["client_id"])) {
    http_response_code(400);
    echo json_encode(["error" => "Parámetro client_id requerido"]);
    exit;
}

$client_id = $_GET["client_id"];

$sentencia = $bd->prepare("SELECT client_id, client_name, client_phone, client_email, client_ruc, client_logo FROM clients WHERE client_id = :client_id");
$sentencia->bindParam(':client_id', $client_id, PDO::PARAM_INT);
$sentencia->execute();

$cliente = $sentencia->fetch();

header('Content-Type: application/json');
echo json_encode($cliente);
