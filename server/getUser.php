<?php
// CORS y preflight se manejan en vc_db.php
$bd = include_once "vc_db.php";
require_once __DIR__ . '/token.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($payload['username_system'] ?? '');
$password = $payload['password_system'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetros requeridos']);
    exit;
}

$sentencia = $bd->prepare("SELECT user_id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, cel_number, email, role_system, property_category, house_id, photo_url, status_validated, status_reason, status_system, civil_status, profession, address_reniec, district, province, region, password_system FROM users WHERE LOWER(username_system) = LOWER(:username)");
$sentencia->bindParam(':username', $username, PDO::PARAM_STR);
$sentencia->execute();
$user = $sentencia->fetchObject();

if ($user && $user->password_system !== null && $user->password_system !== '') {
    $stored = (string) $user->password_system;
    // Bcrypt/Argon2: empiezan por $2y$, $2a$, $argon2
    $isHashed = (strlen($stored) >= 60 && (strpos($stored, '$2y$') === 0 || strpos($stored, '$2a$') === 0))
        || strpos($stored, '$argon2') === 0;
    $validPassword = $isHashed
        ? password_verify($password, $stored)
        : hash_equals($stored, (string) $password); // texto plano (entorno dev)

    if ($validPassword) {
        $token = generateToken([
            'user_id' => $user->user_id,
            'role_system' => $user->role_system,
            'house_id' => $user->house_id,
        ]);
        unset($user->password_system);
        echo json_encode(['user' => $user, 'token' => $token]);
        exit;
    }
}

http_response_code(401);
echo json_encode(['error' => 'Credenciales inválidas']);
?>
