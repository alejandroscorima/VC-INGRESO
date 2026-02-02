<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

try {
    $sentencia = $bd->prepare("SELECT 
        h.house_id,
        h.block_house,
        h.lot,
        h.apartment,
        h.status_system
    FROM houses AS h 
    WHERE h.status_system = 'ACTIVO'
    ORDER BY h.block_house, h.lot, h.apartment");
    
    $sentencia->execute();
    $houses = $sentencia->fetchAll(PDO::FETCH_OBJ);
    
    // Enviar los datos como JSON
    echo json_encode($houses);
} catch (PDOException $e) {
    // Manejo de errores: devolver un mensaje de error en formato JSON
    http_response_code(500); // Código de error interno del servidor
    echo json_encode([
        "error" => true,
        "message" => "Error al obtener los datos de la tabla houses.",
        "details" => $e->getMessage()
    ]);
}
?>
