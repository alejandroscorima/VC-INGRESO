<?php
// CORS se maneja en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

// Incluir conexión a la base de datos
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
    // Listar todas las personas del domicilio (persons.house_id), tengan o no usuario.
    // Incluir person_type y property_category para que My House filtre residentes/visitas.
    $sentencia = $bd->prepare("SELECT 
        p.id AS person_id,
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
        p.person_type,
        p.person_type AS property_category,
        p.house_id,
        p.status_validated,
        p.status_system,
        u.user_id,
        u.role_system,
        u.username_system,
        u.status_validated AS user_status_validated,
        u.status_reason,
        u.status_system AS user_status_system,
        h.block_house,
        h.lot,
        h.apartment
    FROM persons AS p
    LEFT JOIN users AS u ON u.person_id = p.id
    LEFT JOIN houses AS h ON p.house_id = h.house_id
    WHERE p.house_id = :house_id
    ORDER BY p.person_type, p.paternal_surname, p.first_name");

    $sentencia->bindParam(':house_id', $house_id);
    $sentencia->execute();
    $persons = $sentencia->fetchAll(PDO::FETCH_OBJ);

    if ($persons) {
        foreach ($persons as $person) {
            if (isset($person->password_system)) {
                unset($person->password_system);
            }
        }
        echo json_encode($persons);
    } else {
        echo json_encode([]);
    }

    // Cerrar la sentencia
    $sentencia = null;

} catch (Exception $e) {
    // Registrar el error en un archivo de log
    error_log($e->getMessage(), 3, '/var/log/php_errors.log');

    // Devolver un mensaje genérico
    echo json_encode([
        "error" => true,
        "message" => "An error occurred. Please try again later."
    ]);
}
