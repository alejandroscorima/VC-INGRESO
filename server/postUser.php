<?php
// No exponer errores PHP en producción
if (getenv('APP_DEBUG') === 'true' || getenv('APP_DEBUG') === '1') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    exit("Solo acepto peticiones POST");
}

$jsonUser  = json_decode(file_get_contents("php://input"));
if (!$jsonUser ) {
    exit("No hay datos");
}

// Hashear la contraseña antes de guardarla
$hashedPassword = password_hash($jsonUser->password_system, PASSWORD_DEFAULT);

// Conexión a la base de datos
$bd = include_once "vc_db.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

// Preparar la consulta SQL para insertar un nuevo usuario
$sql = "INSERT INTO users (
            type_doc, doc_number, first_name, paternal_surname, maternal_surname, 
            gender, birth_date, cel_number, email, username_system, password_system, 
            role_system, house_id, property_category, photo_url, 
            status_validated, status_reason, status_system, civil_status, 
            profession, address_reniec, district, province, region
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$sentencia = $bd->prepare($sql);

// Ejecutar la consulta con los valores del JSON recibido
$resultado = $sentencia->execute([
    $jsonUser->type_doc,
    $jsonUser->doc_number,
    $jsonUser->first_name,
    $jsonUser->paternal_surname,
    $jsonUser->maternal_surname,
    $jsonUser->gender,
    $jsonUser->birth_date,
    $jsonUser->cel_number,
    $jsonUser->email,
    $jsonUser->username_system,
    $hashedPassword,
    $jsonUser->role_system,
    $jsonUser->house_id,
    $jsonUser->property_category,
    $jsonUser->photo_url,
    $jsonUser->status_validated,
    $jsonUser->status_reason,
    $jsonUser->status_system,
    $jsonUser->civil_status,
    $jsonUser->profession,
    $jsonUser->address_reniec,
    $jsonUser->district,
    $jsonUser->province,
    $jsonUser->region
]);

// Retornar respuesta en JSON
if ($resultado) {
    echo json_encode(["success" => true, "message" => "Usuario creado correctamente."]);
} else {
    http_response_code(500); // Error interno
    echo json_encode(["error" => "Error al crear el usuario."]);
}