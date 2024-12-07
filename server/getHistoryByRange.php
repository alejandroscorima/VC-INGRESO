<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Recibir los parámetros enviados a través de GET
$fecha_inicial = $_GET['fecha_inicial'];
$fecha_final = $_GET['fecha_final'];
$access_point = $_GET['access_point'];

// Conectar a la base de datos
$bd = include_once "vc_db.php";

// Validar los parámetros
if (empty($fecha_inicial) || empty($fecha_final) || empty($access_point)) {
    echo json_encode(['error' => 'Faltan parámetros requeridos.']);
    exit();
}

// Preparar la consulta SQL
$sql = "
SELECT 
    a.access_log_id AS log_id,
    a.user_id,
    a.vehicle_id,
    a.entry_time AS date_entry,
    NULL AS date_exit,
    ap.ap_location AS ap_name,
    a.status_validated AS obs,
    CONCAT(o.first_name, ' ', o.paternal_surname) AS operator,
    CONCAT(h.block_house, '-', h.lot, IFNULL(CONCAT('-', h.apartment), '')) AS house_address,
    (
        SELECT COUNT(*)
        FROM access_logs al_count
        WHERE 
            (al_count.user_id = a.user_id OR al_count.vehicle_id = a.vehicle_id)
            AND al_count.entry_time BETWEEN :fecha_inicial AND :fecha_final
    ) AS visits,
    COALESCE(u.doc_number, v.license_plate) AS doc_number,
    COALESCE(CONCAT(u.first_name, ' ', u.paternal_surname), v.type_vehicle) AS name,
    'access_logs' AS log_type,
    CASE 
        WHEN u.user_id IS NULL THEN 'VEHÍCULO'
        ELSE 'PERSONA'
    END AS type
FROM 
    access_logs a
LEFT JOIN 
    users u ON a.user_id = u.user_id
LEFT JOIN 
    vehicles v ON a.vehicle_id = v.vehicle_id
LEFT JOIN 
    access_points ap ON a.ap_id = ap.ap_id
LEFT JOIN 
    users o ON a.operario_id = o.user_id
LEFT JOIN 
    houses h ON u.house_id = h.house_id OR v.house_id = h.house_id
WHERE 
    a.entry_time = (
        SELECT MAX(entry_time)
        FROM access_logs al_sub
        WHERE 
            al_sub.user_id = a.user_id OR al_sub.vehicle_id = a.vehicle_id
    )
    AND a.entry_time BETWEEN :fecha_inicial AND :fecha_final
    AND ap.ap_location = :access_point

UNION ALL

SELECT 
    t.temp_access_log_id AS log_id,
    t.temp_visit_id AS user_id,
    NULL AS vehicle_id,
    t.temp_entry_time AS date_entry,
    t.temp_exit_time AS date_exit,
    ap.ap_location AS ap_name,
    t.status_validated AS obs,
    CONCAT(o.first_name, ' ', o.paternal_surname) AS operator,
    CONCAT(h.block_house, '-', h.lot, IFNULL(CONCAT('-', h.apartment), '')) AS house_address,
    (
        SELECT COUNT(*)
        FROM temporary_access_logs tal_count
        WHERE 
            tal_count.temp_visit_id = t.temp_visit_id
            AND tal_count.temp_entry_time BETWEEN :fecha_inicial AND :fecha_final
    ) AS visits,
    COALESCE(tv.temp_visit_doc, tv.temp_visit_plate) AS doc_number,
    tv.temp_visit_name AS name,
    'temporary_access_logs' AS log_type,
    'PERSONA' AS type
FROM 
    temporary_access_logs t
LEFT JOIN 
    temporary_visits tv ON t.temp_visit_id = tv.temp_visit_id
LEFT JOIN 
    access_points ap ON t.ap_id = ap.ap_id
LEFT JOIN 
    users o ON t.operario_id = o.user_id
LEFT JOIN 
    houses h ON t.house_id = h.house_id
WHERE 
    t.temp_entry_time = (
        SELECT MAX(temp_entry_time)
        FROM temporary_access_logs t_sub
        WHERE 
            t_sub.temp_visit_id = t.temp_visit_id
    )
    AND t.temp_entry_time BETWEEN :fecha_inicial AND :fecha_final
    AND ap.ap_location = :access_point

ORDER BY 
    date_entry DESC;
";

try {
    // Preparar y ejecutar la consulta
    $sentencia = $bd->prepare($sql);

    // Asignar valores a los parámetros
    $sentencia->bindParam(':fecha_inicial', $fecha_inicial);
    $sentencia->bindParam(':fecha_final', $fecha_final);
    $sentencia->bindParam(':access_point', $access_point);

    // Ejecutar la consulta
    $sentencia->execute();
    $results = $sentencia->fetchAll(PDO::FETCH_OBJ);

    // Devolver los resultados como JSON
    echo json_encode($results);
} catch (PDOException $e) {
    // Manejo de errores
    echo json_encode(['error' => $e->getMessage()]);
}
?>
