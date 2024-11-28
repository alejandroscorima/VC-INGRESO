<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json'); // Crucial!

$bd = include_once "vc_db.php";

// Validar las entradas
$username = trim($_GET['username_system'] ?? '');
$password = $_GET['password_system'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['error' => 'Faltan parámetros']);
    exit;
}

// Cambiar la consulta para obtener el hash de la contraseña
$sentencia = $bd->prepare("SELECT user_id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, cel_number, email, role_system, property_category, house_id, photo_url, status_validated, status_reason, status_system, civil_status, profession, address_reniec, district, province, region, password_system FROM users WHERE LOWER(username_system) = LOWER(?)");
$sentencia->execute([$username]);
$user = $sentencia->fetchObject();

if ($user) {
    // Verificar la contraseña
    if (password_verify($password, $user->password_system)) {
        // Remover el hash antes de enviar la respuesta
        unset($user->password_system);
        echo json_encode($user);
    } else {
        echo json_encode(['error' => 'Contraseña incorrecta']);
    }
} else {
    echo json_encode(['error' => 'Usuario no encontrado']);
}
?>
