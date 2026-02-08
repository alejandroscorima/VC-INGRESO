<?php
// Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

try {
    // Incluir archivo de conexión a la base de datos
    
    // Preparar la consulta SQL
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
    FROM 
        vehicles v
    JOIN 
        houses h ON v.house_id = h.house_id
    WHERE v.status_system = 'ACTIVO'
    ORDER BY 
        h.block_house ASC;
    ");
    
    // Ejecutar la consulta
    $sentencia->execute();

    // Obtener los resultados
    $vehicles = $sentencia->fetchAll(PDO::FETCH_OBJ);

    // Enviar los resultados como JSON
    echo json_encode($vehicles);

} catch (PDOException $e) {
    // Manejar errores de base de datos
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
}
?>
