<?php
// CORS se maneja en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

header('Content-Type: application/json');

// Validación y sanitización del parámetro 'user_id'
if (!isset($_GET['user_id'])) {
    echo json_encode([
        "error" => true,
        "message" => "Invalid or missing user_id"
    ]);
    exit;
}

$user_id = (int) $_GET['user_id'];

try {
    $sentencia = $bd->prepare("SELECT 
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
    WHERE u.user_id = :user_id");

    // Vincula el parámetro
    $sentencia->bindParam(':user_id', $user_id);

    // Ejecutar la consulta
    $sentencia->execute();
    
    // Obtener los resultados como un arreglo de objetos
    $user = $sentencia->fetchObject();
    
    // Comprobar si se encontraron resultados
    if ($user) {
        // Eliminar el campo 'password_system' del objeto antes de devolverlo
        unset($user->password_system);

        // Devolver los resultados en formato JSON
        echo json_encode($user);
    } else {
        // Si no se encuentran resultados, se devuelve un mensaje de error
        echo json_encode([
            "error" => true,
            "message" => "User not found"
        ]);
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
