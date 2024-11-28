
<?php
// Configuración de CORS y métodos permitidos
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

// Decodificar el JSON recibido
$jsonExternalVehicle = json_decode(file_get_contents("php://input"));
if (!$jsonExternalVehicle) {
    http_response_code(400); // Solicitud incorrecta
    exit(json_encode(["success" => false, "error" => "No se encontraron datos en la solicitud"]));
}

$bd = include_once "vc_db.php";

try {
    // Preparar la consulta SQL
    $sentencia = $bd->prepare("INSERT INTO temporary_visits (temp_visit_name, temp_visit_doc, temp_visit_plate, temp_visit_cel, temp_visit_type, status_validated, status_reason, status_system) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    // Ejecutar la consulta
    $resultado = $sentencia->execute([
        $jsonExternalVehicle->temp_visit_name,
        $jsonExternalVehicle->temp_visit_doc,
        $jsonExternalVehicle->temp_visit_plate,
        $jsonExternalVehicle->temp_visit_cel,
        $jsonExternalVehicle->temp_visit_type,
        $jsonExternalVehicle->status_validated,
        $jsonExternalVehicle->status_reason,
        $jsonExternalVehicle->status_system,
        
    ]);
    if ($resultado) {
        echo json_encode(["success" => true, "message" => "Vehículo externo creado correctamente"]);
    } else {
    echo json_encode(["success" => false, "message" => "Error al guardar vehículo externo"]);
}
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Error de base de datos: " . $e->getMessage()]);
}
