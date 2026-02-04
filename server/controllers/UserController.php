<?php
/**
 * UserController para VC-INGRESO
 * 
 * Controlador para gestionar usuarios del sistema.
 * Ejemplo de implementación MVC.
 */

namespace Controllers;

use Utils\Response;
use Utils\Router;

class UserController extends Controller {
    protected $tableName = 'users';
    
    /**
     * Listar todos los usuarios
     */
    public function index($params = []) {
        $users = $this->getAll([], 'user_id DESC');
        Response::success($users, 'Usuarios obtenidos correctamente');
    }
    
    /**
     * Obtener usuario por ID
     */
    public function show($params = []) {
        $userId = $params['id'] ?? null;
        
        if (!$userId) {
            Response::error('ID de usuario requerido', 400);
        }
        
        $user = $this->findById($userId, 'user_id');
        
        if (!$user) {
            Response::notFound('Usuario no encontrado');
        }
        
        // Eliminar contraseña de la respuesta
        unset($user->password_system);
        
        Response::success($user);
    }
    
    /**
     * Crear nuevo usuario
     */
    public function store($params = []) {
        $data = $this->getInput();
        
        // Validar campos requeridos
        $required = ['doc_number', 'first_name', 'paternal_surname'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }
        
        // Verificar si ya existe
        if ($this->exists('doc_number', $data['doc_number'])) {
            Response::error('Ya existe un usuario con este número de documento', 409);
        }
        
        // Hash de contraseña si viene
        if (isset($data['password_system']) && !empty($data['password_system'])) {
            $data['password_system'] = password_hash($data['password_system'], PASSWORD_DEFAULT);
        }
        
        // Campos permitidos
        $allowed = [
            'type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname',
            'gender', 'birth_date', 'cel_number', 'email', 'role_system', 'username_system',
            'password_system', 'property_category', 'house_id', 'photo_url',
            'status_validated', 'status_reason', 'status_system',
            'civil_status', 'profession', 'address_reniec', 'district', 'province', 'region'
        ];
        
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        
        $userId = $this->create($filtered);
        $user = $this->findById($userId, 'user_id');
        unset($user->password_system);
        
        Response::created($user, 'Usuario creado correctamente');
    }
    
    /**
     * Actualizar usuario
     */
    public function updateUser($params = []) {
        $userId = $params['id'] ?? null;
        
        if (!$userId) {
            Response::error('ID de usuario requerido', 400);
        }
        
        $user = $this->findById($userId, 'user_id');
        if (!$user) {
            Response::notFound('Usuario no encontrado');
        }
        
        $data = $this->getInput();
        
        // Hash de contraseña si viene y es diferente
        if (isset($data['password_system']) && !empty($data['password_system'])) {
            $data['password_system'] = password_hash($data['password_system'], PASSWORD_DEFAULT);
        }
        
        // Campos permitidos
        $allowed = [
            'type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname',
            'gender', 'birth_date', 'cel_number', 'email', 'role_system', 'username_system',
            'password_system', 'property_category', 'house_id', 'photo_url',
            'status_validated', 'status_reason', 'status_system',
            'civil_status', 'profession', 'address_reniec', 'district', 'province', 'region'
        ];
        
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        
        if (empty($filtered)) {
            Response::error('No hay datos para actualizar', 400);
        }
        
        parent::update($userId, $filtered, 'user_id');
        $user = $this->findById($userId, 'user_id');
        unset($user->password_system);
        
        Response::success($user, 'Usuario actualizado correctamente');
    }
    
    /**
     * Eliminar usuario
     */
    public function destroy($params = []) {
        $userId = $params['id'] ?? null;
        
        if (!$userId) {
            Response::error('ID de usuario requerido', 400);
        }
        
        $user = $this->findById($userId, 'user_id');
        if (!$user) {
            Response::notFound('Usuario no encontrado');
        }
        
        $this->delete($userId, 'user_id');
        
        Response::success(null, 'Usuario eliminado correctamente');
    }
    
    /**
     * Obtener usuarios por fecha de cumpleaños
     */
    public function byBirthday($params = []) {
        $fecha_cumple = $params['fecha_cumple'] ?? $_GET['fecha_cumple'] ?? null;
        
        if (!$fecha_cumple) {
            Response::error('Parámetro fecha_cumple requerido', 400);
        }
        
        $sql = "SELECT * FROM users WHERE DATE_FORMAT(birth_date,'%m-%d') = ? AND status_validated='PERMITIDO'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$fecha_cumple]);
        
        $users = $stmt->fetchAll();
        Response::success($users);
    }
}

/**
 * Registrar rutas del controlador
 */
function registerUserRoutes(Router $router) {
    $router->prefix('/api/v1/users')->get('/by-birthday', 'UserController@byBirthday');
}
