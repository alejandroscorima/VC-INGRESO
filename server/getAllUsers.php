<?php
// Permitir solicitudes de cualquier origen (modificar en producción para mayor seguridad)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Incluir conexión a la base de datos
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

try {
    // Preparar la consulta SQL
    $sentencia = $bd->prepare("SELECT 
        u.user_id,
        u.person_id,
        u.role_system,
        u.username_system,
        u.house_id,
        u.status_validated,
        u.status_reason,
        COALESCE(u.status_system, 'ACTIVO') AS status_system,
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
    WHERE (u.status_system = 'ACTIVO' OR u.status_system IS NULL) AND COALESCE(u.is_active, 1) = 1
    ORDER BY COALESCE(h.block_house, ''), h.lot, h.apartment, u.user_id;
    ");
    
    $sentencia->execute();
    $users = $sentencia->fetchAll(PDO::FETCH_OBJ);
    
    echo json_encode($users);

} catch (Exception $e) {
    // Manejo de errores: devolver un mensaje en caso de falla
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}
?>
