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
        u.type_doc,
        u.doc_number,
        u.first_name,
        u.paternal_surname,
        u.maternal_surname,
        u.gender,
        u.birth_date,
        u.cel_number,
        u.email,
        u.role_system,
        u.username_system,
        u.password_system,
        u.property_category,
        u.house_id,
        u.photo_url,
        u.status_validated,
        u.status_reason,
        u.status_system,
        u.civil_status,
        u.profession,
        u.address_reniec,
        u.district,
        u.province,
        u.region,
        h.block_house,
        h.lot,
        h.apartment
    FROM users AS u
    LEFT JOIN houses AS h ON u.house_id = h.house_id
    WHERE DATE_FORMAT(u.birth_date,'%m-%d') = :fecha_cumple AND u.status_validated='PERMITIDO';
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
