<?php
// Conexión PDO principal. Usa DB_NAME (vc_db). No cambiar nombre de archivo para no romper includes.

// Basic CORS handling for all endpoints that include this file
$allowedOrigin = getenv('CORS_ALLOW_ORIGIN') ?: '*';
$allowedMethods = 'GET, POST, PUT, DELETE, OPTIONS';
$allowedHeaders = 'Content-Type, Authorization, X-Requested-With';

header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: ' . $allowedMethods);
header('Access-Control-Allow-Headers: ' . $allowedHeaders);

// Short-circuit OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dbHost    = getenv('DB_HOST') ?: 'localhost';
$dbPort    = getenv('DB_PORT') ?: '3306';
$dbName    = getenv('DB_NAME') ?: 'vc_db';
$dbUser    = getenv('DB_USER') ?: 'root';
// En producción .env debe definir DB_PASS; sin fallback para no exponer credenciales
$dbPass    = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbCharset = getenv('DB_CHARSET') ?: 'utf8mb4';

$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', $dbHost, $dbPort, $dbName, $dbCharset);

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
    ]);
    return $pdo;
} catch (Exception $e) {
    // Do not leak sensitive details in production
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
