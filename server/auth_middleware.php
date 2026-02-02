<?php
require_once __DIR__ . '/token.php';

function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (stripos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Missing token']);
        exit;
    }

    $token = trim(substr($authHeader, 7));
    $payload = verifyToken($token);
    if ($payload === false) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    return $payload; // contains user_id, role_system, etc.
}
