
<?php
// Configuración de CORS y métodos permitidos
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

// Decodificar el JSON recibido
$jsonVehicle = json_decode(file_get_contents("php://input"));
if (!$jsonVehicle) {
    http_response_code(400); // Solicitud incorrecta
    exit(json_encode(["success" => false, "message" => "No se encontraron datos en la solicitud"]));
}

$bd = include_once "vc_db.php";

try {
    // Preparar la consulta SQL
    $sentencia = $bd->prepare("INSERT INTO vehicles (license_plate, type_vehicle, house_id, status_validated, status_reason, status_system, category_entry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    // Ejecutar la consulta
    $resultado = $sentencia->execute([
        $jsonVehicle->license_plate,
        $jsonVehicle->type_vehicle,
        $jsonVehicle->house_id,
        $jsonVehicle->status_validated,
        $jsonVehicle->status_reason,
        $jsonVehicle->status_system,
        $jsonVehicle->category_entry
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "vehículo creado correctamente"]);
    } else {
    echo json_encode(["success" => false, "message" => "Error al guardar vehículo"]);
}
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
