<?php
require_once __DIR__ . '/token.php';

/**
 * Autenticación obligatoria. Si $checkCsrf=true también valida encabezado X-CSRF-Token
 * generado como base64_encode(HMAC_SHA256(token, CSRF_SECRET || JWT_SECRET)).
 */
function requireAuth(bool $checkCsrf = false) {
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

    if ($checkCsrf) {
        $csrfHeader = $headers['X-CSRF-Token'] ?? $headers['X-Csrf-Token'] ?? $headers['x-csrf-token'] ?? '';
        if ($csrfHeader === '') {
            http_response_code(403);
            echo json_encode(['error' => 'Missing CSRF token']);
            exit;
        }
        $secret = getenv('CSRF_SECRET') ?: getenv('JWT_SECRET') ?: 'change-me';
        $expected = base64_encode(hash_hmac('sha256', $token, $secret, true));
        if (!hash_equals($expected, $csrfHeader)) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid CSRF token']);
            exit;
        }
    }

    return $payload; // contains user_id, role_system, etc.
}
