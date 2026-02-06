<?php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json; charset=UTF-8');

$fecha_inicial = $_GET['fecha_inicial'] ?? '';
$fecha_final = $_GET['fecha_final'] ?? '';
$access_point = $_GET['access_point'] ?? '';

if (empty($fecha_inicial) || empty($fecha_final) || empty($access_point)) {
    echo json_encode(['error' => 'Faltan parámetros requeridos.']);
    exit();
}

// Esquema vc_db: access_logs (id, access_point_id, person_id, doc_number, vehicle_id, type, created_at)
// access_points (id, name); persons; vehicles; houses (house_id, block_house, lot, apartment)
// users en vc_db tiene user_id; persons tiene id. access_logs usa person_id -> persons.id
$sql = "
SELECT 
    a.id AS log_id,
    a.person_id AS user_id,
    a.vehicle_id,
    a.created_at AS date_entry,
    NULL AS date_exit,
    ap.name AS ap_name,
    a.observation AS obs,
    NULL AS operator,
    CONCAT(h.block_house, '-', h.lot, IFNULL(CONCAT('-', h.apartment), '')) AS house_address,
    1 AS visits,
    COALESCE(p.doc_number, v.license_plate) AS doc_number,
    COALESCE(CONCAT(p.first_name, ' ', p.paternal_surname), v.license_plate) AS name,
    'access_logs' AS log_type,
    CASE 
        WHEN p.id IS NULL THEN 'VEHÍCULO'
        ELSE 'PERSONA'
    END AS type
FROM access_logs a
LEFT JOIN persons p ON a.person_id = p.id
LEFT JOIN vehicles v ON a.vehicle_id = v.vehicle_id
LEFT JOIN access_points ap ON a.access_point_id = ap.id
LEFT JOIN houses h ON h.house_id = COALESCE(p.house_id, v.house_id)
WHERE a.created_at BETWEEN :fecha_inicial AND :fecha_final
  AND ap.name = :access_point

UNION ALL

SELECT 
    t.temp_access_log_id AS log_id,
    t.temp_visit_id AS user_id,
    NULL AS vehicle_id,
    t.temp_entry_time AS date_entry,
    t.temp_exit_time AS date_exit,
    ap.name AS ap_name,
    t.status_validated AS obs,
    NULL AS operator,
    CONCAT(h.block_house, '-', h.lot, IFNULL(CONCAT('-', h.apartment), '')) AS house_address,
    1 AS visits,
    COALESCE(tv.temp_visit_doc, tv.temp_visit_plate) AS doc_number,
    tv.temp_visit_name AS name,
    'temporary_access_logs' AS log_type,
    'PERSONA' AS type
FROM temporary_access_logs t
LEFT JOIN temporary_visits tv ON t.temp_visit_id = tv.temp_visit_id
LEFT JOIN access_points ap ON t.access_point_id = ap.id
LEFT JOIN houses h ON t.house_id = h.house_id
WHERE t.temp_entry_time BETWEEN :fecha_inicial AND :fecha_final
  AND ap.name = :access_point

ORDER BY date_entry DESC
";

try {
    $sentencia = $bd->prepare($sql);
    $sentencia->bindParam(':fecha_inicial', $fecha_inicial);
    $sentencia->bindParam(':fecha_final', $fecha_final);
    $sentencia->bindParam(':access_point', $access_point);
    $sentencia->execute();
    $results = $sentencia->fetchAll(PDO::FETCH_OBJ);
    echo json_encode($results);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Error en la consulta']);
}
