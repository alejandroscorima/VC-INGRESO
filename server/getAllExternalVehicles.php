<?php
// Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
$bd = include_once "vc_db.php";

try {
    // Incluir archivo de conexión a la base de datos
    
    // Preparar la consulta SQL
    $sentencia = $bd->prepare("SELECT 
        tv.temp_visit_id,
        tv.temp_visit_name,
        tv.temp_visit_doc,
        tv.temp_visit_plate,
        tv.temp_visit_cel,
        tv.temp_visit_type,
        tv.status_validated,
        tv.status_reason,
        tv.status_system
    FROM 
        temporary_visits tv
    ORDER BY 
        tv.temp_visit_id DESC;
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
