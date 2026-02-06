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
    $sentencia = $bd->prepare("SELECT 
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
    WHERE u.house_id = :house_id");

    // Vincula el parámetro
    $sentencia->bindParam(':house_id', $house_id);
    

    // Ejecutar la consulta
    $sentencia->execute();
    
    // Obtener los resultados como un arreglo de objetos
    $persons = $sentencia->fetchAll(PDO::FETCH_OBJ);
    
    // Siempre devolver un array (vacío si no hay resultados) para que el frontend no falle con *ngFor
    if ($persons) {
        foreach ($persons as $person) {
          unset($person->password_system);
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
