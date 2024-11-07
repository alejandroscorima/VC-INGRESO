<?php
header("Access-Control-Allow-Origin: *");

$bd = include_once "bdData.php";

$username = $_GET['username'];
$password = $_GET['password'];

// Cambiar la consulta para obtener el hash de la contraseña
$sentencia = $bd->prepare("SELECT user_id, colab_id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, civil_status, profession, cel_number, email, address, district, province, region, username, entrance_role, latitud, longitud, photo_url, house_id, password FROM users WHERE username = ?");
$sentencia->execute([$username]);
$user = $sentencia->fetchObject();

if ($user && password_verify($password, $user->password)) {
    // Si la contraseña es correcta, eliminar el hash de la respuesta
    unset($user->password);
    echo json_encode($user);
} else {
    // Si el usuario no existe o la contraseña es incorrecta
    echo json_encode(["error" => "Usuario o contraseña incorrectos"]);
}

?>