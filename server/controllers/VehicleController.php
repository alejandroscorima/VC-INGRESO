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
    
    /**
     * Listar todos los vehículos (requiere auth; admin ve todos, resto según política)
     */
    public function index($params = []) {
        requireAuth();
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
        $vehicles = $this->getAll(['house_id' => $houseId]);
        Response::success($vehicles);
    }
    
    /**
     * Crear nuevo vehículo
     */
    public function store($params = []) {
        $auth = requireAuth();
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
        $ownerId = isset($data['owner_id']) ? (int) $data['owner_id'] : null;
        if ($houseId && $ownerId !== null && !validateOwnerInHouse($this->db, $houseId, $ownerId)) {
            Response::error('El responsable (owner_id) debe ser miembro activo de la misma casa', 400);
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

        $data = $this->getInput();
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
        $this->delete($vehicleId, 'vehicle_id');
        Response::success(null, 'Vehículo eliminado correctamente');
    }
}
