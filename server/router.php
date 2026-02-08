<?php
/**
 * Router para el servidor de desarrollo PHP (php -S).
 * Redirige todas las peticiones a index.php para que CORS y la API funcionen.
 *
 * Uso: desde la carpeta server/
 *   php -S localhost:8080 router.php
 */

// CORS (igual que index.php)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/index.php';
