<?php
/**
 * VC-INGRESO API - Entry Point (MVC)
 * 
 * Punto de entrada unico para todas las peticiones API.
 * Sistema de control de acceso para condominio.
 */

// CORS: enviar siempre desde PHP (funciona con servidor integrado PHP o Apache)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Preflight OPTIONS: responder 204 con las cabeceras anteriores
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
    
    // ==================== PETS ====================
    if (str_starts_with($path, 'pets')) {
        require_once __DIR__ . '/controllers/PetController.php';
        $controller = new \Controllers\PetController();
        
        // pets/:id/photo - subir foto
        if (str_contains($path, 'photo') && preg_match('#^pets/(\d+)/photo#', $path, $m)) {
            if ($method === 'POST') {
                $controller->uploadPhoto($m[1]);
            }
            exit;
        }
        
        // pets/:id/validate - cambiar estado
        if (str_contains($path, 'validate') && preg_match('#^pets/(\d+)/validate#', $path, $m)) {
            if ($method === 'PUT') {
                $controller->validate($m[1], []);
            }
            exit;
        }
        
        // pets/person/:person_id - mascotas de un propietario
        if (str_contains($path, 'person/') && preg_match('#^pets/person/(\d+)#', $path, $m)) {
            if ($method === 'GET') {
                $controller->byOwner($m[1]);
            }
            exit;
        }
        
        // pets/:id
        if (preg_match('#^pets(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show($id);
                    } else {
                        $controller->index($_GET);
                    }
                    break;
                case 'POST':
                    $controller->store([]);
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->update($id, []);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy($id);
                    }
                    break;
            }
            exit;
        }
    }
    
    // ==================== ACCESS LOGS ====================
    if (str_starts_with($path, 'access-logs')) {
        require_once __DIR__ . '/db_connection.php';
        require_once __DIR__ . '/controllers/AccessLogController.php';
        $pdo = getDbConnection();
        $controller = new \Controllers\AccessLogController($pdo);
        
        // access-logs/access-points
        if (str_contains($path, 'access-points')) {
            if ($method === 'GET') {
                $controller->accessPoints();
            }
            exit;
        }
        
        // access-logs/stats/daily
        if (str_contains($path, 'stats/daily')) {
            if ($method === 'GET') {
                $controller->dailyStats();
            }
            exit;
        }
        
        // access-logs/:id
        if (preg_match('#^access-logs(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show($id);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
            }
            exit;
        }
    }
    
    // ==================== RESERVATIONS ====================
    if (str_starts_with($path, 'reservations')) {
        require_once __DIR__ . '/db_connection.php';
        require_once __DIR__ . '/controllers/ReservationController.php';
        $pdo = getDbConnection();
        $controller = new \Controllers\ReservationController($pdo);
        
        // reservations/areas
        if (str_contains($path, 'areas')) {
            if ($method === 'GET') {
                $controller->areas();
            }
            exit;
        }
        
        // reservations/availability
        if (str_contains($path, 'availability')) {
            if ($method === 'GET') {
                $controller->availability();
            }
            exit;
        }
        
        // reservations/:id/status
        if (str_contains($path, 'status') && preg_match('#^reservations/(\d+)/status#', $path, $m)) {
            if ($method === 'PUT') {
                $controller->updateStatus($m[1]);
            }
            exit;
        }
        
        // reservations/:id
        if (preg_match('#^reservations(?:/(\d+))?#', $path, $matches)) {
            $id = $matches[1] ?? null;
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $controller->show($id);
                    } else {
                        $controller->index();
                    }
                    break;
                case 'POST':
                    $controller->store();
                    break;
                case 'PUT':
                    if ($id) {
                        $controller->update($id);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $controller->destroy($id);
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
            'DELETE /api/v1/external-vehicles/:id' => 'Eliminar vehículo externo',
            
            // Pets (Mascotas)
            'GET /api/v1/pets' => 'Listar todas las mascotas',
            'GET /api/v1/pets/:id' => 'Obtener mascota por ID',
            'GET /api/v1/pets/person/:person_id' => 'Mascotas de un propietario',
            'POST /api/v1/pets' => 'Crear mascota',
            'PUT /api/v1/pets/:id' => 'Actualizar mascota',
            'PUT /api/v1/pets/:id/validate' => 'Cambiar estado de validación',
            'POST /api/v1/pets/:id/photo' => 'Subir foto de mascota',
            'DELETE /api/v1/pets/:id' => 'Eliminar mascota',
            
            // Access Logs (Logs de Acceso)
            'GET /api/v1/access-logs' => 'Listar logs de acceso',
            'GET /api/v1/access-logs/:id' => 'Obtener log por ID',
            'POST /api/v1/access-logs' => 'Crear registro de acceso',
            'GET /api/v1/access-logs/access-points' => 'Listar puntos de acceso',
            'GET /api/v1/access-logs/stats/daily' => 'Estadísticas diarias',
            
            // Reservations (Reservaciones Casa Club)
            'GET /api/v1/reservations' => 'Listar reservaciones',
            'GET /api/v1/reservations/:id' => 'Obtener reservación',
            'POST /api/v1/reservations' => 'Crear reservación',
            'PUT /api/v1/reservations/:id' => 'Actualizar reservación',
            'PUT /api/v1/reservations/:id/status' => 'Cambiar estado',
            'DELETE /api/v1/reservations/:id' => 'Eliminar reservación',
            'GET /api/v1/reservations/areas' => 'Listar áreas disponibles',
            'GET /api/v1/reservations/availability' => 'Consultar disponibilidad'
        ]
    ]);
}
