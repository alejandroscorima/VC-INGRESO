<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=UTF-8');

$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

try {
    // Esquema vc_db: access_points tiene id, name, type, location, is_active (no ap_id, ap_location, status_system)
    $sentencia = $bd->prepare("SELECT 
        id,
        name,
        type,
        location,
        is_active
    FROM access_points 
    WHERE is_active = 1 
    ORDER BY name");
    $sentencia->execute();
    $rows = $sentencia->fetchAll(PDO::FETCH_OBJ);

    // Compatibilidad con frontend que espera ap_id / ap_location
    $points = array_map(function ($row) {
        return (object) [
            'id' => (int) $row->id,
            'name' => $row->name,
            'type' => $row->type,
            'location' => $row->location,
            'is_active' => (bool) $row->is_active,
            'ap_id' => (int) $row->id,
            'ap_location' => $row->name,
        ];
    }, $rows);

    echo json_encode($points);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Error al obtener puntos de acceso']);
}
