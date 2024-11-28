<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "vc_db.php";

$username_system = $_GET['username_system'];
$password_system = $_GET['password_system'];

// Cambiar la consulta para obtener el hash de la contraseña
$sentencia = $bd->prepare("SELECT user_id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, cel_number, email, role_system, property_category, house_id, photo_url, status_validated, status_reason, status_system, civil_status, profession, address_reniec, district, province, region, password_system FROM users WHERE username_system = ?");
$sentencia->execute([$username_system]);
$user = $sentencia->fetchObject();

if ($user && password_verify($password_system, $user->password_system)) {
    // Si la contraseña es correcta, eliminar el hash de la respuesta
    unset($user->password_system);
    echo json_encode($user);
} else {
    // Si el usuario no existe o la contraseña es incorrecta
    echo json_encode(["error" => "Usuario o contraseña incorrectos"]);
}
?>
