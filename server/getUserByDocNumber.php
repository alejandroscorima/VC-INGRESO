<?php
// CORS se maneja en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

$doc_number=$_GET['doc_number'] ?? '';

// Validar los parámetros
if (empty($doc_number)) {
    echo json_encode(['error' => 'Faltan parámetros requeridos.']);
    exit();
}

$sql = "
SELECT 
        u.user_id,
        u.person_id,
        u.role_system,
        u.username_system,
        u.password_system,
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
    WHERE p.doc_number = :doc_number
    LIMIT 1;
";

try {
    // Preparar y ejecutar la consulta
    $sentencia = $bd->prepare($sql);
    $sentencia->bindParam(':doc_number', $doc_number);
    $sentencia->execute();

    $user = $sentencia->fetchObject();
    
    // Verificar si se encontró el usuario
    if ($user) {
        unset($user->password_system); // Remover datos sensibles
        echo json_encode($user);
    } else {
        echo json_encode(['error' => 'Usuario no encontrado.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al consultar la base de datos.']);
}
