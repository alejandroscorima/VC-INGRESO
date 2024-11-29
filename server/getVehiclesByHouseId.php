<?php
// Permitir solicitudes de cualquier origen (modificar en producción para mayor seguridad)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir conexión a la base de datos
$bd = include_once "vc_db.php";

// Validación y sanitización del parámetro 'house_id'
if (!isset($_GET['house_id'])) {
    echo json_encode([
        "error" => true,
        "message" => "Invalid or missing house_id"
    ]);
    exit;
}

$house_id = (int) $_GET['house_id'];

try {
    $sentencia = $bd->prepare("SELECT 
        v.vehicle_id,
        v.license_plate,
        v.type_vehicle,
        v.house_id,
        v.status_validated,
        v.status_reason,
        v.status_system,
        v.category_entry,
        h.block_house,
        h.lot,
        h.apartment
    FROM vehicles AS v
    LEFT JOIN houses AS h ON v.house_id = h.house_id
    WHERE v.house_id = :house_id");

    // Vincula el parámetro
    $sentencia->bindParam(':house_id', $house_id);

    // Ejecutar la consulta
    $sentencia->execute();
    
    // Obtener los resultados como un arreglo de objetos
    $vehicles = $sentencia->fetchAll(PDO::FETCH_OBJ);
    
    // Comprobar si se encontraron resultados
    if ($vehicles) {
        // Devolver los resultados en formato JSON
        echo json_encode($vehicles);
    } else {
        // Si no se encuentran resultados, se devuelve un mensaje de error
        echo json_encode([
            "error" => true,
            "message" => "vehicles not found"
        ]);
    }

    // Cerrar la sentencia
    $sentencia = null;

} catch (Exception $e) {
    // Registrar el error en un archivo de log
    error_log($e->getMessage(), 3, '/var/log/php_errors.log');

    // Devolver un mensaje genérico
    echo json_encode([
        "error" => true,
        "message" => "An error occurred. Please try again later.",
        "server_error" => $e->getMessage()
    ]);
}

?>
