<?php
// CORS se maneja en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

$fecha_cumple = $_GET['fecha_cumple'] ?? null;

// Validar el parámetro
if (empty($fecha_cumple)) {
    echo json_encode(['error' => 'Parámetro "fecha_cumple" es requerido y debe estar en el formato MM-DD.']);
    exit();
}

$sql = "
SELECT 
        u.user_id,
        u.person_id,
        u.role_system,
        u.username_system,
        u.house_id,
        u.status_validated,
        u.status_reason,
        u.status_system,
        p.type_doc,
        p.doc_number,
        p.first_name,
        p.paternal_surname,
        p.maternal_surname,
        p.gender,
        p.birth_date,
        p.cel_number,
        p.email,
        p.photo_url,
        p.civil_status,
        p.address,
        p.address AS address_reniec,
        p.district,
        p.province,
        p.region,
        h.block_house,
        h.lot,
        h.apartment
    FROM users AS u
    LEFT JOIN persons AS p ON u.person_id = p.id
    LEFT JOIN houses AS h ON u.house_id = h.house_id
    WHERE p.id IS NOT NULL AND DATE_FORMAT(p.birth_date,'%m-%d') = :fecha_cumple AND u.status_validated='PERMITIDO';
";

try {
    // Preparar la consulta
    $sentencia = $bd->prepare($sql);

    // Vincular el parámetro
    $sentencia->bindParam(':fecha_cumple', $fecha_cumple, PDO::PARAM_STR);

    // Ejecutar la consulta
    $sentencia->execute();

    // Obtener los resultados
    $user = $sentencia->fetchAll(PDO::FETCH_OBJ);

    // Verificar si se encontraron resultados
    echo json_encode($user);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Error en la consulta']);
}
