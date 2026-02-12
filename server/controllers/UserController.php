<?php
/**
 * UserController para VC-INGRESO
 * 
 * Controlador para gestionar usuarios del sistema.
 * Ejemplo de implementación MVC.
 */

namespace Controllers;

require_once __DIR__ . '/../auth_middleware.php';

use Utils\Response;
use Utils\Router;

class UserController extends Controller {
    protected $tableName = 'users';
    
    /**
     * Listar todos los usuarios (datos sistema en users + identidad en persons)
     */
    public function index($params = []) {
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id,
                       u.status_validated, u.status_reason, u.status_system, u.is_active,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname,
                       p.gender, p.birth_date, p.cel_number, p.email, p.photo_url, p.civil_status,
                       p.address, p.district, p.province, p.region
                FROM users u
                LEFT JOIN persons p ON u.person_id = p.id
                ORDER BY u.user_id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(\PDO::FETCH_OBJ);
        foreach ($users as $u) {
            unset($u->password_system);
        }
        Response::success($users, 'Usuarios obtenidos correctamente');
    }
    
    /**
     * Obtener usuario por ID (datos sistema + persona enlazada)
     */
    public function show($params = []) {
        $userId = $params['id'] ?? null;
        
        if (!$userId) {
            Response::error('ID de usuario requerido', 400);
        }
        
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id,
                       u.status_validated, u.status_reason, u.status_system, u.is_active,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname,
                       p.gender, p.birth_date, p.cel_number, p.email, p.photo_url, p.civil_status,
                       p.address, p.district, p.province, p.region
                FROM users u
                LEFT JOIN persons p ON u.person_id = p.id
                WHERE u.user_id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(\PDO::FETCH_OBJ);
        
        if (!$user) {
            Response::notFound('Usuario no encontrado');
        }

        // Añadir block_house, lot, apartment de la vivienda principal (side-nav / nav-bar).
        $houseId = !empty($user->house_id) ? (int) $user->house_id : null;
        if (!$houseId && !empty($user->person_id)) {
            $stmtHm = $this->db->prepare("SELECT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1 ORDER BY is_primary DESC, id ASC LIMIT 1");
            $stmtHm->execute([$user->person_id]);
            $row = $stmtHm->fetch(\PDO::FETCH_OBJ);
            $houseId = $row ? (int) $row->house_id : null;
        }
        if ($houseId) {
            $stmtH = $this->db->prepare("SELECT block_house, lot, apartment FROM houses WHERE house_id = ? LIMIT 1");
            $stmtH->execute([$houseId]);
            $h = $stmtH->fetch(\PDO::FETCH_OBJ);
            if ($h) {
                $user->block_house = $h->block_house;
                $user->lot = $h->lot;
                $user->apartment = $h->apartment;
            }
        }
        
        Response::success($user);
    }
    
    /**
     * Crear nuevo usuario. Crea/usa persona (datos civiles) y usuario (sistema).
     */
    public function store($params = []) {
        $data = $this->getInput();
        
        $required = ['doc_number', 'first_name', 'paternal_surname'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }
        
        $stmt = $this->db->prepare("SELECT id FROM persons WHERE doc_number = ? LIMIT 1");
        $stmt->execute([trim($data['doc_number'])]);
        $existingPerson = $stmt->fetch(\PDO::FETCH_OBJ);
        if ($existingPerson) {
            $stmt = $this->db->prepare("SELECT 1 FROM users WHERE person_id = ? LIMIT 1");
            $stmt->execute([$existingPerson->id]);
            if ($stmt->fetch()) {
                Response::error('Ya existe un usuario con este número de documento', 409);
            }
        }
        
        $personAllowed = ['type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname', 'gender', 'birth_date', 'cel_number', 'email', 'address', 'district', 'province', 'region', 'civil_status', 'photo_url', 'person_type', 'house_id', 'status_validated', 'status_system'];
        $userAllowed = ['role_system', 'username_system', 'password_system', 'house_id', 'status_validated', 'status_reason', 'status_system'];
        
        if ($existingPerson) {
            $personId = (int) $existingPerson->id;
        } else {
            $pData = [];
            foreach ($personAllowed as $f) {
                if (isset($data[$f])) $pData[$f] = $data[$f];
            }
            if (empty($pData['person_type'])) $pData['person_type'] = 'RESIDENTE';
            $cols = implode(', ', array_keys($pData));
            $ph = implode(', ', array_fill(0, count($pData), '?'));
            $this->db->prepare("INSERT INTO persons ($cols) VALUES ($ph)")->execute(array_values($pData));
            $personId = (int) $this->db->lastInsertId();
        }
        
        $uData = ['person_id' => $personId];
        foreach ($userAllowed as $f) {
            if (isset($data[$f])) $uData[$f] = $data[$f];
        }
        if (isset($uData['password_system']) && $uData['password_system'] !== '') {
            $uData['password_system'] = password_hash($uData['password_system'], PASSWORD_DEFAULT);
        }
        if (empty($uData['role_system'])) $uData['role_system'] = 'RESIDENTE';
        if (empty($uData['username_system'])) $uData['username_system'] = trim($data['doc_number']);
        if ($this->exists('username_system', $uData['username_system'])) {
            Response::error('El nombre de usuario ya existe', 409);
        }
        $cols = implode(', ', array_keys($uData));
        $ph = implode(', ', array_fill(0, count($uData), '?'));
        $this->db->prepare("INSERT INTO users ($cols) VALUES ($ph)")->execute(array_values($uData));
        $userId = (int) $this->db->lastInsertId();
        
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id, u.status_validated, u.status_reason, u.status_system, u.is_active,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname, p.gender, p.birth_date, p.cel_number, p.email, p.photo_url, p.civil_status, p.address, p.district, p.province, p.region
                FROM users u LEFT JOIN persons p ON u.person_id = p.id WHERE u.user_id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(\PDO::FETCH_OBJ);
        Response::created($user, 'Usuario creado correctamente');
    }
    
    /**
     * Actualizar usuario: datos civiles en persons, datos sistema en users.
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
        if (empty($data)) {
            Response::error('No hay datos para actualizar', 400);
        }
        
        $personAllowed = ['type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname', 'gender', 'birth_date', 'cel_number', 'email', 'address', 'district', 'province', 'region', 'civil_status', 'photo_url', 'person_type', 'house_id', 'status_validated', 'status_system'];
        $userAllowed = ['role_system', 'username_system', 'password_system', 'house_id', 'status_validated', 'status_reason', 'status_system', 'is_active', 'force_password_change'];
        
        if (!empty($user->person_id)) {
            $pData = [];
            foreach ($personAllowed as $f) {
                if (array_key_exists($f, $data)) $pData[$f] = $data[$f];
            }
            if (!empty($pData)) {
                $set = implode(', ', array_map(fn($c) => "$c = ?", array_keys($pData)));
                $params = array_values($pData);
                $params[] = $user->person_id;
                $this->db->prepare("UPDATE persons SET $set WHERE id = ?")->execute($params);
            }
        }
        
        $uData = [];
        foreach ($userAllowed as $f) {
            if (array_key_exists($f, $data)) $uData[$f] = $data[$f];
        }
        if (isset($uData['password_system']) && $uData['password_system'] !== '') {
            $uData['password_system'] = password_hash($uData['password_system'], PASSWORD_DEFAULT);
            $uData['force_password_change'] = 0;
        }
        if (!empty($uData)) {
            parent::update($userId, $uData, 'user_id');
        }
        
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id, u.status_validated, u.status_reason, u.status_system, u.is_active,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname, p.gender, p.birth_date, p.cel_number, p.email, p.photo_url, p.civil_status, p.address, p.district, p.province, p.region
                FROM users u LEFT JOIN persons p ON u.person_id = p.id WHERE u.user_id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(\PDO::FETCH_OBJ);
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
     * POST /api/v1/users/from-person
     * Crear usuario a partir de una persona existente (dar acceso al sistema).
     * Body: { person_id, username_system, password_system, role_system }.
     * No se duplican datos de identidad en users; se obtienen de persons vía person_id.
     */
    public function createFromPerson($params = []) {
        requireAuth();
        $data = $this->getInput();
        $personId = isset($data['person_id']) ? (int) $data['person_id'] : null;
        if (!$personId) {
            Response::error('person_id es requerido', 400);
        }
        foreach (['username_system', 'password_system', 'role_system'] as $f) {
            if (empty($data[$f])) {
                Response::error("Campo requerido: $f", 400);
            }
        }
        $stmt = $this->db->prepare("SELECT id FROM persons WHERE id = ? LIMIT 1");
        $stmt->execute([$personId]);
        if (!$stmt->fetch()) {
            Response::error('Persona no encontrada', 404);
        }
        $stmt = $this->db->prepare("SELECT 1 FROM users WHERE person_id = ? LIMIT 1");
        $stmt->execute([$personId]);
        if ($stmt->fetch()) {
            Response::error('Esta persona ya tiene un usuario asignado', 409);
        }
        if ($this->exists('username_system', trim($data['username_system']))) {
            Response::error('El nombre de usuario ya existe', 409);
        }
        $houseId = null;
        $stmt = $this->db->prepare("SELECT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1 ORDER BY is_primary DESC, id ASC LIMIT 1");
        $stmt->execute([$personId]);
        $row = $stmt->fetch(\PDO::FETCH_OBJ);
        if ($row) {
            $houseId = (int) $row->house_id;
        }
        $insert = [
            'person_id' => $personId,
            'username_system' => trim($data['username_system']),
            'password_system' => password_hash($data['password_system'], PASSWORD_DEFAULT),
            'role_system' => trim($data['role_system']),
            'is_active' => 1,
            'house_id' => $houseId,
            'status_validated' => 'PERMITIDO',
            'status_system' => 'ACTIVO'
        ];
        $cols = implode(', ', array_keys($insert));
        $placeholders = implode(', ', array_fill(0, count($insert), '?'));
        $sql = "INSERT INTO users ($cols) VALUES ($placeholders)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($insert));
        $userId = (int) $this->db->lastInsertId();
        $user = $this->findById($userId, 'user_id');
        unset($user->password_system);
        Response::created($user, 'Usuario creado; la persona ya puede iniciar sesión');
    }

    /**
     * GET /api/v1/users/by-doc-number?doc_number=
     * Obtener usuario por número de documento (person.doc_number).
     */
    public function byDocNumber($params = []) {
        $doc_number = $params['doc_number'] ?? $_GET['doc_number'] ?? '';
        if (empty($doc_number)) {
            Response::error('doc_number requerido', 400);
            return;
        }
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id,
                       u.status_validated, u.status_reason, u.status_system,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname,
                       p.gender, p.birth_date, p.cel_number, p.email, p.photo_url, p.civil_status,
                       p.address, p.address AS address_reniec, p.district, p.province, p.region,
                       h.block_house, h.lot, h.apartment
                FROM users u
                LEFT JOIN persons p ON u.person_id = p.id
                LEFT JOIN houses h ON u.house_id = h.house_id
                WHERE p.doc_number = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$doc_number]);
        $user = $stmt->fetch(\PDO::FETCH_OBJ);
        if (!$user) {
            Response::notFound('Usuario no encontrado');
            return;
        }
        Response::success($user);
    }

    /**
     * Obtener usuarios por fecha de cumpleaños (con domicilio: manzana/lote)
     */
    public function byBirthday($params = []) {
        $fecha_cumple = $params['fecha_cumple'] ?? $_GET['fecha_cumple'] ?? null;
        
        if (!$fecha_cumple) {
            Response::error('Parámetro fecha_cumple requerido', 400);
            return;
        }
        
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id, u.status_validated, u.status_reason, u.status_system,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname,
                       p.gender, p.birth_date, p.cel_number, p.email, p.photo_url,
                       h.block_house, h.lot, h.apartment
                FROM users u
                LEFT JOIN persons p ON u.person_id = p.id
                LEFT JOIN houses h ON u.house_id = h.house_id
                WHERE p.id IS NOT NULL AND DATE_FORMAT(p.birth_date,'%m-%d') = ? AND u.status_validated = 'PERMITIDO'
                ORDER BY p.paternal_surname, p.first_name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$fecha_cumple]);
        
        $users = $stmt->fetchAll(\PDO::FETCH_OBJ);
        Response::success($users);
    }

    /**
     * POST /api/v1/users/me/photo
     * Subir foto de perfil del usuario autenticado. Body: multipart/form-data con campo "photo".
     * Actualiza persons.photo_url y devuelve el usuario con la nueva photo_url.
     */
    public function uploadProfilePhoto($params = []) {
        $payload = requireAuth();
        $userId = isset($payload['user_id']) ? (int) $payload['user_id'] : null;
        if (!$userId) {
            Response::error('Usuario no identificado', 401);
        }
        $user = $this->findById($userId, 'user_id');
        if (!$user || empty($user->person_id)) {
            Response::error('Usuario o persona no encontrada', 404);
        }
        require_once __DIR__ . '/../helpers/upload_storage.php';
        $result = storePublicPhoto($_FILES['photo'] ?? null, 'profiles');
        if (!$result['success']) {
            Response::error($result['error'] ?? 'Error al subir la imagen', 400);
        }
        $stmt = $this->db->prepare("UPDATE persons SET photo_url = ? WHERE id = ?");
        $stmt->execute([$result['photo_url'], $user->person_id]);
        $sql = "SELECT u.user_id, u.person_id, u.role_system, u.username_system, u.house_id, u.status_validated, u.status_reason, u.status_system, u.is_active,
                       p.type_doc, p.doc_number, p.first_name, p.paternal_surname, p.maternal_surname, p.gender, p.birth_date, p.cel_number, p.email, p.photo_url, p.civil_status, p.address, p.district, p.province, p.region
                FROM users u LEFT JOIN persons p ON u.person_id = p.id WHERE u.user_id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        $updated = $stmt->fetch(\PDO::FETCH_OBJ);
        Response::success($updated, 'Foto de perfil actualizada');
    }
}

/**
 * Registrar rutas del controlador
 */
function registerUserRoutes(Router $router) {
    $router->prefix('/api/v1/users')->get('/by-birthday', 'UserController@byBirthday');
}
