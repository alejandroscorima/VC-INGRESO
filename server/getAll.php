
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$fecha_cumple = isset($_GET['fecha_cumple']) ? trim($_GET['fecha_cumple']) : '';

// Basic input validation to reduce injection surface while keeping legacy flexibility
if ($fecha_cumple !== '' && !preg_match('/^[0-9\-\/]{1,10}$/', $fecha_cumple)) {
	http_response_code(400);
	echo json_encode(['error' => 'Parámetro fecha_cumple inválido']);
	exit;
}

try {
	$bd = include_once "bd.php";
	$sentencia = $bd->prepare("SELECT doc_number, client_name FROM clients WHERE birth_date LIKE ?");
	$sentencia->execute(["%{$fecha_cumple}%"]);
	$clientes = $sentencia->fetchAll();
	echo json_encode($clientes);
} catch (Exception $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Error al consultar clientes']);
}
?>