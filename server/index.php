<?php
/**
 * VC-INGRESO API - Entry Point (MVC)
 * 
 * Punto de entrada unico para todas las peticiones API.
 * Sistema de control de acceso para condominio.
 */

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Autoload simple para las nuevas clases
spl_autoload_register(function ($class) {
    $prefix = 'Utils\\';
    $baseDir = __DIR__ . '/utils/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        $prefix2 = 'Controllers\\';
        $baseDir2 = __DIR__ . '/controllers/';
        if (strncmp($prefix2, $class, $len) === 0) {
            $className = substr($class, $len);
            $file = $baseDir2 . $className . '.php';
            if (file_exists($file)) {
                require_once $file;
            }
        }
        return;
    }
    
    $className = substr($class, $len);
    $file = $baseDir . $className . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});

// Incluir archivos necesarios
require_once __DIR__ . '/error-handler.php';
require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/sanitize.php';

// Obtener ruta
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// API v1 Routes
if (str_starts_with($uri, '/api/v1/')) {
    $path = substr($uri, strlen('/api/v1/'));
    
    // ==================== USERS ====================
    if (str_starts_with($path, 'users')) {
        require_once __DIR__ . '/controllers/UserController.php';
        $controller = new \Controllers\UserController();
        
        if (preg_match('#^users(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show(['id' => $id]);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->updateUser(['id' => $id]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy(['id' => $id]);
                    }
                    break;
            }
            exit;
        }
        
        if (str_contains($path, 'by-birthday')) {
            if ($method === 'GET') {
                $controller->byBirthday([]);
            }
            exit;
        }
    }
    
    // ==================== HOUSES ====================
    if (str_starts_with($path, 'houses')) {
        require_once __DIR__ . '/controllers/HouseController.php';
        $controller = new \Controllers\HouseController();
        
        if (preg_match('#^houses(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show(['id' => $id]);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->updateHouse(['id' => $id]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy(['id' => $id]);
                    }
                    break;
            }
            exit;
        }
    }
    
    // ==================== VEHICLES ====================
    if (str_starts_with($path, 'vehicles')) {
        require_once __DIR__ . '/controllers/VehicleController.php';
        $controller = new \Controllers\VehicleController();
        
        if (preg_match('#^vehicles(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show(['id' => $id]);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->updateVehicle(['id' => $id]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy(['id' => $id]);
                    }
                    break;
            }
            exit;
        }
        
        if (str_contains($path, 'by-house')) {
            if ($method === 'GET') {
                $houseId = $_GET['house_id'] ?? null;
                $controller->byHouse(['house_id' => $houseId]);
            }
            exit;
        }
    }
    
    // ==================== PERSONS ====================
    if (str_starts_with($path, 'persons')) {
        require_once __DIR__ . '/controllers/PersonController.php';
        $controller = new \Controllers\PersonController();
        
        if (preg_match('#^persons(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show(['id' => $id]);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->updatePerson(['id' => $id]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy(['id' => $id]);
                    }
                    break;
            }
            exit;
        }
        
        // by-doc-number
        if (str_contains($path, 'by-doc-number')) {
            if ($method === 'GET') {
                $docNumber = $_GET['doc_number'] ?? null;
                $controller->byDocNumber(['doc_number' => $docNumber]);
            }
            exit;
        }
        
        // observed (estado OBSERVADO)
        if (str_contains($path, 'observed')) {
            if ($method === 'GET') {
                $controller->observed([]);
            }
            exit;
        }
        
        // restricted (estado DENEGADO)
        if (str_contains($path, 'restricted')) {
            if ($method === 'GET') {
                $controller->restricted([]);
            }
            exit;
        }
        
        // validate (cambiar estado de validacion)
        if (str_contains($path, 'validate')) {
            if ($method === 'PUT' && preg_match('#^persons/(\d+)/validate#', $path, $m)) {
                $controller->validate(['id' => $m[1]]);
            }
            exit;
        }
    }
    
    // ==================== EXTERNAL VEHICLES ====================
    if (str_starts_with($path, 'external-vehicles')) {
        require_once __DIR__ . '/controllers/ExternalVehicleController.php';
        $controller = new \Controllers\ExternalVehicleController();
        
        if (preg_match('#^external-vehicles(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show(['id' => $id]);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->updateExternalVehicle(['id' => $id]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy(['id' => $id]);
                    }
                    break;
            }
            exit;
        }
    }
}

// Backward compatibility - endpoints legacy
$file = __DIR__ . '/' . basename($uri) . '.php';
if (file_exists($file)) {
    require_once $file;
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Ruta no encontrada',
        'available_routes' => [
            // Users
            'GET /api/v1/users' => 'Listar todos los usuarios',
            'GET /api/v1/users/:id' => 'Obtener usuario por ID',
            'POST /api/v1/users' => 'Crear usuario',
            'PUT /api/v1/users/:id' => 'Actualizar usuario',
            'DELETE /api/v1/users/:id' => 'Eliminar usuario',
            'GET /api/v1/users/by-birthday?fecha=MM-DD' => 'Usuarios por cumpleaños',
            
            // Houses
            'GET /api/v1/houses' => 'Listar casas',
            'GET /api/v1/houses/:id' => 'Obtener casa',
            'POST /api/v1/houses' => 'Crear casa',
            'PUT /api/v1/houses/:id' => 'Actualizar casa',
            'DELETE /api/v1/houses/:id' => 'Eliminar casa',
            
            // Vehicles
            'GET /api/v1/vehicles' => 'Listar vehículos',
            'GET /api/v1/vehicles/:id' => 'Obtener vehículo',
            'POST /api/v1/vehicles' => 'Crear vehículo',
            'PUT /api/v1/vehicles/:id' => 'Actualizar vehículo',
            'DELETE /api/v1/vehicles/:id' => 'Eliminar vehículo',
            'GET /api/v1/vehicles/by-house?house_id=:id' => 'Vehículos por casa',
            
            // Persons (unificado -取代 clients)
            'GET /api/v1/persons' => 'Listar personas',
            'GET /api/v1/persons/:id' => 'Obtener persona',
            'POST /api/v1/persons' => 'Crear persona',
            'PUT /api/v1/persons/:id' => 'Actualizar persona',
            'DELETE /api/v1/persons/:id' => 'Eliminar persona',
            'GET /api/v1/persons/by-doc-number?doc_number=:doc' => 'Por documento',
            'GET /api/v1/persons/observed' => 'Personas observadas',
            'GET /api/v1/persons/restricted' => 'Personas restringidas',
            'PUT /api/v1/persons/:id/validate' => 'Cambiar estado validación',
            
            // External Vehicles
            'GET /api/v1/external-vehicles' => 'Listar vehículos externos',
            'GET /api/v1/external-vehicles/:id' => 'Obtener vehículo externo',
            'POST /api/v1/external-vehicles' => 'Crear vehículo externo',
            'PUT /api/v1/external-vehicles/:id' => 'Actualizar vehículo externo',
            'DELETE /api/v1/external-vehicles/:id' => 'Eliminar vehículo externo'
        ]
    ]);
}
