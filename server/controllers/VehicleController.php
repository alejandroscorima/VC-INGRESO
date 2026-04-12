<?php
/**
 * VehicleController para VC-INGRESO
 * 
 * Controlador para gestionar los vehículos de los residentes.
 * House-centric: permisos por house_members; owner_id debe ser miembro de la casa.
 */

namespace Controllers;

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../helpers/house_permissions.php';

use Utils\Response;

class VehicleController extends Controller {
    protected $tableName = 'vehicles';
    protected $primaryKey = 'vehicle_id';
    
    /**
     * Listar todos los vehículos (requiere auth; admin ve todos, resto según política)
     */
    public function index($params = []) {
        $auth = requireAuth();
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            if ($tid <= 0) {
                Response::success([], 'Vehículos obtenidos correctamente');
                return;
            }
            $vehicles = $this->getAll(['owner_id' => $tid], 'vehicle_id DESC');
            Response::success($vehicles, 'Vehículos obtenidos correctamente');
            return;
        }
        if (!isStaffRole($auth)) {
            Response::error('Sin permiso', 403);
            return;
        }
        $vehicles = $this->getAll([], 'vehicle_id DESC');
        Response::success($vehicles, 'Vehículos obtenidos correctamente');
    }

    /**
     * Obtener vehículo por ID
     */
    public function show($params = []) {
        $auth = requireAuth();
        $vehicleId = $params['id'] ?? null;

        if (!$vehicleId) {
            Response::error('ID de vehículo requerido', 400);
        }

        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        if (!$vehicle) {
            Response::notFound('Vehículo no encontrado');
        }
        if (!canAccessHouse($this->db, $auth, (int) $vehicle->house_id)) {
            Response::error('Sin permiso para ver este vehículo', 403);
        }
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            $vOwner = isset($vehicle->owner_id) ? (int) $vehicle->owner_id : 0;
            if ($tid <= 0 || $vOwner !== $tid) {
                Response::error('Sin permiso para ver este vehículo', 403);
            }
        }
        Response::success($vehicle);
    }
    
    /**
     * Obtener vehículos por house_id
     */
    public function byHouse($params = []) {
        $auth = requireAuth();
        $houseId = $params['house_id'] ?? null;
        
        if (!$houseId) {
            Response::error('ID de casa requerido', 400);
        }
        if (!canAccessHouse($this->db, $auth, (int) $houseId)) {
            Response::error('Sin permiso para ver vehículos de esta casa', 403);
        }
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            if ($tid <= 0) {
                Response::success([]);
                return;
            }
            $vehicles = $this->getAll(['house_id' => (int) $houseId, 'owner_id' => $tid], 'vehicle_id DESC');
            Response::success($vehicles);
            return;
        }
        $vehicles = $this->getAll(['house_id' => $houseId], 'vehicle_id DESC');
        Response::success($vehicles);
    }
    
    /**
     * Crear nuevo vehículo
     */
    public function store($params = []) {
        $auth = requireAuth();
        if (isOperarioPorteriaSinVecindad($this->db, $auth)) {
            Response::error('Sin permiso para registrar vehículos (solo lectura)', 403);
            return;
        }
        $data = $this->getInput();
        
        $required = ['license_plate', 'house_id'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }
        if ($this->exists('license_plate', $data['license_plate'])) {
            Response::error('Ya existe un vehículo con esta placa', 409);
        }
        $houseId = (int) $data['house_id'];
        if (!canAccessHouse($this->db, $auth, $houseId)) {
            Response::error('Sin permiso para crear vehículos en esta casa', 403);
        }
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            if ($tid <= 0) {
                Response::error('Sesión sin persona asociada', 403);
                return;
            }
            $cat = strtoupper(trim((string) ($data['category_entry'] ?? '')));
            if ($cat !== 'INQUILINO') {
                Response::error('Como inquilino solo puedes registrar vehículos con categoría INQUILINO', 403);
                return;
            }
            $data['owner_id'] = $tid;
            $data['category_entry'] = 'INQUILINO';
        } elseif (isAdminRole($auth)) {
            $ownerProp = getFirstPropietarioPersonIdForHouse($this->db, $houseId);
            if ($ownerProp === null || $ownerProp <= 0) {
                Response::error('No hay propietario registrado para esta casa.', 400);
                return;
            }
            $data['owner_id'] = $ownerProp;
        } else {
            $pid = (int) ($auth['person_id'] ?? 0);
            if ($pid <= 0) {
                Response::error('Sesión sin persona asociada; no se puede asignar responsable del vehículo.', 403);
                return;
            }
            $data['owner_id'] = $pid;
        }

        $ownerId = (int) ($data['owner_id'] ?? 0);
        if ($ownerId <= 0) {
            Response::error('No se pudo determinar el responsable del vehículo (owner_id).', 400);
            return;
        }
        if (!validateOwnerInHouse($this->db, $houseId, $ownerId)) {
            Response::error('El responsable (owner_id) debe pertenecer a la misma casa', 400);
        }
        $createdBy = isset($auth['user_id']) ? (int) $auth['user_id'] : null;

        $allowed = ['license_plate', 'type_vehicle', 'house_id', 'owner_id', 'status_validated', 'status_reason', 'status_system', 'category_entry', 'color', 'brand', 'model', 'year', 'photo_url'];
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        $filtered['created_by_user_id'] = $createdBy;

        $vehicleId = $this->create($filtered);
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        Response::created($vehicle, 'Vehículo creado correctamente');
    }
    
    /**
     * Actualizar vehículo
     */
    public function updateVehicle($params = []) {
        $auth = requireAuth();
        if (isOperarioPorteriaSinVecindad($this->db, $auth)) {
            Response::error('Sin permiso para editar vehículos (solo lectura)', 403);
            return;
        }
        $vehicleId = $params['id'] ?? null;
        
        if (!$vehicleId) {
            Response::error('ID de vehículo requerido', 400);
        }
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        if (!$vehicle) {
            Response::notFound('Vehículo no encontrado');
        }
        if (!canAccessHouse($this->db, $auth, (int) $vehicle->house_id)) {
            Response::error('Sin permiso para editar este vehículo', 403);
        }
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            $vOwner = isset($vehicle->owner_id) ? (int) $vehicle->owner_id : 0;
            $vCat = strtoupper(trim((string) ($vehicle->category_entry ?? '')));
            if ($tid <= 0 || $vOwner !== $tid || $vCat !== 'INQUILINO') {
                Response::error('Solo puedes editar tus vehículos registrados como INQUILINO', 403);
                return;
            }
        }

        $data = $this->getInput();
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            $data['owner_id'] = $tid;
            $data['category_entry'] = 'INQUILINO';
            unset($data['house_id']);
        }
        $houseId = isset($data['house_id']) ? (int) $data['house_id'] : (int) $vehicle->house_id;
        if (isset($data['house_id']) && (int) $data['house_id'] !== (int) $vehicle->house_id) {
            if (!canAccessHouse($this->db, $auth, (int) $data['house_id'])) {
                Response::error('Sin permiso para asignar este vehículo a esa casa', 403);
            }
        }
        if (isset($data['owner_id'])) {
            $ownerId = $data['owner_id'] === null || $data['owner_id'] === '' ? null : (int) $data['owner_id'];
            if ($ownerId !== null && !validateOwnerInHouse($this->db, $houseId, $ownerId)) {
                Response::error('El responsable (owner_id) debe ser miembro activo de la misma casa', 400);
            }
        }
        $updatedBy = isset($auth['user_id']) ? (int) $auth['user_id'] : null;

        $allowed = ['license_plate', 'type_vehicle', 'house_id', 'owner_id', 'status_validated', 'status_reason', 'status_system', 'category_entry', 'color', 'brand', 'model', 'year', 'photo_url'];
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        $filtered['updated_by_user_id'] = $updatedBy;

        if (empty($filtered)) {
            Response::error('No hay datos para actualizar', 400);
        }
        parent::update($vehicleId, $filtered, 'vehicle_id');
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        Response::success($vehicle, 'Vehículo actualizado correctamente');
    }
    
    /**
     * Eliminar vehículo
     */
    public function destroy($params = []) {
        $auth = requireAuth();
        if (isOperarioPorteriaSinVecindad($this->db, $auth)) {
            Response::error('Sin permiso para eliminar vehículos (solo lectura)', 403);
            return;
        }
        $vehicleId = $params['id'] ?? null;
        
        if (!$vehicleId) {
            Response::error('ID de vehículo requerido', 400);
        }
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        if (!$vehicle) {
            Response::notFound('Vehículo no encontrado');
        }
        if (!canAccessHouse($this->db, $auth, (int) $vehicle->house_id)) {
            Response::error('Sin permiso para eliminar este vehículo', 403);
        }
        if (isTenantUser($this->db, $auth)) {
            $tid = (int) ($auth['person_id'] ?? 0);
            $vOwner = isset($vehicle->owner_id) ? (int) $vehicle->owner_id : 0;
            $vCat = strtoupper(trim((string) ($vehicle->category_entry ?? '')));
            if ($tid <= 0 || $vOwner !== $tid || $vCat !== 'INQUILINO') {
                Response::error('Sin permiso para eliminar este vehículo', 403);
                return;
            }
        }
        $this->delete($vehicleId, 'vehicle_id');
        Response::success(null, 'Vehículo eliminado correctamente');
    }
}
