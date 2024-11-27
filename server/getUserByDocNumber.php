<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$bd = include_once "vc_db.php";

$doc_number=$_GET['doc_number'];

// Validar los parámetros
if (empty($doc_number)) {
    echo json_encode(['error' => 'Faltan parámetros requeridos.']);
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
    WHERE u.doc_number = :doc_number;
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
    echo json_encode(['error' => 'Error al consultar la base de datos.', 'details' => $e->getMessage()]);
}
?>
