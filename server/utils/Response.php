<?php
/**
 * Response Utility para VC-INGRESO
 * 
 * Proporciona métodos convenientes para enviar respuestas HTTP consistentes.
 */

namespace Utils;

class Response {
    /**
     * Enviar respuesta JSON
     */
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    
    /**
     * Enviar respuesta de éxito
     */
    public static function success($data = null, $message = 'Operación exitosa', $statusCode = 200) {
        $response = [
            'success' => true,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::json($response, $statusCode);
    }
    
    /**
     * Enviar respuesta de error
     */
    public static function error($message, $statusCode = 400, $details = null) {
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        // Solo mostrar detalles si no estamos en producción
        if ($details !== null && getenv('APP_DEBUG') === 'true') {
            $response['details'] = $details;
        }
        
        self::json($response, $statusCode);
    }
    
    /**
     * Enviar respuesta paginada
     */
    public static function paginated($data, $total, $page, $perPage) {
        $response = [
            'success' => true,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
        
        self::json($response);
    }
    
    /**
     * Enviar respuesta Created (201)
     */
    public static function created($data = null, $message = 'Recurso creado') {
        self::success($data, $message, 201);
    }
    
    /**
     * Enviar respuesta No Content (204)
     */
    public static function noContent() {
        http_response_code(204);
        exit;
    }
    
    /**
     * Enviar respuesta Not Found (404)
     */
    public static function notFound($message = 'Recurso no encontrado') {
        self::error($message, 404);
    }
    
    /**
     * Enviar respuesta Unauthorized (401)
     */
    public static function unauthorized($message = 'No autorizado') {
        self::error($message, 401);
    }
    
    /**
     * Enviar respuesta Forbidden (403)
     */
    public static function forbidden($message = 'Acceso prohibido') {
        self::error($message, 403);
    }
    
    /**
     * Enviar respuesta Validation Error (422)
     */
    public static function validationError($errors) {
        $response = [
            'success' => false,
            'error' => 'Error de validación',
            'errors' => $errors
        ];
        
        self::json($response, 422);
    }
}
