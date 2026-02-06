<?php
/**
 * VehicleController para VC-INGRESO
 * 
 * Controlador para gestionar los vehículos de los residentes.
 */

namespace Controllers;

use Utils\Response;

class VehicleController extends Controller {
    protected $tableName = 'vehicles';
    
    /**
     * Listar todos los vehículos
     */
    public function index($params = []) {
        $vehicles = $this->getAll([], 'vehicle_id DESC');
        Response::success($vehicles, 'Vehículos obtenidos correctamente');
    }

    /**
     * Obtener vehículo por ID
     */
    public function show($params = []) {
        $vehicleId = $params['id'] ?? null;

        if (!$vehicleId) {
            Response::error('ID de vehículo requerido', 400);
        }

        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        
        if (!$vehicle) {
            Response::notFound('Vehículo no encontrado');
        }
        
        Response::success($vehicle);
    }
    
    /**
     * Obtener vehículos por house_id
     */
    public function byHouse($params = []) {
        $houseId = $params['house_id'] ?? null;
        
        if (!$houseId) {
            Response::error('ID de casa requerido', 400);
        }
        
        $vehicles = $this->getAll(['house_id' => $houseId]);
        Response::success($vehicles);
    }
    
    /**
     * Crear nuevo vehículo
     */
    public function store($params = []) {
        $data = $this->getInput();
        
        // Validar campos requeridos
        $required = ['license_plate'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }
        
        // Verificar si ya existe
        if ($this->exists('license_plate', $data['license_plate'])) {
            Response::error('Ya existe un vehículo con esta placa', 409);
        }
        
        // Campos permitidos
        $allowed = ['license_plate', 'type_vehicle', 'house_id', 'owner_id', 'status_validated', 'status_reason', 'status_system', 'category_entry', 'color', 'brand', 'model', 'year', 'photo_url'];

        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }

        $vehicleId = $this->create($filtered);
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        
        Response::created($vehicle, 'Vehículo creado correctamente');
    }
    
    /**
     * Actualizar vehículo
     */
    public function updateVehicle($params = []) {
        $vehicleId = $params['id'] ?? null;
        
        if (!$vehicleId) {
            Response::error('ID de vehículo requerido', 400);
        }
        
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        if (!$vehicle) {
            Response::notFound('Vehículo no encontrado');
        }

        $data = $this->getInput();

        // Campos permitidos
        $allowed = ['license_plate', 'type_vehicle', 'house_id', 'owner_id', 'status_validated', 'status_reason', 'status_system', 'category_entry', 'color', 'brand', 'model', 'year', 'photo_url'];

        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }

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
        $vehicleId = $params['id'] ?? null;
        
        if (!$vehicleId) {
            Response::error('ID de vehículo requerido', 400);
        }
        
        $vehicle = $this->findById($vehicleId, 'vehicle_id');
        if (!$vehicle) {
            Response::notFound('Vehículo no encontrado');
        }

        $this->delete($vehicleId, 'vehicle_id');
        
        Response::success(null, 'Vehículo eliminado correctamente');
    }
}
